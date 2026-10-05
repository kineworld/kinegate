/** Deterministic, fail-closed preflight. No network, keys, signing or broadcasting. */
/** @typedef {'LIVE'|'FIXTURE'|'REPLAY'} DataMode */
/** @typedef {{chainId:number,address:string,issuer:string,ticker:string,decimals:number,ratioNumerator:string,ratioDenominator:string,rightsUrl:string}} Asset */
/** @typedef {{id:string,mode:DataMode,observedAt:number,asset:Asset,market:{status:'OPEN'|'CLOSED'|'PAUSED'|'UNKNOWN',referenceObservedAt:number,independentPriceMicros:string|null,nextOpen:string},quote:{id:string,observedAt:number,expiresAt:number,inputAtomic:string,outputAtomic:string,minOutputAtomic:string,vendor:string,spender:string,priceImpactBps:number,slippageBps:number,gasMicros:string,feeMicros:string},wallet:{balanceAtomic:string,gasBalanceMicros:string,allowanceAtomic:string,eligibility:'CONFIRMED'|'DENIED'|'UNKNOWN'},simulation:{status:'PASS'|'FAIL'|'UNKNOWN',quoteId:string,outputAtomic:string,reason:string},transport:'OK'|'TIMEOUT'|'RATE_LIMIT'|'MISSING',blockNumber:string}} Snapshot */
/** @typedef {{chainId:number,address:string,issuer:string,inputAtomic:string,rightsAcknowledged:boolean}} Intent */
/** @typedef {{maxSpendAtomic:string,maxSlippageBps:number,maxImpactBps:number,maxCostMicros:string,maxReferenceAgeMs:number,maxQuoteAgeMs:number,allowClosed:boolean,stopped:boolean,approvedAssets:readonly string[],approvedSpenders:readonly string[]}} Policy */
/** @typedef {{id:string,label:string,status:'PASS'|'WAIT'|'BLOCK',detail:string,next:string}} Check */

export const DEFAULT_POLICY = Object.freeze({maxSpendAtomic:'100000000000000000000',maxSlippageBps:100,maxImpactBps:100,maxCostMicros:'2000000',maxReferenceAgeMs:300000,maxQuoteAgeMs:30000,allowClosed:false,stopped:false,approvedAssets:Object.freeze(['56:ondo:0x1111111111111111111111111111111111111111']),approvedSpenders:Object.freeze(['FixtureRfq:0x2222222222222222222222222222222222222222'])});
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const UINT = /^(0|[1-9][0-9]*)$/;
/** @param {unknown} value @returns {bigint} */
export function uint(value) {
  if (typeof value !== 'string' || value.length > 78 || !UINT.test(value)) throw new Error('Expected canonical unsigned integer');
  return BigInt(value);
}
/** @param {string} value @param {number} decimals */
export function parseUnits(value, decimals) {
  if (typeof value!=='string' || !Number.isInteger(decimals) || decimals < 0 || decimals > 36 || value.length > 80) throw new Error('Expected a decimal string with valid precision');
  const match = /^(0|[1-9][0-9]*)(?:\.([0-9]+))?$/.exec(value);
  if (!match || (match[2]?.length ?? 0) > decimals) throw new Error('Enter a positive decimal within token precision');
  return uint((match[1] + (match[2] ?? '').padEnd(decimals,'0')).replace(/^0+(?=\d)/,'')).toString();
}
/** @param {string} atomic @param {number} decimals @param {number} [places] */
export function formatUnits(atomic, decimals, places = 6) {
  const value = uint(atomic).toString().padStart(decimals + 1,'0');
  if (!decimals) return value;
  const whole = value.slice(0,-decimals);
  const fraction = value.slice(-decimals).slice(0,places).replace(/0+$/,'');
  return whole + (fraction ? '.' + fraction : '');
}
/** @param {Snapshot} s */
export function shareAmount(s) {
  return (uint(s.quote.outputAtomic) * uint(s.asset.ratioNumerator) / uint(s.asset.ratioDenominator)).toString();
}
/** @param {unknown} value @returns {string} */
export function canonical(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (typeof value === 'object' && value) return '{' + Object.keys(value).sort().map(k => JSON.stringify(k)+':'+canonical(/** @type {Record<string, unknown>} */(value)[k])).join(',') + '}';
  throw new Error('Non-canonical value');
}
/** @param {unknown} value */
export async function digest(value) {
  const bytes = new TextEncoder().encode(canonical(value));
  return [...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
/** Shared gate collection for complete snapshots and explicitly partial observations. @param {string} [passDetail] */
export function checkCollector(passDetail='Verified for this snapshot.') {
  /** @type {Check[]} */ const checks=[];
  /** @param {string} id @param {string} label @param {boolean} pass @param {string} detail @param {string} next @param {'WAIT'|'BLOCK'} [severity] */
  const add=(id,label,pass,detail,next,severity='BLOCK')=>checks.push({id,label,status:pass?'PASS':severity,detail,next:pass?passDetail:next});
  return {checks,add};
}
/** @param {Check[]} checks @param {number} now @param {DataMode} mode */
export function gateSummary(checks,now,mode) {
  const status=checks.some(c=>c.status==='BLOCK')?'BLOCKED':checks.some(c=>c.status==='WAIT')?'WAIT':'READY_FOR_LOCAL_SIMULATION';
  return {status,checks,checkedAt:now,mode,canSign:false,canBroadcast:false};
}
/** @param {Snapshot} s @param {Intent} intent @param {Policy} policy @param {number} now */
export function evaluate(s, intent, policy = DEFAULT_POLICY, now = Date.now()) {
  const {checks,add}=checkCollector();
  try {
    if (!s || !intent || !policy || !Number.isSafeInteger(now)) throw new Error('Invalid snapshot or evaluation time');
    if (typeof policy.stopped!=='boolean' || typeof policy.allowClosed!=='boolean' || typeof intent.rightsAcknowledged!=='boolean' || !Array.isArray(policy.approvedAssets) || !Array.isArray(policy.approvedSpenders) || !policy.approvedAssets.every(x=>typeof x==='string') || !policy.approvedSpenders.every(x=>typeof x==='string')) throw new Error('Policy booleans and whitelist arrays must be explicit');
    const amount=uint(intent.inputAtomic), input=uint(s.quote.inputAtomic), output=uint(s.quote.outputAtomic), minimum=uint(s.quote.minOutputAtomic);
    const balance=uint(s.wallet.balanceAtomic), gas=uint(s.quote.gasMicros), fee=uint(s.quote.feeMicros), allowance=uint(s.wallet.allowanceAtomic);
    const cap=uint(policy.maxSpendAtomic), costCap=uint(policy.maxCostMicros), gasBalance=uint(s.wallet.gasBalanceMicros);
    uint(s.simulation.outputAtomic); uint(s.blockNumber);
    if (!Number.isInteger(s.asset.decimals) || s.asset.decimals<0 || s.asset.decimals>36 || uint(s.asset.ratioNumerator)===0n || uint(s.asset.ratioDenominator)===0n) throw new Error('Unknown token decimals or share conversion');
    if (![s.observedAt,s.quote.observedAt,s.quote.expiresAt,s.market.referenceObservedAt].every(Number.isSafeInteger)) throw new Error('Missing timestamp');
    if (![policy.maxQuoteAgeMs,policy.maxReferenceAgeMs,policy.maxSlippageBps,policy.maxImpactBps,s.quote.slippageBps,s.quote.priceImpactBps].every(x=>Number.isSafeInteger(x)&&x>=0) || s.quote.slippageBps>10000 || policy.maxSlippageBps>10000) throw new Error('Invalid limits');
    if (!['LIVE','FIXTURE','REPLAY'].includes(s.mode) || !['OPEN','CLOSED','PAUSED','UNKNOWN'].includes(s.market.status)) throw new Error('Unknown provenance or market status');
    add('stop','Stop switch',!policy.stopped,'Policy stop switch '+(policy.stopped?'is active.':'is off.'),'Clear the stop switch only after reviewing the issue.');
    add('transport','Evidence available',s.transport==='OK',s.transport==='OK'?'Snapshot is complete.':'Upstream state: '+s.transport,'Retry a read-only refresh; never reuse an old success.','WAIT');
    add('identity','Issuer-bound identity',s.asset.chainId===56 && intent.chainId===56 && ADDRESS.test(s.asset.address) && ADDRESS.test(intent.address) && s.asset.address.toLowerCase()===intent.address.toLowerCase() && s.asset.issuer===intent.issuer && policy.approvedAssets.includes('56:'+s.asset.issuer.toLowerCase()+':'+s.asset.address.toLowerCase()),'BSC · '+s.asset.issuer+' · '+s.asset.ticker,'Use the exact verified issuer contract on the chain/issuer/asset whitelist.');
    add('rights','Rights reviewed',intent.rightsAcknowledged===true && /^https:\/\//.test(s.asset.rightsUrl),'A ticker does not confer shareholder rights or issuer equivalence.','Read issuer terms and explicitly acknowledge this representation.');
    add('eligibility','Asset access permission',s.wallet.eligibility==='CONFIRMED',s.wallet.eligibility==='CONFIRMED'?'Scenario permission is confirmed; real eligibility remains personal.':'Access permission: '+s.wallet.eligibility,'Confirm issuer and API eligibility personally; do not bypass restrictions.');
    add('budget','Spend cap & balance',amount>0n && amount<=cap && amount<=balance && amount===input,'Intention, quote input, balance and cap must agree exactly.','Use a smaller permitted amount or obtain a new quote.');
    const qFresh=s.quote.observedAt<=now && now-s.quote.observedAt<=policy.maxQuoteAgeMs && now<s.quote.expiresAt && s.quote.expiresAt>s.quote.observedAt && s.observedAt<=now && now-s.observedAt<=policy.maxQuoteAgeMs;
    add('quote','Quote clock',qFresh,'Quote expires '+new Date(s.quote.expiresAt).toISOString()+'.','Refresh quote and all dependent evidence.','WAIT');
    const refFresh=s.market.independentPriceMicros!==null && uint(s.market.independentPriceMicros)>0n && s.market.referenceObservedAt<=now && now-s.market.referenceObservedAt<=policy.maxReferenceAgeMs;
    add('reference','Independent reference clock',refFresh,'A derived RWA per-share reference cannot replace an independently timestamped stock quote.','Wait for a fresh independent underlying-market reference.','WAIT');
    add('market','Market state',s.market.status==='OPEN' || (s.market.status==='CLOSED' && policy.allowClosed),'Underlying market: '+s.market.status+'. Token transferability is a separate property.','Wait for market evidence; a policy exception still requires a fresh reference.','WAIT');
    const limits=s.quote.slippageBps<=policy.maxSlippageBps && s.quote.priceImpactBps<=policy.maxImpactBps && output>0n && minimum>0n && minimum<=output && minimum*10000n>=output*BigInt(10000-s.quote.slippageBps);
    add('liquidity','Liquidity & minimum received',limits,'Impact '+s.quote.priceImpactBps+' bps · slippage '+s.quote.slippageBps+' bps.','Reduce size and requote; never raise limits to hide missing liquidity.');
    add('cost','Fees & gas cap',gas+fee<=costCap && gas<=gasBalance,'Gas + routing fee: '+formatUnits((gas+fee).toString(),6,6)+' USD equivalent.','Check fee currency, top up only with authorization, or wait.');
    add('spender','Vendor & exact allowance',!!s.quote.vendor && ADDRESS.test(s.quote.spender) && policy.approvedSpenders.includes(s.quote.vendor+':'+s.quote.spender.toLowerCase()) && allowance>=amount && allowance<=cap,'Vendor '+s.quote.vendor+'; quote-selected spender, allowance bounded by policy.','Verify quote vendorName/spender against the whitelist; do not use unlimited approval.');
    add('simulation','Transaction effects',s.simulation.status==='PASS' && s.simulation.quoteId===s.quote.id && uint(s.simulation.outputAtomic)>=minimum,'Simulation '+s.simulation.status+': '+s.simulation.reason,'Rebuild and simulate the exact current quote before any authorized signature.');
  } catch (error) {
    checks.push({id:'schema',label:'Evidence schema',status:'BLOCK',detail:error instanceof Error?error.message:'Malformed evidence',next:'Acquire complete, canonical, validated evidence. Missing fields cannot be inferred.'});
  }
  return gateSummary(checks,now,s?.mode??'FIXTURE');
}
/** @typedef {{schema:'kinegate.receipt.v1',snapshot:Snapshot,intent:Intent,policy:Policy,createdAt:number,expiresAt:number,result:ReturnType<typeof evaluate>,binding:string,mode:'SIMULATION',sourceMode:DataMode,executed:false}} Receipt */
/** @param {Snapshot} snapshot @param {Intent} intent @param {Policy} policy @param {number} now @returns {Promise<Receipt>} */
export async function createReceipt(snapshot,intent,policy,now) {
  const frozen=JSON.parse(canonical({snapshot,intent,policy}));
  const result=evaluate(frozen.snapshot,frozen.intent,frozen.policy,now);
  const body={schema:/** @type {const} */('kinegate.receipt.v1'),...frozen,createdAt:now,expiresAt:Math.min(snapshot.quote.expiresAt,now+policy.maxQuoteAgeMs),result,mode:/** @type {const} */('SIMULATION'),sourceMode:snapshot.mode,executed:/** @type {const} */(false)};
  return {...body,binding:await digest(body)};
}
/** @param {unknown} value @param {number} now @param {{snapshot:Snapshot,intent:Intent,policy:Policy}} [current] */
export async function verifyReceipt(value,now,current) {
  try {
    if (!value || typeof value!=='object') throw new Error('Malformed receipt');
    const r=/** @type {Receipt} */(value), {binding,...body}=r;
    if (r.schema!=='kinegate.receipt.v1' || r.mode!=='SIMULATION' || r.executed!==false || r.sourceMode!==r.snapshot.mode || !/^[0-9a-f]{64}$/.test(binding) || await digest(body)!==binding) throw new Error('Receipt integrity failed');
    if (!Number.isSafeInteger(now) || !Number.isSafeInteger(r.createdAt) || now<r.createdAt || now>=r.expiresAt) throw new Error('Receipt expired or future-dated');
    const recalculated=evaluate(r.snapshot,r.intent,r.policy,r.createdAt);
    if (canonical(recalculated)!==canonical(r.result) || r.result.status!=='READY_FOR_LOCAL_SIMULATION') throw new Error('Receipt does not contain a passing preflight');
    const expectedExpiry=Math.min(r.snapshot.quote.expiresAt,r.createdAt+r.policy.maxQuoteAgeMs);
    if (r.expiresAt!==expectedExpiry) throw new Error('Expiry does not match bound evidence');
    if (current && canonical(current)!==canonical({snapshot:r.snapshot,intent:r.intent,policy:r.policy})) throw new Error('Intention or evidence changed; rerun preflight');
    if (evaluate(r.snapshot,r.intent,r.policy,now).status!=='READY_FOR_LOCAL_SIMULATION') throw new Error('Evidence no longer passes at verification time');
    return {valid:true,reason:'Integrity and current gates pass. Hash is not an issuer signature or chain receipt.'};
  } catch(error) {return {valid:false,reason:error instanceof Error?error.message:'Verification failed'};}
}
/** A deliberately simplified display-price baseline. Never an execution strategy. @param {Snapshot} s */
export function priceOnlyBaseline(s) {
  try {
    if (!s.market.independentPriceMicros || uint(s.quote.outputAtomic)===0n) return false;
    const shares=uint(shareAmount(s));
    const displayedCostMicros=uint(s.quote.inputAtomic)*1000000n/1000000000000000000n;
    return displayedCostMicros*10n**BigInt(s.asset.decimals)<=shares*uint(s.market.independentPriceMicros)*102n/100n;
  } catch {return false;}
}
