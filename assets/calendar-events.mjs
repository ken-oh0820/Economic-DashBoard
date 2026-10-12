export const CALENDAR_EVENTS_REVIEWED = '2026-10-12';
const fedCalendar = 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm';
const treasuryCalendar = 'https://home.treasury.gov/policy-issues/financing-the-government/quarterly-refunding/most-recent-quarterly-refunding-documents/';

// Official statement release dates, not meeting start dates or Treasury borrowing estimates.
export const CALENDAR_EVENTS = [
  {id:'fomc-202601',kind:'fomc',at:'2026-01-28T14:00:00-05:00',sep:false},
  {id:'fomc-202603',kind:'fomc',at:'2026-03-18T14:00:00-04:00',sep:true},
  {id:'fomc-202604',kind:'fomc',at:'2026-04-29T14:00:00-04:00',sep:false},
  {id:'fomc-202606',kind:'fomc',at:'2026-06-17T14:00:00-04:00',sep:true},
  {id:'fomc-202607',kind:'fomc',at:'2026-07-29T14:00:00-04:00',sep:false},
  {id:'fomc-202609',kind:'fomc',at:'2026-09-16T14:00:00-04:00',sep:true},
  {id:'fomc-202610',kind:'fomc',at:'2026-10-28T14:00:00-04:00',sep:false,
    timeSource:'https://www.federalreserve.gov/newsevents/2026-october.htm'},
  {id:'fomc-202612',kind:'fomc',at:'2026-12-09T14:00:00-05:00',sep:true,
    timeSource:'https://www.federalreserve.gov/newsevents/2026-december.htm'},
  {id:'qra-202602',kind:'qra',at:'2026-02-04T08:30:00-05:00',
    source:'https://home.treasury.gov/news/press-releases/sb0377'},
  {id:'qra-202605',kind:'qra',at:'2026-05-06T08:30:00-04:00',
    source:'https://home.treasury.gov/news/press-releases/sb0485'},
  {id:'qra-202608',kind:'qra',at:'2026-08-05T08:30:00-04:00',source:treasuryCalendar},
  {id:'qra-202611',kind:'qra',at:'2026-11-04T08:30:00-05:00',source:treasuryCalendar}
].map(event => ({
  title:event.kind === 'fomc' ? 'FOMC 금리 결정 발표' : 'QRA 분기 국채 발행계획 발표',
  source:fedCalendar,
  ...(event.kind === 'fomc' ? {timeSource:'https://www.federalreserve.gov/monetarypolicy/fomcpressconf20260128.htm'} : {}),
  ...event
})).sort((a,b) => Date.parse(a.at) - Date.parse(b.at));

export function eventClock(event, timeZone = 'Asia/Seoul') {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', hourCycle:'h23'
  }).formatToParts(new Date(event.at));
  const read = type => parts.find(part => part.type === type).value;
  return {date:`${read('year')}-${read('month')}-${read('day')}`, time:`${read('hour')}:${read('minute')}`};
}

export function eventsOnDate(date) {
  return CALENDAR_EVENTS.filter(event => eventClock(event).date === date);
}
