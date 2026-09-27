import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const workspace=await readFile(new URL('../assets/workspace.mjs',import.meta.url),'utf8');
const fn=(code,name)=>code.match(new RegExp('function '+name+'\\([^]*?^}', 'm'))[0];
function setup(){
  const grid={innerHTML:''};
  const ctx=vm.createContext({
    OfficialData:{periodPoint:(rows,date,months)=>months===12?rows[0]:rows[1]},
    document:{getElementById:()=>grid},window:{},MARKET_CHARTS:{},
    sourceOnlyChart:()=>false,escHtml:String,bindMarketChartClicks(){},notifyMarketRendered(){}
  });
  vm.runInContext(fn(html,'calcMacroFromPoints')+'\n'+fn(html,'renderUsMacro'),ctx);
  return {ctx,grid};
}

test('monthly deltas have signed positive/negative text and neutral rounded zero',()=>{
  const {ctx}=setup();
  for(const mode of ['inflation','rate']){
    for(const [value,sign,tone] of [[101,'+1.0','market-up'],[99,'-1.0','market-down'],[100,'0.0','market-flat'],[99.99,'0.0','market-flat']]){
      ctx.rows=[{date:'2025-08-01',value:80},{date:'2026-07-01',value:100},{date:'2026-08-01',value}];
      ctx.item={mode,unit:'%'};
      const result=vm.runInContext('calcMacroFromPoints(rows,item,"test")',ctx);
      assert.equal(result.cls,tone);
      assert.ok(result.change.startsWith('전월 대비 '+sign+'%'));
    }
  }
});

test('monthly direction colors only the period delta, not the opposite annual figure',()=>{
  const {ctx,grid}=setup();
  ctx.rows=[{date:'2025-08-01',value:80},{date:'2026-07-01',value:100},{date:'2026-08-01',value:99}];
  vm.runInContext('renderUsMacro([calcMacroFromPoints(rows,{key:"cpi",mode:"inflation",unit:"%"},"test")])',ctx);
  assert.match(grid.innerHTML,/<span class="period-change market-down">전월 대비 -1.0%<\/span> · 전년 대비 \+23.8%/);
  assert.doesNotMatch(grid.innerHTML,/class="macro-value [^"]*market-down/);
});

test('payroll colors the monthly job change but not the total employment count',()=>{
  const {ctx,grid}=setup();
  for(const [value,tone] of [[100100,'market-up'],[99900,'market-down'],[100000,'market-flat']]){
    ctx.rows=[{date:'2025-08-01',value:90000},{date:'2026-07-01',value:100000},{date:'2026-08-01',value}];
    vm.runInContext('renderUsMacro([calcMacroFromPoints(rows,{key:"payems",mode:"level-change"},"test")])',ctx);
    assert.ok(grid.innerHTML.includes('class="macro-value period-change '+tone+'"'));
    assert.match(grid.innerHTML,/<div class="macro-change">전월 대비 증감 · 총고용/);
  }
  vm.runInContext('renderUsMacro([{key:"cpi",value:"확인 불가"}])',ctx);
  assert.doesNotMatch(grid.innerHTML,/period-change market-(?:up|down)/);
});

test('favorites preserve delta colors without tinting levels or payroll totals',()=>{
  const host={innerHTML:'',querySelectorAll:()=>[]};
  const ctx=vm.createContext({
    $:()=>host, favorites:['macro-cpi','macro-payems'],catalog:[{key:'macro-cpi',label:'CPI'},{key:'macro-payems',label:'고용'}],
    MARKET_CHARTS:{'macro-cpi':{transform:'yoy'},'macro-payems':{transform:'change'}},
    OfficialData:{metadata:()=>({date:'2026-08-01',frequency:'monthly'}),get:()=>({points:[{value:100}]})},
    document:{querySelector:()=>({querySelector:selector=>selector==='.period-change'?{classList:{contains:name=>name==='market-down'}}:{textContent:selector.includes('value')?'-1':'전월 대비 -1.0% · 전년 대비 +2.0%'}})},
    escape:String,observationLabel:()=> '2026년 8월'
  });
  vm.runInContext(fn(workspace,'refreshOverview')+'\nrefreshOverview()',ctx);
  const [cpi,payroll]=host.innerHTML.split('</article>');
  assert.match(cpi,/<strong class="">-1<\/strong><span class="overview-change period-change market-down">/);
  assert.match(payroll,/<strong class="period-change market-down">-1<\/strong><span class="overview-change ">총고용/);
});

test('light and dark delta styles are scoped and changed assets bypass stale caches',async()=>{
  const css=await readFile(new URL('../assets/workspace.css',import.meta.url),'utf8');
  for(const tone of ['up','down','flat'])assert.ok(css.includes('#indicatorDashboard .period-change.market-'+tone));
  assert.match(css,/body.light #indicatorDashboard .period-change.market-up\{color:#167344\}/);
  assert.match(css,/body.light #indicatorDashboard .period-change.market-down\{color:#c12c40\}/);
  for(const ext of ['css','mjs'])assert.ok(html.includes('assets/workspace.'+ext+'?v=20260927-change-colors'));
});
