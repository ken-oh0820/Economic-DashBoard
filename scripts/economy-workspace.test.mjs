import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initEconomyTabs} from '../assets/economy-tabs.mjs';
import {indicatorExplanation} from '../assets/indicator-explanations.mjs';

test('economic workspace synchronizes both tab state and keyboard navigation',()=>{
  const tabs=['dashboard','guide'].map(view=>({
    dataset:{economyView:view},attrs:{},events:{},
    setAttribute(key,value){this.attrs[key]=value;},
    addEventListener(key,fn){this.events[key]=fn;},focus(){this.focused=true;}
  }));
  const calls=[];
  const sync=initEconomyTabs({querySelectorAll:()=>tabs},view=>{calls.push(view);sync(view);});
  sync('dashboard');
  assert.deepEqual(tabs.map(t=>t.tabIndex),[0,-1]);
  tabs[1].events.click();
  assert.equal(calls.at(-1),'guide');
  assert.deepEqual(tabs.map(t=>t.attrs['aria-selected']),['false','true']);
  for(const [index,key,destination] of [[1,'ArrowRight',0],[0,'ArrowLeft',1],[1,'Home',0],[0,'End',1]]){
    let prevented=false;
    tabs[index].events.keydown({key,preventDefault(){prevented=true;}});
    assert.equal(prevented,true);
    assert.equal(calls.at(-1),tabs[destination].dataset.economyView);
    assert.equal(tabs[destination].focused,true);
  }
  tabs[0].events.keydown({key:'Tab',preventDefault(){assert.fail('native Tab');}});
  sync('dashboard');assert.deepEqual(tabs.map(t=>t.tabIndex),[0,-1]);
});

test('each monitored macro has its own definition, reading, caution and source',()=>{
  for(const key of ['cpi','core-cpi','ppi','core-ppi','unrate','payems','ahe','ngdp','rgdp','inflation','gdpdef']){
    const note=indicatorExplanation('macro-'+key);
    assert.ok(note,key);
    for(const field of ['definition','reading','caution'])assert.ok(note[field].length>20);
    assert.match(note.source,/^https:\/\/(www\.bls\.gov|www\.bea\.gov|fred\.stlouisfed\.org)\//);
  }
  assert.match(indicatorExplanation('macro-cpi').definition,/전년 동월/);
  assert.match(indicatorExplanation('macro-core-ppi').definition,/무역서비스/);
  assert.match(indicatorExplanation('macro-inflation').caution,/Core PCE가 아닙니다/);
  assert.match(indicatorExplanation('macro-gdpdef').definition,/전분기/);
  assert.match(indicatorExplanation('macro-payems').caution,/일자리 수/);
  assert.match(indicatorExplanation('bond-us-10y').caution,/채권 투자 수익률/);
  assert.equal(indicatorExplanation('unknown'),null);
});

test('chart explanation stays inside the chart dialog and related concepts stay distinct',async()=>{
  const code=await readFile(new URL('../assets/workspace.mjs',import.meta.url),'utf8');
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(code,/renderChartExplanation\(key\)/);
  assert.match(code,/지표 해설 · /);
  assert.match(code,/관련 지표 · /);
  assert.doesNotMatch(code,/const returnChart|chartDialog.close\(\);switchView\('guide'\)/);
  assert.match(code,/section.focus\(\{preventScroll:true\}\)/);
  for(const [id,tab] of [['indicatorDashboard','economy-monitor-tab'],['usEconomyGuide','economy-guide-tab']]){
    assert.ok(html.includes('id="'+id+'" role="tabpanel" aria-labelledby="'+tab+'" tabindex="0"'));
    assert.ok(html.includes('id="'+tab+'" role="tab" aria-controls="'+id+'"'));
  }
  assert.doesNotMatch(code.match(/const navItems=.*;/)[0],/\['guide'/);
});
