import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {US_GEOGRAPHY_GROUPS,US_GEOGRAPHY_SOURCES,US_GEOGRAPHY_REVIEWED,usRouteReviewLabel} from '../assets/country-geography-us.mjs';
import {geographyMarkup,resourcesMarkup,usGeographyMarkup} from '../assets/country-profile.mjs';

test('US overview contains four complete sourced groups with nationwide coverage',()=>{
  assert.deepEqual(US_GEOGRAPHY_GROUPS.map(g=>g.key),['ports','waterways','terrain','routes']);
  const ids=new Set();
  for(const group of US_GEOGRAPHY_GROUPS){
    assert.equal(group.items.length,8);
    for(const item of group.items){
      assert.ok(!ids.has(item.id));ids.add(item.id);
      for(const field of ['title','meta','fact','reading'])assert.ok(item[field]?.trim());
      assert.ok(item.sources.length);
      for(const key of [...item.sources,...(item.schedule?[item.schedule]:[])]){
        const source=US_GEOGRAPHY_SOURCES[key];assert.ok(source?.label);
        assert.equal(new URL(source.url).protocol,'https:');
      }
    }
  }
  for(const id of ['california','northwest','northeast','southeast','gulf','great-lakes','alaska','hawaii'])assert.ok(ids.has(id));
});

test('advertised services distinguish international and domestic connections and retain schedules',()=>{
  const routes=US_GEOGRAPHY_GROUPS.find(g=>g.key==='routes').items;
  assert.equal(routes.filter(r=>r.meta.startsWith('국제')).length,6);
  assert.equal(routes.filter(r=>r.meta.startsWith('국내 연안')).length,2);
  for(const route of routes){assert.ok(route.connection);assert.ok(route.schedule);}
  assert.match(routes.find(r=>r.id==='aax').connection,/→/);
  assert.match(routes.find(r=>r.id==='al4').fact,/환적/);
  assert.match(US_GEOGRAPHY_GROUPS.find(g=>g.key==='waterways').items.find(i=>i.id==='bering').reading,/연중 정기.*뜻하지 않습니다/);
});

test('dated route review does not silently become a live sailing status',()=>{
  const checked=Date.parse(`${US_GEOGRAPHY_REVIEWED}T00:00:00+09:00`);
  assert.match(usRouteReviewLabel(checked),/항차별 운항 미확인/);
  assert.match(usRouteReviewLabel(checked+29*86400000),/항차별 운항 미확인/);
  assert.match(usRouteReviewLabel(checked+30*86400000),/재확인 필요/);
  for(const now of [NaN,Infinity,checked-1])assert.match(usRouteReviewLabel(now),/날짜 점검/);
});

test('US detail replaces short overview, keeps compact disclosures and preserves resource statistics',()=>{
  const html=resourcesMarkup({code:'US',stats:{},resources:[]});
  assert.equal((html.match(/data-geography-key=/g)||[]).length,4);
  assert.equal((html.match(/data-us-geography-item=/g)||[]).length,32);
  assert.equal((html.match(/data-resource-key=/g)||[]).length,7);
  assert.equal((html.match(/class="country-sources country-route-schedule"/g)||[]).length,8);
  assert.doesNotMatch(html,/<details[^>]+\sopen[\s>]|undefined|NaN/);
  assert.match(html,/본토 48개 주·알래스카·하와이/);
  assert.match(html,/전체 순서·직항·양방향 동일 운항을 뜻하지 않습니다/);
  assert.match(html,/World Bank 통계와 별도의 자료/);
  assert.equal((geographyMarkup({code:'JP'}).match(/data-geography-key=/g)||[]).length,3);
  assert.match(geographyMarkup({code:'KR'}),/준비 중/);
  assert.match(usGeographyMarkup(Date.parse('2027-01-01')),/재확인 필요/);
});

test('expanded US data uses links without browser scraping or invented map tracks',()=>{
  const read=file=>readFileSync(new URL(file,import.meta.url),'utf8');
  assert.doesNotMatch(read('../assets/country-geography-us.mjs'),/fetch\s*\(|XMLHttpRequest|setInterval|coordinates|polyline/);
  assert.match(read('../assets/country-profile.mjs'),/country-geography-us.mjs\?v=20260923-us-geography1/);
  assert.match(read('../.github/workflows/update-country-data.yml'),/country-geography-us.test.mjs/);
});
