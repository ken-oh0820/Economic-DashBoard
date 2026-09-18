import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {policyRate,policyRateMarkup} from '../assets/policy-rates.mjs';
import {SERIES} from './update-official-data.mjs';
const now=Date.parse('2026-09-18T09:00:00Z');
const group=key=>({key,items:[{date:'2026-09-18'},{date:'2026-10-22'}]});
const snapshot=(lowDate,highDate,opts={})=>({get:({series})=>({points:[{date:series==='DFEDTARL'?lowDate:highDate,value:series==='DFEDTARL'?3.75:4}],status:'ok',fetchedAt:new Date(now).toISOString(),...opts})});

test('policy rates distinguish target range, Japanese approximate target and effective monthly rate',()=>{
  assert.equal(policyRate(group('kr'),null,now).valueText,'3.00%');
  assert.equal(policyRate(group('jp'),null,now).valueText,'1.00% 내외');
  const us=policyRate(group('us'),null,now);
  assert.equal(us.valueText,'3.75–4.00%');assert.equal(us.mode,'manual');
  assert.match(us.label,/목표금리 범위/);
  assert.doesNotMatch(us.label,/월평균/);
});
test('new decisions on the calendar do not automatically confirm unchanged policy rates',()=>{
  assert.match(policyRate(group('kr'),null,now).warning,/새 결정 확인/);
  assert.equal(policyRate({key:'kr',items:[{date:'2026-10-22'}]},null,now).warning,'');
  assert.match(policyRate({key:'kr',items:[]},null,now+2*86400000).warning,/최신 여부/);
});
test('an announced Japanese rate change is not treated as effective before its start date',()=>{
  const jp=policyRate(group('jp'),null,now);
  assert.equal(jp.valueText,'1.00% 내외');
  assert.match(jp.effectiveNote,/2026-09-24부터 1.25% 내외 적용 예정/);
  assert.equal(jp.warning,'');
  assert.equal(policyRate(group('jp'),null,Date.parse('2026-09-23T14:59:59Z')).valueText,'1.00% 내외');
  assert.equal(policyRate(group('jp'),null,Date.parse('2026-09-23T15:00:00Z')).valueText,'1.25% 내외');
});
test('US bounds require matching dates and cannot regress to pre-decision observations',()=>{
  assert.equal(policyRate(group('us'),snapshot('2026-09-17','2026-09-17'),now).mode,'api');
  assert.equal(policyRate(group('us'),snapshot('2026-09-16','2026-09-17'),now).mode,'manual');
  assert.equal(policyRate(group('us'),snapshot('2026-09-16','2026-09-16'),now).mode,'manual');
  assert.equal(policyRate(group('us'),snapshot('2026-12-01','2026-12-01'),now).mode,'manual');
  const stale=policyRate({key:'us',items:[]},snapshot('2026-09-17','2026-09-17',{status:'stale'}),now);
  assert.equal(stale.delayed,true);assert.match(stale.warning,/최신 여부/);
});
test('policy summaries label manual versus API updates and include safe official source links',()=>{
  const manual=policyRateMarkup(group('jp'),null,now);
  assert.match(manual,/자동 갱신 아님/);assert.match(manual,/최근 확인값/);assert.match(manual,/noopener noreferrer/);
  const api=policyRateMarkup(group('us'),snapshot('2026-09-17','2026-09-17'),now);
  assert.match(api,/공식 API/);assert.match(api,/관측일 2026-09-17/);
  assert.equal(policyRate({key:'other',items:[]},null,now),null);
});
test('target-rate collection shares the official allowlist and never scrapes central bank pages',async()=>{
  for(const id of ['DFEDTARL','DFEDTARU'])assert.deepEqual(SERIES[id],['Federal Reserve','daily']);
  const runtime=await readFile(new URL('../assets/official-data.js',import.meta.url),'utf8');
  const ui=await readFile(new URL('../assets/policy-rates.mjs',import.meta.url),'utf8');
  assert.match(runtime,/'DFEDTARL','DFEDTARU'/);
  assert.doesNotMatch(ui,/\bfetch\s*\(|XMLHttpRequest/);
});
