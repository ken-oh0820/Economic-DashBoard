import {timestampLabel} from './workspace-model.mjs?v=20260917-five-menus';

// Decision facts checked against the linked central-bank releases, not market-rate proxies.
export const VERIFIED_POLICY_RATES={
  kr:{label:'한국은행 기준금리',value:3,decisionDate:'2026-08-27',decisionKstDate:'2026-08-27',checkedAt:'2026-09-17T23:32:42Z',source:'한국은행',url:'https://www.bok.or.kr/portal/singl/baseRate/progress.do?dataSeCd=01&menuNo=200656'},
  us:{label:'연방기금 목표금리 범위',lower:3.75,upper:4,decisionDate:'2026-09-16',decisionKstDate:'2026-09-17',effectiveDate:'2026-09-17',checkedAt:'2026-09-17T23:32:42Z',source:'Federal Reserve',url:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a1.htm'},
  jp:{label:'무담보 익일물 콜금리 목표',value:1,approximate:true,decisionDate:'2026-07-31',decisionKstDate:'2026-07-31',checkedAt:'2026-09-17T23:32:42Z',source:'일본은행',url:'https://www.boj.or.jp/en/mopo/mpmdeci/mpr_2026/k260731a.pdf'}
};
export function policyRate(group,official,now=Date.now()){
  const verified=VERIFIED_POLICY_RATES[group.key];if(!verified)return null;
  let rate={...verified,mode:'manual',referenceDate:verified.decisionKstDate,dateLabel:'결정일 '+verified.decisionDate+' (현지)',delayed:false};
  if(group.key==='us'){
    const lower=official?.get({series:'DFEDTARL'}),upper=official?.get({series:'DFEDTARU'});
    const low=lower?.points?.at(-1),high=upper?.points?.at(-1);
    // Never combine bounds from different observation dates or regress to a pre-decision range.
    if(low&&high&&low.date===high.date&&low.date>=verified.effectiveDate&&Date.parse(low.date)<=now&&Number.isFinite(low.value)&&Number.isFinite(high.value)&&low.value<=high.value){
      const timestamps=[lower.fetchedAt,upper.fetchedAt].map(Date.parse);
      const checked=Math.min(...timestamps);
      rate={...rate,lower:low.value,upper:high.value,mode:'api',referenceDate:low.date,dateLabel:'관측일 '+low.date+' (미국)',checkedAt:Number.isFinite(checked)?new Date(checked).toISOString():null,
        source:'Federal Reserve / FRED',url:'https://fred.stlouisfed.org/series/DFEDTARU',
        delayed:lower.status!=='ok'||upper.status!=='ok'||!Number.isFinite(checked)||now-checked>86400000};
    }
  }
  const today=new Date(now+9*3600000).toISOString().slice(0,10);
  const unconfirmed=group.items.some(item=>item.date>rate.referenceDate&&item.date<=today);
  const checked=Date.parse(rate.checkedAt);
  rate.delayed=rate.delayed||!Number.isFinite(checked)||now-checked>86400000;
  rate.warning=unconfirmed?'발표일 도래 · 새 결정 확인 필요':rate.delayed?'최신 여부 확인 필요':'';
  rate.valueText=rate.lower!==undefined?rate.lower.toFixed(2)+'–'+rate.upper.toFixed(2)+'%':rate.value.toFixed(2)+'%'+(rate.approximate?' 내외':'');
  return rate;
}
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function policyRateMarkup(group,official,now=Date.now()){
  const rate=policyRate(group,official,now);if(!rate)return '<p>기준금리 확인 불가</p>';
  return '<div class="policy-rate'+(rate.warning?' needs-review':'')+'"><span class="policy-rate-label">'+escape(rate.label)+'</span><strong class="policy-rate-value">'+escape(rate.valueText)+'</strong><span class="policy-rate-basis">최근 확인값 · '+escape(rate.dateLabel)+'</span>'+
    '<span class="policy-rate-check">'+(rate.mode==='api'?'수집 ':'원문 확인 ')+escape(timestampLabel(rate.checkedAt))+'</span><span class="policy-rate-method">'+(rate.mode==='api'?'공식 API · 3시간마다 갱신 확인':'공식 발표 수동 반영 · 자동 갱신 아님')+'</span>'+
    (rate.warning?'<span class="policy-rate-warning">'+escape(rate.warning)+'</span>':'')+
    '<a href="'+escape(rate.url)+'" target="_blank" rel="noopener noreferrer">'+escape(rate.source)+' 금리 원문 ↗</a></div>';
}
export function initPolicyRates({groups,official}){
  window.PolicyRates={markup:(group,now)=>policyRateMarkup(group,official,now)};
  const refresh=()=>document.querySelectorAll('[data-policy-country]').forEach(host=>{
    const group=groups.find(item=>item.key===host.dataset.policyCountry);if(!group)return;
    const html=policyRateMarkup(group,official);
    if(host.innerHTML!==html)host.innerHTML=html;
  });
  window.addEventListener('market-data-rendered',refresh);
  window.addEventListener('app-view-change',refresh);
  // Refresh only the rate summary; leave expanded schedules and focused links in place.
  setInterval(()=>{if(document.body.classList.contains('dashboard-mode'))refresh();},60000);
  refresh();
}
