import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {DEFAULT_FAVORITES,cleanFavorites,cleanRecent,observationLabel,timestampLabel,readPreference,savePreference} from '../assets/workspace-model.mjs';

test('favorites support an intentionally empty list, deduplicate and cap saved choices',()=>{
  const allowed=[...DEFAULT_FAVORITES,'a','b','c'];
  assert.deepEqual(cleanFavorites(null,allowed),DEFAULT_FAVORITES);
  assert.deepEqual(cleanFavorites([],allowed),[]);
  assert.deepEqual(cleanFavorites(['a','a','missing',42],allowed),['a']);
  assert.equal(cleanFavorites(allowed,allowed).length,8);
});
test('stored preferences fail safely and do not accept arbitrary company markup',()=>{
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.deepEqual(readPreference(blocked,'key',[]),[]);
  assert.equal(savePreference(blocked,'key',[]),false);
  assert.deepEqual(readPreference({getItem:()=>'{bad'},'key',[]),[]);
  assert.deepEqual(cleanRecent(['NASDAQ:AAPL','NASDAQ:AAPL','NYSE:BRK.B','<img src=x>','NYSE:']),['NASDAQ:AAPL','NYSE:BRK.B']);
});
test('observations distinguish monthly and quarterly periods from collection timestamps',()=>{
  assert.equal(observationLabel('2026-08-01','monthly'),'2026년 8월');
  assert.equal(observationLabel('2026-04-01','quarterly'),'2026년 2분기');
  assert.equal(observationLabel('2026-09-15','daily'),'2026-09-15');
  assert.equal(observationLabel(null,'monthly'),'기준일 미제공');
  assert.equal(timestampLabel(null),'미제공');
  assert.equal(timestampLabel('bad'),'미제공');
  assert.match(timestampLabel('2026-09-16T21:00:00Z'),/2026.*09.*17.*06:00.*KST/);
  assert.equal(timestampLabel(1700000000),timestampLabel(1700000000000));
});
test('official metadata flags delayed collection independently of observation month',async()=>{
  const code=await readFile(new URL('../assets/official-data.js',import.meta.url),'utf8');
  const item={points:[{date:'2026-06-01',value:1},{date:'2026-07-01',value:2}],frequency:'monthly',source:'BLS / FRED',rights:'Public Domain: Citation Requested',status:'ok',fetchedAt:new Date().toISOString()};
  const ctx=vm.createContext({Date,AbortSignal,fetch:async()=>({ok:true,json:async()=>({schemaVersion:1,updatedAt:new Date().toISOString(),series:{CPIAUCSL:item}})})});
  vm.runInContext(code,ctx);await ctx.OfficialData.load();
  assert.equal(ctx.OfficialData.metadata({series:'CPIAUCSL'}).delayed,false);
  assert.equal(ctx.OfficialData.metadata({series:'CPIAUCSL'}).date,'2026-07-01');
  ctx.OfficialData.get({series:'CPIAUCSL'}).fetchedAt='2020-01-01T00:00:00Z';
  assert.equal(ctx.OfficialData.metadata({series:'CPIAUCSL'}).delayed,true);
  assert.equal(ctx.OfficialData.metadata({series:'unknown'}),null);
});
test('workflow reuses original chart and sections without adding a data collection route',async()=>{
  const code=await readFile(new URL('../assets/workspace.mjs',import.meta.url),'utf8');
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.doesNotMatch(code,/\bfetch\s*\(|XMLHttpRequest/);
  assert.match(code,/chartPanelHost.*append\(\$\('\.market-chart-panel'\)\)/);
  assert.match(code,/\.showModal\(\)/);
  assert.match(code,/data-recent-symbol/);
  assert.match(code,/item\.hidden=.*term/);
  assert.match(html,/참고값 \(자동 갱신 없음\)/);
  assert.match(html,/app-view-change/);
  for(const path of ['assets/workspace.mjs','assets/workspace-model.mjs','assets/workspace.css']){
    assert.ok((await readFile(new URL('../'+path,import.meta.url),'utf8')).length);
  }
});
