import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SERIES} from '../assets/country-data.mjs';
import {industryMetric,industryHeadline,industryScale,INDUSTRY_KEYS,INDUSTRY_INFO} from '../assets/country-industry.mjs';
import {industryMarkup} from '../assets/country-profile.mjs';
const snapshot=()=>({schemaVersion:1,attemptedAt:'2026-09-21T00:00:00Z',series:{}});
function add(s,key,countries){s.series[key]={indicator:SERIES[key][0],countries,status:'ok',fetchedAt:'2026-09-21T00:00:00Z',sourceOrganization:'Test source'};}
test('all nine industrial metrics have defined units, denominators and cautions',()=>{
  assert.equal(INDUSTRY_KEYS.length,9);assert.equal(new Set(INDUSTRY_KEYS).size,9);
  for(const key of INDUSTRY_KEYS){assert.equal(SERIES[key][2],'%');assert.ok(INDUSTRY_INFO[key].basis);assert.ok(INDUSTRY_INFO[key].meaning);assert.ok(INDUSTRY_INFO[key].caution);}
});
test('industry comparison uses the selected country observation year, unique peers and median',()=>{
  const s=snapshot(),countries={KR:{2024:25,2021:20}};
  const codes=['KR',...Array.from({length:9},(_,i)=>`C${i}`)];
  codes.slice(1).forEach((c,i)=>countries[c]={2024:i,2025:999});
  add(s,'manufacturing',countries);
  const m=industryMetric(s,'manufacturing','KR',[...codes,'KR']);
  assert.equal(m.current.year,2024);assert.equal(m.median,4.5);assert.equal(m.count,10);assert.equal(m.total,10);assert.equal(m.change,5);assert.equal(m.baselineYear,2021);
});
test('three-year change is percentage points and never falls back to a different baseline year',()=>{
  const s=snapshot();add(s,'research',{KR:{2024:0,2022:4,2021:2}});
  assert.equal(industryMetric(s,'research','KR').change,-2);
  delete s.series.research.countries.KR[2021];
  assert.equal(industryMetric(s,'research','KR').change,null);
  assert.equal(industryMetric(s,'research','XX').current,null);
  assert.equal(industryMetric(s,'research','KR',['KR']).median,null);
});
test('GDP structure headline compares only the same year and excludes overlapping manufacturing',()=>{
  const s=snapshot();add(s,'services',{KR:{2025:70,2024:60}});add(s,'industry',{KR:{2024:32}});add(s,'agriculture',{KR:{2024:2}});add(s,'manufacturing',{KR:{2024:99}});
  assert.match(industryHeadline(s,'KR'),/서비스업 60.0%.*2024년/);
  assert.doesNotMatch(industryHeadline(s,'KR'),/2025|99/);
  delete s.series.agriculture.countries.KR[2024];assert.match(industryHeadline(s,'KR'),/자료 부족/);
});
test('valid export ratios over 100 percent keep their value and use a labeled larger scale',()=>{
  assert.deepEqual(industryScale('exportIntensity',180),{max:200,width:90});
  assert.deepEqual(industryScale('research',5),{max:10,width:50});
  assert.deepEqual(industryScale('manufacturing',0),{max:100,width:0});
  assert.equal(industryScale('manufacturing',null).width,0);
});
test('industrial disclosures are compact, safe and retain original data attribution',()=>{
  const s=snapshot();add(s,'exportIntensity',{KR:{2025:180,2022:160}});
  const c={code:'KR',official:s,industryMetrics:{exportIntensity:industryMetric(s,'exportIntensity','KR',['KR'])},industries:['<script>unsafe</script>'],technologies:[],money:{}};
  const html=industryMarkup(c);
  assert.equal((html.match(/data-industry-key=/g)||[]).length,9);
  assert.doesNotMatch(html,/<details[^>]+\sopen[\s>]/);
  assert.match(html,/180%/);assert.match(html,/0–200%/);assert.match(html,/\+20%p/);
  assert.match(html,/전체 상품 수출 대비/);assert.match(html,/제조품 수출 대비/);assert.match(html,/전체 서비스 수출 대비/);
  assert.match(html,/locations=KR/);assert.match(html,/CC BY 4.0/);assert.match(html,/경쟁력 순위 아님/);
  assert.doesNotMatch(html,/<script>/);assert.match(html,/미검증/);assert.match(html,/세부 품목 순위는 연결하지 않았/);
});
test('no-data countries retain all sections without invented scores, bars or medians',()=>{
  const html=industryMarkup({industryMetrics:{},industries:[],technologies:[]});
  assert.match(html,/0\/9/);assert.match(html,/자료 없음/);
  assert.doesNotMatch(html,/class="industry-track"/);assert.doesNotMatch(html,/NaN|undefined|null%/);
});
test('browser assets are versioned consistently and collection remains official WDI only',()=>{
  const read=file=>readFileSync(new URL(file,import.meta.url),'utf8');
  const html=read('../index.html');
  for(const asset of ['country-profile.mjs','country-data-client.mjs','country-profile.css'])assert.ok(html.includes(`${asset}?v=20260921-resources1`));
  for(const file of ['../assets/country-profile.mjs','../assets/country-data-client.mjs','../assets/country-industry.mjs','../assets/country-resources.mjs'])assert.match(read(file),/country-data.mjs\?v=20260921-resources1/);
  const collector=read('./update-country-data.mjs');assert.match(collector,/https:\/\/api.worldbank.org/);assert.doesNotMatch(collector,/comtradeapi|comtradeplus|scrap/i);
});
