import {SERIES,points,finite,seriesKeys,sourceUrl,stale,iso2FromFlag} from './country-data.mjs?v=20260922-compare1';
import {INDUSTRY_KEYS,INDUSTRY_INFO} from './country-industry.mjs?v=20260922-compare1';
import {RESOURCE_KEYS,RESOURCE_INFO} from './country-resources.mjs?v=20260922-compare1';
import {SECURITY_KEYS,SECURITY_INFO} from './country-security.mjs?v=20260922-compare1';

export const COMPARE_GROUPS=[
  {id:'economy',label:'경제',keys:['gdp','gdpPc','growth','gni','gniPc','exports','imports','trade','unemployment','inflation']},
  {id:'population',label:'인구',keys:['population','popGrowth','workingAge','elderly','fertility']},
  {id:'industry',label:'산업',keys:INDUSTRY_KEYS},
  {id:'resources',label:'자원',keys:RESOURCE_KEYS},
  {id:'security',label:'군사',keys:SECURITY_KEYS}
];
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const format=(value,digits=2)=>new Intl.NumberFormat('ko-KR',{maximumFractionDigits:digits}).format(value);
export function normalizeSelections(ids,allowed){
  const seen=new Set();
  return Array.from({length:3},(_,i)=>{const id=ids[i];if(!allowed.has(id)||seen.has(id))return '';seen.add(id);return id;});
}
export function commonObservation(snapshot,key,codes){
  codes=[...new Set(codes)];
  if(!codes.length)return {year:null,values:[]};
  const data=codes.map(code=>points(snapshot,key,code));
  const year=Object.keys(data[0]).map(Number).filter(y=>data.every(values=>finite(values[y]))).sort((a,b)=>b-a)[0]??null;
  return {year,values:codes.map((_,i)=>year===null?null:data[i][year])};
}
export function compareValue(key,value){
  if(!finite(value))return '자료 없음';
  const unit=key==='trade'?'USD':SERIES[key]?.[2];
  if(unit==='USD')return Math.abs(value)>=1e12?`${format(value/1e12)}조 USD`:Math.abs(value)>=1e8?`${format(value/1e8)}억 USD`:`${format(value)} USD`;
  if(unit==='%')return `${format(value)}%`;
  return `${format(value,['명','km²','m³/인'].includes(unit)?0:2)} ${unit}`;
}
const BASE_NOTES={gdp:'현재 가격 · 환율 영향 포함',gdpPc:'현재 가격 · 인구 1인당',growth:'실질 GDP 연간 증감률',gni:'국민총소득 · 현재 가격',gniPc:'Atlas 방식 · 인구 1인당',exports:'상품·서비스 수출',imports:'상품·서비스 수입',trade:'상품·서비스 수출 + 수입 · 무역수지 아님',unemployment:'ILO 모형 추정 · 연간',inflation:'소비자물가 연간 상승률',population:'총인구 · 추정 포함',popGrowth:'연간 인구 증가율',workingAge:'총인구 중 15–64세 · 취업률 아님',elderly:'총인구 중 65세 이상',fertility:'여성 1인당 출생아 수'};
export function comparisonMarkup(snapshot,countries,groupId,now=Date.now()){
  if(!countries.length)return '<p class="compare-empty">선택된 국가 없음</p>';
  const group=COMPARE_GROUPS.find(g=>g.id===groupId)||COMPARE_GROUPS[0];
  const body=group.keys.map(key=>{
    const row=commonObservation(snapshot,key,countries.map(c=>c.code));
    const info=INDUSTRY_INFO[key]||RESOURCE_INFO[key]||SECURITY_INFO[key];
    const name=key==='trade'?'무역 총액':SERIES[key][1];
    const age=row.year!==null&&new Date(now).getUTCFullYear()-row.year>3;
    return `<tr><th scope="row">${escape(name)}<small>${row.year===null?'공통 연도 없음':`${row.year}년`}${age?' · 3년 초과 경과':''}</small><small>${escape(info?.basis||BASE_NOTES[key])}</small>${info?`<details class="compare-definition"><summary>해석</summary><p>${escape(info.meaning)}</p><p>${escape(info.caution)}</p></details>`:''}</th>${countries.map((country,i)=>`<td><strong>${escape(compareValue(key,row.values[i]))}</strong><span class="compare-cell-source">${seriesKeys(key).map(k=>`<a href="${escape(sourceUrl(k,country.code))}" target="_blank" rel="noopener noreferrer" aria-label="${escape(country.name+' '+SERIES[k][1]+' 원자료')}">${key==='trade'?escape(SERIES[k][1]):'원자료'}</a>`).join(' · ')}</span>${stale(snapshot,key,now)?'<small class="compare-stale">수집 갱신 지연</small>':''}</td>`).join('')}</tr>`;
  }).join('');
  return `<table class="compare-table"><caption>${escape(group.label)} · ${countries.length}개국 비교</caption><thead><tr><th scope="col">지표 · 공통 연도</th>${countries.map(c=>`<th scope="col">${escape(c.flag)} ${escape(c.name)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
}

export function initCountryComparison({document,window,getCountry,getCountries}){
  const dialog=document.getElementById('countryCompareDialog');
  const selectors=document.getElementById('countryCompareSelectors');
  const tabs=document.getElementById('countryCompareTabs');
  const body=document.getElementById('countryCompareBody');
  const status=document.getElementById('countryCompareStatus');
  let selected=['','',''],groupId='economy',currentId=null,returnFocus=null;
  const identities=()=>Object.entries(getCountries()).sort((a,b)=>a[1].name.localeCompare(b[1].name,'ko'));
  const icons=()=>window.lucide?.createIcons();
  function renderSelectors(){
    const entries=identities();selected=normalizeSelections(selected,new Set(entries.map(([id])=>id)));
    selectors.innerHTML=selected.map((id,index)=>`<label for="compareCountry${index}">국가 ${index+1}<select id="compareCountry${index}" data-compare-slot="${index}"><option value="">선택 안 함</option>${entries.map(([value,c])=>`<option value="${escape(value)}" ${value===id?'selected':''} ${selected.includes(value)&&value!==id?'disabled':''}>${escape(c.flag)} ${escape(c.name)}</option>`).join('')}</select></label>`).join('');
  }
  function render(){
    const countries=selected.filter(Boolean).map(getCountry).filter(Boolean).map(c=>({...c,code:c.code||iso2FromFlag(c.flag)}));
    const snapshot=countries.find(c=>c.official)?.official;
    status.textContent=`비교 국가 ${countries.length}/3${countries.length&&!snapshot?' · 공식 자료 대기':''}`;
    body.innerHTML=comparisonMarkup(snapshot,countries,groupId);
    body.setAttribute('aria-labelledby',`compare-tab-${groupId}`);
    for(const button of tabs.querySelectorAll('[role="tab"]')){const active=button.dataset.compareGroup===groupId;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}
    const organizations=[...new Set(COMPARE_GROUPS.find(g=>g.id===groupId).keys.flatMap(seriesKeys).map(key=>snapshot?.series?.[key]?.sourceOrganization).filter(Boolean))];
    document.getElementById('countryCompareAttribution').innerHTML=organizations.map(org=>`<p>${escape(org)}</p>`).join('');
  }
  function open(id){
    returnFocus=document.activeElement;
    if(id&&getCountry(id))selected=[id,...selected.filter(value=>value&&value!==id)].slice(0,3);
    renderSelectors();render();icons();
    if(!dialog.open)dialog.showModal();
    document.getElementById('compareCountry0').focus();
  }
  function close(restore=true){
    if(!dialog.open)return;
    dialog.close();
    if(restore&&returnFocus?.isConnected&&returnFocus.getClientRects().length)returnFocus.focus({preventScroll:true});
  }
  tabs.innerHTML=COMPARE_GROUPS.map(g=>`<button type="button" id="compare-tab-${g.id}" role="tab" aria-controls="countryCompareBody" aria-selected="${g.id===groupId}" tabindex="${g.id===groupId?0:-1}" data-compare-group="${g.id}">${g.label}</button>`).join('');
  selectors.addEventListener('change',event=>{
    const slot=event.target.dataset.compareSlot;
    if(!/^[012]$/.test(slot||''))return;
    selected[Number(slot)]=event.target.value;renderSelectors();render();document.getElementById(`compareCountry${slot}`).focus();
  });
  tabs.addEventListener('click',event=>{const button=event.target.closest('[data-compare-group]');if(button){groupId=button.dataset.compareGroup;render();}});
  tabs.addEventListener('keydown',event=>{
    const buttons=[...tabs.querySelectorAll('[role="tab"]')],index=buttons.indexOf(event.target);
    if(index<0||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
    groupId=buttons[next].dataset.compareGroup;render();buttons[next].focus();
  });
  document.getElementById('countryCompareOpen').addEventListener('click',()=>open());
  document.getElementById('countryCompareCurrent').addEventListener('click',()=>open(currentId));
  document.getElementById('countryCompareClose').addEventListener('click',()=>close());
  document.getElementById('countryCompareReset').addEventListener('click',()=>{selected=['','',''];renderSelectors();render();document.getElementById('compareCountry0').focus();});
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('click',event=>{const rect=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))close();});
  window.addEventListener('app-view-change',event=>{if(event.detail!=='map')close(false);});
  icons();
  return {open,close,refresh(){if(dialog.open)render();},setCountry(id){currentId=id;if(dialog.open)render();}};
}
