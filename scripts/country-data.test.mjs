import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {SERIES,iso2FromFlag,observations,observation,comparison,rankFor,sourceUrl,stale,validateSnapshot} from '../assets/country-data.mjs';
import {buildAtlasData,loadAtlasData} from '../assets/country-data-client.mjs';
import {readPages,failedSeries} from './update-country-data.mjs';
import {summaryMarkup,tabMarkup} from '../assets/country-profile.mjs';
const date='2026-09-21T00:00:00Z';
const series=(key,countries)=>({indicator:SERIES[key][0],status:'ok',fetchedAt:date,countries});
const sample=()=>({schemaVersion:1,attemptedAt:date,series:{gdp:series('gdp',{US:{2024:100,2025:110},KR:{2024:20},JP:{2024:30,2025:35}})}});

test('country identity and API selection exclude aggregate rows, invalid and future values',()=>{
  assert.equal(iso2FromFlag('🇰🇷'),'KR');assert.throws(()=>iso2FromFlag('KR'));
  const make=(id,value,year='2025',indicator='FP.CPI.TOTL.ZG')=>({country:{id},value,date:year,indicator:{id:indicator}});
  const result=observations([make('US',0),make('JP',-0.5),make('KR',null),make('WLD',7),make('CN',Infinity),make('US',8,'2026'),make('US',8,'2025','OTHER')],'FP.CPI.TOTL.ZG',new Set(['US','JP','KR','CN']),2025);
  assert.deepEqual(result,{US:{2025:0},JP:{2025:-0.5}});
});
test('common-year comparison never mixes newer observations into ranks; ties share rank',()=>{
  const s=sample(), codes=['US','KR','JP'];
  assert.deepEqual(comparison(s,'gdp',codes),{year:2024,count:3,total:3});
  assert.equal(observation(s,'gdp','KR',2025),null);
  assert.equal(rankFor(s,'KR',codes,2024),3);
  s.series.gdp.countries.KR[2024]=30;
  assert.equal(rankFor(s,'KR',codes,2024),2);
  assert.equal(rankFor(s,'XX',codes,2024),null);
  assert.deepEqual(comparison(s,'inflation',codes),{year:null,count:0,total:3});
});
test('trade sums only matching years and does not coerce null values',()=>{
  const s=sample();s.series.exports=series('exports',{US:{2024:10,2025:20}});s.series.imports=series('imports',{US:{2024:5,2025:null}});
  assert.deepEqual(observation(s,'trade','US'),{year:2024,value:15});
  assert.equal(observation(s,'trade','US',2025),null);
});
test('failed updates retain original timestamps and are visibly stale',()=>{
  const old=series('gdp',{US:{2025:1}}), failed=failedSeries(old,SERIES.gdp[0]);
  assert.equal(failed.fetchedAt,date);assert.equal(failed.status,'stale');
  const s=sample();s.series.gdp=failed;
  assert.equal(stale(s,'gdp',Date.parse(date)),true);
  s.series.gdp=old;assert.equal(stale(s,'gdp',Date.parse(date)),false);
  assert.equal(stale(s,'gdp',Date.parse(date)+15*86400000),true);
  assert.equal(failedSeries(null,SERIES.gdp[0]).status,'unavailable');
});
test('pagination combines all pages and rejects truncated or error payloads',async()=>{
  const request=async url=>({ok:true,json:async()=>[{page:Number(url.searchParams.get('page')),pages:2,total:2,lastupdated:'2026-07-13'},[{id:url.searchParams.get('page')}]]});
  const result=await readPages('https://api.worldbank.org/v2/indicator/x',request);
  assert.equal(result.rows.length,2);
  await assert.rejects(readPages('https://api.worldbank.org/v2/indicator/x',async()=>({ok:true,json:async()=>[{page:1,pages:1,total:2},[{}]]})),/Incomplete/);
  await assert.rejects(readPages('https://api.worldbank.org/v2/indicator/x',async()=>({ok:true,json:async()=>[{message:'error'}]})),/Unexpected/);
});
test('adapter uses billion USD for map, raw units for details and null for missing series',()=>{
  const s=sample(), b=buildAtlasData(s,{'840':{flag:'🇺🇸'},'410':{flag:'🇰🇷'},'392':{flag:'🇯🇵'}},Date.parse(date));
  assert.equal(b.mapValues['840'].gdp,100/1e9);
  assert.equal(b.profiles['840'].stats.gdp.year,2024);
  assert.equal(b.mapValues['410'].inflation,null);
  assert.equal(b.profiles['410'].stats.population,null);
  assert.match(b.status,/갱신 지연/);
});
test('browser reads only the bundled snapshot and exposes failures instead of fallback numbers',async()=>{
  let applied=0,failed=0,called;
  const w={getAtlasCountries:()=>({'840':{flag:'🇺🇸'}}),applyAtlasCountryData:()=>applied++,failAtlasCountryData:()=>failed++};
  await loadAtlasData(w,async url=>{called=url;return {ok:true,json:async()=>sample()};});
  assert.equal(applied,1);assert.match(called.pathname,/\/data\/country-data.json$/);
  await loadAtlasData(w,async()=>({ok:true,json:async()=>({invalid:true})}));
  assert.equal(failed,1);assert.equal(applied,1);
});
test('snapshot schema rejects nonnumeric observations and non-allowlisted series',()=>{
  const s=sample();s.series.gdp.countries.US[2025]='110';assert.throws(()=>validateSnapshot(s));
  const bad=sample();bad.series.other={};assert.throws(()=>validateSnapshot(bad));
  assert.match(sourceUrl('gdp','KR'),/^https:\/\/data.worldbank.org\/indicator\/NY.GDP.MKTP.CD\?locations=KR$/);
});
test('committed data covers registered countries only and maintains common-year GDP agreement',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const countries=runInNewContext('('+html.match(/const eData=(\{[^\r\n]+\});/)[1]+')');
  const s=validateSnapshot(JSON.parse(readFileSync(new URL('../data/country-data.json',import.meta.url),'utf8')));
  const codes=Object.values(countries).map(c=>iso2FromFlag(c.flag));
  const b=buildAtlasData(s,countries);
  for(const data of Object.values(s.series)) for(const code of Object.keys(data.countries)) assert.ok(codes.includes(code));
  for(const [id,profile] of Object.entries(b.profiles)) {
    assert.equal(b.mapValues[id].gdp,profile.stats.gdp?profile.stats.gdp.value/1e9:null);
    if(profile.stats.gdp) assert.equal(profile.stats.gdp.year,b.comparisons.gdp.year);
  }
  assert.ok(Object.values(countries).every(c=>c.gdp===null&&c.inflation===null));
  assert.doesNotMatch(html,/const extraInfo=/);
});
test('profile links show per-metric years, collection dates, source attribution and unavailable debt',()=>{
  const s=sample();s.series.gdp.sourceOrganization='<script>national statistics</script>';
  const c={official:s,code:'US',stats:{gdp:{year:2024,value:100}},money:{gdp:'$100B'},rank:1,rankYear:2024,count:3,extra:{},industries:[],technologies:[],resources:[],groups:[]};
  const markup=tabMarkup('economy',c);
  assert.match(markup,/2024년 · 연간/);assert.match(markup,/2026-09-21/);
  assert.match(markup,/CC BY 4.0/);assert.match(markup,/국가채무 값은/);
  assert.doesNotMatch(markup,/<script>/);assert.match(markup,/locations=US/);
  assert.match(summaryMarkup(c),/2024년 · 3개국 비교/);
});
