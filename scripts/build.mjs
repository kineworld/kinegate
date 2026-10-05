import {mkdir,cp,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),dist=resolve(root,'dist');
await mkdir(dist,{recursive:true});
for(const path of ['index.html','src']) await cp(resolve(root,path),resolve(dist,path),{recursive:true});
await mkdir(resolve(dist,'evidence/mainnet'),{recursive:true});
for(const path of ['bsc-readonly-probe.json','current-api-asset-readonly.json','settlement-usdt-readonly.json','native-simulation-comparison.json','tight-slippage-native-comparison.json']) {
  try { await cp(resolve(root,'evidence/mainnet',path),resolve(dist,'evidence/mainnet',path)); } catch(error) { if(error.code!=='ENOENT')throw error; }
}
await writeFile(resolve(dist,'.nojekyll'),'');
await mkdir(resolve(dist,'evidence/devex'),{recursive:true});
for(const name of ['authenticated-rwa.json','authenticated-quote-6usdt.json','unsigned-swap-validation.json','unsigned-swap-allowance-validation.json']) {
  try { await cp(resolve(root,'evidence/devex',name),resolve(dist,'evidence/devex',name)); } catch(error) { if(error.code!=='ENOENT')throw error; }
}
console.log('PASS static production build: dist/index.html + src. No credentials or local API server bundled.');
