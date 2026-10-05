import {DEFAULT_POLICY,parseUnits} from './engine.mjs';
/** @typedef {import('./engine.mjs').Snapshot} Snapshot */
/** @typedef {import('./engine.mjs').Intent} Intent */
export const FIXTURE_TIME=Date.parse('2026-10-05T14:00:00.000Z');
/** @returns {Snapshot} */
export function baseSnapshot() {
  return {id:'fixture-open',mode:'FIXTURE',observedAt:FIXTURE_TIME-1000,blockNumber:'0',asset:{chainId:56,address:'0x1111111111111111111111111111111111111111',issuer:'Ondo',ticker:'NVDAon',decimals:18,ratioNumerator:'1',ratioDenominator:'1',rightsUrl:'https://docs.ondo.finance/global-markets'},market:{status:'OPEN',referenceObservedAt:FIXTURE_TIME-20000,independentPriceMicros:'185000000',nextOpen:'2026-10-06T13:30:00Z'},quote:{id:'fixture-quote-001',observedAt:FIXTURE_TIME-1000,expiresAt:FIXTURE_TIME+45000,inputAtomic:parseUnits('50',18),outputAtomic:parseUnits('0.2701',18),minOutputAtomic:parseUnits('0.2687495',18),vendor:'FixtureRfq',spender:'0x2222222222222222222222222222222222222222',priceImpactBps:22,slippageBps:50,gasMicros:'80000',feeMicros:'50000'},wallet:{balanceAtomic:parseUnits('100',18),gasBalanceMicros:'5000000',allowanceAtomic:parseUnits('50',18),eligibility:'CONFIRMED'},simulation:{status:'PASS',quoteId:'fixture-quote-001',outputAtomic:parseUnits('0.2701',18),reason:'Local fixture effects match minimum received. No chain call.'},transport:'OK'};
}
export const scenarios=[
  {id:'open',title:'A trade that clears',subtitle:'Fresh clocks, matched identity, bounded spend.',group:'Normal',expectedSafe:true},
  {id:'closed',title:'The weekend illusion',subtitle:'A cheaper token against an old closing price.',group:'Market clock',expectedSafe:false},
  {id:'issuer',title:'Same ticker, different claim',subtitle:'The intention names a different issuer.',group:'Identity',expectedSafe:false},
  {id:'stale',title:'Quote expired',subtitle:'A display price survived its executable quote.',group:'Quote clock',expectedSafe:false},
  {id:'liquidity',title:'Thin liquidity',subtitle:'The price looks fine until your size hits the route.',group:'Liquidity',expectedSafe:false},
  {id:'balance',title:'Insufficient balance',subtitle:'A route exists; the wallet cannot fund it.',group:'Wallet',expectedSafe:false},
  {id:'permission',title:'Access denied',subtitle:'A quote cannot override issuer permission.',group:'Permission',expectedSafe:false},
  {id:'timeout',title:'API timeout',subtitle:'Missing upstream evidence never becomes a pass.',group:'Transport',expectedSafe:false},
  {id:'rate-limit',title:'Rate limit',subtitle:'Refresh failed; do not reuse a previous green light.',group:'Transport',expectedSafe:false},
  {id:'simulation',title:'Simulation failed',subtitle:'The route has a price but its effects do not pass.',group:'Simulation',expectedSafe:false},
  {id:'spender',title:'Wrong vendor allowance',subtitle:'The quote requires a different spender.',group:'Vendor',expectedSafe:false},
  {id:'missing',title:'Reference missing',subtitle:'RWA referencePrice cannot replace lastPrice.',group:'Evidence',expectedSafe:false},
  {id:'paused',title:'Asset paused',subtitle:'Fresh prices do not establish trading permission.',group:'Market state',expectedSafe:false},
  {id:'gas',title:'Gas cap exceeded',subtitle:'Output alone hides an unaffordable execution.',group:'Cost',expectedSafe:false},
  {id:'future',title:'Clock disagreement',subtitle:'Future timestamps invalidate evidence.',group:'Clock',expectedSafe:false},
  {id:'small',title:'A smaller valid intention',subtitle:'Same constraints, a correctly bound lower amount.',group:'Normal',expectedSafe:true}
];
/** @param {string} id */
export function scenario(id) {
  const s=baseSnapshot();
  /** @type {Intent} */ const intent={chainId:56,address:s.asset.address,issuer:s.asset.issuer,inputAtomic:s.quote.inputAtomic,rightsAcknowledged:true};
  const policy={...DEFAULT_POLICY};
  s.id='fixture-'+id;
  switch(id) {
    case 'closed':s.market.status='CLOSED';s.market.referenceObservedAt=FIXTURE_TIME-48*3600000;break;
    case 'issuer':intent.issuer='xStocks';break;
    case 'stale':s.quote.expiresAt=FIXTURE_TIME-1;break;
    case 'liquidity':s.quote.priceImpactBps=650;break;
    case 'balance':s.wallet.balanceAtomic=parseUnits('12',18);break;
    case 'permission':s.wallet.eligibility='DENIED';break;
    case 'timeout':s.transport='TIMEOUT';break;
    case 'rate-limit':s.transport='RATE_LIMIT';break;
    case 'simulation':s.simulation.status='FAIL';s.simulation.reason='Fixture route reverted: transfer rejected.';break;
    case 'spender':s.wallet.allowanceAtomic='0';break;
    case 'missing':s.market.independentPriceMicros=null;break;
    case 'paused':s.market.status='PAUSED';break;
    case 'gas':s.quote.gasMicros='6000000';break;
    case 'future':s.quote.observedAt=FIXTURE_TIME+10000;break;
    case 'small':s.quote.inputAtomic=parseUnits('25',18);s.quote.outputAtomic=parseUnits('0.13505',18);s.quote.minOutputAtomic=parseUnits('0.13437475',18);s.simulation.outputAtomic=s.quote.outputAtomic;intent.inputAtomic=s.quote.inputAtomic;break;
    case 'open':break;
    default:throw new Error('Unknown fixture scenario');
  }
  return {snapshot:s,intent,policy,now:FIXTURE_TIME};
}
