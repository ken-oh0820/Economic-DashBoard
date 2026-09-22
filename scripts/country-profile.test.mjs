import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {populationLabel,summaryMarkup,tabMarkup,TABS,initCountryProfile} from '../assets/country-profile.mjs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../assets/country-profile.css',import.meta.url),'utf8');
const source=readFileSync(new URL('../assets/country-profile.mjs',import.meta.url),'utf8');
const country={id:'840',name:'미국',flag:'US',region:'아메리카',rank:1,count:100,extra:{pop:341.8,debt:125.2},money:{gdp:'$30.6T',trade:'$5.4T',gni:'$28T',gniPc:'$82,580'},currency:'usd',industries:['IT','금융'],technologies:['AI'],resources:[],groups:['NATO','G7'],inflation:2.8,unemployment:4.2};

test('population uses millions-to-eok conversion and never converts missing values to zero',()=>{
  assert.equal(populationLabel(1412.2),'14.1억 명');
  assert.equal(populationLabel(341.8),'3.4억 명');
  assert.equal(populationLabel(51.7),'5,170만 명');
  for(const value of [null,undefined,NaN,Infinity,-1]) assert.equal(populationLabel(value),'자료 없음');
});
test('KRW trillion-to-gyeong conversion has the correct threshold',()=>{
  const fn=html.match(/function fmtMoney\(billionsUsd\)\{[\s\S]*?\n\}/)[0];
  const ctx=vm.createContext({curCurrency:'krw',usdKrwRate:1000});
  vm.runInContext(fn,ctx);
  assert.equal(vm.runInContext('fmtMoney(1000)',ctx),'₩1000.0조');
  assert.equal(vm.runInContext('fmtMoney(10000)',ctx),'₩1.0경');
  assert.equal(vm.runInContext('fmtMoney(30000)',ctx),'₩3.0경');
});
test('profile distinguishes coverage, sources, missing data and unranked industries',()=>{
  const summary=summaryMarkup(country);
  assert.match(summary,/등록 국가·지역 내 GDP 순위/);
  assert.match(summary,/100개 국가·지역 비교/);
  assert.doesNotMatch(summary,/GDP 세계 순위/);
  assert.match(tabMarkup('industry',country),/경쟁력 순위 아님/);
  assert.match(tabMarkup('resources',country),/자원이 없다는 의미는 아닙니다/);
  assert.match(tabMarkup('security',country),/군사력 종합 순위는 표시하지 않습니다/);
  assert.match(html,/표시된 개별 수치의 검증된 원문 출처를 뜻하지 않습니다/);
  assert.doesNotMatch(source,/\bfetch\s*\(/);
});
test('all dynamic profile text is escaped and source links are safe',()=>{
  const malicious={...country,region:'<img onerror=alert(1)>',industries:['<script>bad</script>'],technologies:[],resources:[{label:'<svg>',note:'<script>'}],groups:['<iframe>'],money:{...country.money,gdp:'<script>'}};
  for(const markup of [summaryMarkup(malicious),...TABS.map(([key])=>tabMarkup(key,malicious))]){
    assert.doesNotMatch(markup,/<script>|<iframe>|<img |<svg>/);
    for(const match of markup.matchAll(/<a [^>]+>/g)){
      assert.match(match[0],/href="https:\/\//);
      assert.match(match[0],/rel="noopener noreferrer"/);
    }
  }
});

function fixture(){
  const nodes=new Map();
  const doc={activeElement:null,body:{classList:{contains:()=>true}},getElementById:id=>nodes.get(id)};
  function node(id){
    const attrs={},classes=new Set();
    const n={id,dataset:{},hidden:true,isConnected:true,scrollTop:0,innerHTML:'',events:{},
      setAttribute:(k,v)=>{attrs[k]=v;},getAttribute:k=>attrs[k],
      addEventListener:(k,v)=>{n.events[k]=v;},focus:()=>{doc.activeElement=n;},
      matches:()=>true,getClientRects:()=>[{}],
      classList:{toggle:k=>{if(classes.has(k)){classes.delete(k);return false;}classes.add(k);return true;}},
      closest:()=>n};
    nodes.set(id,n);return n;
  }
  for(const id of ['countryProfile','countryDetail','countryProfileOpen','countryTabs','countryTabBody','countryProfileScroll','countryProfileTitle','countryProfileRegion','countryProfileCurrency','countryProfileHighlights','countryProfileClose','countryProfileExpand'])node(id);
  const buttons=TABS.map(([id])=>{const n=node(`country-tab-${id}`);n.dataset.countryTab=id;return n;});
  nodes.get('countryTabs').querySelectorAll=()=>buttons;
  const events={},window={addEventListener:(k,v)=>{events[k]=v;},lucide:{createIcons(){}}};
  doc.activeElement=node('selection');
  const api=initCountryProfile({document:doc,window,getCountry:()=>country});
  return {api,nodes,doc,buttons,events};
}
test('country panel selects tabs, resizes without map calls, closes on menu exit and reopens',()=>{
  const {api,nodes,doc,buttons,events}=fixture();
  api.render(country,{show:true});
  assert.equal(nodes.get('countryProfile').hidden,false);
  assert.equal(doc.activeElement.id,'countryProfileTitle');
  nodes.get('countryTabs').events.keydown({target:buttons[0],key:'ArrowRight',preventDefault(){}});
  assert.equal(doc.activeElement,buttons[1]);
  assert.equal(buttons[1].getAttribute('aria-selected'),'true');
  assert.match(nodes.get('countryTabBody').innerHTML,/인구 구조/);
  api.render({...country,id:'410',name:'한국'});
  assert.equal(buttons[1].getAttribute('aria-selected'),'true');
  nodes.get('countryProfileExpand').events.click({currentTarget:nodes.get('countryProfileExpand')});
  assert.equal(nodes.get('countryProfileExpand').getAttribute('aria-pressed'),'true');
  events['app-view-change']({detail:'fed'});
  assert.equal(nodes.get('countryProfile').hidden,true);
  assert.equal(nodes.get('countryProfileOpen').hidden,false);
  api.open();
  api.close();
  assert.equal(doc.activeElement.id,'selection');
  assert.doesNotMatch(source,/invalidateSize|setView|fitBounds/);
  assert.match(css,/position: absolute; right: 0; top: 0; bottom: 0/);
  assert.match(css,/@media \(max-width: 768px\)/);
});
test('profile is contained within the map layout and no old narrow detail column remains',()=>{
  assert.equal((html.match(/id="countryDetail"/g)||[]).length,1);
  assert.doesNotMatch(html,/id="sidebarDetail"/);
  assert.ok(html.indexOf('id="countryProfile"')>html.indexOf('<div class="layout">'));
  assert.ok(html.indexOf('id="countryProfile"')<html.indexOf('id="mapContainer"'));
  assert.match(html,/renderDetail\(id,true\)/);
});
