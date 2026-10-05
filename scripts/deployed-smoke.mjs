import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..'),base='https://zoahdev.github.io/kinegate/';
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try {
  const response=await page.goto(base+'?release=0.2.0',{waitUntil:'networkidle'});assert.equal(response.status(),200);
  await page.click('#run-preflight');await page.waitForFunction(()=>!document.querySelector('#run-preflight').disabled);
  assert.match(await page.locator('#decision-status').innerText(),/Ready for local simulation/);
  await page.click('[data-tab="evidence"]');await page.click('#read-rwa-replay');await page.waitForFunction(()=>!document.querySelector('#read-rwa-replay').disabled);
  assert.match(await page.locator('#rwa-inspection-status').innerText(),/REPLAY.*WAIT.*AAPLon/);
  await page.click('#read-quote-replay');await page.waitForFunction(()=>!document.querySelector('#read-quote-replay').disabled);
  assert.match(await page.locator('#quote-evidence-status').innerText(),/LiquidMesh.*SWAP.*Trading disabled/);
  await page.click('#read-simulation-replay');await page.waitForFunction(()=>!document.querySelector('#read-simulation-replay').disabled);
  assert.match(await page.locator('#real-simulation-status').innerText(),/SIMULATION.*FAILED.*exceeds balance/);
  assert.deepEqual(errors,[]);await page.screenshot({path:resolve(root,'evidence/deployed-anonymous.png'),fullPage:true});
  const releaseResponse=await context.request.get('https://api.github.com/repos/zoahdev/kinegate/releases/tags/v0.2.0');assert.equal(releaseResponse.status(),200);
  const release=await releaseResponse.json(),video=release.assets.find(asset=>asset.name==='kinegate-demo.mp4');assert.ok(video);assert.equal(video.size,(await readFile(resolve(root,'demo/kinegate-demo.mp4'))).length);
  const hash=createHash('sha256').update(await readFile(resolve(root,'demo/kinegate-demo.mp4'))).digest('hex');if(video.digest)assert.equal(video.digest,'sha256:'+hash);
  await writeFile(resolve(root,'evidence/deployed-smoke.json'),JSON.stringify({verifiedAt:new Date().toISOString(),base,httpStatus:200,anonymous:true,developerCookies:false,wallet:false,fixtureReady:true,rwaReplay:'WAIT',quoteReplay:'LiquidMesh / SWAP / trading disabled',offChainPrediction:'FAILED: transfer amount exceeds balance',consoleErrors:errors,releaseHttpStatus:200,release:release.html_url,video:{name:video.name,sizeBytes:video.size,sha256:hash,publicDigest:video.digest??null,downloadUrl:video.browser_download_url},limits:'Anonymous verification at one time. Static production contains no credentials. No mainnet trade. Release verification uses public metadata/digest, not a playback compatibility test.'},null,2));
  console.log('PASS anonymous production workflow, real-evidence replays and public video metadata.');
} finally {await browser.close();}
