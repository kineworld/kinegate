import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
async function files(dir){let out=[];for(const e of await readdir(dir,{withFileTypes:true})){if(['node_modules','.git','dist'].includes(e.name))continue;const p=resolve(dir,e.name);if(e.isDirectory())out.push(...await files(p));else if(p.endsWith('.mjs'))out.push(p);}return out;}
const list=await files(root);
for(const file of list){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){console.error(r.stderr);process.exit(1);}}
const app=await readFile(resolve(root,'src/app.mjs'),'utf8');
if(/eval\s*\(|new Function\s*\(|ethereum\.request\s*\(/.test(app))throw new Error('Unexpected dynamic code or wallet execution');
console.log('PASS syntax + execution-surface lint across '+list.length+' modules. This is a bounded custom lint, not ESLint.');
