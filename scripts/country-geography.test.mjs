import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {COUNTRY_GEOGRAPHY,GEOGRAPHY_GROUPS,GEOGRAPHY_SOURCES,GEOGRAPHY_REVIEWED,GEOGRAPHY_COHORT_YEAR} from '../assets/country-geography.mjs';
import {geographyMarkup,resourcesMarkup} from '../assets/country-profile.mjs';

test('reviewed cohort has three sourced representative examples for ten countries',()=>{
  assert.deepEqual(Object.keys(COUNTRY_GEOGRAPHY),['US','CN','DE','JP','GB','IN','FR','RU','IT','CA']);
  assert.equal(GEOGRAPHY_COHORT_YEAR,2025);
  assert.match(GEOGRAPHY_REVIEWED,/^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(GEOGRAPHY_GROUPS.map(g=>g.key),['ports','waterways','terrain']);
  for(const country of Object.values(COUNTRY_GEOGRAPHY)){
    assert.equal(Object.keys(country).length,3);
    for(const {key} of GEOGRAPHY_GROUPS){
      const item=country[key];
      for(const field of ['title','relation','fact','reading','source']) assert.ok(item[field]?.trim());
      const source=GEOGRAPHY_SOURCES[item.source];
      assert.ok(source.label);assert.equal(new URL(source.url).protocol,'https:');
    }
  }
});

test('foreign waterways are not labelled as domestic assets',()=>{
  for(const code of ['US','CN','DE','JP','IN','RU','IT']) assert.match(COUNTRY_GEOGRAPHY[code].waterways.relation,/해외/);
  assert.match(COUNTRY_GEOGRAPHY.GB.waterways.relation,/영국·프랑스/);
  assert.match(COUNTRY_GEOGRAPHY.FR.waterways.relation,/프랑스·영국/);
  assert.match(COUNTRY_GEOGRAPHY.CA.waterways.relation,/공유 수로/);
});

test('geography rows are collapsed, sourced and distinguish facts from interpretation',()=>{
  for(const code of Object.keys(COUNTRY_GEOGRAPHY)){
    const html=geographyMarkup({code});
    assert.equal((html.match(/data-geography-key=/g)||[]).length,3);
    assert.equal((html.match(/경제적 의미 · 이 사이트의 해석/g)||[]).length,3);
    assert.equal((html.match(/rel="noopener noreferrer"/g)||[]).length,3);
    assert.match(html,/수동 확인/);assert.match(html,/실시간 제공하지 않습니다/);
    assert.doesNotMatch(html,/<details[^>]+\sopen[\s>]|undefined|NaN/);
    for(const group of GEOGRAPHY_GROUPS) assert.ok(html.includes(GEOGRAPHY_SOURCES[COUNTRY_GEOGRAPHY[code][group.key].source].url));
  }
});

test('uncovered, missing and prototype-like codes have honest empty states',()=>{
  for(const code of ['KR','ZZ',undefined,'__proto__','constructor','<script>alert(1)</script>']){
    const html=geographyMarkup({code});
    assert.match(html,/준비 중/);assert.match(html,/없다는 의미는 아닙니다/);
    assert.doesNotMatch(html,/data-geography-key|<script|undefined|NaN/);
  }
});

test('geography precedes statistics without replacing seven resource metrics',()=>{
  const html=resourcesMarkup({code:'US',stats:{},resources:[]});
  assert.equal((html.match(/data-resource-key=/g)||[]).length,7);
  assert.ok(html.indexOf('data-geography-key')<html.indexOf('data-resource-key'));
  assert.match(html,/World Bank 통계와 별도의 자료/);
});

test('editorial data adds no collection and changed assets bypass old caches',()=>{
  const read=file=>readFileSync(new URL(file,import.meta.url),'utf8');
  assert.doesNotMatch(read('../assets/country-geography.mjs'),/fetch\s*\(|XMLHttpRequest|setInterval/);
  assert.match(read('../assets/country-profile.mjs'),/country-geography.mjs\?v=20260923-geography1/);
  for(const asset of ['country-profile.css','country-profile.mjs'])assert.ok(read('../index.html').includes(`${asset}?v=20260923-geography1`));
  assert.match(read('../.github/workflows/update-country-data.yml'),/country-geography.test.mjs/);
});
