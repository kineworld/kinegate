import {evaluate,createReceipt,verifyReceipt,parseUnits,formatUnits,priceOnlyBaseline} from './engine.mjs';
import {scenario,scenarios,FIXTURE_TIME} from './fixtures.mjs';

const $ = id => document.getElementById(id);
const node = (tag,text,className) => {const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
let current=scenario('open'), selected='open', receipt=null, invalidated=false, revision=0, pending=false;
const executed=new Set();
const time = value => new Date(value).toISOString().replace('T',' ').replace('.000Z',' UTC');
const bound = () => ({snapshot:current.snapshot,intent:current.intent,policy:current.policy});
const errorText = error => error instanceof Error?error.message:'Operation could not be completed.';

function renderEvidence() {
  const s=current.snapshot;
  $('quote-output').textContent=formatUnits(s.quote.outputAtomic,s.asset.decimals)+' NVDAon';
  $('quote-minimum').textContent=formatUnits(s.quote.minOutputAtomic,s.asset.decimals)+' NVDAon';
  $('quote-vendor').textContent=s.quote.vendor;
  $('market-state').textContent=s.market.status;
  $('virtual-clock').textContent=time(current.now);
  $('amount-help').textContent='Fixture quote is bound to $'+formatUnits(s.quote.inputAtomic,18)+'. Editing requires a new matching fixture; use the $25 scenario for a smaller quote.';
  document.querySelectorAll('[data-scenario]').forEach(el=>{const active=el.dataset.scenario===selected;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));});
}
function invalidate(reason) {
  revision++;
  if(receipt){invalidated=true;setReceipt(false,'INVALID · '+reason);}
  $('simulate').disabled=true;
  $('decision-status').textContent='Review changed intention';
  $('decision-status').className='decision-status idle';
  $('decision-summary').textContent='Previous checks are historical. Re-run preflight against the current fields.';
}
function syncIntent() {
  current.intent.rightsAcknowledged=$('rights').checked;
  current.policy.stopped=$('stop').checked;
  current.policy.allowClosed=$('allow-closed').checked;
  try{current.intent.inputAtomic=parseUnits($('amount').value.trim(),18);$('amount').removeAttribute('aria-invalid');}
  catch(error){current.intent.inputAtomic='INVALID';$('amount').setAttribute('aria-invalid','true');$('amount-help').textContent=errorText(error);}
}
function loadScenario(id) {
  invalidate('Scenario or evidence changed. Run preflight again.');
  selected=id;current=scenario(id);$('scenario').value=id;
  $('amount').value=formatUnits(current.intent.inputAtomic,18);
  $('rights').checked=current.intent.rightsAcknowledged;
  $('stop').checked=current.policy.stopped;$('allow-closed').checked=current.policy.allowClosed;
  $('amount').removeAttribute('aria-invalid');renderEvidence();
  $('checks').replaceChildren(node('li','New fixture loaded. Run preflight for current checks.','empty-state'));
}
function setReceipt(valid,message) {
  $('receipt-state').textContent=message;$('receipt-state').className='receipt-state '+(valid?'valid':'invalid');
  $('simulate').disabled=!valid || pending || (receipt && executed.has(receipt.binding));
  $('verify-receipt').disabled=!receipt;$('export-receipt').disabled=!receipt;
}
function renderResult(result) {
  const ready=result.status==='READY_FOR_LOCAL_SIMULATION';
  $('decision-status').textContent=ready?'Ready for local simulation':result.status==='WAIT'?'Wait for fresh evidence':'Blocked by current checks';
  $('decision-status').className='decision-status '+(ready?'ready':result.status==='WAIT'?'wait':'blocked');
  const bad=result.checks.filter(c=>c.status!=='PASS');
  $('decision-summary').textContent=ready?'All '+result.checks.length+' checks pass for this fixture. Signing and broadcasting remain disabled.':bad.length+' check'+(bad.length===1?'':'s')+' need attention. Review the reasons below; a display price is not permission to act.';
  $('checks').replaceChildren(...result.checks.map(check=>{
    const li=node('li',undefined,'check '+check.status.toLowerCase());
    const top=node('div',undefined,'check-top');top.append(node('span',check.label),node('span',check.status,'check-badge'));
    li.append(top,node('p',check.detail));if(check.status!=='PASS')li.append(node('p',check.next,'next-step'));return li;
  }));
}
async function verifyCurrent() {
  if(!receipt)return;
  const token=revision;
  const verification=await verifyReceipt(receipt,current.now,bound());
  if(token!==revision)return;
  const valid=verification.valid&&!invalidated;
  setReceipt(valid,valid?'VALID · Bound fields & clocks pass.':invalidated?'INVALID · Reviewed fields were edited. Run preflight again.':'INVALID · '+verification.reason);
  return valid;
}
async function runPreflight() {
  if(pending)return;syncIntent();pending=true;const token=++revision;
  $('run-preflight').disabled=true;$('run-preflight').textContent='Checking evidence…';$('simulate').disabled=true;
  try {
    const result=evaluate(current.snapshot,current.intent,current.policy,current.now);renderResult(result);
    const generated=await createReceipt(current.snapshot,current.intent,current.policy,current.now);
    if(token!==revision)return;
    receipt=generated;invalidated=false;$('receipt-hash').textContent=receipt.binding;
    $('receipt-expiry').textContent='Created '+time(receipt.createdAt)+' · expires '+time(receipt.expiresAt);
    await verifyCurrent();
  } catch(error){setReceipt(false,'Unable to create receipt: '+errorText(error));}
  finally{pending=false;$('run-preflight').disabled=false;$('run-preflight').textContent='Run preflight →';if(token===revision)await verifyCurrent();}
}
async function simulate() {
  if(pending||!receipt)return;
  const token=revision,valid=await verifyCurrent();if(!valid||token!==revision)return;
  if(executed.has(receipt.binding)){setReceipt(false,'Already simulated · this bound receipt is deduplicated.');return;}
  executed.add(receipt.binding);$('simulate').disabled=true;
  if($('simulation-log').querySelector('.empty-state'))$('simulation-log').replaceChildren();
  const li=node('li');li.append(node('strong','SIMULATION · source FIXTURE'),node('p','Local effects checked at '+time(current.now)+'. No transaction was signed or broadcast.'),node('code','Receipt '+receipt.binding.slice(0,16)+'…'));
  $('simulation-log').prepend(li);setReceipt(true,'VALID · Local simulation recorded once. No chain transaction.');
}
function exportReceipt() {
  if(!receipt)return;const url=URL.createObjectURL(new Blob([JSON.stringify(receipt,null,2)],{type:'application/json'}));
  const a=node('a');a.href=url;a.download='kinegate-fixture-receipt.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importReceipt(event) {
  const file=event.target.files?.[0];if(!file)return;const token=revision;
  $('import-status').textContent='Checking untrusted receipt…';
  try {
    if(file.size>1048576)throw new Error('Receipt exceeds the 1 MB import limit.');
    const candidate=JSON.parse(await file.text());const verified=await verifyReceipt(candidate,current.now,bound());
    if(token!==revision)throw new Error('Fields changed during import. Try again.');
    if(!verified.valid)throw new Error(verified.reason);
    receipt=candidate;invalidated=false;$('receipt-hash').textContent=receipt.binding;
    $('receipt-expiry').textContent='Imported fixture proof · expires '+time(receipt.expiresAt);
    renderResult(receipt.result);setReceipt(true,'VALID · Imported proof matches current fields.');$('import-status').textContent='Receipt verified. The hash does not authenticate its author.';
  } catch(error){$('import-status').textContent='Import rejected: '+errorText(error);}
  event.target.value='';
}
function renderBaseline() {
  const rows=scenarios.map(def=>{const item=scenario(def.id);return {def,baseline:priceOnlyBaseline(item.snapshot),result:evaluate(item.snapshot,item.intent,item.policy,item.now)};});
  const unsafe=rows.filter(r=>!r.def.expectedSafe), safe=rows.filter(r=>r.def.expectedSafe);
  const baselineUnsafe=unsafe.filter(r=>r.baseline).length, gateUnsafe=unsafe.filter(r=>r.result.status==='READY_FOR_LOCAL_SIMULATION').length;
  $('baseline-summary').replaceChildren(...[['16','Predefined fixtures'],[baselineUnsafe+'/'+unsafe.length,'Unsafe accepted · price-only'],[gateUnsafe+'/'+unsafe.length,'Unsafe accepted · KineGate'],[safe.filter(r=>r.result.status==='READY_FOR_LOCAL_SIMULATION').length+'/'+safe.length,'Valid fixtures passed · KineGate']].map(([n,label])=>{const el=node('div',undefined,'metric');el.append(node('strong',n),node('span',label));return el;}));
  $('baseline-rows').replaceChildren(...rows.map(r=>{const tr=node('tr');tr.append(node('td',r.def.title),node('td',r.def.expectedSafe?'Yes':'No'),node('td',r.baseline?'ACCEPT':'REJECT'),node('td',r.result.status==='READY_FOR_LOCAL_SIMULATION'?'READY':r.result.status));return tr;}));
}
async function fetchStatus() {
  $('refresh-status').disabled=true;$('api-status-label').textContent='Fetching read-only integration status…';$('api-status-raw').textContent='';
  try {
    const response=await fetch('/api/status',{signal:AbortSignal.timeout(8000),cache:'no-store'});
    if(!response.ok)throw new Error('HTTP '+response.status);
    if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('Server returned a non-JSON page; local API may be unavailable.');
    const status=await response.json();
    $('api-status-label').textContent=status.credentialsConfigured===false?'BLOCKED · API credentials are not configured. No authenticated integration verified.':status.eligibilityConfirmed===false?'BLOCKED · API eligibility has not been personally confirmed.': 'Server configuration received. Credentials being present does not prove a successful API call or filled trade.';
    $('api-status-raw').textContent=JSON.stringify(status,null,2);
  } catch(error){$('api-status-label').textContent='BLOCKED / unavailable: '+errorText(error);$('api-status-raw').textContent='No authenticated call or mainnet execution is established by this workspace. Use the local server for API integration status.';}
  finally{$('refresh-status').disabled=false;}
}
function tab(name) {
  document.querySelectorAll('.nav-tab').forEach(el=>{const active=el.dataset.tab===name;el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active));});
  document.querySelectorAll('.tab-panel').forEach(el=>{el.hidden=el.id!=='panel-'+name;});
  if(name==='baseline')renderBaseline();if(name==='evidence'){fetchStatus();fetchChainEvidence();}
}
async function fetchChainEvidence() {
  try {
    const response=await fetch('evidence/mainnet/bsc-readonly-probe.json',{signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw new Error('HTTP '+response.status);
    const data=await response.json();
    if(data.mode!=='LIVE'||data.readOnly!==true||typeof data.rawResponse!=='string')throw new Error('Unexpected evidence schema');
    const packets=JSON.parse(data.rawResponse);
    const value=id=>packets.find(p=>p.id===id)?.result;
    if(value(1)!=='0x38')throw new Error('Wrong chain');
    const code=value(3),decimals=Number(BigInt(value(5)));
    $('chain-evidence').textContent='LIVE acquisition · recorded read-only BSC response at '+data.timeUtc+'. Official-listed AAPLB contract has code; decimals '+decimals+'. No quote, liquidity, issuer qualification or filled trade is proven.';
    $('chain-evidence-raw').textContent=JSON.stringify({mode:'LIVE read-only acquisition / stored evidence',rpc:data.rpc,chainId:56,block:Number(BigInt(value(2))),asset:'AAPLB',contract:data.request.find(r=>r.method==='eth_getCode')?.params[0],codePresent:typeof code==='string'&&code!=='0x',decimals,source:data.contractSource,executed:false},null,2);
  }catch(error){$('chain-evidence').textContent='Read-only evidence unavailable: '+errorText(error)+'. No mainnet transaction is established.';}
}
async function readDiscovery() {
  $('read-discovery').disabled=true;$('discovery-status').textContent='Fetching allowed read-only catalog…';$('discovery-raw').textContent='';
  try {
    const response=await fetch('/api/discovery',{signal:AbortSignal.timeout(18000),cache:'no-store'});
    if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('Local API server is unavailable on this static host.');
    const result=await response.json();
    if(!response.ok)throw new Error(result.error+': '+(result.message??'Unavailable'));
    if(result.mode!=='LIVE'||!Array.isArray(result.data))throw new Error('Unverified response shape.');
    $('discovery-status').textContent='LIVE read-only catalog received at '+result.observedAt+'. Raw data is not automatically promoted into a passing preflight.';
    $('discovery-raw').textContent=JSON.stringify(result,null,2);
  }catch(error){$('discovery-status').textContent='BLOCKED: '+errorText(error);}
  finally{$('read-discovery').disabled=false;}
}
for(const def of scenarios){const option=node('option',def.title);option.value=def.id;$('scenario').append(option);}
for(const id of ['open','closed','issuer','stale']){const def=scenarios.find(s=>s.id===id);const button=node('button',undefined,'scenario-button');button.dataset.scenario=id;button.type='button';button.append(node('span',def.group,'scenario-group'),node('strong',def.title));button.addEventListener('click',()=>loadScenario(id));$('scenario-cards').append(button);}
$('scenario').addEventListener('change',event=>loadScenario(event.target.value));
$('amount').addEventListener('input',()=>{syncIntent();invalidate('Amount changed. Obtain a matching quote and rerun preflight.');});
for(const id of ['rights','allow-closed','stop'])$(id).addEventListener('change',()=>{syncIntent();invalidate('Acknowledgement or policy changed. Run preflight again.');});
$('run-preflight').addEventListener('click',runPreflight);$('refresh-fixture').addEventListener('click',()=>loadScenario(selected));
$('advance-clock').addEventListener('click',async()=>{revision++;current.now+=60000;renderEvidence();renderResult(evaluate(current.snapshot,current.intent,current.policy,current.now));await verifyCurrent();});
$('reset-clock').addEventListener('click',async()=>{revision++;current.now=FIXTURE_TIME;renderEvidence();renderResult(evaluate(current.snapshot,current.intent,current.policy,current.now));await verifyCurrent();});
$('verify-receipt').addEventListener('click',verifyCurrent);$('export-receipt').addEventListener('click',exportReceipt);$('import-receipt').addEventListener('change',importReceipt);
$('simulate').addEventListener('click',simulate);$('refresh-status').addEventListener('click',fetchStatus);
$('read-discovery').addEventListener('click',readDiscovery);
document.querySelectorAll('.nav-tab').forEach(el=>el.addEventListener('click',()=>tab(el.dataset.tab)));
renderEvidence();
