import {DEFAULT_FAVORITES,cleanFavorites,observationLabel,timestampLabel,readPreference,savePreference} from './workspace-model.mjs?v=20260917-five-menus';
import {initMonitorTools,nextReleaseText} from './monitor-tools.mjs?v=20260917-contrast';

const $=selector=>document.querySelector(selector);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons=()=>window.lucide?.createIcons();
const icon=name=>'<i data-lucide="'+name+'" aria-hidden="true"></i>';
const button=(id,label,symbol)=>'<button type="button" id="'+id+'" class="workspace-icon" title="'+label+'" aria-label="'+label+'">'+icon(symbol)+'</button>';
let storage;try{storage=window.localStorage;}catch{}
const catalog=[
  ...US_MACRO_ITEMS.map(item=>({key:'macro-'+item.key,label:item.name})),
  ...BOND_TENORS.map(item=>({key:'bond-us-'+item.key,label:'미국 국채 '+item.label})),
  {key:'bond-us-spread',label:'미국 10년−3개월'},
  {key:'rate-us',label:'미국 실효 연방기금금리'}
];
const allowed=catalog.map(item=>item.key);
let favorites=cleanFavorites(readPreference(storage,'ken-favorites-v1',DEFAULT_FAVORITES),allowed);
let activeChart=null;
const helpMap={'macro-cpi':3,'macro-core-cpi':3,'macro-inflation':3,'macro-ahe':3,'macro-unrate':5,'macro-payems':5,'bond-us-2y':2,'rate-us':2,hy:7};

function makeDialog(id,title,body){
  const dialog=document.createElement('dialog');dialog.id=id;dialog.className='workspace-dialog';
  dialog.setAttribute('aria-labelledby',id+'Title');
  dialog.innerHTML='<div class="workspace-dialog-head"><h2 id="'+id+'Title">'+title+'</h2>'+button(id+'Close','닫기','x')+'</div>'+body;
  document.body.append(dialog);
  $('#'+id+'Close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
  return dialog;
}

const navItems=[['menu','홈','layout-grid'],['map','세계 경제 지도','globe-2'],['dashboard','지표 모니터링','chart-no-axes-combined'],['sites','투자 관련 사이트','newspaper'],['guide','미국 경제 지표 해설','book-open'],['fed','연준 대차대조표','landmark']];
const nav=makeDialog('workspaceNav','워크스페이스','<nav aria-label="워크스페이스 메뉴">'+navItems.map(([view,label,symbol])=>'<button type="button" data-view="'+view+'">'+icon(symbol)+'<span>'+label+'</span></button>').join('')+'</nav>');
const menuButton=$('header .app-nav-btn');
menuButton.removeAttribute('onclick');menuButton.setAttribute('aria-label','메뉴 열기');menuButton.title='메뉴 열기';
menuButton.setAttribute('aria-haspopup','dialog');menuButton.setAttribute('aria-controls',nav.id);
menuButton.addEventListener('click',()=>nav.showModal());
nav.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{nav.close();switchView(btn.dataset.view);}));
window.addEventListener('app-view-change',event=>{
  const view=event.detail;
  nav.querySelectorAll('[data-view]').forEach(btn=>{if(btn.dataset.view===view)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');});
  if(view!=='dashboard'&&chartDialog.open)chartDialog.close();
});

// Reuse the original controls and fetch/render functions; no parallel data pipeline.
const shell=$('#indicatorDashboard .dashboard-shell');
const overview=document.createElement('section');overview.className='workspace-overview';overview.setAttribute('aria-labelledby','overviewTitle');
overview.innerHTML='<div class="workspace-section-head"><div><h2 id="overviewTitle">나의 핵심 지표</h2><p>관측 기간 기준 · 공식 데이터</p></div>'+button('editFavorites','핵심 지표 선택','sliders-horizontal')+'</div><div id="overviewGrid" class="overview-grid"></div><p id="preferenceStatus" class="workspace-feedback" role="status"></p>';
shell.querySelector('.dashboard-top').after(overview);
const jump=document.createElement('nav');jump.className='monitor-jump';jump.setAttribute('aria-label','모니터링 섹션');
const sections=[['monitorMacro','물가·고용·성장'],['monitorRates','금리·유동성'],['monitorSentiment','시장 심리'],['monitorSources','원문·연결 상태']];
jump.innerHTML=sections.map(([id,label])=>'<button type="button" data-section="'+id+'">'+label+'</button>').join('');
overview.after(jump);
const macro=$('#usMacroGrid').closest('.dashboard-panel'),basis=$('.basis-monitor'),rates=$('#globalRateGrid').closest('.dashboard-panel'),bonds=$('.bond-panel'),schedule=$('#rateSchedulePanel'),sentiment=$('#indicatorDashboard .indicator-grid'),sources=$('#indicatorDashboard .dashboard-sections');
const groups=sections.map(([id,label])=>{const section=document.createElement('section');section.id=id;section.className='monitor-section';section.setAttribute('aria-label',label);shell.append(section);return section;});
groups[0].append(macro);
groups[1].append(schedule,bonds,rates);
const advanced=document.createElement('details');advanced.className='workspace-advanced';
advanced.innerHTML='<summary>국채 Basis 위험 모니터링</summary>';advanced.append(basis);groups[1].append(advanced);
groups[2].innerHTML='<h2 class="workspace-section-title">시장 심리</h2>';groups[2].append(sentiment);
groups[3].append(sources);
sources.querySelectorAll('.watch-row[data-chart-key]').forEach(row=>{
  if(row.dataset.chartKey==='dubai')return;
  row.removeAttribute('role');row.removeAttribute('tabindex');row.removeAttribute('data-chart-key');
});
jump.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{const section=$('#'+btn.dataset.section);section.tabIndex=-1;section.focus({preventScroll:true});section.scrollIntoView({block:'start',behavior:'instant'});}));
$('#marketSourceList').closest('.dashboard-panel').querySelector('.dashboard-panel-title').textContent='데이터 연결 상태';
$('#indicatorDashboard .dashboard-sub').textContent='관측값과 변화 · 발표 일정 · 시계열 비교';
$('#investmentSites .dashboard-sub').textContent='공식 발표·공시와 뉴스 제공처 원문 리서치';
for(const [selector,links] of [
  ['#indicatorDashboard', [['guide','지표 해설'],['sites','원문 리서치']]],
  ['#usEconomyGuide', [['dashboard','현재 지표'],['sites','원문 리서치']]],
  ['#investmentSites', [['dashboard','현재 지표'],['guide','지표 해설']]]
]){
  const navigation=document.createElement('nav');navigation.className='context-links';navigation.setAttribute('aria-label','관련 화면');
  navigation.innerHTML=links.map(([view,label])=>'<button type="button" data-destination="'+view+'">'+label+icon('arrow-up-right')+'</button>').join('');
  $(selector+' .dashboard-top').after(navigation);
  navigation.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>switchView(button.dataset.destination)));
}

const chartDialog=makeDialog('workspaceChart','지표 상세','<div id="chartDataBasis"></div><div id="chartPanelHost"></div><div class="chart-secondary-actions">'+button('chartFavorite','핵심 지표에 추가','star')+'<button type="button" id="chartGuideLink" class="workspace-text-button">'+icon('book-open')+'관련 해설</button></div><section id="chartGuidePreview" class="chart-guide-preview" hidden></section>');
$('#chartPanelHost').append($('.market-chart-panel'));
const chooser=makeDialog('workspaceFavorites','핵심 지표 선택','<p class="workspace-dialog-note">최대 8개 · 이 브라우저에 저장</p><fieldset id="favoriteChoices"><legend class="workspace-sr-only">관찰할 지표</legend>'+catalog.map(item=>'<label><input type="checkbox" value="'+item.key+'">'+escape(item.label)+'</label>').join('')+'</fieldset><p id="favoriteLimit" role="status"></p><div class="workspace-dialog-actions"><button type="button" id="favoritesDefault" class="workspace-text-button">기본 선택</button><button type="button" id="favoritesSave" class="workspace-primary">적용</button></div>');
$('#editFavorites').addEventListener('click',()=>{chooser.querySelectorAll('input').forEach(input=>input.checked=favorites.includes(input.value));$('#favoriteLimit').textContent='';$('#favoritesSave').disabled=false;chooser.showModal();});
chooser.addEventListener('change',()=>{const count=chooser.querySelectorAll('input:checked').length;$('#favoriteLimit').textContent=count>8?'최대 8개까지 선택할 수 있습니다.':count+'개 선택';$('#favoritesSave').disabled=count>8;});
$('#favoritesDefault').addEventListener('click',()=>{chooser.querySelectorAll('input').forEach(input=>input.checked=DEFAULT_FAVORITES.includes(input.value));$('#favoriteLimit').textContent='6개 선택';$('#favoritesSave').disabled=false;});
function persistFavorites(){const saved=savePreference(storage,'ken-favorites-v1',favorites);$('#preferenceStatus').textContent=saved?'':'브라우저 저장을 사용할 수 없어 이번 방문에만 적용합니다.';refreshOverview();updateFavoriteButton();window.dispatchEvent(new Event('workspace-favorites-changed'));}
$('#favoritesSave').addEventListener('click',()=>{favorites=cleanFavorites([...chooser.querySelectorAll('input:checked')].map(input=>input.value),allowed);persistFavorites();chooser.close();});
function toggleFavorite(key){
  if(favorites.includes(key))favorites=favorites.filter(item=>item!==key);
  else if(favorites.length<8)favorites.push(key);
  else {$('#chartDataBasis').textContent='핵심 지표는 최대 8개입니다. 핵심 지표 선택에서 기존 항목을 해제해 주세요.';return;}
  persistFavorites();
}
$('#chartFavorite').addEventListener('click',()=>toggleFavorite(activeChart));
function updateFavoriteButton(){
  const btn=$('#chartFavorite');btn.hidden=!allowed.includes(activeChart);
  const selected=favorites.includes(activeChart);
  btn.setAttribute('aria-pressed',String(selected));btn.setAttribute('aria-label',selected?'핵심 지표에서 제거':'핵심 지표에 추가');btn.title=btn.getAttribute('aria-label');
}

function provenance(key){
  const meta=OfficialData.metadata(MARKET_CHARTS[key]);if(!meta)return '<div class="observation-date">관측값 확인 불가</div>';
  return '<div class="observation-date">관측 '+escape(observationLabel(meta.date,meta.frequency))+'</div><div class="observation-status '+(meta.delayed?'delayed':'')+'">'+(meta.delayed?'수집 지연 · 마지막 확보값':'공식 관측값')+'</div><div class="observation-collected">수집 '+escape(timestampLabel(meta.fetchedAt))+'</div><div class="observation-next">'+escape(nextReleaseText(MARKET_CHARTS[key]))+'</div>';
}

function refreshOverview(){
  const host=$('#overviewGrid');
  if(!favorites.length){host.innerHTML='<p class="overview-empty">선택한 핵심 지표가 없습니다.</p>';return;}
  host.innerHTML=favorites.map(key=>{
    const item=catalog.find(item=>item.key===key),original=document.querySelector('#indicatorDashboard [data-chart-key="'+key+'"]');
    const value=original?.querySelector('.macro-value,.bond-value')?.textContent || (OfficialData.get(MARKET_CHARTS[key])?'표시 준비 중':'확인 불가');
    const change=original?.querySelector('.macro-change,.bond-change')?.textContent||'';
    const meta=OfficialData.metadata(MARKET_CHARTS[key]);
    const cfg=MARKET_CHARTS[key],qualifier=cfg.transform==='yoy'?'전년 대비':cfg.transform==='change'?'전월 대비 증감':cfg.transform==='qoq-annualized'?'전분기 연율':key.includes('gdp')?'연율 환산 규모':key==='rate-us'?'월평균 금리':key==='bond-us-spread'?'금리 차':'수준';
    const shortChange=key==='macro-payems'&&meta?'총고용 '+(OfficialData.get(cfg).points.at(-1).value/10).toLocaleString('ko-KR',{maximumFractionDigits:1})+'만 명':change.split(' · ')[0];
    return '<article class="overview-item"><button type="button" class="overview-open" data-open-chart="'+key+'"><span class="overview-label">'+escape(item.label)+'</span><span class="overview-qualifier">'+qualifier+'</span><strong>'+escape(value)+'</strong><span class="overview-change">'+escape(shortChange)+'</span><span class="observation-date">'+escape(meta?observationLabel(meta.date,meta.frequency):'관측값 미확인')+'</span>'+(meta?.delayed?'<span class="observation-status delayed">수집 지연</span>':'')+'</button></article>';
  }).join('');
  host.querySelectorAll('[data-open-chart]').forEach(btn=>btn.addEventListener('click',()=>openChart(btn.dataset.openChart)));
}

function openChart(key){
  if(!MARKET_CHARTS[key])return;
  activeChart=key;
  $('#workspaceChartTitle').textContent=MARKET_CHARTS[key].label;
  $('#chartDataBasis').innerHTML=OfficialData.metadata(MARKET_CHARTS[key])?provenance(key)+'<div class="chart-source-name">'+escape(OfficialData.metadata(MARKET_CHARTS[key]).source)+'</div>':'<p>기준일·출처는 차트와 원문에서 확인하세요.</p>';
  updateFavoriteButton();
  const number=helpMap[key],detail=number?document.querySelectorAll('#guide-important .us-guide-item')[number-1]:null;
  $('#chartGuideLink').hidden=!detail;$('#chartGuidePreview').hidden=!detail;
  $('#chartGuidePreview').replaceChildren();
  if(detail){const title=document.createElement('h3');title.textContent='함께 읽기 · '+detail.querySelector('.us-guide-term').textContent;const p=document.createElement('p');p.textContent=detail.querySelector('.us-guide-detail p').textContent;$('#chartGuidePreview').append(title,p);}
  if(!chartDialog.open)chartDialog.showModal();
  showMarketChart(key);
}
const returnChart=document.createElement('button');returnChart.type='button';returnChart.className='workspace-text-button guide-return';returnChart.hidden=true;returnChart.innerHTML=icon('arrow-left')+'지표 상세로 돌아가기';
$('#usEconomyGuide .dashboard-top').after(returnChart);
returnChart.addEventListener('click',()=>{switchView('dashboard');openChart(activeChart);returnChart.hidden=true;});
$('#chartGuideLink').addEventListener('click',()=>{
  const index=helpMap[activeChart];if(!index)return;
  chartDialog.close();switchView('guide');$('#guide-important-tab').click();
  guideSearch.value='';filterGuide();
  const detail=document.querySelectorAll('#guide-important .us-guide-item')[index-1];detail.open=true;
  returnChart.hidden=false;detail.querySelector('summary').focus();detail.scrollIntoView({block:'center',behavior:'instant'});
});

const searchBand=document.createElement('div');searchBand.className='guide-search-band';
searchBand.innerHTML='<label for="guideSearch">'+icon('search')+'지표 검색</label><input type="search" id="guideSearch" placeholder="지표명 또는 키워드" autocomplete="off"><span id="guideSearchCount" role="status"></span>';
$('#usEconomyGuide .guide-tabs').after(searchBand);
const guideSearch=$('#guideSearch');
const noResults=document.createElement('p');noResults.className='guide-empty';noResults.hidden=true;noResults.textContent='일치하는 지표가 없습니다.';searchBand.after(noResults);
function filterGuide(){
  const term=guideSearch.value.trim().toLocaleLowerCase();
  document.querySelectorAll('#usEconomyGuide .us-guide-item').forEach(item=>item.hidden=!!term&&!item.textContent.toLocaleLowerCase().includes(term));
  document.querySelectorAll('.important-guide-group').forEach(group=>group.hidden=![...group.querySelectorAll('.us-guide-item')].some(item=>!item.hidden));
  const active=$('#guide-important').hidden?$('#guide-terms'):$('#guide-important');
  const count=[...active.querySelectorAll('.us-guide-item')].filter(item=>!item.hidden).length;
  $('#guideSearchCount').textContent=count+'개';noResults.hidden=count!==0;
}
guideSearch.addEventListener('input',filterGuide);
$('#usEconomyGuide .guide-tabs').addEventListener('click',()=>queueMicrotask(filterGuide));
$('#usEconomyGuide .guide-tabs').addEventListener('keydown',()=>queueMicrotask(filterGuide));

window.addEventListener('market-data-rendered',refreshOverview);
window.WorkspaceUI={openChart,refreshOverview,provenance,timestampLabel};
initMonitorTools({catalog,getFavorites:()=>favorites,makeDialog,openChart,escape,icon});
refreshOverview();filterGuide();icons();
