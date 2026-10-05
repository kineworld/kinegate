import {execFileSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
if(!files.length)throw new Error('Stage intended public files before audit');
const findings=[];
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/(?:gh[opusr]_|github_pat_|sk-proj-|AKIA)[A-Za-z0-9_]{16,}/,/BX-[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}/,/^[ \t]*(?:OC_API_KEY|OC_SECRET_KEY)[ \t]*=[ \t]*[^\s#]+/m];
let configuredValues=[];
try { configuredValues=(await readFile(resolve(root,'.env'),'utf8')).split(/\r?\n/).filter(line=>/^(OC_API_KEY|OC_SECRET_KEY)=/.test(line)).map(line=>line.slice(line.indexOf('=')+1).trim()).filter(value=>value.length>=8); } catch(error) { if(error.code!=='ENOENT')throw error; }
try { const wallet=JSON.parse(await readFile(resolve(root,'evidence/local-api/wallet-readonly.json'),'utf8')); if(typeof wallet.address==='string'&&/^0x[\da-fA-F]{40}$/.test(wallet.address))configuredValues.push(wallet.address); } catch(error) { if(error.code!=='ENOENT')throw error; }
for(const file of files){
  if(/(^|\/)(?:\.env(?:\..*)?|mission\.md|approvals\.md|state\.md|plan\.md)$/.test(file)&&file!=='.env.example')findings.push({file,issue:'Private execution file staged'});
  if(file.startsWith('evidence/local-api/'))findings.push({file,issue:'Private API log staged'});
  const bytes=await readFile(resolve(root,file));if(bytes.length>5*1024*1024)continue;
  if(/\.(?:png|jpg|webm|mp4|zip)$/.test(file))continue;
  const text=bytes.toString('utf8');for(const pattern of patterns)if(pattern.test(text))findings.push({file,issue:'Potential credential pattern; inspect locally, no matching text emitted'});
  if(configuredValues.some(value=>text.toLowerCase().includes(value.toLowerCase())))findings.push({file,issue:'Local credential or private receiver found; matching text withheld'});
}
const report={time:new Date().toISOString(),status:findings.length?'FAIL':'PASS',trackedFiles:files.length,findings,limitations:'Bounded pattern scan and explicit private-file exclusions; not proof that all secrets or personal information are absent. Images visually inspected separately. Dependency license inventory in docs/attribution.md.'};
await writeFile(resolve(root,'evidence/publication-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(findings.length)process.exitCode=1;
