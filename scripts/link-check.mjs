import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),html=await readFile(resolve(root,'index.html'),'utf8');
const urls=[...new Set([...html.matchAll(/href="(https:\/\/[^"#]+)"/g)].map(m=>m[1]))],results=[];
await Promise.all(urls.map(async url=>{
  const start=performance.now();
  try {const r=await fetch(url,{signal:AbortSignal.timeout(12000),redirect:'follow'});results.push({url,httpStatus:r.status,finalUrl:r.url,status:r.ok?'PASS':[401,403,429].includes(r.status)?'ACCESS_LIMITED':'FAIL',elapsedMs:Math.round(performance.now()-start)});await r.body?.cancel();}
  catch {results.push({url,status:'NETWORK_UNVERIFIED',elapsedMs:Math.round(performance.now()-start)});}
}));
await writeFile(resolve(root,'evidence/link-check.json'),JSON.stringify({time:new Date().toISOString(),scope:'External product UI links, HTTP GET; page content and legal terms not certified.',results},null,2));console.log(JSON.stringify(results,null,2));if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
