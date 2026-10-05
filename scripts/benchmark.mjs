import {writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {scenarios,scenario,FIXTURE_TIME} from '../src/fixtures.mjs';
import {evaluate,priceOnlyBaseline} from '../src/engine.mjs';
const rows=scenarios.map(item=>{const d=scenario(item.id);const result=evaluate(d.snapshot,d.intent,d.policy,d.now);return {id:item.id,expectedSafe:item.expectedSafe,priceOnlyAccept:priceOnlyBaseline(d.snapshot),gateAccept:result.status==='READY_FOR_LOCAL_SIMULATION',gateStatus:result.status,reasons:result.checks.filter(c=>c.status!=='PASS').map(c=>c.id)};});
const summary={generatedAt:new Date().toISOString(),mode:'FIXTURE',fixtureTime:new Date(FIXTURE_TIME).toISOString(),sampleSize:rows.length,baseline:'Accept if displayed quote cost/share <= independent displayed reference * 1.02; ignores clocks/permissions/costs. Deliberately simplified educational comparator, not a production broker.',priceOnlyUnsafeAccepts:rows.filter(x=>!x.expectedSafe&&x.priceOnlyAccept).length,gateUnsafeAccepts:rows.filter(x=>!x.expectedSafe&&x.gateAccept).length,priceOnlySafeRejects:rows.filter(x=>x.expectedSafe&&!x.priceOnlyAccept).length,gateSafeRejects:rows.filter(x=>x.expectedSafe&&!x.gateAccept).length,limitations:'Hand-authored cases designed around gate requirements; expectedSafe labels are policy-based. No estimate of real-world error rates, safety, profitability or API performance.',rows};
await mkdir(resolve(import.meta.dirname,'../evidence'),{recursive:true});
await writeFile(resolve(import.meta.dirname,'../evidence/fixture-benchmark.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
