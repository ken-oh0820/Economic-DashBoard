import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../assets/monitor-compact.css',import.meta.url),'utf8');
const code=await readFile(new URL('../assets/workspace.mjs',import.meta.url),'utf8');

test('compact monitor has item/value columns and scoped responsive rows without changing dictionary styles',()=>{
  assert.ok(html.indexOf('assets/monitor-compact.css')>html.indexOf('assets/workspace.css'));
  assert.match(css,/content:'항목'/);
  assert.match(css,/content:'수치'/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/min-height:44px/);
  assert.doesNotMatch(css,/#usEconomyGuide|\.us-guide|body\.guide-mode/);
  assert.match(css,/body\.dashboard-mode #economyHeader/);
  assert.match(css,/#indicatorDashboard :is\(\.observation-date,[^]*?display:none/);
  assert.match(css,/\.observation-status.delayed\{display:block/);
  assert.match(css,/\.macro-change \.period-change\{font-size:10px/);
  assert.match(css,/:focus-visible\{outline:2px solid/);
});

test('compact row opens the existing chart with value, deltas, date and source retained in detail',()=>{
  const nodes=new Map();
  const changes=['전 관측일 +0.02%p','1개월 전 -0.10%p'];
  const calls=[];
  const ctx=vm.createContext({
    MARKET_CHARTS:{'bond-us-10y':{label:'미국 국채 10년물'}},activeChart:null,
    document:{querySelector:()=>({querySelector:()=>({textContent:'4.50%'}),querySelectorAll:()=>changes.map(text=>({textContent:text}))})},
    $:id=>{if(!nodes.has(id))nodes.set(id,{});return nodes.get(id);},
    OfficialData:{metadata:()=>({source:'Federal Reserve / FRED'})},
    escape:String,provenance:()=>'<div>관측 2026-09-24</div>',updateFavoriteButton(){},renderChartExplanation(){},
    chartDialog:{open:false,showModal(){this.open=true;}},showMarketChart:key=>calls.push(key)
  });
  vm.runInContext(code.match(/function openChart\([^]*?^}/m)[0]+"\nopenChart('bond-us-10y')",ctx);
  const detail=nodes.get('#chartDataBasis').innerHTML;
  for(const text of ['4.50%',...changes,'관측 2026-09-24','Federal Reserve / FRED'])assert.ok(detail.includes(text));
  assert.deepEqual(calls,['bond-us-10y']);
  assert.equal(ctx.chartDialog.open,true);
  assert.equal(nodes.get('#workspaceChartTitle').textContent,'미국 국채 10년물');
});
