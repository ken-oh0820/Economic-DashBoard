import {calendarGroup,calendarState,comparisonData} from './monitor-model.mjs';
import {timestampLabel,observationLabel} from './workspace-model.mjs';

export function initMonitorTools({catalog,getFavorites,makeDialog,openChart,escape,icon}){
  const $=selector=>document.querySelector(selector);
  const overview=$('.workspace-overview');
  const compareButton=document.createElement('button');
  compareButton.type='button';compareButton.className='workspace-text-button';compareButton.id='openComparison';
  compareButton.innerHTML=icon('chart-no-axes-combined')+'지표 비교';
  $('#editFavorites').before(compareButton);
  const release=document.createElement('details');release.className='release-panel';release.id='releasePanel';
  release.innerHTML='<summary>최근 발표 · 다음 발표 <span id="releaseSummary"></span></summary><div class="release-toolbar"><label><input type="checkbox" id="releaseFavorites"> 관심 지표만</label><span>미국 현지 발표일 · 발표 시각은 원문 확인</span></div><div class="release-columns"><section><h3>최근 발표 일정</h3><div id="releaseRecent"></div></section><section><h3>다음 발표 일정</h3><div id="releaseNext"></div></section></div><p class="release-note">일정 경과는 데이터 수집 완료를 의미하지 않습니다. 발표일과 관측 기간은 다르며 일정은 변경될 수 있습니다.</p>';
  overview.after(release);
  $('#releaseFavorites').addEventListener('change',renderCalendar);
  function renderCalendar(){
    const groups=OfficialData.calendar().groups||[];
    const favoriteSeries=getFavorites().map(key=>MARKET_CHARTS[key]?.fallbackFred||MARKET_CHARTS[key]?.series);
    const selected=groups.filter(group=>!$('#releaseFavorites').checked||group.series.some(id=>favoriteSeries.includes(id)));
    const rows=selected.map(group=>({group,...calendarState(group)}));
    const recent=rows.filter(row=>row.past).sort((a,b)=>b.past.localeCompare(a.past)).slice(0,5);
    const next=rows.filter(row=>row.today||row.next).sort((a,b)=>(a.today||a.next).localeCompare(b.today||b.next)).slice(0,5);
    function rowHtml(row,future){
      const date=future?(row.today||row.next):row.past;
      const item=catalog.find(item=>row.group.series.includes(MARKET_CHARTS[item.key]?.fallbackFred||MARKET_CHARTS[item.key]?.series));
      return '<div class="release-row"><time>'+escape(date)+'</time><div>'+(item?'<button type="button" data-release-chart="'+item.key+'">'+escape(row.group.name)+'</button>':escape(row.group.name))+'<small>'+escape(row.stale?'일정 수집 지연':future&&row.today?'오늘 · 발표 여부 원문 확인':future?'예정':'일정 경과')+'</small></div><a href="'+escape(row.group.url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+escape(row.group.name)+' 공식 일정">원문 ↗</a></div>';
    }
    $('#releaseRecent').innerHTML=recent.map(row=>rowHtml(row,false)).join('')||'<p>확인된 일정이 없습니다.</p>';
    $('#releaseNext').innerHTML=next.map(row=>rowHtml(row,true)).join('')||'<p>예정일 미확인 · 원문 일정 확인</p>';
    const closest=next[0];
    $('#releaseSummary').textContent=closest?(closest.stale?'수집 지연 · ':'')+(closest.today||closest.next)+' '+closest.group.name:'일정 확인 대기';
    release.querySelectorAll('[data-release-chart]').forEach(button=>button.addEventListener('click',()=>openChart(button.dataset.releaseChart)));
  }
  const options=catalog.map(item=>'<option value="'+item.key+'">'+escape(MARKET_CHARTS[item.key].label)+'</option>').join('');
  const dialog=makeDialog('compareDialog','지표 비교','<div class="compare-controls"><label>왼쪽 축<select id="compareFirst">'+options+'</select></label><label>오른쪽 축<select id="compareSecond">'+options+'</select></label><label>기간<select id="comparePeriod"><option value="12">1년</option><option value="36">3년</option><option value="60">5년</option></select></label><label>표시<select id="compareMode"><option value="level">원 단위 · 좌우 축</option><option value="change">기준 대비 변화율 (%)</option></select></label></div><p id="compareMessage" role="status"></p><div class="compare-canvas"><canvas id="compareCanvas" role="img" aria-label="두 지표의 시계열 비교"></canvas></div><div id="compareSources"></div><details class="compare-values"><summary>관측값 표</summary><div id="compareTable"></div></details>');
  $('#compareFirst').value='macro-cpi';$('#compareSecond').value='rate-us';
  let chart=null;
  compareButton.addEventListener('click',()=>{dialog.showModal();drawComparison();});
  dialog.querySelectorAll('select').forEach(select=>select.addEventListener('change',drawComparison));
  dialog.addEventListener('close',()=>{chart?.destroy();chart=null;});
  function drawComparison(){
    chart?.destroy();chart=null;
    $('#compareSources').replaceChildren();$('#compareTable').replaceChildren();
    const keys=[$('#compareFirst').value,$('#compareSecond').value],months=Number($('#comparePeriod').value),mode=$('#compareMode').value;
    const configs=keys.map(key=>MARKET_CHARTS[key]);
    const raw=configs.map(cfg=>OfficialData.chart(cfg,'all')?.points||[]);
    const result=comparisonData(...raw,months,mode);
    const error=keys[0]===keys[1]?'서로 다른 지표를 선택하세요.':result.error;
    $('.compare-canvas').hidden=!!error;$('.compare-values').hidden=!!error;
    if(error){$('#compareMessage').textContent=error;return;}
    if(!window.Chart){$('#compareMessage').textContent='차트 라이브러리를 불러오지 못했습니다. 새로고침 후 다시 시도하세요.';return;}
    const unit=cfg=>cfg.suffix==='K'?'천 명':cfg.suffix==='T'?'조 달러':cfg.suffix||'지수';
    const date=t=>new Date(t).toISOString().slice(0,10);
    const number=value=>value.toLocaleString('ko-KR',{maximumFractionDigits:2});
    const units=configs.map(cfg=>mode==='change'?'%':unit(cfg));
    $('#compareMessage').textContent=date(result.start)+' ~ '+date(result.end)+' · 관측 기준일 비교 (발표일 아님) · '+(mode==='change'?'각 지표의 기간 내 첫 관측값 대비 변화율':'좌우 축 눈금은 독립적입니다. 선의 교차는 동일한 수준을 뜻하지 않습니다.');
    const colors=document.body.classList.contains('light')?['#087e83','#c05825']:['#4cd9dc','#ffae72'],text=getComputedStyle(document.body).getPropertyValue('--text').trim();
    const datasets=result.series.map((series,index)=>({label:configs[index].label+' ['+units[index]+']',data:series.points,borderColor:colors[index],backgroundColor:colors[index],pointRadius:2,pointHoverRadius:5,borderWidth:2,tension:0,yAxisID:mode==='change'?'y':index?'yRight':'y'}));
    const y={position:'left',title:{display:true,text:mode==='change'?'상대 변화율 (%)':units[0],color:colors[0]},ticks:{color:colors[0]},grid:{color:'#8882'}};
    const scales={x:{type:'linear',min:result.start,max:result.end,ticks:{maxTicksLimit:5,color:text,callback:value=>date(value).slice(0,7)},grid:{display:false}},y};
    if(mode!=='change')scales.yRight={position:'right',title:{display:true,text:units[1],color:colors[1]},ticks:{color:colors[1]},grid:{drawOnChartArea:false}};
    chart=new Chart($('#compareCanvas'),{type:'line',data:{datasets},options:{responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'nearest',intersect:false},scales,plugins:{legend:{labels:{color:text,boxWidth:16}},tooltip:{callbacks:{title:items=>items.length?date(items[0].parsed.x):'',label:item=>item.dataset.label+': '+number(item.parsed.y)}}}}});
    $('#compareSources').innerHTML=configs.map((cfg,index)=>{
      const meta=OfficialData.metadata(cfg);
      return '<p><b style="color:'+colors[index]+'">'+escape(cfg.label)+'</b> · '+escape(observationLabel(meta.date,meta.frequency))+' · '+escape(meta.delayed?'수집 지연':'수집 '+timestampLabel(meta.fetchedAt))+'<br><a href="'+escape(cfg.sourceUrl||'https://fred.stlouisfed.org/series/'+cfg.series)+'" target="_blank" rel="noopener noreferrer">FRED 원문 ↗</a>'+(mode==='change'?' · 비교 기준 '+date(result.series[index].base.t):'')+'</p>';
    }).join('');
    const allDates=[...new Set(result.series.flatMap(series=>series.points.map(p=>p.x)))].sort((a,b)=>b-a);
    const maps=result.series.map(series=>new Map(series.points.map(p=>[p.x,p.y])));
    $('#compareTable').innerHTML='<table><thead><tr><th>관측일</th>'+configs.map((cfg,index)=>'<th>'+escape(cfg.label)+' ('+units[index]+')</th>').join('')+'</tr></thead><tbody>'+allDates.map(t=>'<tr><th>'+date(t)+'</th>'+maps.map(map=>'<td>'+(map.has(t)?number(map.get(t)):'관측 없음')+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  }
  window.addEventListener('market-data-rendered',()=>{renderCalendar();if(dialog.open)drawComparison();});
  window.addEventListener('workspace-favorites-changed',renderCalendar);
  window.addEventListener('app-view-change',event=>{if(event.detail!=='dashboard')dialog.close();else renderCalendar();});
  const observer=new MutationObserver(()=>{if(dialog.open)drawComparison();});observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  setInterval(()=>{if(document.body.classList.contains('dashboard-mode'))renderCalendar();},60000);
  renderCalendar();
}

export function nextReleaseText(cfg){
  const id=cfg?.fallbackFred||cfg?.series,group=calendarGroup(OfficialData.calendar(),id);
  if(!group)return '발표 일정 미제공';
  const state=calendarState(group);
  return (state.stale?'일정 수집 지연 · ':'')+(state.today?'오늘 발표 일정 · 시각 원문 확인':state.next?'다음 발표 '+state.next+' (미국 현지 날짜)':'다음 발표일 미확인');
}
