import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createBinanceClient, signRequest, VERIFIED_ASSETS, MAX_RESPONSE_BYTES } from '../server/binance.mjs';
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
