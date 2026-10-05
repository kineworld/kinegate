import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {scenarios} from '../src/fixtures.mjs';
const root=resolve(import.meta.dirname,'..'),evidence=resolve(root,'evidence'),base=process.env.KINE_BASE_URL??'http://127.0.0.1:4173';
await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const tests=[];
async function check(name,fn){await fn();tests.push({name,status:'PASS'});console.log('PASS '+name);}
try {
  await page.goto(base,{waitUntil:'networkidle'});
  await check('Fixture banner and no wallet path',async()=>{assert.match(await page.locator('.provenance-banner').innerText(),/FIXTURE.*Synthetic/s);assert.equal(await page.locator('#scenario option').count(),16);});
  for(const item of scenarios) await check('UI scenario '+item.id,async()=>{
    await page.selectOption('#scenario',item.id);await page.click('#run-preflight');
    await page.waitForFunction(()=>document.querySelector('#run-preflight').disabled===false);
    const state=await page.locator('#decision-status').innerText();assert.equal(state==='Ready for local simulation',item.expectedSafe);
    assert.equal(await page.locator('#simulate').isEnabled(),item.expectedSafe);
  });
  await page.selectOption('#scenario','open');await page.click('#run-preflight');await page.waitForFunction(()=>!document.querySelector('#run-preflight').disabled);
  let receiptPath;
  await check('Export and verify genuine local receipt',async()=>{const wait=page.waitForEvent('download');await page.click('#export-receipt');const download=await wait;receiptPath=resolve(evidence,'fixture-receipt.json');await download.saveAs(receiptPath);const r=JSON.parse(await readFile(receiptPath,'utf8'));assert.equal(r.executed,false);assert.equal(r.sourceMode,'FIXTURE');assert.equal(r.binding.length,64);});
  await check('Single-session simulation deduplication',async()=>{await page.click('#simulate');assert.equal(await page.locator('#simulation-log li').count(),1);assert.equal(await page.locator('#simulate').isEnabled(),false);await page.click('#run-preflight');await page.waitForFunction(()=>!document.querySelector('#run-preflight').disabled);assert.equal(await page.locator('#simulate').isEnabled(),false);});
  await check('Edited amount invalidates and cannot synthesize a quote',async()=>{await page.fill('#amount','51');assert.match(await page.locator('#receipt-state').innerText(),/INVALID/);assert.equal(await page.locator('#simulate').isEnabled(),false);await page.click('#run-preflight');assert.match(await page.locator('#decision-status').innerText(),/Blocked/);});
  await check('Negative amount rejected',async()=>{await page.fill('#amount','-1');await page.click('#run-preflight');assert.equal(await page.locator('#amount').getAttribute('aria-invalid'),'true');assert.match(await page.locator('#decision-status').innerText(),/Blocked/);});
  await page.selectOption('#scenario','open');await page.click('#run-preflight');await page.waitForFunction(()=>!document.querySelector('#run-preflight').disabled);
  await check('Virtual time expires a receipt',async()=>{await page.click('#advance-clock');assert.match(await page.locator('#decision-status').innerText(),/Wait/);assert.match(await page.locator('#receipt-state').innerText(),/INVALID/);assert.equal(await page.locator('#simulate').isEnabled(),false);});
  await check('Explicit JSON recovery after reload and tamper rejection',async()=>{
    await page.reload();await page.setInputFiles('#import-receipt',receiptPath);await page.waitForFunction(()=>document.querySelector('#import-status').textContent.includes('Receipt verified'));
    const r=JSON.parse(await readFile(receiptPath,'utf8'));r.intent.inputAtomic='1';
    await page.setInputFiles('#import-receipt',{name:'tampered.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(r))});await page.waitForFunction(()=>document.querySelector('#import-status').textContent.includes('rejected'));assert.match(await page.locator('#import-status').innerText(),/integrity failed/);
  });
  await check('Baseline comparison has actual sixteen rows',async()=>{await page.click('[data-tab="baseline"]');assert.equal(await page.locator('#baseline-rows tr').count(),16);assert.match(await page.locator('#baseline-summary').innerText(),/13\/14/);await page.screenshot({path:resolve(evidence,'baseline-desktop.png'),fullPage:true});});
  await check('Integration configuration never implies signing or a filled trade',async()=>{await page.click('[data-tab="evidence"]');await page.waitForFunction(()=>!document.querySelector('#refresh-status').disabled);const raw=await page.locator('#api-status-raw').innerText();if(raw.trim().startsWith('{')){const status=JSON.parse(raw);assert.equal(status.signingEnabled,false);assert.equal(status.spendingEnabled,false);}else assert.match(await page.locator('#api-status-label').innerText(),/BLOCKED/);});
  await check('Recorded authenticated API replay preserves missing execution evidence',async()=>{await page.click('#read-rwa-replay');await page.waitForFunction(()=>!document.querySelector('#read-rwa-replay').disabled);assert.match(await page.locator('#rwa-inspection-status').innerText(),/REPLAY.*WAIT.*AAPLon/);assert.equal(await page.locator('#rwa-checks li').count(),9);assert.match(await page.locator('#rwa-checks').innerText(),/Amount-bound executable quote.*WAIT/s);await page.screenshot({path:resolve(evidence,'api-replay-desktop.png'),fullPage:true});});
  await check('Successful real quote replay retains actual mode and disables trading',async()=>{await page.click('#read-quote-replay');await page.waitForFunction(()=>!document.querySelector('#read-quote-replay').disabled);assert.match(await page.locator('#quote-evidence-status').innerText(),/REPLAY.*6 USDT.*AAPLon.*LiquidMesh.*SWAP.*Trading disabled/s);assert.match(await page.locator('#quote-evidence-limit').innerText(),/no expiry timestamp or minimum output/);});
  await check('Real off-chain failed simulation is never shown as an execution success',async()=>{await page.click('#read-simulation-replay');await page.waitForFunction(()=>!document.querySelector('#read-simulation-replay').disabled);assert.match(await page.locator('#real-simulation-status').innerText(),/REPLAY.*SIMULATION.*FAILED.*exceeds balance.*No transaction executed/s);const evidence=JSON.parse(await page.locator('#real-simulation-raw').textContent());assert.equal(evidence.walletSignatures,0);assert.equal(evidence.broadcasts,0);});
  await check('Actual partial SWAP flows through 13 gates with a non-executable bound audit',async()=>{
    await page.click('#run-observed-preflight');await page.waitForFunction(()=>!document.querySelector('#run-observed-preflight').disabled);
    assert.match(await page.locator('#observed-status').innerText(),/REPLAY.*BLOCKED.*13 core gates.*Execution disabled/);
    assert.equal(await page.locator('#observed-checks li').count(),13);
    assert.match(await page.locator('[data-gate="simulation"]').innerText(),/BLOCK.*FAILED.*exceeds allowance/s);
    assert.match(await page.locator('[data-gate="liquidity"]').innerText(),/BLOCK.*exact policy boundary.*does not prove on-chain minimum enforcement/s);
    for(const id of ['cost','spender','quote','reference'])assert.match(await page.locator('[data-gate="'+id+'"]').innerText(),/WAIT/);
    const wait=page.waitForEvent('download');await page.click('#observed-export');const download=await wait;
    const auditPath=resolve(evidence,'observed-audit.json');await download.saveAs(auditPath);const audit=JSON.parse(await readFile(auditPath,'utf8'));
    assert.equal(audit.schema,'kinegate.observed-audit.v1');assert.equal(audit.purpose,'NON_EXECUTABLE_AUDIT');assert.equal(audit.canSign,false);assert.equal(audit.canBroadcast,false);assert.equal(audit.result.executable,false);assert.equal(audit.binding.length,64);
    assert.equal(audit.evidence.quote.expiresAt,null);assert.equal(audit.evidence.wallet.allowanceAtomic,null);
    for(const privateField of ['receiver','quoteId','REDACTED'])assert.equal(JSON.stringify(audit).includes(privateField),false);
  });
  await check('Observed amount and policy changes invalidate the existing audit without fabricating a quote',async()=>{
    await page.fill('#observed-amount','7');assert.match(await page.locator('#observed-audit-state').innerText(),/INVALID/);assert.equal(await page.locator('#observed-export').isEnabled(),false);
    await page.click('#observed-verify');assert.match(await page.locator('#observed-audit-state').innerText(),/INVALID.*changed/);
    await page.fill('#observed-amount','6');await page.click('#observed-verify');assert.match(await page.locator('#observed-audit-state').innerText(),/INVALID.*rerun/);assert.equal(await page.locator('#observed-export').isEnabled(),false);await page.fill('#observed-amount','7');
    await page.click('#run-observed-preflight');await page.waitForFunction(()=>!document.querySelector('#run-observed-preflight').disabled);
    assert.match(await page.locator('[data-gate="budget"]').innerText(),/BLOCK.*does not match/s);
    assert.equal(JSON.parse(await page.locator('#observed-audit-raw').textContent()).evidence.quote.inputAtomic,'6000000000000000000');
    await page.check('#observed-stop');assert.match(await page.locator('#observed-audit-state').innerText(),/INVALID/);
    await page.fill('#observed-amount','6');await page.uncheck('#observed-stop');await page.click('#run-observed-preflight');await page.waitForFunction(()=>!document.querySelector('#run-observed-preflight').disabled);
    assert.match(await page.locator('#observed-audit-state').innerText(),/VALID HISTORICAL AUDIT/);
    await page.screenshot({path:resolve(evidence,'observed-preflight-desktop.png'),fullPage:true});
  });
  await page.click('[data-tab="workspace"]');await page.click('#run-preflight');await page.waitForFunction(()=>!document.querySelector('#run-preflight').disabled);await page.screenshot({path:resolve(evidence,'desktop-yellow.png'),fullPage:true});
  await check('Keyboard input and action reachable',async()=>{await page.locator('#amount').focus();await page.keyboard.press('Tab');assert.notEqual(await page.evaluate(()=>document.activeElement.tagName),'BODY');});
  await check('Narrow-screen workflow, long hash and no horizontal overflow',async()=>{await page.setViewportSize({width:360,height:800});await page.selectOption('#scenario','small');await page.click('#run-preflight');await page.waitForFunction(()=>!document.querySelector('#run-preflight').disabled);assert.equal(await page.locator('#simulate').isEnabled(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:resolve(evidence,'mobile-yellow.png'),fullPage:true});});
  await check('Partial evidence audit remains usable without overflow at 360px',async()=>{await page.click('[data-tab="evidence"]');await page.locator('#observed-preflight').scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(await page.locator('#observed-export').isEnabled(),true);await page.screenshot({path:resolve(evidence,'observed-preflight-mobile.png'),fullPage:true});});
  assert.deepEqual(errors,[]);
  await writeFile(resolve(evidence,'browser-qa.json'),JSON.stringify({time:new Date().toISOString(),base,mode:'FIXTURE',tool:'Playwright 1.63.0 + isolated headless Edge on Windows',sampleSize:tests.length,tests,consoleErrors:errors,limitations:'Local product browser flow only; not authenticated API or mainnet execution. Keyboard smoke, not full accessibility certification.'},null,2));
} finally {await browser.close();}
