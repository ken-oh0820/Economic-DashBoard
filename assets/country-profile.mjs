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

export function summaryMarkup(c) {
  return `<div class="country-summary">
    <div><span>GDP</span><strong>${e(c.money.gdp)}</strong></div>
    <div><span>등록 국가 내 GDP 순위</span><strong>${c.rank ? `${c.rank}위` : '자료 없음'}</strong><small>${c.count}개국 비교</small></div>
    <div><span>총인구</span><strong>${populationLabel(c.extra?.pop)}</strong></div>
    <div><span>1인당 GNI</span><strong>${e(c.money.gniPc)}</strong><small>GDP와 다른 국민소득 지표</small></div>
    <div><span>실업률</span><strong>${pct(c.unemployment)}</strong></div>
    <div><span>인플레이션</span><strong>${pct(c.inflation)}</strong></div>
  </div>`;
}

export function tabMarkup(tab,c) {
  if (tab === 'economy') return section('경제 규모와 소득', rows([
    ['GDP', c.money.gdp, '기존 명목 GDP 참고값'],
    ['무역 규모', c.money.trade, '기존 수출입 합계 참고값'],
    ['GNI 총액', c.money.gni, '기존 2024년 참고값'],
    ['국가채무 / GDP', pct(c.extra?.debt), '기존 2025년 참고값 · 범위 미검증']
  ])) + section('함께 살펴볼 점',list([
    '경제 규모는 GDP, 국민에게 귀속되는 소득은 GNI로 구분합니다.',
    '성장률·물가·실업률은 기준 시점과 통계 정의를 맞춰 비교해야 합니다.'
  ])) + `<div class="country-sources">${link('https://data.worldbank.org/','World Bank 경제 통계')}</div>`;
  if (tab === 'population') return section('인구 규모',rows([
    ['총인구', populationLabel(c.extra?.pop), '기존 인구 자료 · 기준 연도 재확인 필요']
  ])) + section('인구 구조', unavailable('출산율·고령화율·생산가능인구는 검증된 수치가 아직 연결되지 않았습니다.')) + section('해석',list([
    '인구 규모만으로 소비시장 성장이나 노동력 확대를 판단하지 않습니다.',
    '생산가능인구 비중, 소득 수준, 연령 구조를 함께 봐야 합니다.'
  ])) + `<div class="country-sources">${link('https://population.un.org/wpp','UN 인구 추계·전망')}</div>`;
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
