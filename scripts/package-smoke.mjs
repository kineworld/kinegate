import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),base=process.argv[2]??'http://127.0.0.1:4175',production=base.startsWith('https://');
if(base!=='http://127.0.0.1:4175'&&base!=='https://zoahdev.github.io/kinegate')throw Error('Unsupported smoke target');
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
 let publishedSource=null,video=null;
 if(production){
  const metadataResponse=await context.request.get(base+'/publication.json');assert.equal(metadataResponse.status(),200);const metadata=await metadataResponse.json();assert.match(metadata.sourceCommit,/^[a-f0-9]{40}$/);publishedSource=metadata.sourceCommit;
  const releaseResponse=await context.request.get('https://api.github.com/repos/zoahdev/kinegate/releases/tags/demo-polished-v1');assert.equal(releaseResponse.status(),200);
  const release=await releaseResponse.json(),asset=release.assets.find(a=>a.name==='kinegate-demo-polished.mp4');assert.ok(asset);assert.equal(asset.size,33325757);assert.equal(asset.digest,'sha256:92ca9590a560012e501fcd82f58ceb2c55365201b93f59a3cec1bcc77b4fd15e');
  const response=await context.request.head(asset.browser_download_url);assert.equal(response.status(),200);video={release:release.html_url,download:asset.browser_download_url,sizeBytes:asset.size,digest:asset.digest,anonymousDownloadHeadStatus:200};
 }
 await page.screenshot({path:resolve(root,production?'evidence/production-personal-desktop.png':'evidence/package-desktop.png'),fullPage:true});
 await page.setViewportSize({width:360,height:800});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 await writeFile(resolve(root,production?'evidence/production-personal-smoke.json':'evidence/package-smoke.json'),JSON.stringify({schema:'kinegate.package-smoke.v1',verifiedAt:new Date().toISOString(),base,httpStatus:200,anonymous:true,developerCookies:false,fixturePreflight:'READY_FOR_LOCAL_SIMULATION',observedGateCount:13,observedDecision:'BLOCKED',strictMinimumBoundary:'BLOCK',editInvalidatesAudit:true,bothNativeComparisonRecordsAccessible:true,nativeModes:'SIMULATION / actual asset actions zero',apiAndEnvironmentPaths:404,narrowScreenNoOverflow:true,consoleErrors:errors,publishedSource,video,limitation:production?'Actual isolated anonymous browser against personal Pages; availability checked at this timestamp, not guaranteed indefinitely. Video digest/anonymous HEAD verification, not a playback test. No mainnet transaction.':'Actual isolated browser against the standalone local package, not an external deployment or mainnet transaction.'},null,2)+'\n');
 console.log('PASS '+(production?'personal Pages and public video':'standalone demo package')+', 13 observed gates, edit invalidation, both native records, API/environment isolation and 360px layout.');
}finally{await browser.close();}
