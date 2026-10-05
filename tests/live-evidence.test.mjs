import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectRwaEvidence} from '../src/live-evidence.mjs';
const now = Date.parse('2026-10-05T12:00:00Z');
const identity = {binanceChainId:'56',tokenContractAddress:'0x'+'1'.repeat(40),platformId:'ondo'};
function fixture() { return {observedAt:new Date(now-1000).toISOString(),asset:{...identity,underlyingTicker:'FIXTURE',tokenToShareRatio:'1.002'},price:{code:0,data:[{...identity,tokenPrice:'50',referencePrice:'49.9',tokenPriceUpdatedAt:now-1000}]},profile:{code:0,data:{...identity,underlyingTicker:'FIXTURE',tokenToShareRatio:'1.002'}},market:{code:0,data:{...identity,statusInfo:{openState:true,marketStatus:'regular'},marketData:{lastPrice:'49.9'}}}}; }
test('FIXTURE RWA inspection cannot promote metadata into executable preflight',()=>{
  const r=inspectRwaEvidence(fixture(),'REPLAY',now);
  assert.equal(r.status,'WAIT'); assert.equal(r.canSign,false); assert.equal(r.canBroadcast,false);
  assert.equal(r.checks.find(c=>c.id==='identity').status,'PASS');
  assert.equal(r.checks.find(c=>c.id==='reference').status,'WAIT');
  assert.equal(r.checks.find(c=>c.id==='quote').status,'WAIT');
});
test('FIXTURE exact contract, issuer and ratio mismatches fail closed',()=>{
  for(const alter of [x=>x.profile.data.tokenContractAddress='0x'+'2'.repeat(40),x=>x.market.data.platformId='bstock',x=>x.profile.data.tokenToShareRatio='1',x=>x.price.code=40101]){
    const x=fixture();alter(x);assert.equal(inspectRwaEvidence(x,'REPLAY',now).status,'BLOCKED');
  }
});
test('FIXTURE future acquisition is blocked, stale replay waits, retrieval never supplies price time',()=>{
  const x=fixture();x.observedAt=new Date(now+1).toISOString();assert.equal(inspectRwaEvidence(x,'REPLAY',now).status,'BLOCKED');
  x.observedAt=new Date(now-30001).toISOString();const stale=inspectRwaEvidence(x,'REPLAY',now);assert.equal(stale.checks.find(c=>c.id==='retrieval').status,'WAIT');
  x.market.timestamp=now;x.market.data.marketData.updatedAt=now;
  assert.equal(inspectRwaEvidence(x,'LIVE',now).checks.find(c=>c.id==='reference').status,'WAIT');
});
