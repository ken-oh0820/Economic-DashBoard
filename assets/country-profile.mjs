import {SERIES,sourceUrl,seriesKeys,stale} from './country-data.mjs';
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
  if (tab === 'industry') return section('주요 산업',
    `<p class="country-note">기존 편집 자료 · 경쟁력 순위 아님</p>` + (c.industries.length ? list(c.industries) : unavailable('등록된 산업 정보가 없습니다.'))
  ) + section('관련 기술·분야', c.technologies.length ? list(c.technologies) : unavailable('등록된 기술 정보가 없습니다.')) + section('산업 순위 기준',
    `<p>수출 규모, 세계 점유율, 기술 경쟁력은 서로 다른 기준입니다. 검증된 통계 없이 산업 TOP 10 순위를 만들지 않습니다.</p>`
  ) + `<div class="country-sources">${link('https://comtrade.un.org/','UN Comtrade 상품 무역 통계')}</div>`;
  if (tab === 'resources') return section('지리', rows([
    ['지역',c.region],['항만·해협·지형','자료 미연결']
  ])) + section('기존 지도에 등록된 자원 분야', c.resources.length ?
    `<ul class="country-resource-list">${c.resources.map(r=>`<li><strong>${e(r.label)}</strong><small>${e(r.note)}</small></li>`).join('')}</ul>` :
    unavailable('현재 목록에 등록된 항목이 없습니다. 자원이 없다는 의미는 아닙니다.')
  ) + `<p class="country-note">이 목록은 일부 생산·수출 국가 분류입니다. 매장량 또는 채굴 가능성을 뜻하지 않습니다.</p>` +
    `<div class="country-sources">${link('https://www.usgs.gov/programs/mineral-resources-program/mineral-resources-data','USGS 광물 자료')}${link('https://www.eia.gov/international/','EIA 에너지 자료')}</div>`;
  return section('국제 협의체·동맹', c.groups.length ? list(c.groups) : unavailable('기존 지도 분류에 등록된 협의체가 없습니다.')) +
    `<p class="country-note">기존 지도 분류 기준 · NATO는 군사동맹, G7·BRICS는 군사동맹이 아닙니다. 최신 회원 현황은 재확인이 필요합니다.</p>` +
    section('군사 지표', unavailable('국방비·GDP 대비 국방비·병력 수는 검증된 자료 연결 전입니다. 군사력 종합 순위는 표시하지 않습니다.')) +
    section('해석', `<p>국방비는 지출 규모이며 실제 전투력과 같지 않습니다. 장비·훈련·동맹·지리적 조건을 함께 봐야 합니다.</p>`) +
    `<div class="country-sources">${link('https://www.sipri.org/databases/milex','SIPRI 국방비 자료')}${link('https://www.nato.int/','NATO 공식 사이트')}</div>`;
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
    document.getElementById('countryProfileHighlights').textContent = country.industries.length ? country.industries.slice(0,3).join(' · ') : '산업 정보 미등록';
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
