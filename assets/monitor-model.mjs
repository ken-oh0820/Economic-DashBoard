export function calendarGroup(calendar,series){
  return calendar?.groups?.find(group=>group.series.includes(series))||null;
}
export function calendarState(group,now=new Date()){
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const dates=[...new Set(group?.dates||[])].sort();
  return {past:dates.filter(date=>date<today).at(-1)||null,today:dates.includes(today)?today:null,
    next:dates.find(date=>date>today)||null,stale:!group||group.status!=='ok'||!Number.isFinite(Date.parse(group.fetchedAt))||now-Date.parse(group.fetchedAt)>86400000};
}
export function comparisonData(first,second,months,mode='level'){
  const input=[first,second].map(points=>points.filter(p=>Number.isFinite(p.t)&&Number.isFinite(p.v)).sort((a,b)=>a.t-b.t));
  if(input.some(points=>points.length<2))return {error:'비교에 필요한 관측값이 부족합니다.'};
  const end=Math.min(...input.map(points=>points.at(-1).t));
  const cutoff=new Date(end);cutoff.setUTCMonth(cutoff.getUTCMonth()-months);
  const start=Math.max(cutoff.getTime(),...input.map(points=>points[0].t));
  const shared=input.map(points=>points.filter(p=>p.t>=start&&p.t<=end));
  if(shared.some(points=>points.length<2))return {error:'공통 기간의 관측값이 부족합니다. 기간을 늘려주세요.'};
  if(mode==='change'&&shared.some(points=>points.some(p=>p.v<=0)))return {error:'0 또는 음수가 포함된 지표는 변화율 비교가 왜곡될 수 있습니다. 원 단위 비교를 선택하세요.'};
  return {start,end,series:shared.map(points=>({base:points[0],points:points.map(p=>({x:p.t,y:mode==='change'?(p.v/points[0].v-1)*100:p.v}))}))};
}
