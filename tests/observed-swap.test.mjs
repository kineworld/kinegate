import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {OBSERVED_SOURCES,OBSERVED_POLICY,observeSwap,observedIntent,evaluateObservedSwap,createObservedAudit,verifyObservedAudit} from '../src/observed-swap.mjs';
import {evaluate,verifyReceipt} from '../src/engine.mjs';
import {scenario} from '../src/fixtures.mjs';
const records=await Promise.all(OBSERVED_SOURCES.map(path=>readFile(new URL('../'+path,import.meta.url),'utf8').then(JSON.parse)));
const now=Date.parse('2026-10-05T14:00:00Z');
const evidence=()=>observeSwap(...structuredClone(records));
const gate=(result,id)=>result.checks.find(check=>check.id===id);

test('Actual partial SWAP uses the same 13 gates and blocks the genuine allowance failure',()=>{
  const e=evidence(),result=evaluateObservedSwap(e,observedIntent(),OBSERVED_POLICY,now),fixture=scenario('open');
  assert.deepEqual(result.checks.map(c=>[c.id,c.label]),evaluate(fixture.snapshot,fixture.intent,fixture.policy,fixture.now).checks.map(c=>[c.id,c.label]));
  assert.equal(result.status,'BLOCKED');assert.equal(result.mode,'REPLAY');assert.equal(result.canSign,false);assert.equal(result.canBroadcast,false);assert.equal(result.executable,false);
  assert.equal(gate(result,'identity').status,'PASS');assert.equal(gate(result,'liquidity').status,'BLOCK');assert.equal(gate(result,'simulation').status,'BLOCK');assert.match(gate(result,'simulation').detail,/exceeds allowance/);
  for(const id of ['eligibility','budget','quote','reference','market','cost','spender'])assert.equal(gate(result,id).status,'WAIT');
  assert.equal(e.quote.expiresAt,null);assert.equal(e.wallet.balanceAtomic,null);assert.equal(e.quote.feeCurrency,null);
});
test('Declared minimum uses exact crossmultiplication: one atomic crosses the boundary, absent numbers WAIT',()=>{
  const e=evidence(),check=()=>gate(evaluateObservedSwap(e,observedIntent(),OBSERVED_POLICY,now),'liquidity');
  const output=BigInt(e.quote.outputAtomic),minimum=BigInt(e.builder.minOutputAtomic);
  assert.equal(minimum*10000n-output*9950n,-850n);assert.equal(check().status,'BLOCK');
  e.builder.minOutputAtomic=(minimum+1n).toString();assert.equal(check().status,'PASS');assert.match(check().detail,/does not prove on-chain minimum enforcement/);
  e.quote.priceImpactPercent=null;assert.equal(check().status,'WAIT');
  e.builder.minOutputAtomic=minimum.toString();assert.equal(check().status,'BLOCK');
  e.builder.minOutputAtomic=null;assert.equal(check().status,'WAIT');
  e.quote.priceImpactPercent='1.0000000001';assert.equal(check().status,'BLOCK');
  e.quote.priceImpactPercent='0';e.quote.outputAtomic='200';e.builder.minOutputAtomic='199';assert.equal(check().status,'PASS');
  e.builder.minOutputAtomic='198';assert.equal(check().status,'BLOCK');
});
test('Audit hash binds amount, acknowledgement, policy and observed source fields; it is not a receipt',async()=>{
  const e=evidence(),intent=observedIntent(),audit=await createObservedAudit(e,intent,OBSERVED_POLICY,now),current={evidence:e,intent,policy:OBSERVED_POLICY};
  assert.equal((await verifyObservedAudit(audit,current)).valid,true);assert.equal((await verifyReceipt(audit,now)).valid,false);
  const tamper=structuredClone(audit);tamper.evidence.builder.minOutputAtomic='1';assert.equal((await verifyObservedAudit(tamper,current)).valid,false);
  for(const change of [()=>({...current,intent:observedIntent('7000000000000000000')}),()=>({...current,intent:observedIntent(intent.inputAtomic,true)}),()=>({...current,policy:{...OBSERVED_POLICY,stopped:true}}),()=>{const changed=structuredClone(e);changed.provenance[0].acquiredAt='2026-10-05T12:38:50Z';return {...current,evidence:changed};}])assert.equal((await verifyObservedAudit(audit,change())).valid,false);
  const publicJSON=JSON.stringify(audit);for(const field of ['receiver','quoteId','calldata','REDACTED'])assert.equal(publicJSON.includes(field),false);
  assert.equal(gate(evaluateObservedSwap(e,observedIntent('7000000000000000000'),OBSERVED_POLICY,now),'budget').status,'BLOCK');
  const changedBlock=structuredClone(e);changedBlock.chainObservations[0].block='0x7808a03';assert.equal((await verifyObservedAudit(audit,{...current,evidence:changedBlock})).valid,false);
});
test('Missing acquisition time, invalid chain precision and mismatched identity fail closed',()=>{
  const missing=structuredClone(records);delete missing[0].observedAt;
  assert.equal(gate(evaluateObservedSwap(observeSwap(...missing),observedIntent(),OBSERVED_POLICY,now),'transport').status,'WAIT');
  const wrong=structuredClone(records);wrong[3].responses.find(p=>p.id===5).result='0x6';
  const e=observeSwap(...wrong);assert.equal(e.input.decimals,null);assert.equal(gate(evaluateObservedSwap(e,observedIntent(),OBSERVED_POLICY,now),'identity').status,'BLOCK');
  assert.equal(gate(evaluateObservedSwap(evidence(),{...observedIntent(),issuer:'bstock'},OBSERVED_POLICY,now),'identity').status,'BLOCK');
  const unrelated=structuredClone(records);unrelated[2].requests.find(p=>p.id===5).params[0].to='0x1111111111111111111111111111111111111111';assert.equal(gate(evaluateObservedSwap(observeSwap(...unrelated),observedIntent(),OBSERVED_POLICY,now),'identity').status,'BLOCK');
});
test('Unknown fee units and approval target never become PASS, even with permissive policy or asserted success',()=>{
  const e=evidence();e.builder.minOutputAtomic=(BigInt(e.builder.minOutputAtomic)+1n).toString();e.simulation.status='PASS';e.simulation.reason='Unverified assertion';e.wallet.eligibility='CONFIRMED';e.wallet.balanceAtomic='999999999999999999999';e.wallet.allowanceAtomic='999999999999999999999';
  const policy={...OBSERVED_POLICY,maxCostMicros:'999999999999999999999',approvedSpenders:[e.quote.vendor+':'+e.builder.target],allowClosed:true};
  const result=evaluateObservedSwap(e,observedIntent('6000000000000000000',true),policy,now);
  assert.equal(result.status,'WAIT');assert.equal(gate(result,'cost').status,'WAIT');assert.equal(gate(result,'spender').status,'WAIT');assert.equal(gate(result,'simulation').status,'WAIT');assert.equal(result.executable,false);
});
test('Malformed evidence cannot produce a valid audit or any ready path',async()=>{
  for(const value of [null,{}, {...evidence(),mode:'LIVE'}, {...evidence(),quote:null}]){
    const result=evaluateObservedSwap(value,observedIntent(),OBSERVED_POLICY,now);assert.equal(result.status,'BLOCKED');assert.equal(result.canSign,false);
    const audit=await createObservedAudit(value,observedIntent(),OBSERVED_POLICY,now);assert.equal((await verifyObservedAudit(audit)).valid,false);
  }
});
