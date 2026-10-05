import { createHmac, randomUUID } from 'node:crypto';
import { windowsTransport } from './windows-transport.mjs';

export const API_BASE = 'https://web3.binance.com';
export const MAX_RESPONSE_BYTES = 1024 * 1024;
export const VERIFIED_ASSETS = Object.freeze({
  AAPLB: '0x431a3bee82e2ca41e49895cbece5bb0f76a89b7a',
  // Exact chain-56 match from authenticated current RWA catalog; provenance in evidence/devex/authenticated-rwa.json.
  AAPLon: '0x390a684ef9cade28a7ad0dfa61ab1eb3842618c4',
});
/** @typedef {{code:number,msg?:string,data:unknown,timestamp?:number}} OCResult */
/** @typedef {{key?:string,secret?:string,eligible?:boolean,fetchFn?:typeof fetch,now?:()=>Date,sleep?:(ms:number)=>Promise<void>,onEvidence?:(e:Record<string,unknown>)=>void|Promise<void>,onResponse?:(endpoint:string,result:OCResult|null)=>void|Promise<void>}} ClientOptions */
export class ApiError extends Error {
  /** @param {string} code @param {string} message @param {number} [status] */
  constructor(code, message, status = 503) { super(message); this.name = 'ApiError'; this.code = code; this.status = status; }
}
/** The same encoded bytes are used for signature and request URL. @param {string} timestamp @param {string} method @param {string} path @param {string} body @param {string} secret */
export function signRequest(timestamp, method, path, body, secret) {
  return createHmac('sha256', secret).update(timestamp + method + path + body, 'utf8').digest('base64');
}
/** Bound decoded response memory before JSON parsing. @param {Response} response @returns {Promise<unknown>} */
async function readResponse(response) {
  if (Number(response.headers.get('Content-Length') ?? '0') > MAX_RESPONSE_BYTES) {
    await response.body?.cancel();
    throw new ApiError('RESPONSE_TOO_LARGE', 'External response exceeds the 1 MiB local limit.');
  }
  if (!response.body) return null;
  const reader = response.body.getReader();
  /** @type {Uint8Array[]} */ const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new ApiError('RESPONSE_TOO_LARGE', 'External response exceeds the 1 MiB local limit.');
      }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return null; }
}
/** @param {unknown} value @returns {value is OCResult} */
function isEnvelope(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = /** @type {Record<string, unknown>} */ (value);
  return typeof record.code === 'number' && Number.isInteger(record.code) && Object.hasOwn(record, 'data')
    && (record.msg === undefined || typeof record.msg === 'string')
    && (record.timestamp === undefined || (typeof record.timestamp === 'number' && Number.isFinite(record.timestamp)));
}
/** Validate only the unsigned zero-native-value EVM branch before off-chain simulation.
 * No receiver ownership, spender trust or execution authorization is established.
 * @param {unknown} data @param {string} receiver @returns {{from:string,to:string,value:string,data:string}} */
export function validateUnsignedSwap(data, receiver) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ApiError('INVALID_UNSIGNED_SWAP', 'Builder did not return an object.', 400);
  const result = /** @type {Record<string,unknown>} */ (data);
  if (result.executionMode !== 'SWAP' || (result.rfq !== undefined && result.rfq !== null) || !result.tx || typeof result.tx !== 'object' || Array.isArray(result.tx)) throw new ApiError('INVALID_UNSIGNED_SWAP', 'Only the explicit unsigned SWAP branch can be EVM simulated.', 400);
  const tx = /** @type {Record<string,unknown>} */ (result.tx);
  if (typeof tx.from !== 'string' || !/^0x[\da-fA-F]{40}$/.test(tx.from) || tx.from.toLowerCase() !== receiver.toLowerCase()
    || typeof tx.to !== 'string' || !/^0x[\da-fA-F]{40}$/.test(tx.to) || /^0x0{40}$/i.test(tx.to)
    || tx.value !== '0' || typeof tx.data !== 'string' || !/^0x(?:[\da-fA-F]{2}){4,16384}$/.test(tx.data)
    || (tx.signatureData !== undefined && tx.signatureData !== null && (!Array.isArray(tx.signatureData) || tx.signatureData.length !== 0))) throw new ApiError('INVALID_UNSIGNED_SWAP', 'Unsigned EVM fields must match receiver, contain bounded calldata and send zero native value without approval data.', 400);
  return { from: tx.from, to: tx.to, value: '0', data: tx.data };
}
/** Original minimal HTTP adapter following Binance documentation; no SDK code copied. @param {ClientOptions} [options] */
export function createBinanceClient(options = {}) {
  const key = options.key ?? process.env.OC_API_KEY ?? '';
  const secret = options.secret ?? process.env.OC_SECRET_KEY ?? '';
  const eligible = options.eligible ?? process.env.KINE_API_ELIGIBILITY_CONFIRMED === 'true';
  const fetchFn = options.fetchFn ?? (process.platform === 'win32' ? windowsTransport : fetch);
  const mode = options.fetchFn ? 'FIXTURE' : 'LIVE';
  const now = options.now ?? (() => new Date());
  const sleep = options.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms)));
  /** @param {'GET'|'POST'} method @param {string} endpoint @param {Record<string,string>} [params] @param {Record<string,unknown>} [payload] */
  async function request(method, endpoint, params = {}, payload) {
    if (!key || !secret) throw new ApiError('CREDENTIALS_MISSING', 'Configure local OC_API_KEY and OC_SECRET_KEY.');
    if (!eligible) throw new ApiError('ELIGIBILITY_UNCONFIRMED', 'A person must confirm API and asset eligibility before authenticated requests.');
    if (!/^\/api\/v1\/dex\/(market\/rwa\/(tokens|price|underlying-profile|underlying-market)|aggregator\/(quote|swap)|pre-transaction\/simulate)$/.test(endpoint)) throw new ApiError('ENDPOINT_DENIED', 'This adapter permits only documented read-only, unsigned building or off-chain simulation endpoints.', 400);
    const query = Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    const path = '/build' + endpoint + (query ? '?' + query : '');
    const body = method === 'GET' ? '' : JSON.stringify(payload ?? {});
    // Quotes/builders are receiver-bound and short-lived: never silently repeat an input.
    const maxAttempts = method === 'GET' && !/^\/api\/v1\/dex\/aggregator\//.test(endpoint) ? 2 : 1;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const timestamp = now().toISOString();
      const started = performance.now();
      const headers = { 'X-OC-APIKEY': key, 'X-OC-TIMESTAMP': timestamp, 'X-OC-SIGN': signRequest(timestamp, method, path, body, secret), 'X-OC-NONCE': randomUUID(), 'Content-Type': 'application/json' };
      let response;
      try {
        response = await fetchFn(API_BASE + path, { method, headers, ...(body ? { body } : {}), signal: AbortSignal.timeout(8000), redirect: 'error' });
      } catch (error) {
        const transportCode = error instanceof Error && /^WINDOWS_[A-Z_]{1,80}$/.test(error.message) ? error.message : null;
        await options.onEvidence?.({ mode, timestamp, endpoint, method, attempt, elapsedMs: Math.round(performance.now() - started), outcome: 'NETWORK_OR_TIMEOUT', transportCode, parameterNames: Object.keys(params) });
        throw new ApiError('NETWORK_OR_TIMEOUT', 'External request failed or exceeded the 8 second timeout.' + (transportCode ? ` ${transportCode}` : ''));
      }
      /** @type {OCResult | null} */ let result = null;
      try {
        const parsed = await readResponse(response);
        if (isEnvelope(parsed)) result = parsed;
      } catch (error) {
        await options.onEvidence?.({ mode, timestamp, endpoint, method, attempt, httpStatus: response.status, elapsedMs: Math.round(performance.now() - started), outcome: error instanceof ApiError ? error.code : 'NETWORK_OR_TIMEOUT', parameterNames: Object.keys(params) });
        if (error instanceof ApiError) throw error;
        throw new ApiError('NETWORK_OR_TIMEOUT', 'Response body could not be read within the request limit.');
      }
      // Opt-in CLI capture may contain receiver data; caller must store this only in ignored private evidence.
      await options.onResponse?.(endpoint, result);
      await options.onEvidence?.({ mode, timestamp, endpoint, method, attempt, httpStatus: response.status, businessCode: result?.code ?? null, elapsedMs: Math.round(performance.now() - started), parameterNames: Object.keys(params) });
      const retryable = response.status === 429 || response.status >= 500 || result?.code === 42900 || result?.code === 50000 || result?.code === 50001;
      if (retryable && attempt < maxAttempts) {
        const retrySeconds = Number(response.headers.get('Retry-After') ?? '0.25');
        if (!Number.isFinite(retrySeconds) || retrySeconds > 2) throw new ApiError('RATE_LIMITED', 'Retry delay exceeds the local bounded retry budget.');
        await sleep(Math.max(250, retrySeconds * 1000)); continue;
      }
      if (!response.ok || !result || result.code !== 0) {
        const code = response.status === 401 || response.status === 403 ? 'AUTHORIZATION_FAILED' : retryable ? 'UPSTREAM_UNAVAILABLE' : !result ? 'MALFORMED_RESPONSE' : 'API_REJECTED';
        throw new ApiError(code, `Binance request did not succeed (HTTP ${response.status}, API ${result?.code ?? 'unparsed'}).`);
      }
      const expectsArray = /\/(tokens|price|quote)$/.test(endpoint);
      if (!result.data || typeof result.data !== 'object' || Array.isArray(result.data) !== expectsArray) throw new ApiError('MALFORMED_RESPONSE', 'Successful API envelope has an invalid endpoint data shape.');
      return result;
    }
    throw new ApiError('UPSTREAM_UNAVAILABLE', 'Retry budget exhausted.');
  }
  return {
    status: () => ({ credentialsConfigured: Boolean(key && secret), eligibilityConfirmed: eligible, signingEnabled: false, spendingEnabled: false }),
    discovery: () => request('GET', '/api/v1/dex/market/rwa/tokens', { binanceChainId: '56' }),
    /** @param {string} address */
    asset: async address => {
      if (!Object.values(VERIFIED_ASSETS).some(v => v.toLowerCase() === address.toLowerCase())) throw new ApiError('ASSET_DENIED', 'Asset must be in the documented local contract allowlist.', 400);
      const base = { binanceChainId: '56', tokenContractAddress: address };
      const price = await request('GET', '/api/v1/dex/market/rwa/price', { binanceChainId: '56', tokenContractAddresses: address });
      const profile = await request('GET', '/api/v1/dex/market/rwa/underlying-profile', base);
      const market = await request('GET', '/api/v1/dex/market/rwa/underlying-market', base);
      return { mode, observedAt: now().toISOString(), address, price, profile, market };
    },
    /** CLI only; caller must supply the real receiver address for RFQ. @param {{amount:string,fromTokenAddress:string,toTokenAddress:string,userWalletAddress:string}} input */
    quote: input => {
      if (!/^[1-9]\d{0,77}$/.test(input.amount) || BigInt(input.amount) > (1n << 256n) - 1n || ![input.fromTokenAddress, input.toTokenAddress, input.userWalletAddress].every(a => /^0x[\da-fA-F]{40}$/.test(a))) throw new ApiError('INVALID_QUOTE_INPUT', 'Quote needs a positive uint256 base-unit integer of at most 78 digits and valid addresses.', 400);
      if (input.fromTokenAddress.toLowerCase() === input.toTokenAddress.toLowerCase()) throw new ApiError('INVALID_QUOTE_INPUT', 'Quote token pair must differ.', 400);
      if (![input.fromTokenAddress, input.toTokenAddress].some(address => Object.values(VERIFIED_ASSETS).some(asset => asset.toLowerCase() === address.toLowerCase()))) throw new ApiError('ASSET_DENIED', 'Quote must include an RWA from the documented local contract allowlist.', 400);
      return request('GET', '/api/v1/dex/aggregator/quote', { binanceChainId: '56', amount: input.amount, fromTokenAddress: input.fromTokenAddress, toTokenAddress: input.toTokenAddress, userWalletAddress: input.userWalletAddress });
    },
    /** Narrow CLI only: unsigned 6 USDT -> AAPLon payload, never approval calldata or signing.
     * @param {{amount:string,fromTokenAddress:string,toTokenAddress:string,userWalletAddress:string,quoteId:string,slippagePercent:string,approveTransaction:string}} input */
    buildSwap: input => {
      // A percent with at most two decimal places maps exactly to integer basis points.
      const slippage = typeof input.slippagePercent === 'string' ? /^0\.([0-9]{1,2})$/.exec(input.slippagePercent) : null;
      const slippageBps = slippage && slippage[0] === input.slippagePercent ? Number(slippage[1].padEnd(2, '0')) : 0;
      if (input.amount !== '6000000000000000000' || input.fromTokenAddress.toLowerCase() !== '0x55d398326f99059ff775485246999027b3197955' || input.toTokenAddress.toLowerCase() !== VERIFIED_ASSETS.AAPLon.toLowerCase()
        || !/^0x[\da-fA-F]{40}$/.test(input.userWalletAddress) || /^0x0{40}$/i.test(input.userWalletAddress)
        || !/^[\x21-\x7e]{1,512}$/.test(input.quoteId) || slippageBps <= 0 || slippageBps > 50 || input.approveTransaction !== 'false') throw new ApiError('INVALID_BUILD_INPUT', 'Unsigned building is limited to 6 USDT to current AAPLon with positive slippage up to 0.5% (at most two decimal places) and approval disabled.', 400);
      return request('GET', '/api/v1/dex/aggregator/swap', { binanceChainId: '56', amount: input.amount, fromTokenAddress: input.fromTokenAddress, toTokenAddress: input.toTokenAddress, userWalletAddress: input.userWalletAddress, quoteId: input.quoteId, slippagePercent: input.slippagePercent, approveTransaction: 'false' });
    },
    /** CLI only, never RFQ typed data. @param {{from:string,to:string,value:string,data:string}} evmTx */
    simulate: evmTx => {
      if (![evmTx.from, evmTx.to].every(a => /^0x[\da-fA-F]{40}$/.test(a)) || !/^\d+$/.test(evmTx.value) || !/^0x(?:[\da-fA-F]{2})*$/.test(evmTx.data)) throw new ApiError('INVALID_SIMULATION_INPUT', 'Simulation requires an EVM transaction with decimal wei value and hex calldata.', 400);
      return request('POST', '/api/v1/dex/pre-transaction/simulate', {}, { binanceChainId: '56', evmTx });
    },
  };
}
