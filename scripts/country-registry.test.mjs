import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildRegistry} from './update-country-registry.mjs';
import {validateRegistry,registryCountries} from '../assets/country-registry.mjs';
import {buildAtlasData,loadAtlasData} from '../assets/country-data-client.mjs';
const read=file=>readFileSync(new URL(file,import.meta.url),'utf8');
const registry=JSON.parse(read('../data/country-registry.json'));
const source=JSON.parse(read('../data/country-registry-source.json'));
const mappings=JSON.parse(read('../data/country-code-mappings.json')).supplemental.codeMappings;

test('registry contains every official non-aggregate economy exactly once',()=>{
  const rows=source[1].filter(r=>r.region.id!=='NA');
  assert.equal(source[0].total,source[1].length);assert.equal(source[0].pages,1);
  assert.ok(rows.length>200);
  assert.deepEqual(Object.values(registry.countries).map(c=>c.code).sort(),rows.map(r=>r.iso2Code).sort());
  assert.deepEqual(buildRegistry(source[1],mappings,new Date(registry.fetchedAt)),registry);
  assert.equal(Object.values(registry.countries).filter(c=>c.regionId==='NA').length,0);
});
test('statistical areas keep explicit codes, distinct map IDs and missing positions',()=>{
  const countries=registryCountries(registry);
  for(const [id,code] of [['410','KR'],['840','US'],['344','HK'],['446','MO'],['WB-CHI','JG'],['983','XK']])assert.equal(countries[id].code,code);
  assert.equal(countries['WB-CHI'].position,null);
  assert.equal(countries['WB-CHI'].flag,'');
  assert.equal(countries['344'].name,'홍콩');
  for(const c of Object.values(countries))assert.equal(c.gdp,null);
});
test('invalid and duplicate identities cannot silently overwrite countries',()=>{
  const row=source[1].find(r=>r.iso2Code==='US');
  assert.throws(()=>buildRegistry([row,row],mappings));
  assert.throws(()=>buildRegistry([{...row,region:{}}],mappings));
  const bad=structuredClone(registry);bad.countries['840'].position=[null,0];assert.throws(()=>validateRegistry(bad));
  assert.throws(()=>validateRegistry({schemaVersion:1,fetchedAt:registry.fetchedAt,countries:{}}));
});
test('expanded profiles resolve data by provider codes rather than flag rendering',()=>{
  const snapshot=JSON.parse(read('../data/country-data.json'));
  const countries=registryCountries(registry),result=buildAtlasData(snapshot,countries);
  assert.equal(Object.keys(result.profiles).length,Object.keys(countries).length);
  for(const id of ['344','446','WB-CHI','983'])assert.equal(result.profiles[id].code,countries[id].code);
  assert.ok(result.profiles['344'].stats.population.value>0);
  assert.equal(result.profiles['WB-CHI'].stats.militarySpending,null);
});
test('data failure preserves registered search targets; registry failure never displays a false count',async()=>{
  let registered=null,applied=false,failed=0;
  const w={registerAtlasCountries:c=>registered=c,getAtlasCountries:()=>registered,applyAtlasCountryData:()=>applied=true,failAtlasCountryData:()=>failed++};
  await loadAtlasData(w,async url=>({ok:url.pathname.endsWith('country-registry.json'),status:503,json:async()=>registry}));
  assert.equal(Object.keys(registered).length,217);assert.equal(applied,false);assert.equal(failed,1);
  registered=null;
  await loadAtlasData(w,async()=>({ok:true,json:async()=>({schemaVersion:0})}));
  assert.equal(registered,null);assert.equal(failed,2);
});
test('UI retains search without map boundaries and identifies reference markers',()=>{
  const html=read('../index.html');
  assert.match(html,/d.englishName,d.code,d.wbId/);
  assert.match(html,/LABEL_POS\[id\]\|\|eData\[id\].position/);
  assert.match(html,/참고 위치 \(경계 아님\)/);
  assert.match(html,/지도 경계 미제공/);
  assert.match(html,/목록 연결 실패/);
  assert.doesNotMatch(html,/100개국|const eData=\{"/);
});
