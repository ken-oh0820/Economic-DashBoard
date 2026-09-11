import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {SERIES,observations,spreadPoints} from './update-official-data.mjs';
const code=await readFile(new URL('../assets/official-data.js',import.meta.url),'utf8');
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
function setup(data){
  let requests=0;
  const ctx=vm.createContext({Date,AbortSignal,fetch:async(url)=>{requests++;assert.match(url,/^data\/official-data.json\?v=/);return {ok:true,json:async()=>data};}});
  vm.runInContext(code,ctx);
  return {ctx,api:ctx.OfficialData,requests:()=>requests};
}
const entry=points=>({points,source:'BLS / FRED',frequency:'monthly',status:'ok',fetchedAt:new Date().toISOString(),rights:'Public Domain: Citation Requested'});
test('collector rejects missing values and aligns spread on matching dates',()=>{
  assert.deepEqual(observations([{date:'2026-01-01',value:'.'},{date:'2026-01-02',value:null},{date:'2026-01-03',value:'-1'},{date:'bad',value:'2'},{date:'2026-01-04',value:''}]),[{date:'2026-01-03',value:-1}]);
  assert.deepEqual(spreadPoints([{date:'2026-01-01',value:4},{date:'2026-01-02',value:5}],[{date:'2026-01-02',value:3}]),[{date:'2026-01-02',value:2}]);
  for(const id of ['VIXCLS','MORTGAGE30US','BAMLH0A0HYM2','IRLTLT01KRM156N'])assert.equal(SERIES[id],undefined);
  assert.ok(SERIES.PPIFIS);assert.equal(SERIES.PPIACO,undefined);
});
test('snapshot requests deduplicate and reject unapproved series',async()=>{
  const {api,requests}=setup({schemaVersion:1,updatedAt:new Date().toISOString(),series:{GDP:entry([{date:'2025-01-01',value:100},{date:'2025-04-01',value:110}]),MORTGAGE30US:entry([{date:'2025-01-01',value:1},{date:'2025-02-01',value:2}])}});
  await Promise.all([api.load(),api.load(),api.load()]);
  assert.equal(requests(),1);assert.equal(api.get({series:'MORTGAGE30US'}),null);assert.equal(api.get({series:'GDP'}).points.length,2);
});
test('month comparison clamps calendar dates and never substitutes a distant month',()=>{
  const {api}=setup({});
  assert.equal(api.monthBefore('2026-03-31',1),'2026-02-28');
  assert.equal(api.monthBefore('2024-03-31',1),'2024-02-29');
  let delta=api.bondChanges([{date:'2026-07-30',value:3},{date:'2026-08-28',value:4},{date:'2026-08-31',value:4.1}]);
  assert.ok(Math.abs(delta.monthly-1.1)<1e-10);assert.ok(Math.abs(delta.day-.1)<1e-10);
  delta=api.bondChanges([{date:'2026-06-01',value:3},{date:'2026-08-31',value:4.1}]);
  assert.equal(delta.monthly,null);
});
test('GDP annual comparison uses matching quarter, not 12 quarters earlier',()=>{
  const {ctx}=setup({});
  const match=html.match(/function calcMacroFromPoints\([^]*?^}/m);vm.runInContext(match[0],ctx);
  ctx.points=[{date:'2025-01-01',value:100},{date:'2025-04-01',value:103},{date:'2025-07-01',value:105},{date:'2025-10-01',value:110},{date:'2026-01-01',value:120}];
  const result=vm.runInContext("calcMacroFromPoints(points,{mode:'level-trillion',periodsPerYear:4},'test')",ctx);
  assert.match(result.change,/YoY \+20.0%/);
  ctx.points.splice(3,1);
  assert.equal(vm.runInContext("calcMacroFromPoints(points,{mode:'level-trillion',periodsPerYear:4},'test')",ctx),null);
});
test('GDP chart scales billions to trillions and quarterly range stays usable',async()=>{
  const {api}=setup({schemaVersion:1,updatedAt:new Date().toISOString(),series:{GDP:{...entry([{date:'2025-01-01',value:1000},{date:'2025-04-01',value:1100},{date:'2025-07-01',value:1200},{date:'2025-10-01',value:1300},{date:'2026-01-01',value:1400}]),frequency:'quarterly'}}});
  await api.load();const chart=api.chart({series:'GDP',scale:.001},'1mo');
  assert.equal(chart.points.length,5);assert.ok(Math.abs(chart.points.at(-1).v-1.4)<1e-10);assert.match(chart.rangeLabel,/12개월/);
});
