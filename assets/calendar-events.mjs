export const CALENDAR_EVENTS_REVIEWED = '2026-10-17';
const fedCalendar = 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm';
const treasuryCalendar = 'https://home.treasury.gov/policy-issues/financing-the-government/quarterly-refunding/most-recent-quarterly-refunding-documents/';
const bokCalendar = 'https://www.bok.or.kr/portal/singl/crncyPolicyDrcMtg/listYear.do?menuNo=200755&mtgSe=A';
const bojCalendar = 'https://www.boj.or.jp/en/mopo/mpmsche_minu/index.htm';
export const EVENT_LABELS = {fomc:'FOMC',qra:'QRA',bok:'한국 금리',boj:'일본 금리'};

// Date-only events do not invent a release timestamp. Japan and Korea share UTC+9.
const asianDecisions = [
  ...['2026-01-15','2026-02-26','2026-04-10','2026-05-28','2026-07-16','2026-08-27','2026-10-22','2026-11-26'].map(date=>({
    id:'bok-'+date.replaceAll('-',''),kind:'bok',date,title:'한국은행 기준금리 결정',source:bokCalendar
  })),
  ...[
    ['2026-01-22','2026-01-23'],['2026-03-18','2026-03-19'],['2026-04-27','2026-04-28'],['2026-06-15','2026-06-16'],
    ['2026-07-30','2026-07-31'],['2026-09-17','2026-09-18'],['2026-10-29','2026-10-30'],['2026-12-17','2026-12-18'],
    ['2027-01-21','2027-01-22'],['2027-03-17','2027-03-18'],['2027-04-27','2027-04-28'],['2027-06-10','2027-06-11'],
    ['2027-07-21','2027-07-22'],['2027-09-21','2027-09-22'],['2027-10-28','2027-10-29'],['2027-12-16','2027-12-17']
  ].map(([meetingStart,date])=>({id:'boj-'+date.replaceAll('-',''),kind:'boj',date,meetingStart,title:'일본은행 정책금리 결정',source:bojCalendar}))
];

// 2027 dates are Fed-published tentative meetings; their 14:00 ET release times are estimates.
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
  {id:'qra-202611',kind:'qra',at:'2026-11-04T08:30:00-05:00',source:treasuryCalendar},
  {id:'fomc-202701',kind:'fomc',meetingStart:'2027-01-26',at:'2027-01-27T14:00:00-05:00',sep:false,tentative:true,timeEstimated:true},
  {id:'fomc-202703',kind:'fomc',meetingStart:'2027-03-16',at:'2027-03-17T14:00:00-04:00',sep:true,tentative:true,timeEstimated:true},
  {id:'fomc-202704',kind:'fomc',meetingStart:'2027-04-27',at:'2027-04-28T14:00:00-04:00',sep:false,tentative:true,timeEstimated:true},
  {id:'fomc-202706',kind:'fomc',meetingStart:'2027-06-08',at:'2027-06-09T14:00:00-04:00',sep:true,tentative:true,timeEstimated:true},
  {id:'fomc-202707',kind:'fomc',meetingStart:'2027-07-27',at:'2027-07-28T14:00:00-04:00',sep:false,tentative:true,timeEstimated:true},
  {id:'fomc-202709',kind:'fomc',meetingStart:'2027-09-14',at:'2027-09-15T14:00:00-04:00',sep:true,tentative:true,timeEstimated:true},
  {id:'fomc-202710',kind:'fomc',meetingStart:'2027-10-26',at:'2027-10-27T14:00:00-04:00',sep:false,tentative:true,timeEstimated:true},
  {id:'fomc-202712',kind:'fomc',meetingStart:'2027-12-07',at:'2027-12-08T14:00:00-05:00',sep:true,tentative:true,timeEstimated:true}
].map(event => ({
  title:event.kind === 'fomc' ? 'FOMC 금리 결정 발표' : 'QRA 분기 국채 발행계획 발표',
  source:fedCalendar,
  ...(event.kind === 'fomc' ? {timeSource:'https://www.federalreserve.gov/monetarypolicy/fomcpressconf20260128.htm'} : {}),
  ...event
})).concat(asianDecisions).sort((a,b) => eventClock(a).date.localeCompare(eventClock(b).date));

export function eventClock(event, timeZone = 'Asia/Seoul') {
  if(event.date)return {date:event.date,time:null};
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

export function eventsInYear(year) {
  return CALENDAR_EVENTS.filter(event => eventClock(event).date.startsWith(`${year}-`));
}

export function eventTimeLabel(event) {
  if(event.date)return event.kind==='boj'?'종료 후 · 시각 미정':'시각 미정';
  return eventClock(event).time + (event.timeEstimated ? ' 예상' : '');
}
