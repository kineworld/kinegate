import {execFileSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
if(!files.length)throw new Error('Stage intended public files before audit');
const findings=[];
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/(?:gh[opusr]_|github_pat_|sk-proj-|AKIA)[A-Za-z0-9_]{16,}/,/^[ \t]*(?:OC_API_KEY|OC_SECRET_KEY)[ \t]*=[ \t]*[^\s#]+/m];
for(const file of files){
  if(/(^|\/)(?:\.env(?:\..*)?|mission\.md|approvals\.md|state\.md|plan\.md)$/.test(file)&&file!=='.env.example')findings.push({file,issue:'Private execution file staged'});
  if(file.startsWith('evidence/local-api/'))findings.push({file,issue:'Private API log staged'});
  const bytes=await readFile(resolve(root,file));if(bytes.length>5*1024*1024)continue;
  if(/\.(?:png|jpg|webm|mp4|zip)$/.test(file))continue;
  const text=bytes.toString('utf8');for(const pattern of patterns)if(pattern.test(text))findings.push({file,issue:'Potential credential pattern; inspect locally, no matching text emitted'});
}
const report={time:new Date().toISOString(),status:findings.length?'FAIL':'PASS',trackedFiles:files.length,findings,limitations:'Bounded pattern scan and explicit private-file exclusions; not proof that all secrets or personal information are absent. Images visually inspected separately. Dependency license inventory in docs/attribution.md.'};
await writeFile(resolve(root,'evidence/publication-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(findings.length)process.exitCode=1;
