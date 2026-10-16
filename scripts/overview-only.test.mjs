import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const workspace=await readFile(new URL('../assets/workspace.mjs',import.meta.url),'utf8');
const fn=(code,name)=>code.match(new RegExp('function '+name+'\\([^]*?^}', 'm'))[0];
const macroDeclaration=html.match(/const US_MACRO_ITEMS=\[[^]*?^\];/m)[0];

test('macro table omits the four overview duplicates while retaining the other seven rows',()=>{
  const grid={innerHTML:''};
  const ctx=vm.createContext({document:{getElementById:()=>grid},MARKET_CHARTS:{},window:{},sourceOnlyChart:()=>false,escHtml:String,bindMarketChartClicks(){},notifyMarketRendered(){}});
  vm.runInContext(macroDeclaration+'\n'+fn(html,'renderUsMacro')+'\nrenderUsMacro(US_MACRO_ITEMS)',ctx);
  assert.deepEqual([...grid.innerHTML.matchAll(/data-chart-key="([^"]+)"/g)].map(match=>match[1]),['macro-ppi','macro-core-ppi','macro-ahe','macro-ngdp','macro-rgdp','macro-inflation','macro-gdpdef']);
});

test('overview-only macro and spread values, changes and chart summaries survive without table nodes',()=>{
  const points=[{date:'2025-09-01',value:100},{date:'2026-08-01',value:110},{date:'2026-09-01',value:112}];
  const host={innerHTML:'',querySelectorAll:()=>[]};
  const keys=['macro-cpi','macro-core-cpi','macro-unrate','macro-payems','bond-us-spread'];
  const cfg=Object.fromEntries(keys.map(key=>[key,{series:key,label:key,suffix:key==='bond-us-spread'?'%p':'%'}]));
  const nodes=new Map(),calls=[];
  const ctx=vm.createContext({
    MARKET_CHARTS:cfg,favorites:keys,catalog:keys.map(key=>({key,label:key})),
    OfficialData:{get:()=>({points}),source:()=> 'Official source',periodPoint:(rows,date,months)=>rows.at(months===12?0:1),bondChanges:()=>({last:{value:.91},day:.02,monthly:-.1}),metadata:()=>({date:'2026-09-01',frequency:'monthly',source:'Official source'})},
    document:{querySelector:()=>null},
    $:id=>{if(id==='#overviewGrid')return host;if(!nodes.has(id))nodes.set(id,{});return nodes.get(id);},
    escape:String,observationLabel:date=>date,provenance:()=>'',updateFavoriteButton(){},renderChartExplanation(){},
    chartDialog:{open:false,showModal(){this.open=true;}},showMarketChart:key=>calls.push(key)
  });
  vm.runInContext(macroDeclaration+'\n'+['calcMacroFromPoints','fmtMarketNumber'].map(name=>fn(html,name)).join('\n')+'\n'+['standaloneObservation','refreshOverview','openChart'].map(name=>fn(workspace,name)).join('\n')+'\nrefreshOverview()',ctx);
  for(const key of keys)assert.ok(host.innerHTML.includes('data-open-chart="'+key+'"'));
  assert.match(host.innerHTML,/12\.0%/);
  assert.match(host.innerHTML,/전월 대비 \+1\.8%/);
  assert.match(host.innerHTML,/0\.91%p/);
  assert.doesNotMatch(host.innerHTML,/표시 준비 중|확인 불가/);
  for(const key of keys){ctx.key=key;vm.runInContext('openChart(key)',ctx);assert.equal(calls.at(-1),key);assert.match(nodes.get('#chartDataBasis').innerHTML,/chart-current-value/);}
  assert.match(nodes.get('#chartDataBasis').innerHTML,/0\.91%p/);
  assert.match(nodes.get('#chartDataBasis').innerHTML,/전 관측일 \+0\.02%p/);
});
