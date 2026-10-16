import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CALENDAR_EVENTS, CALENDAR_EVENTS_REVIEWED, eventClock, eventsOnDate, eventsInYear, eventTimeLabel} from '../assets/calendar-events.mjs';
import {readCalendar, saveCalendarDay} from '../assets/calendar-notes.mjs';

test('2026 calendar contains official US, Korean and Japanese policy events', () => {
  const events=eventsInYear(2026);
  assert.equal(events.length,28);
  assert.equal(new Set(CALENDAR_EVENTS.map(event=>event.id)).size,CALENDAR_EVENTS.length);
  assert.equal(events.filter(event=>event.kind==='fomc').length,8);
  assert.equal(events.filter(event=>event.kind==='qra').length,4);
  assert.equal(events.filter(event=>event.sep).length,4);
  assert.equal(CALENDAR_EVENTS_REVIEWED,'2026-10-17');
  for(const event of CALENDAR_EVENTS)assert.ok(['www.federalreserve.gov','home.treasury.gov','www.bok.or.kr','www.boj.or.jp'].includes(new URL(event.source).hostname));
});

test('FOMC is on the following Korean date with daylight-saving adjustments', () => {
  const events=eventsInYear(2026).filter(event=>event.kind==='fomc');
  assert.deepEqual(events.map(event=>eventClock(event)),[
    {date:'2026-01-29',time:'04:00'}, {date:'2026-03-19',time:'03:00'},
    {date:'2026-04-30',time:'03:00'}, {date:'2026-06-18',time:'03:00'},
    {date:'2026-07-30',time:'03:00'}, {date:'2026-09-17',time:'03:00'},
    {date:'2026-10-29',time:'03:00'}, {date:'2026-12-10',time:'04:00'}
  ]);
  for(const event of events)assert.equal(eventClock(event,'America/New_York').time,'14:00');
  assert.equal(eventsOnDate('2026-10-28').length,0);
  assert.equal(eventsOnDate('2026-10-29')[0].id,'fomc-202610');
});

test('2027 FOMC retains eight Fed-published tentative meetings with estimated release times', () => {
  const events=eventsInYear(2027).filter(event=>event.kind==='fomc');
  assert.equal(events.length,8);
  assert.equal(events.filter(event=>event.sep).length,4);
  assert.equal(eventsInYear(2028).length,0);
  assert.deepEqual(events.map(event=>event.meetingStart),['2027-01-26','2027-03-16','2027-04-27','2027-06-08','2027-07-27','2027-09-14','2027-10-26','2027-12-07']);
  assert.deepEqual(events.map(event=>eventClock(event)),[
    {date:'2027-01-28',time:'04:00'}, {date:'2027-03-18',time:'03:00'},
    {date:'2027-04-29',time:'03:00'}, {date:'2027-06-10',time:'03:00'},
    {date:'2027-07-29',time:'03:00'}, {date:'2027-09-16',time:'03:00'},
    {date:'2027-10-28',time:'03:00'}, {date:'2027-12-09',time:'04:00'}
  ]);
  for(const event of events){
    assert.equal(event.kind,'fomc');
    assert.equal(event.tentative,true);
    assert.equal(event.timeEstimated,true);
    assert.match(eventTimeLabel(event),/ 예상$/);
    assert.equal(eventClock(event,'America/New_York').time,'14:00');
  }
  for(const event of eventsInYear(2026))assert.doesNotMatch(eventTimeLabel(event),/예상/);
});

test('Korea uses eight 2026 policy meetings, not financial stability or minutes dates',()=>{
  const events=CALENDAR_EVENTS.filter(event=>event.kind==='bok');
  assert.deepEqual(events.map(event=>event.date),['2026-01-15','2026-02-26','2026-04-10','2026-05-28','2026-07-16','2026-08-27','2026-10-22','2026-11-26']);
  assert.equal(eventsInYear(2027).filter(event=>event.kind==='bok').length,0);
  for(const event of events){
    assert.equal(event.at,undefined);
    assert.deepEqual(eventClock(event),{date:event.date,time:null});
    assert.equal(eventTimeLabel(event),'시각 미정');
  }
  assert.equal(eventsOnDate('2026-07-09').length,0);
});

test('Japan shows the meeting end date without fabricated noon release timestamps',()=>{
  const events=CALENDAR_EVENTS.filter(event=>event.kind==='boj');
  assert.deepEqual(events.filter(event=>event.date.startsWith('2026')).map(event=>event.date),['2026-01-23','2026-03-19','2026-04-28','2026-06-16','2026-07-31','2026-09-18','2026-10-30','2026-12-18']);
  assert.deepEqual(events.filter(event=>event.date.startsWith('2027')).map(event=>event.date),['2027-01-22','2027-03-18','2027-04-28','2027-06-11','2027-07-22','2027-09-22','2027-10-29','2027-12-17']);
  for(const event of events){
    assert.ok(event.meetingStart<event.date);
    assert.equal(event.at,undefined);
    assert.equal(eventClock(event).time,null);
    assert.match(eventTimeLabel(event),/終了|종료 후/);
    assert.doesNotMatch(eventTimeLabel(event),/12:00|00:00|예상/);
  }
  assert.deepEqual(eventsOnDate('2026-03-19').map(event=>event.kind),['fomc','boj']);
});

test('QRA dates refer to 08:30 ET issuance details, not Monday borrowing estimates', () => {
  const events=CALENDAR_EVENTS.filter(event=>event.kind==='qra');
  assert.deepEqual(events.map(event=>eventClock(event)),[
    {date:'2026-02-04',time:'22:30'}, {date:'2026-05-06',time:'21:30'},
    {date:'2026-08-05',time:'21:30'}, {date:'2026-11-04',time:'22:30'}
  ]);
  for(const event of events)assert.equal(eventClock(event,'America/New_York').time,'08:30');
  assert.equal(eventsOnDate('2026-11-02').length,0);
});

test('official events coexist with editable personal notes and do not disappear when a note is deleted', () => {
  let raw=null;
  const storage={getItem:()=>raw,setItem:(_,value)=>{raw=value;}};
  saveCalendarDay(storage,'2026-10-29','FOMC 확인 후 메모',null);
  const entry=readCalendar(storage).entries['2026-10-29'];
  assert.equal(eventsOnDate('2026-10-29').length,1);
  saveCalendarDay(storage,'2026-10-29','',entry);
  assert.equal(eventsOnDate('2026-10-29').length,1);
  assert.deepEqual(readCalendar(storage).entries,{});
});

test('calendar exposes official sources separately from personal storage without network collection', async () => {
  const code=await readFile(new URL('../assets/investment-calendar.mjs',import.meta.url),'utf8');
  const events=await readFile(new URL('../assets/calendar-events.mjs',import.meta.url),'utf8');
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/id="calendarOfficialDetails"/);
  assert.match(code,/America\/New_York/);
  assert.match(code,/공식 일정만 표시합니다/);
  assert.match(code,/공식 \$\{officialCount\}건 · 개인/);
  assert.doesNotMatch(events,/localStorage|setItem|\bfetch\s*\(/);
});
