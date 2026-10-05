import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createWindowsTransport, TRANSPORT_MAX_BYTES } from '../server/windows-transport.mjs';
import { signRequest } from '../server/binance.mjs';
const path = '/build/api/v1/dex/market/rwa/price?binanceChainId=56&tokenContractAddresses=0xAA%2C0xBB';
const url = 'https://web3.binance.com' + path;
function fixtureSpawn(result, capture) {
  return (command, args, options) => {
    capture.command = command; capture.args = args; capture.options = options;
    const child = new EventEmitter();
    child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough(); child.kill = () => { capture.killed = true; return true; };
    const chunks = [];
    child.stdin.on('data', chunk => chunks.push(chunk));
    child.stdin.on('finish', () => {
      capture.input = Buffer.concat(chunks).toString('utf8');
      queueMicrotask(() => { child.stderr.emit('data', Buffer.from('potential secret stack detail')); child.stdout.emit('data', Buffer.from(typeof result === 'string' ? result : JSON.stringify(result))); child.emit('close', 0); });
    });
    return child;
  };
}
test('FIXTURE PowerShell transport uses stdin, preserves signed bytes and hides window/environment', async () => {
  const capture = {};
  const transport = createWindowsTransport({ spawnFn: fixtureSpawn({ status: 401, headers: { 'content-type': 'application/json' }, body: '{"code":40101,"data":""}' }, capture) });
  const timestamp = '2026-10-05T12:00:00.000Z';
  const signature = signRequest(timestamp, 'GET', path, '', 'fixture-secret');
  const response = await transport(url, { method: 'GET', headers: { 'X-OC-APIKEY': 'fixture-key', 'X-OC-SIGN': signature, 'X-OC-TIMESTAMP': timestamp } });
  assert.equal(response.status, 401); assert.equal((await response.json()).code, 40101);
  const input = JSON.parse(capture.input);
  assert.equal(input.url, url); assert.equal(input.headers['x-oc-sign'], signature); assert.equal(input.body, '');
  assert.equal(capture.options.windowsHide, true); assert.equal(capture.command, 'pwsh.exe');
  assert.equal(JSON.stringify(capture.args).includes('fixture-key'), false); assert.equal(JSON.stringify(capture.args).includes(signature), false);
  assert.equal(JSON.stringify(capture.options.env).includes('OC_'), false); assert.equal(capture.input.includes('fixture-secret'), false);
});
test('FIXTURE transport refuses arbitrary hosts, redirects, headers and malformed/oversized responses', async () => {
  const capture = {}; const transport = createWindowsTransport({ spawnFn: fixtureSpawn({ status: 200, headers: {}, body: '{}' }, capture) });
  await assert.rejects(transport('https://example.com/build/api/v1/dex/market/rwa/tokens'), /ENDPOINT_DENIED/);
  await assert.rejects(transport('https://web3.binance.com/build/api/v1/dex/pre-transaction/broadcast-transaction'), /ENDPOINT_DENIED/);
  await assert.rejects(transport('https://web3.binance.com/build/api/v1/dex/aggregator/approve-transaction'), /ENDPOINT_DENIED/);
  await assert.rejects(transport('https://web3.binance.com/build/api/v1/dex/aggregator/order/submit'), /ENDPOINT_DENIED/);
  await assert.rejects(transport(url, { headers: { Authorization: 'fixture-secret' } }), /HEADER_DENIED/);
  assert.equal(capture.command, undefined);
  for (const result of [{ status: 302, headers: {}, body: '{}' }, { status: 200, headers: { 'x-secret': 'fixture' }, body: '{}' }, { status: 200, headers: {}, body: {} }, 'bad-json']) {
    const malformed = createWindowsTransport({ spawnFn: fixtureSpawn(result, {}) });
    await assert.rejects(malformed(url), /INVALID_RESPONSE/);
  }
  const overCapture = {};
  await assert.rejects(createWindowsTransport({ spawnFn: fixtureSpawn('x'.repeat(TRANSPORT_MAX_BYTES + 1), overCapture) })(url), /RESPONSE_TOO_LARGE/);
  assert.equal(overCapture.killed, true);
});
test('FIXTURE unsigned swap transport preserves quote identifier bytes in stdin only', async () => {
  const capture = {};
  const transport = createWindowsTransport({ spawnFn: fixtureSpawn({ status: 200, headers: {}, body: '{"code":0,"data":{"executionMode":"SWAP"}}' }, capture) });
  const swapPath = '/build/api/v1/dex/aggregator/swap?binanceChainId=56&quoteId=fixture%2Bquote%2Fid%3D&slippagePercent=0.5&approveTransaction=false';
  const signature = signRequest('2026-10-05T12:00:00.000Z', 'GET', swapPath, '', 'fixture-secret');
  await transport('https://web3.binance.com' + swapPath, { headers: { 'X-OC-APIKEY': 'fixture-key', 'X-OC-SIGN': signature } });
  assert.equal(JSON.parse(capture.input).url, 'https://web3.binance.com' + swapPath);
  assert.equal(JSON.stringify(capture.args).includes('quoteId'), false);
  assert.equal(JSON.stringify(capture.args).includes(signature), false);
});
test('FIXTURE installed PowerShell rejects forbidden URL locally with sanitized output', { skip: process.platform !== 'win32', timeout: 5000 }, async () => {
  const script = fileURLToPath(new URL('../server/windows-transport.ps1', import.meta.url));
  const result = await new Promise((resolve, reject) => {
    const child = spawn('pwsh.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-File', script], { windowsHide: true, env: { SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR, PATH: process.env.PATH, TEMP: process.env.TEMP, TMP: process.env.TMP } });
    let stdout = ''; let stderr = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error('FIXTURE process timeout')); }, 4000);
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.stdout.on('data', chunk => { stdout += chunk; }); child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('close', code => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
    child.stdin.end(JSON.stringify({ url: 'http://127.0.0.1/forbidden-fixture', method: 'GET', headers: { 'x-oc-apikey': 'fixture-input-key', 'x-oc-sign': 'fixture-input-signature' }, body: '' }));
  });
  assert.equal(result.code, 1); assert.equal(result.stdout, ''); assert.equal(result.stderr, 'WINDOWS_NATIVE_TRANSPORT_FAILED_INPUT_VALIDATE');
  assert.equal(result.stderr.includes('fixture-input'), false);
});
test('FIXTURE PowerShell ISO timestamp remains a signed string with DateKind String', { skip: process.platform !== 'win32', timeout: 5000 }, async () => {
  const result = await new Promise((resolve, reject) => {
    const command = `$fixtureJson='{"headers":{"x-oc-timestamp":"2026-10-05T12:00:00.000Z"}}'; $parsed=ConvertFrom-Json -InputObject $fixtureJson -AsHashtable -DateKind String; if ($parsed.headers['x-oc-timestamp'] -is [string] -and $parsed.headers['x-oc-timestamp'] -ceq '2026-10-05T12:00:00.000Z') { [Console]::Out.Write('EXACT_STRING') } else { exit 1 }`;
    const child = spawn('pwsh.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', command], { windowsHide: true, env: { SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR, PATH: process.env.PATH, TEMP: process.env.TEMP, TMP: process.env.TMP } });
    let output = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error('FIXTURE process timeout')); }, 4000);
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.stdout.on('data', chunk => { output += chunk; }); child.stderr.on('data', () => {});
    child.on('close', code => { clearTimeout(timer); resolve({ code, output }); });
  });
  assert.equal(result.code, 0); assert.equal(result.output, 'EXACT_STRING');
});
