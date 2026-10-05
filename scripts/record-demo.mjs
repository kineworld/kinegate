import {chromium} from 'playwright';
import {mkdir,writeFile,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),dir=resolve(root,'demo');
await mkdir(resolve(dir,'raw'),{recursive:true});
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:resolve(dir,'raw'),size:{width:1440,height:1000}}});
const page=await context.newPage(),video=page.video(),start=performance.now(),cues=[];
const seconds=()=>Math.round((performance.now()-start)/1000*100)/100;
const hold=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function scene(text,action,duration){const from=seconds();console.log(text);await action();await hold(duration);cues.push({start:from,end:seconds(),text});}
async function run(){await page.click('#run-preflight');await page.waitForFunction(()=>!document.querySelector('#run-preflight').disabled);}
try {
  await page.goto(process.env.KINE_BASE_URL??'http://127.0.0.1:4173',{waitUntil:'networkidle'});
  await scene('KineGate: a ticker and a good-looking price are not enough. Bind the issuer, clocks and exact intention before acting.',async()=>{},10000);
  await scene('FIXTURE throughout: synthetic data, no wallet, no signed or broadcast transaction. The yellow/black interface is the actual product.',async()=>{await page.locator('#amount').focus();},7000);
  await scene('One $50 intention. Thirteen deterministic checks cover identity, permission, clocks, balance, cost, vendor and effects.',async()=>{await run();await page.locator('#decision-status').scrollIntoViewIfNeeded();},9000);
  await scene('The local receipt binds every input using canonical JSON and SHA-256. A hash proves internal consistency, not issuer authenticity.',async()=>{await page.locator('#receipt-state').scrollIntoViewIfNeeded();},8000);
  await scene('Local simulation records this bound fixture once per browser session. No chain transaction is sent.',async()=>{await page.click('#simulate');},6500);
  await scene('Change the amount to $51: the previous receipt becomes invalid. KineGate does not invent a new quote.',async()=>{await page.fill('#amount','51');await run();},8500);
  await scene('The weekend case waits: stale independent reference plus a closed underlying market. Closure is policy context, not a universal DEX ban.',async()=>{await page.selectOption('#scenario','closed');await run();await page.locator('#decision-status').scrollIntoViewIfNeeded();},8500);
  await scene('Same ticker, different issuer: the exact intended claim does not match. A ticker cannot substitute for issuer-specific rights.',async()=>{await page.selectOption('#scenario','issuer');await run();},7000);
  await scene('Restore a valid fixture, then advance the virtual clock 60 seconds: the receipt expires and dependent evidence must be refreshed.',async()=>{await page.selectOption('#scenario','open');await run();await page.click('#advance-clock');},8500);
  await scene('Same sixteen authored fixtures: a simplified price-only rule accepts thirteen policy-unsafe cases; KineGate accepts none. This is not a real-world accuracy estimate.',async()=>{await page.click('[data-tab="baseline"]');await page.evaluate(()=>scrollTo(0,0));},9500);
  await scene('Evidence separates real acquisition from local simulation. The recorded BSC read proves a listed AAPLB contract exists, not a trade or liquidity.',async()=>{await page.click('[data-tab="evidence"]');await page.locator('#chain-evidence').scrollIntoViewIfNeeded();},8500);
  await scene('Authenticated API calls and funded mainnet settlement remain unverified until eligible credentials and signing authorization. AI does not write the required human DevEx report.',async()=>{await page.locator('#api-status-label').scrollIntoViewIfNeeded();},8000);
  await scene('Run it without a wallet. Inspect the code, exported receipt, test evidence and documented limitations. Evidence before action.',async()=>{await page.click('[data-tab="workspace"]');await page.selectOption('#scenario','small');await page.click('#reset-clock');await run();await page.evaluate(()=>scrollTo(0,0));},7000);
} finally {await context.close();await browser.close();}
await copyFile(await video.path(),resolve(dir,'capture.webm'));
const stamp=n=>{const ms=Math.round(n*1000),h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60;return [h,m,s].map(x=>String(x).padStart(2,'0')).join(':')+','+String(ms%1000).padStart(3,'0');};
await writeFile(resolve(dir,'demo.srt'),cues.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text.replace(/(.{1,85})(?:\s|$)/g,'$1\n').trim()}\n`).join('\n'));
await writeFile(resolve(dir,'script.md'),'# KineGate recorded demonstration\n\nActual browser capture. On-screen product state is FIXTURE, local outcomes SIMULATION; recorded read-only RPC evidence is LIVE acquisition. No human or synthetic voice is used. Captions are AI-assisted product explanations, not a DevEx report.\n\n'+cues.map(c=>`- ${c.start.toFixed(2)}–${c.end.toFixed(2)} s: ${c.text}`).join('\n')+'\n');
await writeFile(resolve(dir,'recording.json'),JSON.stringify({recordedAt:new Date().toISOString(),durationSeconds:seconds(),base:process.env.KINE_BASE_URL??'http://127.0.0.1:4173',actualBrowser:true,liveTrading:false,cues},null,2));
console.log('PASS actual browser video + timed subtitles saved in demo/.');
