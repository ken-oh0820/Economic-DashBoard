import {SERIES,sourceUrl,seriesKeys,stale} from './country-data.mjs?v=20260922-security1';
import {INDUSTRY_GROUPS,INDUSTRY_KEYS,INDUSTRY_INFO,industryScale} from './country-industry.mjs?v=20260922-security1';
import {RESOURCE_GROUPS,RESOURCE_KEYS,RESOURCE_INFO,resourceValue,resourceAge} from './country-resources.mjs?v=20260922-security1';
import {SECURITY_KEYS,SECURITY_INFO,securityValue,securityChange,DIPLOMACY,MEMBERSHIP_CHECKED,membershipLabel} from './country-security.mjs?v=20260922-security1';
export const TABS = [['economy','경제'],['population','인구'],['industry','산업·경쟁력'],['resources','자원·지리'],['security','군사·외교']];
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = value => typeof value === 'number' && Number.isFinite(value);
const format = value => new Intl.NumberFormat('ko-KR',{maximumFractionDigits:1}).format(value);
export function populationLabel(millions) {
  if (!number(millions) || millions < 0) return '자료 없음';
  return millions >= 100 ? `${format(millions / 100)}억 명` : `${format(millions * 100)}만 명`;
}
const e = escapeHtml;
const pct = value => number(value) ? `${format(value)}%` : '자료 없음';
const link = (url,label) => `<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)}<i data-lucide="external-link" aria-hidden="true"></i></a>`;
const section = (title,body) => `<section class="country-section"><h3>${e(title)}</h3>${body}</section>`;
const rows = entries => `<dl class="country-facts">${entries.map(([label,value,note]) => `<div><dt>${e(label)}${note?`<small>${e(note)}</small>`:''}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>`;
const list = items => `<ul class="country-list">${items.map(item=>`<li>${e(item)}</li>`).join('')}</ul>`;
const unavailable = text => `<p class="country-empty">${e(text)}</p>`;
const yearLabel = (c,key) => c.stats?.[key] ? `${c.stats[key].year}년 · 연간` : '자료 없음';
export function collectionDate(value) {
  const date=new Date(value);
  if(!value||!Number.isFinite(date.getTime()))return '없음';
  return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
function sourceMarkup(c,key) {
  if(!c.official) return '';
  return seriesKeys(key).map(k=>{
    const s=c.official.series[k];
    const stamp=collectionDate(s?.fetchedAt);
    return `<div class="country-source-line">${link(sourceUrl(k,c.code),`World Bank · ${SERIES[k][1]}`)}<small>${stale(c.official,k)?'갱신 지연 · 저장 자료':'수집 확인'} ${e(stamp)} (한국 시간) · 원본 DB 갱신 ${e(s?.providerUpdatedAt||'미제공')}</small></div>`;
  }).join('');
}
function officialRows(c,keys) {
  return `<dl class="country-facts country-official-facts">${keys.map(key=>{
    const stat=c.stats?.[key], definition=key==='trade'?'상품·서비스 수출 + 수입 (동일 연도)':SERIES[key][1];
    let value='자료 없음';
    if(stat) value=key==='population'?populationLabel(stat.value/1e6):['gdp','trade','gni','exports','imports','gdpPc','gniPc'].includes(key)?c.money[key]:`${new Intl.NumberFormat('ko-KR',{maximumFractionDigits:2}).format(stat.value)}${SERIES[key]?.[2]==='%'?'%':'명/여성'}`;
    return `<div><dt>${e(definition)}<small>${yearLabel(c,key)}</small></dt><dd>${e(value)}</dd><div class="country-fact-source">${sourceMarkup(c,key)}</div></div>`;
  }).join('')}</dl>`;
}
function attribution(c,keys) {
  if(!c.official) return '';
  const organizations=[...new Set(keys.flatMap(seriesKeys).map(k=>c.official.series[k]?.sourceOrganization).filter(Boolean))];
  return `<details class="country-attribution"><summary>원자료 제공기관·이용 조건</summary>${organizations.map(s=>`<p>${e(s)}</p>`).join('')}<p>World Bank WDI · ${link('https://creativecommons.org/licenses/by/4.0/','CC BY 4.0')} · ${link('https://data.worldbank.org/summary-terms-of-use','World Bank 이용 조건')}</p><p>단위 환산·반올림·한국어 표기 및 동일 연도 수출입 합계는 이 사이트에서 가공했습니다. World Bank의 보증 또는 승인을 뜻하지 않습니다.</p></details>`;
}

export function summaryMarkup(c) {
  return `<div class="country-summary">
    <div><span>GDP</span><strong>${e(c.money.gdp)}</strong><small>${yearLabel(c,'gdp')}</small></div>
    <div><span>등록 국가 내 GDP 순위</span><strong>${c.rank ? `${c.rank}위` : '자료 없음'}</strong><small>${c.rankYear?`${c.rankYear}년 · `:''}${c.count}개국 비교</small></div>
    <div><span>총인구</span><strong>${populationLabel(c.extra?.pop)}</strong><small>${yearLabel(c,'population')}</small></div>
    <div><span>1인당 GNI</span><strong>${e(c.money.gniPc)}</strong><small>${yearLabel(c,'gniPc')} · Atlas 방식</small></div>
    <div><span>실업률 · ILO 추정</span><strong>${pct(c.unemployment)}</strong><small>${yearLabel(c,'unemployment')}</small></div>
    <div><span>소비자물가 상승률</span><strong>${pct(c.inflation)}</strong><small>${yearLabel(c,'inflation')}</small></div>
  </div>`;
}

export function industryMarkup(c) {
  const metrics=c.industryMetrics||{},available=INDUSTRY_KEYS.filter(k=>metrics[k]?.current).length;
  const sections=INDUSTRY_GROUPS.map(group=>section(group.title,
    `<p class="country-note">${e(group.note)}</p><div class="industry-metrics">${group.keys.map(key=>{
      const info=INDUSTRY_INFO[key],m=metrics[key]||{},current=m.current,value=current?.value,scale=industryScale(key,value);
      const roundedChange=number(m.change)?Math.round(m.change*10)/10:null;
      const change=number(roundedChange)?`${roundedChange>0?'+':''}${format(roundedChange===0?0:roundedChange)}%p`:'동일 기준 연도 자료 없음';
      const peerText=number(m.median)?`${pct(m.median)} · ${m.count}/${m.total}개국`:`비교 자료 부족 · ${m.count||0}개국`;
      return `<details class="industry-metric industry-${info.color}" data-industry-key="${key}">
        <summary><span class="industry-metric-name">${e(SERIES[key][1])}<small>${e(info.basis)} · ${current?`${current.year}년`:'자료 없음'}</small></span><strong>${pct(value)}</strong><i data-lucide="chevron-down" aria-hidden="true"></i>
        ${current?`<span class="industry-track" aria-hidden="true"><span style="width:${scale.width.toFixed(2)}%"></span></span><span class="industry-scale" aria-hidden="true">0–${scale.max}%</span>`:''}</summary>
        <div class="industry-reading"><p>${e(info.meaning)}</p>${rows([
          [`3년 전 대비${current?` (${m.baselineYear} → ${current.year})`:''}`,change,'비중 차이 · %p'],
          [`${current?current.year+'년 ':''}등록국 중앙값`,peerText,'국가별 동일 가중 · 경쟁력 순위 아님']
        ])}<p class="country-note">${e(info.caution)}</p>${sourceMarkup(c,key)}</div></details>`;
    }).join('')}</div>`)).join('');
  return `<p class="industry-status">연간 산업 지표 <strong>${available}/${INDUSTRY_KEYS.length}</strong> · 항목별 기준 연도 상이</p>`+sections+
    section('세부 산업·상품 순위',`<p>상품 수출 TOP 10은 서비스업·내수 산업을 포함한 경쟁력 순위와 다릅니다. 현재 세부 품목 순위는 연결하지 않았으며 원문에서 확인할 수 있습니다.</p><div class="country-sources">${link('https://comtradeplus.un.org/','UN Comtrade 품목별 수출 원문')}</div>`)+
    `<details class="industry-legacy"><summary>기존 산업·기술 메모 <small>미검증 · 경쟁력 순위 아님</small></summary>${section('주요 산업',c.industries.length?list(c.industries):unavailable('등록된 산업 정보가 없습니다.'))}${section('관련 기술·분야',c.technologies.length?list(c.technologies):unavailable('등록된 기술 정보가 없습니다.'))}</details>`+
    attribution(c,INDUSTRY_KEYS);
}

export function resourcesMarkup(c) {
  const available=RESOURCE_KEYS.filter(key=>number(c.stats?.[key]?.value)).length;
  return `<p class="industry-status">자원·지리 통계 <strong>${available}/${RESOURCE_KEYS.length}</strong> · 항목별 기준 연도 상이</p>`+
    RESOURCE_GROUPS.map(group=>section(group.title,`<p class="country-note">${e(group.note)}</p>`+group.keys.map(key=>{
      const stat=c.stats?.[key],info=RESOURCE_INFO[key],age=resourceAge(stat?.year);
      return `<details class="industry-metric resource-metric industry-${info.color}" data-resource-key="${key}"><summary><span class="industry-metric-name">${e(SERIES[key][1])}<small>${e(info.basis)} · ${stat?`${e(stat.year)}년`:'자료 없음'}${age?`<span class="resource-age">${e(age)}</span>`:''}</small></span><strong>${e(resourceValue(key,stat?.value))}</strong><i data-lucide="chevron-down" aria-hidden="true"></i></summary><div class="industry-reading"><p>${e(info.meaning)}</p><p class="country-note">${e(info.caution)}</p>${sourceMarkup(c,key)}</div></details>`;
    }).join(''))).join('')+
    section('매장량·채굴 가능성',`<p>생산량·수출량·자원량·매장량은 서로 다릅니다. 경제성·품위·기술·인허가를 확인하지 않은 채굴 가능량은 표시하지 않습니다.</p><div class="country-sources">${link('https://www.usgs.gov/programs/mineral-resources-program/mineral-resources-data','USGS 광물 자료')}${link('https://www.eia.gov/international/','EIA 국가별 에너지 자료')}</div>`)+
    section('항만·해협·지형',`<p class="country-empty">국가별 항만·해협·지형 설명은 검증된 자료 연결 전입니다. 육지 면적과 자원 통계만으로 물류 경쟁력이나 해상 접근성을 판단하지 않습니다.</p>`)+
    `<details class="industry-legacy"><summary>기존 지도 자원 메모 <small>미검증 · 매장량 또는 채굴 가능성 아님</small></summary>${c.resources?.length?`<ul class="country-resource-list">${c.resources.map(r=>`<li><strong>${e(r.label)}</strong><small>${e(r.note)}</small></li>`).join('')}</ul>`:unavailable('현재 목록에 등록된 항목이 없습니다. 자원이 없다는 의미는 아닙니다.')}<p class="country-note">일부 생산·수출 국가를 분류한 기존 참고자료입니다. 현재의 생산 순위나 확인된 매장량으로 사용하지 않습니다.</p></details>`+
    attribution(c,RESOURCE_KEYS);
}

export function securityMarkup(c) {
  const available=SECURITY_KEYS.filter(key=>number(c.stats?.[key]?.value)).length;
  return `<p class="industry-status">군사 통계 <strong>${available}/${SECURITY_KEYS.length}</strong> · 항목별 기준 연도 상이</p>`+
    section('군사 지출과 인력',`<p class="country-note">군사력 종합 순위는 표시하지 않습니다. 지출·인력은 투입 자원이며 실제 전투력과 다릅니다. 국방비 총액은 상단 통화 설정과 관계없이 명목 USD 기준입니다.</p>`+SECURITY_KEYS.map(key=>{
      const stat=c.stats?.[key],info=SECURITY_INFO[key],age=resourceAge(stat?.year),change=securityChange(c.official,key,c.code);
      const delta=change?Math.round(change.value*100)/100:null;
      const comparison=change?`${delta>0?'+':''}${new Intl.NumberFormat('ko-KR',{maximumFractionDigits:2}).format(delta===0?0:delta)}${change.unit}`:'수집 범위 내 전년 자료 없음';
      return `<details class="industry-metric resource-metric industry-${info.color}" data-security-key="${key}"><summary><span class="industry-metric-name">${e(SERIES[key][1])}<small>${e(info.basis)} · ${stat?`${e(stat.year)}년`:'자료 없음'}${age?`<span class="resource-age">${e(age)}</span>`:''}</small></span><strong>${e(securityValue(key,stat?.value))}</strong><i data-lucide="chevron-down" aria-hidden="true"></i></summary><div class="industry-reading"><p>${e(info.meaning)}</p>${rows([[change?`전년 대비 (${change.from} → ${change.to})`:'전년 대비',comparison,SERIES[key][2]==='%'?'비중 차이 · %p':'증감률 · %']])}<p class="country-note">${e(info.caution)}</p>${sourceMarkup(c,key)}</div></details>`;
    }).join(''))+
    section('국제 협의체·동맹',`<p class="country-note">NATO·G7 회원 목록 수동 확인: ${MEMBERSHIP_CHECKED}. 자동 갱신이 아니며, 아래 3개 항목은 모든 외교 관계를 포괄하지 않습니다.</p>`+DIPLOMACY.map(group=>`<details class="industry-metric resource-metric industry-blue"><summary><span class="industry-metric-name">${e(group.name)}<small>${e(group.type)}</small></span><strong>${e(membershipLabel(group,c.code))}</strong><i data-lucide="chevron-down" aria-hidden="true"></i></summary><div class="industry-reading"><p>${e(group.note)}</p><div class="country-sources">${link(group.url,`${group.name} 공식 안내`)}</div></div></details>`).join(''))+
    section('경제와 함께 읽기',list(['국방비 총액과 GDP·정부지출 대비 비중을 함께 봅니다. 지출 증가가 성장 때문인지, 재정 우선순위 변화 때문인지 구분합니다.','장비 조달·연구개발·운영비의 구성과 국내 생산 비중은 별도 확인이 필요합니다. 국방비 총액만으로 특정 방산 기업의 매출을 추정하지 않습니다.','병력 수와 동맹 가입 여부만으로 전쟁 가능성·승패·국가 위험을 점수화하지 않습니다.']))+
    attribution(c,SECURITY_KEYS);
}

export function tabMarkup(tab,c) {
  if (tab === 'economy') return section('경제 규모와 소득',officialRows(c,['gdp','gdpPc','growth','gni','gniPc','trade'])) + section('고용·물가',officialRows(c,['unemployment','inflation'])) + section('비교 기준',list([
    `GDP와 순위는 ${c.rankYear?c.rankYear+'년':'공통 연도'} 자료만 사용합니다. 다른 항목은 수집 범위 내 최신 발표 연도로, 서로 기준 연도가 다를 수 있습니다.`,
    '실업률은 ILO 모형 추정 연간값입니다. 물가는 연간 소비자물가 상승률로 최근 월별 발표치와 다릅니다.',
    '공식 API 자료에도 추정치와 사후 개정이 포함됩니다. 실시간 통계가 아닙니다.',
    '기존 국가채무 값은 정부 범위와 출처를 확인하지 못해 표시하지 않습니다.'
  ])) + attribution(c,['gdp','gdpPc','growth','gni','gniPc','trade','unemployment','inflation']);
  if (tab === 'population') return section('인구 규모',officialRows(c,['population','popGrowth'])) + section('인구 구조',officialRows(c,['workingAge','elderly','fertility'])) + section('해석',list([
    '인구 규모만으로 소비시장 성장이나 노동력 확대를 판단하지 않습니다.',
    '생산가능인구 비중, 소득 수준, 연령 구조를 함께 봐야 합니다.',
    '15–64세 비중은 연령 구조이며 실제 취업자 비율이 아닙니다. 인구 자료에는 추정치가 포함됩니다.'
  ])) + attribution(c,['population','popGrowth','workingAge','elderly','fertility']);
  if (tab === 'industry') return industryMarkup(c);
  if (tab === 'resources') return resourcesMarkup(c);
  return securityMarkup(c);
}

export function initCountryProfile({document,window,getCountry}) {
  const panel = document.getElementById('countryProfile');
  const detail = document.getElementById('countryDetail');
  const reopen = document.getElementById('countryProfileOpen');
  const tabs = document.getElementById('countryTabs');
  const body = document.getElementById('countryTabBody');
  const scroller = document.getElementById('countryProfileScroll');
  let current = null, activeTab = 'economy', returnFocus = null;
  const icons = () => window.lucide?.createIcons();
  const tabButtons = () => [...tabs.querySelectorAll('[role="tab"]')];
  tabs.innerHTML = TABS.map(([id,label])=>`<button type="button" role="tab" id="country-tab-${id}" aria-controls="countryTabBody" aria-selected="${id===activeTab}" tabindex="${id===activeTab?0:-1}" data-country-tab="${id}">${label}</button>`).join('');
  function activate(id) {
    if (!TABS.some(([key])=>key===id)) return;
    activeTab = id;
    for (const button of tabButtons()) {
      const selected = button.dataset.countryTab === id;
      button.setAttribute('aria-selected',String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
    body.setAttribute('aria-labelledby',`country-tab-${id}`);
    body.innerHTML = current ? tabMarkup(id,current) : '';
    icons();
  }
  function open() {
    if (!current) return;
    panel.hidden = false;
    reopen.hidden = true;
    document.getElementById('countryProfileTitle').focus({preventScroll:true});
  }
  function close({restore = true} = {}) {
    panel.hidden = true;
    reopen.hidden = !current;
    if (restore) (returnFocus?.isConnected && returnFocus.matches('button,a,input,[tabindex="0"]') && returnFocus.getClientRects().length ? returnFocus : reopen).focus({preventScroll:true});
  }
  function render(country,{show = false} = {}) {
    if (!country) return;
    const changed = current?.id !== country.id;
    current = country;
    detail.dataset.iso = country.id;
    document.getElementById('countryProfileTitle').textContent = `${country.flag} ${country.name}`;
    document.getElementById('countryProfileRegion').textContent = country.region;
    document.getElementById('countryProfileCurrency').textContent = country.currency === 'krw' ? '원화 환산 · 환율 기준 별도' : '금액: USD';
    const status=document.getElementById('countryProfileStatus');
    if(status) status.textContent=country.dataStatus || '공식 자료 확인 중';
    document.getElementById('countryProfileHighlights').textContent = country.industryHeadline || '산업구조 자료 확인 중';
    detail.innerHTML = summaryMarkup(country);
    activate(activeTab);
    if (changed) scroller.scrollTop = 0;
    if (show) { returnFocus = document.activeElement; open(); }
  }
  tabs.addEventListener('click',event=>{
    const button=event.target.closest('[data-country-tab]');
    if (button) activate(button.dataset.countryTab);
  });
  tabs.addEventListener('keydown',event=>{
    const buttons=tabButtons(), index=buttons.indexOf(event.target);
    if(index<0 || !['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
    activate(buttons[next].dataset.countryTab);
    buttons[next].focus();
  });
  document.getElementById('countryProfileClose').addEventListener('click',()=>close());
  reopen.addEventListener('click',open);
  document.getElementById('countryProfileExpand').addEventListener('click',event=>{
    const wide=panel.classList.toggle('is-wide');
    const button=event.currentTarget;
    button.setAttribute('aria-pressed',String(wide));
    button.setAttribute('aria-label',wide?'국가 패널 좁히기':'국가 패널 넓히기');
    button.title=button.getAttribute('aria-label');
    button.innerHTML=`<i data-lucide="${wide?'minimize-2':'maximize-2'}" aria-hidden="true"></i>`;
    icons();
  });
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();close();}});
  window.addEventListener('app-view-change',event=>{if(event.detail!=='map') close({restore:false});});
  const existing=detail.dataset.iso;
  if(existing) render(getCountry(existing),{show:document.body.classList.contains('map-mode')});
  return {render,open,close};
}

if(typeof window!=='undefined' && window.getAtlasCountry) {
  window.CountryProfile=initCountryProfile({document,window,getCountry:window.getAtlasCountry});
}
