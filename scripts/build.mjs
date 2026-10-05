import {mkdir,cp,writeFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),dist=resolve(root,'dist');
const sourceFiles=['app.mjs','engine.mjs','fixtures.mjs','live-evidence.mjs','observed-swap.mjs','style.css'];
const chainFiles=['bsc-readonly-probe.json','current-api-asset-readonly.json','settlement-usdt-readonly.json','native-simulation-comparison.json','tight-slippage-native-comparison.json'];
const apiFiles=['authenticated-rwa.json','authenticated-quote-6usdt.json','unsigned-swap-validation.json','unsigned-swap-allowance-validation.json'];
const allowedFiles=new Set(['index.html','.nojekyll',...sourceFiles.map(p=>'src/'+p),...chainFiles.map(p=>'evidence/mainnet/'+p),...apiFiles.map(p=>'evidence/devex/'+p)]);
const allowedDirectories=new Set(['src','evidence','evidence/mainnet','evidence/devex']);
async function checkOutput(dir,prefix=''){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=prefix+entry.name;
    if(entry.isDirectory()&&allowedDirectories.has(path))await checkOutput(resolve(dir,entry.name),path+'/');
    else if(!entry.isFile()||!allowedFiles.has(path))throw new Error('STATIC_OUTPUT_UNEXPECTED_ENTRY: '+path);
  }
}
await mkdir(dist,{recursive:true});
await checkOutput(dist);
await cp(resolve(root,'index.html'),resolve(dist,'index.html'));
await mkdir(resolve(dist,'src'),{recursive:true});
for(const path of sourceFiles)await cp(resolve(root,'src',path),resolve(dist,'src',path));
await mkdir(resolve(dist,'evidence/mainnet'),{recursive:true});
for(const path of chainFiles) {
  try { await cp(resolve(root,'evidence/mainnet',path),resolve(dist,'evidence/mainnet',path)); } catch(error) { if(error.code!=='ENOENT')throw error; }
}
await writeFile(resolve(dist,'.nojekyll'),'');
await mkdir(resolve(dist,'evidence/devex'),{recursive:true});
for(const name of apiFiles) {
  try { await cp(resolve(root,'evidence/devex',name),resolve(dist,'evidence/devex',name)); } catch(error) { if(error.code!=='ENOENT')throw error; }
}
await checkOutput(dist);
console.log('PASS static production build: dist/index.html + src. No credentials or local API server bundled.');
