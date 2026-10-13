import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const news=html.slice(html.indexOf('const US_NEWS_SOURCES='),html.indexOf('function clearMapTransientUi'));

test('news desk retains only Reuters, White House and WSJ in tabs and fetching configuration',()=>{
  const context=vm.createContext({});
  vm.runInContext(news,context);
  assert.deepEqual(Array.from(vm.runInContext('Object.keys(US_NEWS_SOURCES)',context)),['reuters','whitehouse','wsj']);
  const section=html.slice(html.indexOf('<section class="us-news-desk"'),html.indexOf('<div class="us-guide-dashboard"'));
  assert.deepEqual([...section.matchAll(/data-source="([^"]+)"/g)].map(match=>match[1]),['all','reuters','whitehouse','wsj']);
  assert.doesNotMatch(section,/Investing|Washington Post|WASHINGTON POST|investing|washingtonpost/);
  assert.doesNotMatch(news,/investing|washingtonpost|5개 출처/);
  assert.match(news,/Object\.keys\(US_NEWS_SOURCES\)\.length\+'개 출처 갱신 중'/);
});

test('old news caches exclude removed sources while retaining timestamps and allowed articles',()=>{
  const cache={savedAt:1234,items:[{sourceKey:'reuters',title:'Reuters'},{sourceKey:'investing',title:'Removed'},{sourceKey:'washingtonpost',title:'Removed'},{sourceKey:'whitehouse',title:'White House'},{sourceKey:'wsj',title:'WSJ'},null,{sourceKey:'constructor'}]};
  const context=vm.createContext({localStorage:{getItem:()=>JSON.stringify(cache)}});
  vm.runInContext(news,context);
  const result=JSON.parse(JSON.stringify(vm.runInContext('readUsNewsCache()',context)));
  assert.equal(result.savedAt,1234);
  assert.deepEqual(result.items.map(item=>item.sourceKey),['reuters','whitehouse','wsj']);
});

test('unrelated Investing bond links remain available',()=>{
  for(const country of ['south-korea','japan','brazil'])assert.ok(html.includes('https://www.investing.com/rates-bonds/'+country+'-government-bonds'));
});
