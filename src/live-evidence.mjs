/** Inspect real RWA observations without manufacturing a complete trading snapshot. */
/** @typedef {Record<string,unknown>} RecordValue */
/** @param {unknown} value @returns {RecordValue} */
const record = value => value && typeof value === 'object' && !Array.isArray(value) ? /** @type {RecordValue} */ (value) : {};
/** @param {unknown} value */
const positiveDecimal = value => typeof value === 'string' && value.length <= 100 && /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value) && /[1-9]/.test(value);
/** @param {unknown} input @param {'LIVE'|'REPLAY'} mode @param {number} [now] */
export function inspectRwaEvidence(input, mode, now = Date.now()) {
  const source = record(input), asset = record(source.asset), priceEnvelope = record(source.price), profileEnvelope = record(source.profile), marketEnvelope = record(source.market);
  const priceRows = Array.isArray(priceEnvelope.data) ? priceEnvelope.data.map(record) : [];
  const address = typeof asset.tokenContractAddress === 'string' ? asset.tokenContractAddress.toLowerCase() : '';
  const price = priceRows.find(row => String(row.tokenContractAddress).toLowerCase() === address) ?? {};
  const profile = record(profileEnvelope.data), market = record(marketEnvelope.data), status = record(market.statusInfo);
  const observedAt = typeof source.observedAt === 'string' ? Date.parse(source.observedAt) : NaN;
  /** @type {{id:string,label:string,status:'PASS'|'WAIT'|'BLOCK',detail:string}[]} */ const checks = [];
  /** @param {string} id @param {string} label @param {'PASS'|'WAIT'|'BLOCK'} state @param {string} detail */
  const add = (id, label, state, detail) => checks.push({id,label,status:state,detail});
  const envelopesValid = [priceEnvelope,profileEnvelope,marketEnvelope].every(e => e.code === 0);
  const issuer = asset.platformId;
  const identityValid = /^0x[\da-f]{40}$/.test(address) && asset.binanceChainId === '56' && ['ondo','bstock'].includes(String(issuer)) && typeof asset.underlyingTicker === 'string'
    && [price,profile,market].every(row => row.binanceChainId === '56' && String(row.tokenContractAddress).toLowerCase() === address && row.platformId === issuer)
    && profile.underlyingTicker === asset.underlyingTicker;
  add('identity','Exact issuer / contract', envelopesValid && identityValid ? 'PASS' : 'BLOCK', envelopesValid && identityValid ? 'Catalog, price, profile and market agree on BSC, issuer and contract.' : 'Missing, rejected or mismatched endpoint identity. A ticker cannot repair a contract mismatch.');
  const timeValid = Number.isSafeInteger(now) && Number.isSafeInteger(observedAt) && observedAt <= now;
  const ageMs = timeValid ? now - observedAt : null;
  add('retrieval','Acquisition clock', !timeValid ? 'BLOCK' : ageMs !== null && ageMs <= 30000 ? 'PASS' : 'WAIT', !timeValid ? 'Missing or future acquisition time.' : `${mode} observation acquired ${Math.floor((ageMs ?? 0)/1000)}s ago. Refresh after 30s; acquisition is distinct from a price as-of time.`);
  const priceTime = price.tokenPriceUpdatedAt;
  const priceTimeValid = typeof priceTime === 'number' && Number.isSafeInteger(priceTime) && priceTime <= now;
  add('token-price','Token price clock', !positiveDecimal(price.tokenPrice) || !priceTimeValid ? 'WAIT' : now - priceTime <= 30000 ? 'PASS' : 'WAIT', 'Uses tokenPriceUpdatedAt only. referencePrice is derived token value per share, not an independent stock quote.');
  add('conversion','Share conversion', positiveDecimal(asset.tokenToShareRatio) && asset.tokenToShareRatio === profile.tokenToShareRatio ? 'PASS' : 'BLOCK', 'The exact decimal ratio must agree between catalog and issuer profile. No one-token-equals-one-share assumption.');
  add('market','Underlying market context', typeof status.openState === 'boolean' && ['premarket','regular','postmarket','overnight','closed','pause'].includes(String(status.marketStatus)) ? 'PASS' : 'WAIT', 'Market status is context. A closed underlying exchange is not a universal ban on secondary token trading.');
  add('reference','Independent reference clock','WAIT','This RWA source establishes no independently timestamped underlying exchange quote. Derived referencePrice and response/retrieval time cannot substitute for one.');
  add('qualification','Issuer trading qualification','WAIT','API access does not establish this person\'s issuer or venue trading eligibility.');
  add('quote','Amount-bound executable quote','WAIT','A real eligible receiver and fresh RFQ quote are still required; no amount, vendor, minimum output or expiry is invented.');
  add('effects','Allowance / balance / settlement effects','WAIT','No wallet balance, quote-selected spender, bounded approval or RFQ settlement proof is established by RWA data.');
  return {mode,status:checks.some(c=>c.status==='BLOCK')?'BLOCKED':'WAIT',canSign:false,canBroadcast:false,checks,observedAt:source.observedAt,asset,price,profile,market,ageMs};
}
