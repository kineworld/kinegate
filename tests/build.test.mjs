import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,copyFile,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,dirname,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
test('Static build refuses stale Git metadata, environment files and unlisted server output',async()=>{
  const temp=await mkdtemp(resolve(tmpdir(),'kinegate-build-'));
  try{
    await mkdir(resolve(temp,'scripts'));await copyFile(resolve(import.meta.dirname,'../scripts/build.mjs'),resolve(temp,'scripts/build.mjs'));
    for(const entry of ['.git/config','.env','server.mjs']){
      const output=resolve(temp,'dist',entry);await mkdir(dirname(output),{recursive:true});await writeFile(output,'PRIVATE_FIXTURE_MARKER');
      const run=spawnSync(process.execPath,[resolve(temp,'scripts/build.mjs')],{encoding:'utf8'});
      assert.notEqual(run.status,0);assert.match(run.stderr,/STATIC_OUTPUT_UNEXPECTED_ENTRY/);
      assert.equal(await readFile(output,'utf8'),'PRIVATE_FIXTURE_MARKER');
      if(entry==='.git/config')await rm(dirname(output),{recursive:true});else await rm(output);
    }
  }finally{
    assert.equal(dirname(temp),resolve(tmpdir()));assert.ok(basename(temp).startsWith('kinegate-build-'));await rm(temp,{recursive:true});
  }
});
