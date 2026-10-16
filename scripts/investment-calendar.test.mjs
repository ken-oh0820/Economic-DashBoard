import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {koreaDate, monthDays, moveMonth, MIN_YEAR, MAX_YEAR} from '../assets/investment-calendar.mjs';

test('calendar uses the Korean date across midnight and year boundaries', () => {
  assert.deepEqual(koreaDate(new Date('2026-12-31T14:59:59Z')), {year:2026, month:12, day:31});
  assert.deepEqual(koreaDate(new Date('2026-12-31T15:00:00Z')), {year:2027, month:1, day:1});
});

test('month navigation crosses years and respects selectable bounds', () => {
  assert.deepEqual(moveMonth(2026,12,1), {year:2027,month:1});
  assert.deepEqual(moveMonth(2026,1,-1), {year:2025,month:12});
  assert.deepEqual(moveMonth(MIN_YEAR,1,-1), {year:MIN_YEAR,month:1});
  assert.deepEqual(moveMonth(MAX_YEAR,12,1), {year:MAX_YEAR,month:12});
});

test('each month has a continuous Sunday-first six-week grid, including leap years', () => {
  for (const year of [1900,2000,2026,2028,2100]) {
    for (let month=1;month<=12;month++) {
      const days=monthDays(year,month);
      assert.equal(days.length,42);
      assert.equal(new Set(days.map(day=>day.iso)).size,42);
      assert.equal(new Date(days[0].iso).getUTCDay(),0);
      assert.equal(new Date(days[41].iso).getUTCDay(),6);
      assert.equal(days.filter(day=>day.inMonth).length,new Date(Date.UTC(year,month,0)).getUTCDate());
      for(let i=1;i<42;i++)assert.equal(Date.parse(days[i].iso)-Date.parse(days[i-1].iso),86400000);
    }
  }
  assert.equal(monthDays(2028,2).filter(day=>day.inMonth).length,29);
  assert.equal(monthDays(2100,2).filter(day=>day.inMonth).length,28);
});

test('investment calendar defaults to calendar while preserving all research destinations', async () => {
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const calendar=await readFile(new URL('../assets/investment-calendar.mjs',import.meta.url),'utf8');
  const css=await readFile(new URL('../assets/investment-calendar.css',import.meta.url),'utf8');
  assert.match(html,/aria-label="투자 관련 일정 및 사이트"/);
  assert.match(html,/data-view="sites" onclick="switchView\('sites'\)" aria-label="투자 관련 일정 및 사이트"/);
  assert.match(html,/id="investmentCalendarTab" role="tab" aria-selected="true"/);
  assert.match(html,/id="investmentLinksPanel"[^>]* hidden>/);
  const links=html.slice(html.indexOf('<section id="investmentLinksPanel"'),html.indexOf('<div class="us-guide-dashboard"'));
  for(const url of ['https://whalewisdom.com/','https://www.earningswhispers.com/','http://openinsider.com/','https://www.valley.town/','https://www.reuters.com/markets/'])assert.ok(links.includes(url));
  assert.match(calendar,/item\.tabIndex = selected \? 0 : -1/);
  for(const key of ['ArrowLeft','ArrowRight','Home','End'])assert.ok(calendar.includes(key));
  assert.doesNotMatch(calendar,/\bfetch\s*\(|XMLHttpRequest/);
  assert.match(css,/\[hidden\]\{display:none!important\}/);
  assert.match(css,/table-layout:fixed/);
});
