import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SERIES} from '../assets/country-data.mjs';
import {SECURITY_KEYS,SECURITY_INFO,securityValue,securityChange,DIPLOMACY,membershipLabel} from '../assets/country-security.mjs';
import {securityMarkup} from '../assets/country-profile.mjs';
const snapshot=(key,values)=>({series:{[key]:{countries:{KR:values}}}});

test('military indicators preserve USD, percent and personnel units',()=>{
  assert.equal(SECURITY_KEYS.length,4);
  for(const key of SECURITY_KEYS){assert.ok(SERIES[key]);assert.ok(SECURITY_INFO[key].meaning);assert.ok(SECURITY_INFO[key].caution);}
  assert.equal(securityValue('militarySpending',5e10),'500억 USD');
  assert.equal(securityValue('militaryPersonnel',500000),'500,000명');
  assert.equal(securityValue('militaryGdp',2.567),'2.57%');
  assert.equal(securityValue('militaryBudget',0),'0%');
  for(const value of [null,undefined,Infinity,'123'])assert.equal(securityValue('militarySpending',value),'자료 없음');
});
test('military year-over-year changes use exact years and distinguish percent points',()=>{
  assert.deepEqual(securityChange(snapshot('militaryGdp',{2023:2,2024:3}),'militaryGdp','KR'),{from:2023,to:2024,value:1,unit:'%p'});
  assert.deepEqual(securityChange(snapshot('militarySpending',{2023:100,2024:110}),'militarySpending','KR'),{from:2023,to:2024,value:10,unit:'%'});
  assert.equal(securityChange(snapshot('militaryPersonnel',{2020:500000}),'militaryPersonnel','KR'),null);
  assert.equal(securityChange(snapshot('militarySpending',{2022:90,2024:110}),'militarySpending','KR'),null);
  assert.equal(securityChange(snapshot('militarySpending',{2023:0,2024:110}),'militarySpending','KR'),null);
  assert.equal(securityChange(undefined,'militaryGdp','KR'),null);
});
test('diplomacy distinguishes membership, partnerships and unconnected status',()=>{
  const [nato,g7,brics]=DIPLOMACY;
  assert.equal(new Set(nato.members).size,32);assert.equal(new Set(g7.members).size,7);
  assert.equal(membershipLabel(nato,'US'),'회원국');assert.equal(membershipLabel(nato,'SE'),'회원국');
  assert.equal(membershipLabel(nato,'KR'),'회원국 아님');assert.equal(membershipLabel(g7,'JP'),'회원국');
  assert.equal(membershipLabel(g7,'ES'),'회원국 아님');assert.equal(membershipLabel(brics,'CN'),'원문에서 확인');
  assert.equal(membershipLabel(nato,undefined),'국가 코드 확인 필요');
  assert.match(g7.note,/EU 회원국 모두/);assert.match(brics.note,/2025년/);
});
test('security disclosure labels old observations, sources, definitions and missing data',()=>{
  const c={code:'KR',currency:'krw',stats:{militaryPersonnel:{year:2020,value:600000},militarySpending:{year:2024,value:5e10}},official:{series:{militarySpending:{status:'ok',fetchedAt:'2026-09-22T00:00:00Z',sourceOrganization:'SIPRI <script>'}}}};
  const html=securityMarkup(c);
  assert.equal((html.match(/data-security-key=/g)||[]).length,4);assert.match(html,/2\/4/);
  assert.match(html,/600,000명/);assert.match(html,/2020년/);assert.match(html,/3년 초과 경과 자료/);
  assert.match(html,/500억 USD/);assert.doesNotMatch(html,/₩|<script>/);
  assert.match(html,/locations=KR/);assert.match(html,/CC BY 4.0/);
  assert.match(html,/군사력 종합 순위는 표시하지 않습니다/);assert.match(html,/수동 확인: 2026-09-22/);
  assert.doesNotMatch(html,/<details[^>]+\sopen[\s>]/);
  const empty=securityMarkup({});assert.match(empty,/0\/4/);assert.doesNotMatch(empty,/NaN|null%|undefined/);
});
test('security updates use versioned local modules and the official collection workflow',()=>{
  const read=file=>readFileSync(new URL(file,import.meta.url),'utf8');
  assert.match(read('../assets/country-profile.mjs'),/country-security.mjs\?v=20260922-registry1/);
  assert.match(read('../assets/country-security.mjs'),/country-data.mjs\?v=20260922-registry1/);
  assert.doesNotMatch(read('../assets/country-security.mjs'),/fetch\s*\(/);
  assert.match(read('../.github/workflows/update-country-data.yml'),/country-security.test.mjs/);
});
test('bundled military series retain provenance and never manufacture a missing expenditure',()=>{
  const s=JSON.parse(readFileSync(new URL('../data/country-data.json',import.meta.url),'utf8'));
  for(const key of SECURITY_KEYS){const series=s.series[key];assert.equal(series.indicator,SERIES[key][0]);assert.ok(series.sourceOrganization);assert.ok(series.sourceNote);assert.ok(Object.keys(series.countries).length>=50);assert.match(series.apiUrl,/^https:\/\/api.worldbank.org\//);}
  const c={code:'XX',stats:{},official:s};
  const html=securityMarkup(c);assert.match(html,/0\/4/);assert.match(html,/자료 없음/);assert.doesNotMatch(html,/0억 USD/);
});
