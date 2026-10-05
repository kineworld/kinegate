import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,parseUnits,formatUnits,createReceipt,verifyReceipt,canonical,DEFAULT_POLICY,priceOnlyBaseline} from '../src/engine.mjs';
import {scenario,scenarios,FIXTURE_TIME} from '../src/fixtures.mjs';

for (const item of scenarios) test('Scenario: '+item.id,()=>{
  const {snapshot,intent,policy,now}=scenario(item.id);
  const r=evaluate(snapshot,intent,policy,now);
  assert.equal(r.status==='READY_FOR_LOCAL_SIMULATION',item.expectedSafe);
  assert.equal(r.canSign,false); assert.equal(r.canBroadcast,false);
  assert.ok(r.checks.length>=13);
});
test('Fixed point preserves >2^53 and exact decimals',()=>{
  assert.equal(parseUnits('0.2701',18),'270100000000000000');
  assert.equal(parseUnits('50',18),'50000000000000000000');
  assert.equal(parseUnits('0',18),'0');
  assert.equal(formatUnits('270100000000000000',18),'0.2701');
  for(const value of ['NaN','-1','1e18',' 1','1.0000001','01','Infinity']) assert.throws(()=>parseUnits(value,6));
});
test('Malformed/ambiguous evidence never passes',()=>{
  for (const mutate of [s=>delete s.market.referenceObservedAt,s=>s.quote.inputAtomic='-1',s=>s.quote.outputAtomic='1e18',s=>s.asset.ratioDenominator='0',s=>s.quote.slippageBps=NaN,s=>s.quote.expiresAt=Infinity,s=>s.mode='UNKNOWN']) {
    const {snapshot,intent,policy,now}=scenario('open'); mutate(snapshot);
    assert.equal(evaluate(snapshot,intent,policy,now).status,'BLOCKED');
  }
});
test('Issuer and spender whitelist reject mutually matching forged identities',()=>{
  const {snapshot,intent,policy,now}=scenario('open');
  snapshot.asset.address=intent.address='0x3333333333333333333333333333333333333333';
  snapshot.quote.spender='0x4444444444444444444444444444444444444444';
  const r=evaluate(snapshot,intent,policy,now);
  assert.equal(r.checks.find(x=>x.id==='identity').status,'BLOCK');
  assert.equal(r.checks.find(x=>x.id==='spender').status,'BLOCK');
});
test('Minimum received and exact allowance boundaries',()=>{
  const data=scenario('open');
  data.snapshot.quote.minOutputAtomic='1';
  assert.equal(evaluate(data.snapshot,data.intent,data.policy,data.now).status,'BLOCKED');
  const other=scenario('open');other.snapshot.wallet.allowanceAtomic=(BigInt(DEFAULT_POLICY.maxSpendAtomic)+1n).toString();
  assert.equal(evaluate(other.snapshot,other.intent,other.policy,other.now).status,'BLOCKED');
});
test('Closed market exception does not excuse stale independent reference',()=>{
  const d=scenario('closed');d.policy.allowClosed=true;
  assert.equal(evaluate(d.snapshot,d.intent,d.policy,d.now).status,'WAIT');
  d.snapshot.market.referenceObservedAt=d.now-1;
  assert.equal(evaluate(d.snapshot,d.intent,d.policy,d.now).status,'READY_FOR_LOCAL_SIMULATION');
});
test('Receipt binds intention/policy/evidence and detects tampering',async()=>{
  const d=scenario('open'),receipt=await createReceipt(d.snapshot,d.intent,d.policy,d.now);
  assert.equal((await verifyReceipt(receipt,d.now+1,{snapshot:d.snapshot,intent:d.intent,policy:d.policy})).valid,true);
  assert.equal(receipt.executed,false);assert.equal(receipt.mode,'SIMULATION');assert.equal(receipt.sourceMode,'FIXTURE');
  const tampered=structuredClone(receipt);tampered.intent.inputAtomic='1';
  assert.equal((await verifyReceipt(tampered,d.now+1)).valid,false);
  d.intent.inputAtomic=parseUnits('51',18);
  assert.match((await verifyReceipt(receipt,d.now+1,d)).reason,/changed/);
});
test('Receipt is independent of mutable source and expires at shortest clock',async()=>{
  const d=scenario('open');const receipt=await createReceipt(d.snapshot,d.intent,d.policy,d.now);
  d.snapshot.quote.outputAtomic='0';
  assert.equal((await verifyReceipt(receipt,d.now+1)).valid,true);
  assert.equal((await verifyReceipt(receipt,d.now+30000)).valid,false);
  assert.equal((await verifyReceipt(receipt,d.now-1)).valid,false);
  assert.equal(canonical({b:2,a:1}),canonical({a:1,b:2}));
});
test('Blocked receipt cannot be relabeled as passing',async()=>{
  const d=scenario('permission'),r=await createReceipt(d.snapshot,d.intent,d.policy,d.now);
  assert.equal((await verifyReceipt(r,d.now)).valid,false);
});
test('Zero slippage uses exact minimum; stop overrides green fixture',()=>{
  const d=scenario('open');d.policy.stopped=true;
  assert.equal(evaluate(d.snapshot,d.intent,d.policy,d.now).status,'BLOCKED');
  d.policy.stopped=false;d.snapshot.quote.slippageBps=0;d.policy.maxSlippageBps=0;
  assert.equal(evaluate(d.snapshot,d.intent,d.policy,d.now).status,'BLOCKED');
  d.snapshot.quote.minOutputAtomic=d.snapshot.quote.outputAtomic;
  assert.equal(evaluate(d.snapshot,d.intent,d.policy,d.now).status,'READY_FOR_LOCAL_SIMULATION');
});
test('Price-only comparison is insufficient for a permission-denied fixture',()=>{
  const d=scenario('permission');assert.equal(priceOnlyBaseline(d.snapshot),true);
  assert.equal(evaluate(d.snapshot,d.intent,d.policy,d.now).status,'BLOCKED');
});
test('Review regressions: malformed policy and numeric inputs fail closed',()=>{
  for(const change of [p=>delete p.stopped,p=>p.allowClosed='false',p=>p.approvedAssets=p.approvedAssets.join(','),p=>p.approvedSpenders=null]) {
    const d=scenario('open');change(d.policy);assert.equal(evaluate(d.snapshot,d.intent,d.policy,d.now).status,'BLOCKED');
  }
  assert.throws(()=>parseUnits(9007199254740993,0));
  assert.throws(()=>DEFAULT_POLICY.approvedAssets.push('unreviewed'));
  assert.throws(()=>DEFAULT_POLICY.approvedSpenders.push('unreviewed'));
});
