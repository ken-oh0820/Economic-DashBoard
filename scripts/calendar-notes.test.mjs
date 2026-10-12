import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CALENDAR_STORAGE_KEY, readCalendar, saveCalendarDay, parseCalendar, restoreCalendar, validDate, escapeCalendarText} from '../assets/calendar-notes.mjs';

function memoryStorage() {
  const values = new Map();
  return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
}

test('calendar notes persist across reloads, edits and deletion without losing other dates', () => {
  const storage=memoryStorage();
  assert.deepEqual(readCalendar(storage).entries,{});
  saveCalendarDay(storage,'2026-10-12','실적 발표\n보고서 읽기',null);
  const original=readCalendar(storage).entries['2026-10-12'];
  assert.equal(original.text,'실적 발표\n보고서 읽기');
  saveCalendarDay(storage,'2026-10-13','회의',null);
  saveCalendarDay(storage,'2026-10-12','수정한 일정',original);
  const changed=readCalendar(storage).entries['2026-10-12'];
  assert.equal(changed.text,'수정한 일정');
  saveCalendarDay(storage,'2026-10-12','',changed);
  assert.equal(readCalendar(storage).entries['2026-10-12'],undefined);
  assert.equal(readCalendar(storage).entries['2026-10-13'].text,'회의');
});

test('calendar refuses stale overwrites and does not silently discard corrupt or blocked storage', () => {
  const storage=memoryStorage();
  saveCalendarDay(storage,'2026-10-12','다른 창에서 저장',null);
  assert.throws(()=>saveCalendarDay(storage,'2026-10-12','덮어쓰기',null),/다른 창/);
  storage.setItem(CALENDAR_STORAGE_KEY,'{corrupt');
  assert.throws(()=>saveCalendarDay(storage,'2026-10-13','새 일정',null));
  assert.equal(storage.getItem(CALENDAR_STORAGE_KEY),'{corrupt');
  assert.throws(()=>readCalendar(undefined));
  const blocked={getItem:()=>null,setItem:()=>{throw new DOMException('Full','QuotaExceededError');}};
  assert.throws(()=>saveCalendarDay(blocked,'2026-10-12','일정',null),{name:'QuotaExceededError'});
});

test('backup round-trip merges imported dates and preserves dates absent from backup', () => {
  const source=memoryStorage(), target=memoryStorage();
  saveCalendarDay(source,'2026-10-12','백업 일정',null);
  saveCalendarDay(target,'2026-10-13','기존 일정',null);
  saveCalendarDay(target,'2026-10-12','기존 겹치는 일정',null);
  const imported=parseCalendar(JSON.stringify(readCalendar(source)));
  restoreCalendar(target,imported);
  assert.equal(readCalendar(target).entries['2026-10-12'].text,'백업 일정');
  assert.equal(readCalendar(target).entries['2026-10-13'].text,'기존 일정');
});

test('invalid dates, oversized notes and unsafe imported shapes are rejected', () => {
  assert.equal(validDate('2028-02-29'),true);
  for(const date of ['2026-02-29','2026-13-01','1899-12-31','__proto__'])assert.equal(validDate(date),false);
  const entry={text:'test',updatedAt:new Date().toISOString()};
  for(const data of [{schemaVersion:2,entries:{}},{schemaVersion:1,entries:[]},{schemaVersion:1,entries:{'2026-02-29':entry}},{schemaVersion:1,entries:{'2026-10-12':{...entry,text:'a'.repeat(10001)}}}])assert.throws(()=>parseCalendar(JSON.stringify(data)));
  assert.throws(()=>parseCalendar('{"schemaVersion":1,"entries":{"__proto__":{"text":"x","updatedAt":"2026-01-01"}}}'));
  assert.equal(escapeCalendarText('<img src=x onerror="alert(1)"> &'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp;');
});

test('calendar editor has save controls, safe preview, local-only backup and unsaved-change protection', async () => {
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const code=await readFile(new URL('../assets/investment-calendar.mjs',import.meta.url),'utf8');
  assert.match(html,/<dialog id="investmentCalendarEditor"/);
  assert.match(html,/textarea id="calendarNoteText" maxlength="10000"/);
  assert.match(code,/escapeCalendarText\(text\)/);
  assert.match(code,/dialog\.addEventListener\('cancel'/);
  assert.match(code,/beforeunload/);
  assert.match(code,/originalEntry/);
  assert.match(code,/URL\.createObjectURL/);
  assert.doesNotMatch(code,/\bfetch\s*\(|XMLHttpRequest/);
});
