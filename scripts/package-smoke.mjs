import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),base='http://127.0.0.1:4175';
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 assert.equal((await page.goto(base,{waitUntil:'networkidle'})).status(),200);
 await page.click('#run-preflight');await page.waitForFunction(()=>!document.querySelector('#run-preflight').disabled);
 assert.match(await page.locator('#decision-status').innerText(),/Ready for local simulation/);
 await page.click('[data-tab="evidence"]');
 await page.click('#run-observed-preflight');await page.waitForFunction(()=>!document.querySelector('#run-observed-preflight').disabled);
 assert.match(await page.locator('#observed-status').innerText(),/REPLAY.*BLOCKED.*13 core gates/);
 assert.equal(await page.locator('#observed-checks [data-gate]').count(),13);
 assert.match(await page.locator('#observed-checks [data-gate="liquidity"]').innerText(),/BLOCK.*Known numeric fields/s);
 await page.fill('#observed-amount','5');assert.ok(await page.locator('#observed-export').isDisabled());
 assert.match(await page.locator('#observed-audit-state').innerText(),/INVALID/);
 const first=await (await context.request.get(base+'/evidence/mainnet/native-simulation-comparison.json')).json();
 const tight=await (await context.request.get(base+'/evidence/mainnet/tight-slippage-native-comparison.json')).json();
 for(const proof of [first,tight]){assert.equal(proof.mode,'SIMULATION');assert.equal(proof.actualBroadcasts,0);assert.equal(proof.actualFundsSpent,'0');assert.equal(proof.executionReady,false);assert.deepEqual(proof.results.map(r=>r.swapStatus),['FAILED','SUCCESS','FAILED']);}
 assert.equal(first.exactSlippage.withinExactCap,false);assert.equal(tight.exactSlippage.withinExactCap,true);
 assert.equal((await context.request.get(base+'/api/status')).status(),404);
 assert.equal((await context.request.get(base+'/.env')).status(),404);
 await page.screenshot({path:resolve(root,'evidence/package-desktop.png'),fullPage:true});
 await page.setViewportSize({width:360,height:800});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 await writeFile(resolve(root,'evidence/package-smoke.json'),JSON.stringify({schema:'kinegate.package-smoke.v1',verifiedAt:new Date().toISOString(),base,httpStatus:200,anonymous:true,developerCookies:false,fixturePreflight:'READY_FOR_LOCAL_SIMULATION',observedGateCount:13,observedDecision:'BLOCKED',strictMinimumBoundary:'BLOCK',editInvalidatesAudit:true,bothNativeComparisonRecordsAccessible:true,nativeModes:'SIMULATION / actual asset actions zero',apiAndEnvironmentPaths:404,narrowScreenNoOverflow:true,consoleErrors:errors,limitation:'Actual isolated browser against the standalone local package, not an external deployment or mainnet transaction.'},null,2)+'\n');
 console.log('PASS standalone anonymous demo package, 13 observed gates, edit invalidation, both native records, API/environment isolation and 360px layout.');
}finally{await browser.close();}
