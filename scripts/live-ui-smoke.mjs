/** Explicit live read-only smoke; not run by unit tests or CI. Needs authorized local API configuration. */
import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),base='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
page.on('pageerror',error=>errors.push(error.message));
try {
  await page.goto(base);await page.click('[data-tab="evidence"]');await page.click('#read-rwa-live');
  await page.waitForFunction(()=>!document.querySelector('#read-rwa-live').disabled,{},{timeout:35000});
  const status=await page.locator('#rwa-inspection-status').innerText();
  assert.match(status,/LIVE.*WAIT.*AAPLon/);assert.equal(await page.locator('#rwa-checks li').count(),9);
  assert.match(await page.locator('#chain-evidence').innerText(),/REPLAY.*AAPLon/);
  const data=JSON.parse(await page.locator('#rwa-inspection-raw').textContent());
  assert.equal(data.canSign,false);assert.equal(data.canBroadcast,false);assert.deepEqual(errors,[]);
  await page.screenshot({path:resolve(root,'evidence/api-live-desktop.png'),fullPage:true});
  await page.setViewportSize({width:360,height:800});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:resolve(root,'evidence/api-live-mobile.png'),fullPage:true});
  await writeFile(resolve(root,'evidence/browser-live-readonly.json'),JSON.stringify({verifiedAt:new Date().toISOString(),mode:'LIVE',readOnly:true,base,tool:'isolated browser / Playwright',status,checks:await page.locator('#rwa-checks').innerText(),wallet:false,canSign:false,canBroadcast:false,consoleErrors:errors,narrowViewportWidth:360,noHorizontalOverflow:true,limitations:'One real read-only UI refresh. Not a quote, RFQ simulation, issuer eligibility proof or chain trade.'},null,2));
  console.log('PASS actual LIVE UI read and explicit WAIT; 360px no overflow.');
} finally {await browser.close();}
