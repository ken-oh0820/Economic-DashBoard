export function gaugeState(value,risk=false){
  if(!Number.isFinite(value))return null;
  if(risk)return {position:Math.max(0,Math.min(100,(value+3)/6*100)),label:value>0?'평균보다 긴축적':value<0?'평균보다 완화적':'장기 평균 수준',min:-3,max:3};
  if(value<0||value>100)return null;
  const label=value<25?'극단적 공포':value<45?'공포':value<=55?'중립':value<=75?'탐욕':'극단적 탐욕';
  return {position:value,label,min:0,max:100};
}

export function initSentimentGauges(root){
  root.classList.add('sentiment-gauges');
  for(const card of root.querySelectorAll('[data-chart-key]')){
    const risk=card.dataset.chartKey==='vix',value=card.querySelector('.indicator-value');
    const gauge=document.createElement('div');gauge.className='sentiment-gauge'+(risk?' risk-gauge':'');
    gauge.innerHTML='<div class="gauge-track"><span class="gauge-marker" hidden></span></div><div class="gauge-scale"><span>'+(risk?'−3 · 완화':'0 · 공포')+'</span><span>'+(risk?'0 · 평균':'50')+'</span><span>'+(risk?'+3 · 긴축':'100 · 탐욕')+'</span></div><div class="gauge-reading" role="status"></div>';
    card.append(gauge);
    const marker=gauge.querySelector('.gauge-marker'),reading=gauge.querySelector('.gauge-reading');
    const update=()=>{
      const text=value.textContent.trim(),number=text===''?NaN:Number(text.replaceAll(',',''));
      const state=gaugeState(number,risk);
      marker.hidden=!state;
      gauge.querySelector('.gauge-track').classList.toggle('unavailable',!state);
      if(state)marker.style.left=state.position+'%';
      reading.textContent=state?state.label:'데이터 확인 대기';
      gauge.setAttribute('aria-label',state?(risk?'NFCI 위험 지수 ':'공포탐욕 점수 ')+text+' · '+state.label:'관측값 없음');
    };
    new MutationObserver(update).observe(value,{childList:true,subtree:true,characterData:true});
    update();
  }
}
