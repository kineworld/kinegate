import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createBinanceClient, signRequest, VERIFIED_ASSETS, MAX_RESPONSE_BYTES, validateUnsignedSwap } from '../server/binance.mjs';
const now = () => new Date('2026-10-05T11:00:00.000Z');
const fixture = data => new Response(JSON.stringify({ code: 0, msg: 'success', data }), { status: 200 });
test('FIXTURE missing credentials and eligibility fail before network', async () => {
  let calls = 0;
  const fetchFn = async () => { calls++; return fixture([]); };
  await assert.rejects(createBinanceClient({ key: '', secret: '', eligible: true, fetchFn }).discovery(), { code: 'CREDENTIALS_MISSING' });
  await assert.rejects(createBinanceClient({ key: 'fixture', secret: 'fixture', eligible: false, fetchFn }).discovery(), { code: 'ELIGIBILITY_UNCONFIRMED' });
  assert.equal(calls, 0);
});
test('FIXTURE canonical signing covers /build and exact encoding', async () => {
  let call;
  const client = createBinanceClient({ key: 'fixture', secret: 'fixture-secret', eligible: true, now, fetchFn: async (url, options) => { call = { url, options }; return fixture([]); } });
  await client.discovery();
  assert.equal(call.url, 'https://web3.binance.com/build/api/v1/dex/market/rwa/tokens?binanceChainId=56');
  const path = '/build/api/v1/dex/market/rwa/tokens?binanceChainId=56';
  const expected = createHmac('sha256', 'fixture-secret').update(now().toISOString() + 'GET' + path).digest('base64');
  assert.equal(call.options.headers['X-OC-SIGN'], expected);
  assert.notEqual(signRequest(now().toISOString(), 'GET', '/api/v1/dex/market/rwa/tokens?binanceChainId=56', '', 'fixture-secret'), expected);
});
test('FIXTURE 429 retries once, authorization denial never retries', async () => {
  let calls = 0; let sleeps = 0;
  const base = { key: 'fixture', secret: 'fixture', eligible: true, sleep: async () => { sleeps++; } };
  const client = createBinanceClient({ ...base, fetchFn: async () => { calls++; return calls === 1 ? new Response('{}', { status: 429, headers: { 'Retry-After': '0' } }) : fixture([]); } });
  await client.discovery(); assert.equal(calls, 2); assert.equal(sleeps, 1);
  calls = 0;
  await assert.rejects(createBinanceClient({ ...base, fetchFn: async () => { calls++; return new Response(JSON.stringify({ code: 40104 }), { status: 403 }); } }).discovery(), { code: 'AUTHORIZATION_FAILED' });
  assert.equal(calls, 1);
});
test('FIXTURE failed business code at HTTP200 is not success', async () => {
  await assert.rejects(createBinanceClient({ key: 'fixture', secret: 'fixture', eligible: true, fetchFn: async () => new Response(JSON.stringify({ code: 40374, data: [] }), { status: 200 }) }).discovery(), { code: 'API_REJECTED' });
});
test('FIXTURE unknown assets denied and EVM simulation sends exactly one payload', async () => {
  let call; const evidence = [];
  const client = createBinanceClient({ key: 'fixture', secret: 'fixture-secret', eligible: true, onEvidence: e => { evidence.push(e); }, fetchFn: async (url, options) => { call = { url, options }; return fixture({ status: 'SUCCESS' }); } });
  await assert.rejects(client.asset('0x0000000000000000000000000000000000000000'), { code: 'ASSET_DENIED' });
  const evmTx = { from: VERIFIED_ASSETS.AAPLB, to: VERIFIED_ASSETS.AAPLB, value: '0', data: '0x' };
  await client.simulate(evmTx);
  assert.deepEqual(JSON.parse(call.options.body), { binanceChainId: '56', evmTx });
  assert.equal(JSON.stringify(evidence).includes('fixture-secret'), false);
  assert.equal(JSON.stringify(evidence).includes('X-OC-SIGN'), false);
});
test('FIXTURE malformed success envelopes and oversized bodies fail closed', async () => {
  for (const body of [{ code: 0 }, { code: '0', data: [] }, { code: 0, data: null }, { code: 0, data: {} }, null]) {
    const client = createBinanceClient({ key: 'fixture', secret: 'fixture', eligible: true, fetchFn: async () => new Response(JSON.stringify(body), { status: 200 }) });
    await assert.rejects(client.discovery(), { code: 'MALFORMED_RESPONSE' });
  }
  const client = createBinanceClient({ key: 'fixture', secret: 'fixture', eligible: true, fetchFn: async () => fixture('x'.repeat(MAX_RESPONSE_BYTES)) });
  await assert.rejects(client.discovery(), { code: 'RESPONSE_TOO_LARGE' });
});
test('FIXTURE injected fetch is labeled correctly and invalid quote inputs never network', async () => {
  const evidence = []; let calls = 0;
  const client = createBinanceClient({ key: 'fixture', secret: 'fixture', eligible: true, onEvidence: e => { evidence.push(e); }, fetchFn: async () => { calls++; return fixture([]); } });
  await client.discovery(); assert.equal(evidence[0].mode, 'FIXTURE');
  const other = '0x0000000000000000000000000000000000000001';
  const receiver = '0x0000000000000000000000000000000000000002';
  const base = { amount: '1', fromTokenAddress: VERIFIED_ASSETS.AAPLB, toTokenAddress: other, userWalletAddress: receiver };
  for (const amount of ['0', '-1', '1.1', '1'.repeat(79), '9'.repeat(78)]) assert.throws(() => client.quote({ ...base, amount }), { code: 'INVALID_QUOTE_INPUT' });
  assert.throws(() => client.quote({ ...base, fromTokenAddress: receiver }), { code: 'ASSET_DENIED' });
  assert.equal(calls, 1);
  await client.quote(base); assert.equal(calls, 2);
});
test('FIXTURE unsigned builder fixes pair, amount, slippage and approval policy before networking', async () => {
  let call; let calls = 0;
  const client = createBinanceClient({ key: 'fixture', secret: 'fixture-secret', eligible: true, now, fetchFn: async (url, options) => { calls++; call = { url, options }; return fixture({ executionMode: 'SWAP' }); } });
  const input = { amount: '6000000000000000000', fromTokenAddress: '0x55d398326f99059fF775485246999027B3197955', toTokenAddress: VERIFIED_ASSETS.AAPLon, userWalletAddress: '0x0000000000000000000000000000000000000002', quoteId: 'fixture+quote/id=', slippagePercent: '0.5', approveTransaction: 'false' };
  for (const patch of [{ amount: '5000000000000000000' }, { fromTokenAddress: VERIFIED_ASSETS.AAPLon }, { toTokenAddress: VERIFIED_ASSETS.AAPLB }, { userWalletAddress: '0x' + '0'.repeat(40) }, { quoteId: 'x'.repeat(513) }, { quoteId: 'fixture\nheader' }, { slippagePercent: '100' }, { approveTransaction: 'true' }]) assert.throws(() => client.buildSwap({ ...input, ...patch }), { code: 'INVALID_BUILD_INPUT' });
  assert.equal(calls, 0);
  await client.buildSwap({ ...input, binanceChainId: '1', feePercent: '5' });
  const url = new URL(call.url);
  assert.equal(url.pathname, '/build/api/v1/dex/aggregator/swap');
  assert.deepEqual(Object.fromEntries(url.searchParams), { binanceChainId: '56', ...input });
  const signedPath = url.pathname + url.search;
  assert.equal(call.options.headers['X-OC-SIGN'], signRequest(now().toISOString(), 'GET', signedPath, '', 'fixture-secret'));
  assert.equal(call.options.body, undefined);
});
test('FIXTURE unsigned validation refuses RFQ, unknown modes, receiver mismatch, value and approval data', () => {
  const receiver = '0x0000000000000000000000000000000000000002';
  const tx = { from: receiver, to: VERIFIED_ASSETS.AAPLon, value: '0', data: '0x12345678' };
  assert.deepEqual(validateUnsignedSwap({ executionMode: 'SWAP', tx }, receiver), tx);
  assert.deepEqual(validateUnsignedSwap({ executionMode: 'SWAP', rfq: null, tx: { ...tx, signatureData: null } }, receiver), tx);
  for (const value of [{ executionMode: 'RFQ', rfq: { typedDataToSign: {} } }, { executionMode: 'UNKNOWN', tx }, { executionMode: 'SWAP', tx, rfq: {} }, ...[{ from: VERIFIED_ASSETS.AAPLB }, { value: '1' }, { to: '0x' + '0'.repeat(40) }, { data: '0x' }, { data: '0x123' }, { signatureData: ['approval'] }].map(patch => ({ executionMode: 'SWAP', tx: { ...tx, ...patch } }))]) assert.throws(() => validateUnsignedSwap(value, receiver), { code: 'INVALID_UNSIGNED_SWAP' });
});
test('FIXTURE quote and unsigned builder never automatically repeat a short-lived input', async () => {
  let calls = 0; const responses = [];
  const client = createBinanceClient({ key: 'fixture', secret: 'fixture', eligible: true, onResponse: (endpoint, result) => { responses.push({ endpoint, result }); }, fetchFn: async () => { calls++; return new Response(JSON.stringify({ code: 50000, data: null }), { status: 500 }); } });
  const pair = { amount: '6000000000000000000', fromTokenAddress: '0x55d398326f99059fF775485246999027B3197955', toTokenAddress: VERIFIED_ASSETS.AAPLon, userWalletAddress: '0x0000000000000000000000000000000000000002' };
  await assert.rejects(client.quote(pair), { code: 'UPSTREAM_UNAVAILABLE' });
  await assert.rejects(client.buildSwap({ ...pair, quoteId: 'fixture', slippagePercent: '0.5', approveTransaction: 'false' }), { code: 'UPSTREAM_UNAVAILABLE' });
  assert.equal(calls, 2); assert.equal(responses.length, 2); assert.equal(responses[1].result.code, 50000);
});
