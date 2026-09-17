import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {comparisonData,calendarState,calendarGroup} from '../assets/monitor-model.mjs';
import {collectCalendar,releaseDates,RELEASE_GROUPS} from './update-official-data.mjs';
const points=rows=>rows.map(([date,v])=>({t:Date.parse(date),v}));
const a=points([['2026-01-01',100],['2026-02-01',110],['2026-03-01',120]]);
const b=points([['2026-01-01',2],['2026-02-01',3]]);

test('comparison ends at common availability and does not fabricate observations',()=>{
  const result=comparisonData(a,b,12);
  assert.equal(result.end,Date.parse('2026-02-01'));
  assert.equal(result.series[0].points.length,2);
  assert.equal(result.series[1].points[0].y,2);
  const daily=points([['2026-01-03',2],['2026-01-20',3],['2026-02-02',4],['2026-03-01',5]]);
  const mixed=comparisonData(a,daily,12);
  assert.deepEqual(mixed.series[0].points.map(p=>p.x),[Date.parse('2026-02-01'),Date.parse('2026-03-01')]);
  assert.equal(mixed.series[1].base.t,Date.parse('2026-01-03'));
});
test('relative change has independent explicit baselines and rejects nonpositive series',()=>{
  const result=comparisonData(a,b,12,'change');
  assert.ok(Math.abs(result.series[0].points[1].y-10)<1e-8);
  assert.equal(result.series[1].points[1].y,50);
  assert.match(comparisonData(a,[{t:a[0].t,v:0},{t:a[1].t,v:1}],12,'change').error,/0 또는 음수/);
  assert.match(comparisonData(a,[],12).error,/부족/);
});
test('release dates respect New York date and never imply intraday release completion',()=>{
  const now=new Date('2026-09-17T01:00:00Z');
  const group={dates:['2026-09-15','2026-09-16','2026-09-17'],status:'ok',fetchedAt:now.toISOString(),series:['CPIAUCSL']};
  const state=calendarState(group,now);
  assert.equal(state.past,'2026-09-15');assert.equal(state.today,'2026-09-16');assert.equal(state.next,'2026-09-17');
  assert.equal(state.stale,false);
  assert.equal(calendarState({...group,fetchedAt:'2020-01-01'},now).stale,true);
  assert.equal(calendarGroup({groups:[group]},'CPIAUCSL'),group);
  assert.equal(calendarGroup({groups:[]},'GDP'),null);
});
test('release collection uses official release discovery and enables future dates',async()=>{
  const calls=[];
  const result=await collectCalendar('not-a-real-key',{},async(endpoint,params)=>{
    calls.push({endpoint,params});
    return endpoint==='series/release'?{releases:[{id:1}]}:{release_dates:[{date:'2026-10-01'},{date:'2026-09-01'}]};
  },new Date('2026-09-17'));
  assert.equal(result.groups.length,5);assert.equal(calls.length,10);
  assert.ok(calls.filter(call=>call.endpoint==='release/dates').every(call=>call.params.include_release_dates_with_no_data==='true'));
  assert.equal(result.groups[0].status,'ok');
  assert.deepEqual(releaseDates([{date:'bad'},{date:'2026-10-01'},{date:'2026-10-01'}]),['2026-10-01']);
});
test('calendar failure preserves last-known dates but never labels them fresh',async()=>{
  const old={...RELEASE_GROUPS[0],dates:['2026-10-01'],fetchedAt:'2026-09-01'};
  const result=await collectCalendar('not-a-real-key',{groups:[old]},async()=>{throw Error('offline');});
  assert.equal(result.groups[0].status,'stale');assert.equal(result.groups[0].fetchedAt,old.fetchedAt);
  assert.deepEqual(result.groups[0].dates,old.dates);assert.deepEqual(result.groups[1].dates,[]);
});
test('payroll units convert thousands to ten-thousands without losing a negative sign',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const ctx=vm.createContext({OfficialData:{periodPoint:(rows,date,months)=>months===1?rows[0]:null}});
  vm.runInContext(html.match(/function calcMacroFromPoints\([^]*?^}/m)[0],ctx);
  ctx.rows=[{date:'2026-07-01',value:100000},{date:'2026-08-01',value:100162}];
  assert.equal(vm.runInContext("calcMacroFromPoints(rows,{mode:'level-change'},'test').value",ctx),'+16.2만 명');
  ctx.rows[1].value=99999;
  assert.equal(vm.runInContext("calcMacroFromPoints(rows,{mode:'level-change'},'test').value",ctx),'-0.1만 명');
});
test('monitor uses bundled chart library, no new browser data extraction, and hides ticker only outside map',async()=>{
  const code=await readFile(new URL('../assets/monitor-tools.mjs',import.meta.url),'utf8');
  const css=await readFile(new URL('../assets/workspace.css',import.meta.url),'utf8');
  assert.doesNotMatch(code,/\bfetch\s*\(|XMLHttpRequest/);
  assert.match(code,/new Chart\(/);assert.match(code,/관측 없음/);
  assert.match(css,/body:not\(\.map-mode\) \.ticker-bar\{display:none\}/);
  assert.match(css,/repeat\(6,minmax\(0,1fr\)\)/);
});
