import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const html=await readFile(new URL('index.html',root),'utf8');
function fn(name){
  const match=html.match(new RegExp('(?:async )?function '+name+'\\([^]*?^}', 'm'));
  assert.ok(match,'Missing function '+name);
  return match[0];
}
function declaration(name){
  const match=html.match(new RegExp('const '+name+'=[^]*?^[}\\]];', 'm'));
  assert.ok(match,'Missing declaration '+name);
  return match[0];
}
function harness(){
  const nodes=new Map();
  const ranges=[{disabled:false},{disabled:false}];
  const context=vm.createContext({
    document:{getElementById(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);},querySelectorAll(){return ranges;}},
    setChartActive(){},updateTradingViewLink(){},bindMarketChartClicks(){},chartLimit(){return 30;},
    escHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');},
    fetchT:async()=>{throw new Error('Unexpected network access');},
    encodeURIComponent,URL,URLSearchParams,
  });
  const names=['investingSearchUrl','investingBondUrl','sourceLinkHtml','marketSourceUrl','sourceOnlyChart','showMarketChart','fetchMarketChartData','renderGlobalRates','renderBondYields','renderUsMacro','fetchBlsMacro'];
  vm.runInContext(names.map(fn).join('\n')+'\n'+['MARKET_CHARTS','GLOBAL_RATE_ITEMS','BOND_TENORS','BOND_YIELD_GROUPS','US_MACRO_ITEMS'].map(declaration).join('\n')+'\nlet currentMarketChartKey="",marketChartRange="1mo";',context);
  return {context,nodes,ranges};
}
test('runtime and scheduled jobs contain no Yahoo/FRED extraction routes',async()=>{
  const texts=[['index.html',html]];
  for(const dir of ['assets/','scripts/','workers/','.github/workflows/']){
    for(const name of await readdir(new URL(dir,root),{recursive:true})){
      if(!/\.(?:m?js|ya?ml)$/.test(name)||name.endsWith('.test.mjs'))continue;
      texts.push([dir+name,await readFile(new URL(dir+name.replaceAll('\\','/'),root),'utf8')]);
    }
  }
  for(const [name,text] of texts){
    assert.doesNotMatch(text,/query[12]\.finance\.yahoo|fredgraph\.(?:csv|png)|\/quotes\?syms|fetchYahoo|fetchFred|HY_SPREAD_FALLBACK|US_MACRO_FALLBACK/,name);
  }
  const snapshot=JSON.parse(await readFile(new URL('data/treasury-basis.json',root),'utf8'));
  assert.deepEqual(Object.keys(snapshot).sort(),['openInterest','position','updatedAt']);
});
test('every source-only chart uses a normal external link without data requests',async()=>{
  const {context,nodes,ranges}=harness();
  const keys=vm.runInContext('Object.keys(MARKET_CHARTS).filter(key=>sourceOnlyChart(MARKET_CHARTS[key]))',context);
  assert.ok(keys.length>40);
  let requests=0;context.fetchT=async()=>{requests++;throw Error('offline');};
  for(const key of keys){
    context.testKey=key;
    await vm.runInContext('showMarketChart(testKey)',context);
    const output=nodes.get('marketChartCanvas').innerHTML;
    assert.match(output,/<a .*href="https:\/\//,key);
    assert.match(output,/rel="noopener noreferrer"/,key);
    assert.doesNotMatch(output,/<(?:iframe|img|svg)\b/,key);
    assert.ok(ranges.every(button=>button.disabled),key);
    assert.equal(await vm.runInContext('fetchMarketChartData(testKey)',context),null);
  }
  assert.equal(requests,0);
});
test('policy rates and bond cards contain links instead of cached yields',()=>{
  const {context,nodes}=harness();
  vm.runInContext('renderGlobalRates();renderBondYields();renderUsMacro(US_MACRO_ITEMS);',context);
  for(const id of ['globalRateGrid','bondYieldGrid']){
    const output=nodes.get(id).innerHTML;
    assert.match(output,/<a class="(?:macro|bond)-card source-card" href="https:/);
    assert.match(output,/원문 보기/);
    assert.doesNotMatch(output,/\d+\.\d+%|FRED cached|전일|1개월/);
  }
  assert.match(nodes.get('usMacroGrid').innerHTML,/href="https:\/\/fred.stlouisfed.org\/series\/GDP"/);
});
test('failed BLS requests never fall back to Yahoo or FRED',async()=>{
  const {context}=harness();
  const urls=[];context.fetchT=async url=>{urls.push(url);throw Error('offline');};
  assert.equal(await vm.runInContext('fetchBlsMacro(US_MACRO_ITEMS[0])',context),null);
  assert.ok(urls.length>=3);
  assert.doesNotMatch(urls.join('\n'),/yahoo|stlouisfed|\/quotes/);
});
test('monitor retains only sentiment and VIX cards and stops Bitcoin requests',()=>{
  const grid=html.slice(html.indexOf('<div class="indicator-grid">'),html.indexOf('<div class="dashboard-panel macro-panel">'));
  assert.deepEqual([...grid.matchAll(/data-chart-key="([^"]+)"/g)].map(match=>match[1]),['fng','cfng','vix']);
  assert.doesNotMatch(html,/fetchBitcoin|api\.coingecko\.com|ind-(?:sp500|nasdaq|gold|btc|kospi|kosdaq)/);
  assert.match(html,/currentMarketChartKey='vix'/);
  const {context}=harness();
  for(const key of ['sp500','nasdaq','gold','btc','kospi','kosdaq'])assert.equal(vm.runInContext('MARKET_CHARTS['+JSON.stringify(key)+']',context),undefined);
});
