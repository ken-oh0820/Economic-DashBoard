import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SERIES} from '../assets/country-data.mjs';
import {buildAtlasData} from '../assets/country-data-client.mjs';
import {RESOURCE_KEYS,RESOURCE_INFO,resourceValue,resourceAge} from '../assets/country-resources.mjs';
import {resourcesMarkup,tabMarkup} from '../assets/country-profile.mjs';

test('seven resource indicators have explicit units and interpretation limits',()=>{
  assert.equal(RESOURCE_KEYS.length,7);
  for(const key of RESOURCE_KEYS){assert.ok(SERIES[key]);assert.ok(RESOURCE_INFO[key].basis);assert.ok(RESOURCE_INFO[key].meaning);assert.ok(RESOURCE_INFO[key].caution);}
  assert.equal(SERIES.landArea[2],'km²');assert.equal(SERIES.freshwater[2],'m³/인');
});
test('resource formatting preserves units, zero and small shares without currency conversion',()=>{
  assert.equal(resourceValue('landArea',1234567),'1,234,567 km²');
  assert.equal(resourceValue('freshwater',1250.6),'1,251 m³/인');
  assert.equal(resourceValue('resourceRents',0.12),'0.12%');
  assert.equal(resourceValue('fuelExports',0),'0%');
  for(const value of [undefined,null,NaN,Infinity,'10'])assert.equal(resourceValue('forestArea',value),'자료 없음');
});
test('observation age is independent of collection freshness',()=>{
  const now=Date.parse('2026-09-21T00:00:00Z');
  assert.equal(resourceAge(2021,now),'3년 초과 경과 자료');
  assert.equal(resourceAge(2023,now),'');assert.equal(resourceAge(undefined,now),'');
});
test('resource values flow through the shared adapter without changing map values',()=>{
  const s={schemaVersion:1,attemptedAt:'2026-09-21T00:00:00Z',series:{}};
  for(const key of RESOURCE_KEYS)s.series[key]={indicator:SERIES[key][0],status:'ok',fetchedAt:s.attemptedAt,countries:{KR:{2021:1,2023:2}}};
  s.series.gdp={indicator:SERIES.gdp[0],status:'ok',fetchedAt:s.attemptedAt,countries:{KR:{2025:1e12}}};
  const data=buildAtlasData(s,{'410':{flag:'🇰🇷'}});
  assert.deepEqual(data.profiles['410'].stats.landArea,{year:2023,value:2});
  assert.equal(data.mapValues['410'].gdp,1000);
  assert.equal(Object.keys(data.mapValues['410']).length,4);
});
test('resource tab keeps seven compact disclosures with country source links and no inferred reserves',()=>{
  const c={code:'KR',stats:{landArea:{year:2023,value:97000},resourceRents:{year:2021,value:0.12}},resources:[{label:'<script>',note:'<img onerror=x>'}],official:{series:{resourceRents:{status:'stale',fetchedAt:'2026-09-01T00:00:00Z',sourceOrganization:'<script>FAO</script>'}}}};
  const html=resourcesMarkup(c);
  assert.equal((html.match(/data-resource-key=/g)||[]).length,7);
  assert.match(html,/2\/7/);assert.match(html,/97,000 km²/);assert.match(html,/0.12%/);
  assert.match(html,/2021년/);assert.match(html,/갱신 지연/);assert.match(html,/CC BY 4.0/);
  assert.match(html,/locations=KR/);assert.match(html,/정부 세수·기업 순이익·자원 매장량이 아닙니다/);
  assert.match(html,/미검증/);assert.doesNotMatch(html,/<script>|<img /);
  assert.doesNotMatch(html,/<details[^>]+\sopen[\s>]/);
  assert.equal(tabMarkup('resources',c),html);
});
test('missing resource data is not displayed as a resource-free country',()=>{
  const html=resourcesMarkup({stats:{},resources:[]});
  assert.match(html,/0\/7/);assert.match(html,/자원이 없다는 의미는 아닙니다/);
  assert.doesNotMatch(html,/NaN|undefined|0%|null/);
});
test('resource module is versioned and uses no third-party browser collection',()=>{
  const read=file=>readFileSync(new URL(file,import.meta.url),'utf8');
  assert.match(read('../assets/country-profile.mjs'),/country-resources.mjs\?v=20260922-registry1/);
  assert.doesNotMatch(read('../assets/country-resources.mjs'),/fetch\s*\(/);
  assert.match(read('../.github/workflows/update-country-data.yml'),/country-resources.test.mjs/);
});
test('bundled resource snapshot includes every series with attribution and registered-country data',()=>{
  const s=JSON.parse(readFileSync(new URL('../data/country-data.json',import.meta.url),'utf8'));
  for(const key of RESOURCE_KEYS){
    const series=s.series[key];assert.equal(series.indicator,SERIES[key][0]);
    assert.ok(series.sourceOrganization);assert.ok(Object.keys(series.countries).length>=50);
    assert.ok(series.sourceNote);assert.match(series.apiUrl,/^https:\/\/api.worldbank.org\//);
  }
});
