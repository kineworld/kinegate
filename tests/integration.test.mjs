import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {request} from 'node:http';
const port=4199,url=`http://127.0.0.1:${port}`;
let child;
before(async()=>{
  child=spawn(process.execPath,['server/server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:String(port),OC_API_KEY:'',OC_SECRET_KEY:'',KINE_API_ELIGIBILITY_CONFIRMED:'false'},stdio:['ignore','pipe','pipe']});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Server readiness timeout')),8000);child.stdout.on('data',d=>{if(d.toString().includes('KineGate:')){clearTimeout(timer);resolve();}});child.once('exit',()=>reject(new Error('Server failed')));});
});
after(()=>child?.kill());
test('Local runnable UI and core module actually served',async()=>{
  const r=await fetch(url);assert.equal(r.status,200);assert.match(await r.text(),/KineGate/);
  const js=await fetch(url+'/src/engine.mjs');assert.match(js.headers.get('content-type'),/javascript/);
});
test('Missing credentials are explicit and cannot sign/broadcast',async()=>{
  const r=await fetch(url+'/api/status');const v=await r.json();assert.deepEqual(v,{credentialsConfigured:false,eligibilityConfirmed:false,signingEnabled:false,spendingEnabled:false});
  const discovery=await fetch(url+'/api/discovery');assert.equal(discovery.status,503);assert.equal((await discovery.json()).error,'CREDENTIALS_MISSING');
  assert.equal((await fetch(url+'/api/asset?address=0x1111111111111111111111111111111111111111')).status,400);
  assert.equal((await fetch(url+'/api/broadcast',{method:'POST'})).status,405);
});
test('Static paths exclude local logs and private files',async()=>{
  for(const path of ['/evidence/local-api/requests.ndjson','/src/..%2f..%2f.env','/.env','/docs/mission.md','/server/binance.mjs']){
    const r=await fetch(url+path);assert.ok([403,404].includes(r.status),path);
  }
});
test('Cross-origin and DNS rebinding requests are denied',async()=>{
  assert.equal((await fetch(url+'/api/status',{headers:{Origin:'https://untrusted.example'}})).status,403);
  const status=await new Promise((resolve,reject)=>{const req=request(url+'/api/status',{headers:{Host:'untrusted.example'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);req.end();});assert.equal(status,403);
});
