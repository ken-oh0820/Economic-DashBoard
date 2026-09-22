import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {COMPARE_GROUPS,normalizeSelections,commonObservation,compareValue,comparisonMarkup,initCountryComparison} from '../assets/country-compare.mjs';
const source=(values)=>({series:{gdp:{countries:values,status:'ok',fetchedAt:'2026-09-22T00:00:00Z'}}});
test('comparison selection is limited to three unique registered countries with empty slots',()=>{
  const allowed=new Set(['840','410','392']);
  assert.deepEqual(normalizeSelections(['840','840','BAD','392'],allowed),['840','','']);
  assert.deepEqual(normalizeSelections(['','410','392'],allowed),['','410','392']);
  assert.deepEqual(normalizeSelections([],allowed),['','','']);
});
test('comparison covers every sourced indicator and same-year total trade',()=>{
  const keys=COMPARE_GROUPS.flatMap(g=>g.keys);
  assert.equal(keys.length,35);assert.equal(new Set(keys).size,35);
  assert.equal(COMPARE_GROUPS.length,5);
});
test('common year is the newest intersection and does not mix latest observations',()=>{
  const s=source({US:{2025:30,2024:29,2023:28},KR:{2024:2,2023:1.9},JP:{2025:4,2023:4.2}});
  assert.deepEqual(commonObservation(s,'gdp',['US','KR']),{year:2024,values:[29,2]});
  assert.deepEqual(commonObservation(s,'gdp',['US','KR','JP']),{year:2023,values:[28,1.9,4.2]});
  assert.deepEqual(commonObservation(s,'gdp',['US']),{year:2025,values:[30]});
});
test('missing common years stay missing while zero and negative values survive',()=>{
  const s=source({US:{2025:0},KR:{2024:-1}});
  assert.deepEqual(commonObservation(s,'gdp',['US','KR']),{year:null,values:[null,null]});
  assert.deepEqual(commonObservation(s,'gdp',[]),{year:null,values:[]});
  assert.deepEqual(commonObservation(s,'gdp',['US']),{year:2025,values:[0]});
  assert.deepEqual(commonObservation(s,'gdp',['KR']),{year:2024,values:[-1]});
  assert.deepEqual(commonObservation(undefined,'gdp',['US']),{year:null,values:[null]});
});
test('trade requires matching exports and imports within each country and across countries',()=>{
  const s={series:{exports:{countries:{US:{2024:3,2023:2},KR:{2024:1,2023:1}}},imports:{countries:{US:{2023:4},KR:{2024:2,2023:2}}}}};
  assert.deepEqual(commonObservation(s,'trade',['US','KR']),{year:2023,values:[6,3]});
});
test('display keeps each indicator unit and never converts missing values to zero',()=>{
  assert.equal(compareValue('gdp',3e12),'3조 USD');assert.equal(compareValue('gdpPc',40000),'40,000 USD');
  assert.equal(compareValue('population',50000000),'50,000,000 명');assert.equal(compareValue('fertility',0.72),'0.72 명/여성');
  assert.equal(compareValue('exportIntensity',180),'180%');assert.equal(compareValue('growth',-2.1),'-2.1%');
  assert.equal(compareValue('landArea',1000),'1,000 km²');assert.equal(compareValue('militarySpending',1e10),'100억 USD');
  assert.equal(compareValue('gdp',null),'자료 없음');
});
test('table exposes exact years, escaped country names, source links and old-data labels',()=>{
  const countries=[{name:'<script>',flag:'US',code:'US'},{name:'한국',flag:'KR',code:'KR'}];
  const html=comparisonMarkup(source({US:{2020:1e12},KR:{2020:2e12}}),countries,'economy',Date.parse('2026-09-22'));
  assert.match(html,/2020년 · 3년 초과 경과/);assert.match(html,/locations=US/);assert.match(html,/locations=KR/);
  assert.match(html,/scope="col"/);assert.match(html,/scope="row"/);assert.doesNotMatch(html,/<script>|NaN/);
  assert.match(html,/공통 연도 없음/);assert.match(html,/1조 USD/);assert.match(html,/2조 USD/);
  assert.match(comparisonMarkup(undefined,[],'economy'),/선택된 국가 없음/);
  assert.match(comparisonMarkup(undefined,countries,'industry'),/제조품 수출 대비/);
});

function fixture(){
  const nodes=new Map(),events={},countries={'840':{id:'840',name:'미국',flag:'🇺🇸',code:'US'},'410':{id:'410',name:'한국',flag:'🇰🇷',code:'KR'}};
  const doc={activeElement:null,getElementById:id=>nodes.get(id)};
  function node(id){const n={id,events:{},dataset:{},isConnected:true,open:false,innerHTML:'',attrs:{},addEventListener:(k,fn)=>n.events[k]=fn,setAttribute:(k,v)=>n.attrs[k]=v,focus:()=>doc.activeElement=n,getClientRects:()=>[{}],showModal:()=>{n.open=true;},close:()=>{n.open=false;}};nodes.set(id,n);return n;}
  for(const id of ['countryCompareDialog','countryCompareSelectors','countryCompareTabs','countryCompareBody','countryCompareStatus','countryCompareAttribution','countryCompareOpen','countryCompareCurrent','countryCompareClose','countryCompareReset','compareCountry0','compareCountry1','compareCountry2'])node(id);
  const buttons=COMPARE_GROUPS.map(g=>{const n=node(`compare-tab-${g.id}`);n.dataset.compareGroup=g.id;n.closest=()=>n;return n;});
  nodes.get('countryCompareTabs').querySelectorAll=()=>buttons;
  const win={addEventListener:(name,fn)=>events[name]=fn,lucide:{createIcons(){}}};
  const api=initCountryComparison({document:doc,window:win,getCountry:id=>countries[id],getCountries:()=>countries});
  return {api,nodes,events,doc,buttons};
}
test('dialog can preselect, retain, reset, handle keyboard tabs, refresh and close on navigation',()=>{
  const {api,nodes,events,doc,buttons}=fixture();
  doc.activeElement=nodes.get('countryCompareCurrent');api.setCountry('840');
  nodes.get('countryCompareCurrent').events.click();
  assert.equal(nodes.get('countryCompareDialog').open,true);assert.match(nodes.get('countryCompareSelectors').innerHTML,/value="840" selected/);
  assert.match(nodes.get('countryCompareStatus').textContent,/공식 자료 대기/);
  nodes.get('countryCompareSelectors').events.change({target:{dataset:{compareSlot:'1'},value:'410'}});
  assert.match(nodes.get('countryCompareStatus').textContent,/2\/3/);
  nodes.get('countryCompareTabs').events.keydown({target:buttons[0],key:'End',preventDefault(){}});
  assert.equal(buttons[4].attrs['aria-selected'],'true');assert.equal(doc.activeElement,buttons[4]);
  api.refresh();nodes.get('countryCompareDialog').events.cancel({preventDefault(){}});
  assert.equal(nodes.get('countryCompareDialog').open,false);assert.equal(doc.activeElement,nodes.get('countryCompareCurrent'));
  api.open();assert.match(nodes.get('countryCompareStatus').textContent,/2\/3/);
  nodes.get('countryCompareReset').events.click();assert.match(nodes.get('countryCompareStatus').textContent,/0\/3/);
  events['app-view-change']({detail:'fed'});assert.equal(nodes.get('countryCompareDialog').open,false);
});
test('comparison uses native modal and local snapshot without new collection or map resize',()=>{
  const read=file=>readFileSync(new URL(file,import.meta.url),'utf8');
  const js=read('../assets/country-compare.mjs'),html=read('../index.html'),css=read('../assets/country-compare.css');
  assert.match(html,/<dialog id="countryCompareDialog"/);assert.match(html,/CountryComparison\?\.refresh/);
  assert.match(html,/country-compare.css\?v=20260922-registry1/);assert.match(js,/dialog.showModal/);
  assert.doesNotMatch(js,/\bfetch\s*\(|invalidateSize|setView|fitBounds/);
  assert.match(css,/#countryCompareBody\{overflow:auto/);assert.match(css,/@media\(max-width:600px\)/);
});
