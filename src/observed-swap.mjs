/** Partial, historical SWAP evidence. Never promote this into a complete Snapshot. */
import {canonical,digest,uint,checkCollector,gateSummary,DEFAULT_POLICY} from './engine.mjs';

export const OBSERVED_ASSET='0x390a684ef9cade28a7ad0dfa61ab1eb3842618c4';
export const OBSERVED_INPUT='0x55d398326f99059ff775485246999027b3197955';
export const OBSERVED_SOURCES=Object.freeze([
  'evidence/devex/unsigned-swap-allowance-validation.json',
  'evidence/devex/authenticated-rwa.json',
  'evidence/mainnet/current-api-asset-readonly.json',
  'evidence/mainnet/settlement-usdt-readonly.json'
]);
export const OBSERVED_POLICY=Object.freeze({...DEFAULT_POLICY,maxSpendAtomic:'6000000000000000000',maxSlippageBps:50,approvedAssets:Object.freeze(['56:ondo:'+OBSERVED_ASSET]),approvedSpenders:Object.freeze([])});
/** Raw JSON boundary only; each exported fact is downselected and checked below. @param {unknown} x @returns {Record<string, any>} */
const object=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
/** @param {unknown} x */
const address=x=>typeof x==='string'?x.toLowerCase():null;
/** @param {unknown} x */
const text=x=>typeof x==='string'&&x.length<=500?x:null;
/** @param {unknown} x */
const timestamp=x=>typeof x==='string'&&Number.isSafeInteger(Date.parse(x))?x:null;
/** @param {unknown} x */
const atomic=x=>{try{return uint(x).toString();}catch{return null;}};
/** @param {unknown} x */
const fraction=x=>typeof x==='string'&&/^(0|[1-9][0-9]*)(\.[0-9]{1,18})?$/.test(x)?x:null;
/** @param {unknown} x @returns {Record<string, any>[]} */
const packets=x=>Array.isArray(x)?x:[];
/** @param {Record<string, any>} data @param {number} id */
const rpc=(data,id)=>packets(data.rawResponses??data.responses).find(p=>object(p).id===id)?.result;
/** @param {Record<string, any>} data @param {string} contract */
function chainMatches(data,contract) {
  try{
    const requests=packets(data.requests),get=/** @param {number} id */(id)=>requests.find(p=>p.id===id),code=get(3),symbol=get(4),decimals=get(5);
    const symbolHex=rpc(data,4);if(typeof symbolHex!=='string'||!/^0x[0-9a-f]+$/i.test(symbolHex))return false;
    const size=Number(BigInt('0x'+symbolHex.slice(66,130)));if(size<1||size>32)return false;
    const decoded=new TextDecoder().decode(new Uint8Array((symbolHex.slice(130,130+size*2).match(/../g)??[]).map(x=>parseInt(x,16))));
    return data.mode==='LIVE'&&data.readOnly===true&&data.chainId===56&&address(data.contract)===contract&&get(1)?.method==='eth_chainId'&&rpc(data,1)==='0x38'&&code?.method==='eth_getCode'&&address(code.params?.[0])===contract&&symbol?.method==='eth_call'&&address(symbol.params?.[0]?.to)===contract&&symbol.params?.[0]?.data==='0x95d89b41'&&decimals?.method==='eth_call'&&address(decimals.params?.[0]?.to)===contract&&decimals.params?.[0]?.data==='0x313ce567'&&decoded===data.symbol&&BigInt(rpc(data,5))===18n&&data.decimals===18&&typeof rpc(data,3)==='string'&&/^0x[0-9a-f]+$/i.test(rpc(data,3))&&rpc(data,3)!=='0x';
  }catch{return false;}
}
/** Downselect only public facts. Receiver, balance, quote ID and calldata are never bound/exported.
 * @param {unknown} swapInput @param {unknown} rwaInput @param {unknown} assetChainInput @param {unknown} inputChainInput */
export function observeSwap(swapInput,rwaInput,assetChainInput,inputChainInput) {
  const swap=object(swapInput),rwa=object(rwaInput),assetChain=object(assetChainInput),inputChain=object(inputChainInput);
  const inputs=object(swap.inputs),quote=object(swap.quote),builder=object(swap.builder),tx=object(builder.tx),simulation=object(swap.simulation),asset=object(rwa.asset);
  const calls=packets(swap.requests).map(p=>{p=object(p);return {endpoint:text(p.endpoint),timestamp:timestamp(p.timestamp),httpStatus:typeof p.httpStatus==='number'?p.httpStatus:null,businessCode:typeof p.businessCode==='number'?p.businessCode:null};});
  const stages=['/api/v1/dex/aggregator/quote','/api/v1/dex/aggregator/swap','/api/v1/dex/pre-transaction/simulate'];
  const stagesOK=calls.length===3&&stages.every((endpoint,i)=>calls[i]?.endpoint===endpoint&&calls[i]?.httpStatus===200&&calls[i]?.businessCode===0);
  const assetVerified=chainMatches(assetChain,OBSERVED_ASSET)&&assetChain.symbol==='AAPLon'&&rwa.schema==='kinegate.rwa-evidence.v1'&&rwa.mode==='LIVE'&&rwa.readOnly===true&&asset.binanceChainId==='56'&&address(asset.tokenContractAddress)===OBSERVED_ASSET&&asset.platformId==='ondo'&&asset.tokenSymbol==='AAPLon'&&asset.decimals==='18'&&rwa.catalog?.apiCode===0;
  const inputVerified=chainMatches(inputChain,OBSERVED_INPUT)&&inputChain.symbol==='USDT';
  const sourceValid=swap.schema==='kinegate.unsigned-swap-evidence.v1'&&swap.mode==='LIVE'&&swap.unsignedOnly===true&&swap.offChainOnly===true&&swap.walletSignatures===0&&swap.approvals===0&&swap.broadcasts===0&&inputs.approveTransaction==='false'&&stagesOK&&quote.executionMode==='SWAP'&&builder.executionMode==='SWAP';
  return {
    schema:'kinegate.observed-swap.v1',mode:'REPLAY',sourceValid,
    provenance:OBSERVED_SOURCES.map((path,i)=>({path,acquiredAt:timestamp([swap,rwa,assetChain,inputChain][i].observedAt)})),calls,
    chainObservations:[assetChain,inputChain].map(data=>({contract:address(data.contract),chainId:text(rpc(data,1)),block:text(rpc(data,2)),symbol:text(data.symbol),decimals:typeof data.decimals==='number'?data.decimals:null,decimalsResult:text(rpc(data,5)),symbolResult:text(rpc(data,4)),codePresent:typeof rpc(data,3)==='string'&&rpc(data,3)!=='0x'})),
    asset:{chainId:56,address:address(inputs.toTokenAddress),issuer:text(asset.platformId),ticker:text(asset.tokenSymbol),decimals:assetVerified?18:null,verified:assetVerified},
    input:{address:address(inputs.fromTokenAddress),symbol:inputVerified?'USDT':null,decimals:inputVerified?18:null,verified:inputVerified},
    requestedChainId:text(inputs.chainId),requestedInputAtomic:atomic(inputs.amount),
    quote:{inputAtomic:atomic(quote.fromTokenAmount),outputAtomic:atomic(quote.toTokenAmount),vendor:text(quote.vendorName),executionMode:text(quote.executionMode),observedAt:calls[0]?.timestamp??null,expiresAt:null,priceImpactPercent:fraction(quote.priceImpactPercent),tradeFee:text(quote.tradeFee),feeCurrency:null,estimateGasFee:text(quote.estimateGasFee),gasFeeCurrency:null},
    builder:{executionMode:text(builder.executionMode),target:address(tx.to),minOutputAtomic:atomic(tx.minReceiveAmount),slippagePercent:fraction(tx.slippagePercent),gas:text(tx.gas),gasPrice:text(tx.gasPrice)},
    market:{recordedStatus:text(asset.statusInfo?.marketStatus),independentPrice:null,independentObservedAt:null},
    wallet:{eligibility:null,balanceAtomic:null,gasBalance:null,allowanceAtomic:null,approvedSpender:null},
    simulation:{status:text(simulation.status),reason:text(simulation.failReason),effectsAuthenticated:false},
    executed:false,canSign:false,canBroadcast:false
  };
}
export function observedIntent(inputAtomic='6000000000000000000',rightsAcknowledged=false) {
  return {chainId:56,address:OBSERVED_ASSET,issuer:'ondo',inputAtomic,rightsAcknowledged};
}
/** @param {string|null} value @param {number} bps */
function percentWithin(value,bps) {
  if(!fraction(value)||!Number.isSafeInteger(bps)||bps<0)return false;
  const [whole,part='']=/** @type {string} */(value).split('.'),scale=10n**BigInt(part.length);
  return (BigInt(whole)*scale+BigInt(part||'0'))*100n<=BigInt(bps)*scale;
}
/** The same 13 gate identities, with UNKNOWN represented explicitly rather than fabricated zeros.
 * @param {ReturnType<typeof observeSwap>} evidence @param {import('./engine.mjs').Intent} intent @param {import('./engine.mjs').Policy} policy @param {number} now */
export function evaluateObservedSwap(evidence,intent,policy=OBSERVED_POLICY,now=Date.now()) {
  const {checks,add}=checkCollector('Verified in the historical record; no execution permission.');
  try {
    if(evidence?.schema!=='kinegate.observed-swap.v1'||evidence.mode!=='REPLAY'||!intent||!policy||!Number.isSafeInteger(now)||typeof policy.stopped!=='boolean'||typeof intent.rightsAcknowledged!=='boolean'||!Array.isArray(policy.approvedAssets))throw new Error('Malformed partial evidence or intent');
    const e=evidence,q=e.quote,b=e.builder,amount=uint(intent.inputAtomic),cap=uint(policy.maxSpendAtomic);
    const acquired=e.provenance.length===4&&e.provenance.every(p=>timestamp(p.acquiredAt)&&Date.parse(p.acquiredAt??'')<=now)&&e.calls.every(p=>timestamp(p.timestamp)&&Date.parse(p.timestamp??'')<=now);
    add('stop','Stop switch',!policy.stopped,'Policy stop switch '+(policy.stopped?'is active.':'is off.'),'Review the stop condition.');
    add('transport','Evidence available',e.sourceValid&&acquired,'Historical quote → unsigned SWAP → simulation records; acquisition time is not quote expiry.','Load all timestamped, successful acquisition records.','WAIT');
    const identity=e.asset.verified&&e.input.verified&&e.requestedChainId==='56'&&e.asset.address===OBSERVED_ASSET&&e.input.address===OBSERVED_INPUT&&intent.chainId===56&&address(intent.address)===e.asset.address&&intent.issuer===e.asset.issuer&&policy.approvedAssets.includes('56:ondo:'+OBSERVED_ASSET);
    add('identity','Issuer-bound identity',identity,'BSC / Ondo / AAPLon and Binance-Peg USDT: exact recorded contracts and chain-read decimals.','Match issuer catalog, read-only chain evidence and intention.');
    add('rights','Rights reviewed',intent.rightsAcknowledged===true,'Personal acknowledgement only; AAPLon is not direct Apple stock ownership.','Read issuer terms and acknowledge this representation.','WAIT');
    add('eligibility','Asset access permission',false,'No current personal eligibility evidence is present.','Confirm eligibility personally.','WAIT');
    const matches=amount>0n&&amount<=cap&&intent.inputAtomic===e.requestedInputAtomic&&intent.inputAtomic===q.inputAtomic;
    add('budget','Spend cap & balance',false,matches?'6-USDT quote amount matches the intention and cap; current balance is unknown.':'Amount or cap does not match the captured quote. No replacement quote is synthesized.',matches?'Obtain current permitted-wallet balance.':'Obtain a new amount-bound quote.',matches?'WAIT':'BLOCK');
    add('quote','Quote clock',false,'Historical quote acquired '+String(q.observedAt)+'; no source expiry was captured.','Fetch a fresh quote with documented validity.','WAIT');
    add('reference','Independent reference clock',false,'RWA referencePrice is derived from token price; no independent stock quote is bound.','Obtain independently timestamped underlying-market evidence.','WAIT');
    add('market','Market state',false,'Historical API context: '+String(e.market.recordedStatus)+'. It does not establish current stock-market freshness.','Refresh market context; a closed-session policy exception still needs fresh reference evidence.','WAIT');
    const complete=q.outputAtomic!==null&&b.minOutputAtomic!==null&&b.slippagePercent!==null&&q.priceImpactPercent!==null;
    const output=q.outputAtomic===null?null:uint(q.outputAtomic),minimum=b.minOutputAtomic===null?null:uint(b.minOutputAtomic);
    let violation=(output!==null&&output<=0n)||(minimum!==null&&minimum<=0n)||(output!==null&&minimum!==null&&minimum>output);
    if(b.slippagePercent!==null)violation ||= !percentWithin(b.slippagePercent,policy.maxSlippageBps);
    if(q.priceImpactPercent!==null)violation ||= !percentWithin(q.priceImpactPercent,policy.maxImpactBps);
    if(output!==null&&minimum!==null&&b.slippagePercent!==null){const [whole,part='']=b.slippagePercent.split('.'),scale=10n**BigInt(part.length),slip=BigInt(whole)*scale+BigInt(part||'0');violation ||= minimum*100n*scale<output*(100n*scale-slip);}
    add('liquidity','Liquidity & minimum received',complete&&!violation,'Declared unsigned-builder minimum: '+String(b.minOutputAtomic)+' atomic AAPLon; slippage '+String(b.slippagePercent)+'%; impact '+String(q.priceImpactPercent)+'%. '+(violation?'Known numeric fields violate the exact policy boundary; no floor-rounding tolerance.':complete?'Declared numeric fields meet the exact boundary.':'Numerical evidence is incomplete.')+' This does not prove on-chain minimum enforcement.','Require complete, policy-bounded numerical fields and independently verify actual payload enforcement; this replay is not live liquidity.',violation?'BLOCK':'WAIT');
    add('cost','Fees & gas cap',false,'tradeFee '+String(q.tradeFee)+' / estimateGasFee '+String(q.estimateGasFee)+': currency and USD conversion were not established.','Verify fee units, conversion and current gas balance.','WAIT');
    add('spender','Vendor & exact allowance',false,'Vendor '+String(q.vendor)+'; builder target '+String(b.target)+' is not an approved allowance spender. Current allowance is unknown.','Independently verify the exact spender and bounded allowance.','WAIT');
    add('simulation','Transaction effects',false,'Recorded off-chain simulation '+String(e.simulation.status)+': '+String(e.simulation.reason)+'. No transaction executed.','Resolve the failure and re-simulate the exact authorized payload.',e.simulation.status==='FAILED'?'BLOCK':'WAIT');
  }catch(error){checks.push({id:'schema',label:'Evidence schema',status:'BLOCK',detail:error instanceof Error?error.message:'Malformed partial evidence',next:'Load validated partial records; unknown fields cannot be inferred.'});}
  return {...gateSummary(checks,now,'REPLAY'),executable:false};
}
/** Historical integrity audit, distinct schema from an executable/local-simulation receipt.
 * @param {ReturnType<typeof observeSwap>} evidence @param {import('./engine.mjs').Intent} intent @param {import('./engine.mjs').Policy} policy @param {number} now */
export async function createObservedAudit(evidence,intent,policy=OBSERVED_POLICY,now=Date.now()) {
  const frozen=JSON.parse(canonical({evidence,intent,policy}));
  const body={schema:'kinegate.observed-audit.v1',...frozen,createdAt:now,result:evaluateObservedSwap(frozen.evidence,frozen.intent,frozen.policy,now),mode:'REPLAY',purpose:'NON_EXECUTABLE_AUDIT',executed:false,canSign:false,canBroadcast:false};
  return {...body,binding:await digest(body)};
}
/** @param {unknown} value @param {{evidence:ReturnType<typeof observeSwap>,intent:import('./engine.mjs').Intent,policy:import('./engine.mjs').Policy}} [current] */
export async function verifyObservedAudit(value,current) {
  try {
    if(!value||typeof value!=='object')throw new Error('Malformed audit');
    const {binding,...body}=/** @type {Awaited<ReturnType<typeof createObservedAudit>>} */(value);
    if(body.schema!=='kinegate.observed-audit.v1'||body.mode!=='REPLAY'||body.purpose!=='NON_EXECUTABLE_AUDIT'||body.executed!==false||body.canSign!==false||body.canBroadcast!==false||!Number.isSafeInteger(body.createdAt)||typeof binding!=='string'||!/^[0-9a-f]{64}$/.test(binding)||await digest(body)!==binding)throw new Error('Audit integrity failed');
    const result=evaluateObservedSwap(body.evidence,body.intent,body.policy,body.createdAt);
    if(canonical(result)!==canonical(body.result)||result.checks.length!==13||result.status==='READY_FOR_LOCAL_SIMULATION'||result.executable!==false)throw new Error('Audit does not contain a valid non-executable partial preflight');
    if(current&&canonical(current)!==canonical({evidence:body.evidence,intent:body.intent,policy:body.policy}))throw new Error('Intention, policy or source evidence changed; rerun observed preflight');
    return {valid:true,reason:'Bound historical fields are unchanged. Hash proves consistency, not issuer authenticity, live freshness or execution permission.',canSign:false,canBroadcast:false};
  }catch(error){return {valid:false,reason:error instanceof Error?error.message:'Verification failed',canSign:false,canBroadcast:false};}
}
