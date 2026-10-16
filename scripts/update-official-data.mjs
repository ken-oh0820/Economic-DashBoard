import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

// Curated statistical series; each run confirms the provider's redistribution label.
export const SERIES={
  CPIAUCSL:['BLS','monthly'],CPILFESL:['BLS','monthly'],PPIFIS:['BLS','monthly'],
  WPSFD49116:['BLS','monthly'],UNRATE:['BLS','monthly'],PAYEMS:['BLS','monthly'],
  CES0500000003:['BLS','monthly'],GDP:['BEA','quarterly'],GDPC1:['BEA','quarterly'],
  PCEPI:['BEA','monthly'],GDPDEF:['BEA','quarterly'],FEDFUNDS:['Federal Reserve','monthly'],
  DFEDTARL:['Federal Reserve','daily'],DFEDTARU:['Federal Reserve','daily'],
  DGS3MO:['Federal Reserve','daily'],DGS1:['Federal Reserve','daily'],DGS2:['Federal Reserve','daily'],
  DGS5:['Federal Reserve','daily'],DGS10:['Federal Reserve','daily'],DGS20:['Federal Reserve','daily'],DGS30:['Federal Reserve','daily'],
  SOFR:['Federal Reserve Bank of New York','daily'],IORB:['Federal Reserve','daily'],
  TGCRRATE:['Federal Reserve Bank of New York','daily'],SRFTSYD:['Federal Reserve Bank of New York','daily'],
  DTWEXBGS:['Federal Reserve','daily'],DEXJPUS:['Federal Reserve','daily'],DEXUSEU:['Federal Reserve','daily'],
  DCOILWTICO:['EIA','daily'],DCOILBRENTEU:['EIA','daily'],
  NFCIRISK:['Federal Reserve Bank of Chicago','weekly'],NFCICREDIT:['Federal Reserve Bank of Chicago','weekly'],
  MORTGAGE30US:['Freddie Mac','weekly'],POILDUBUSDM:['IMF','monthly'],
  IRLTLT01KRM156N:['OECD','monthly'],IRLTLT01JPM156N:['OECD','monthly']
};
export const ATTRIBUTED_SERIES=new Set(['SOFR','TGCRRATE','SRFTSYD','NFCIRISK','NFCICREDIT','MORTGAGE30US','POILDUBUSDM','IRLTLT01KRM156N','IRLTLT01JPM156N']);
export function seriesRights(id,tags){
  const names=new Set((tags||[]).map(tag=>tag.name.toLowerCase()));
  if(names.has('copyrighted: pre-approval required'))return null;
  if(names.has('public domain: citation requested'))return 'Public Domain: Citation Requested';
  if(ATTRIBUTED_SERIES.has(id)&&names.has('copyrighted: citation required'))return 'Copyrighted: Citation Required';
  return null;
}
export function yieldVolatility(points,window=20){
  const result=[];
  for(let i=window;i<points.length;i++){
    const sample=points.slice(i-window,i+1);
    if(sample.some((point,j)=>j&&Date.parse(point.date)-Date.parse(sample[j-1].date)>7*86400000))continue;
    const changes=sample.slice(1).map((point,j)=>(point.value-sample[j].value)*100);
    const mean=changes.reduce((a,b)=>a+b,0)/window;
    const variance=changes.reduce((sum,value)=>sum+(value-mean)**2,0)/(window-1);
    result.push({date:points[i].date,value:Number(Math.sqrt(variance*252).toFixed(6))});
  }
  return result;
}
export function bisPolicySeries(payload){
  const data=payload.data||payload,dimensions=data.structure?.dimensions;
  const countries=dimensions?.series?.findIndex(item=>item.id==='REF_AREA');
  const times=dimensions?.observation?.find(item=>item.id==='TIME_PERIOD')?.values;
  if(countries==null||countries<0||!times)throw Error('Invalid BIS dimensions');
  const result={};
  for(const [key,item] of Object.entries(data.dataSets?.[0]?.series||{})){
    const country=dimensions.series[countries].values[Number(key.split(':')[countries])]?.id;
    if(!['JP','KR','BR'].includes(country))continue;
    const points=observations(Object.entries(item.observations||{}).map(([index,row])=>({date:times[Number(index)]?.id,value:row[0]})));
    if(points.length>1)result['BIS_POLICY_'+country]=points;
  }
  return result;
}
export function observations(rows){
  const points=new Map();
  for(const row of rows||[]){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(row.date)||row.value==null||String(row.value).trim()==='')continue;
    const value=Number(row.value);
    if(Number.isFinite(value))points.set(row.date,{date:row.date,value});
  }
  return [...points.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
export function spreadPoints(long,short){
  const byDate=new Map(short.map(p=>[p.date,p.value]));
  return long.filter(p=>byDate.has(p.date)).map(p=>({date:p.date,value:Number((p.value-byDate.get(p.date)).toFixed(6))}));
}
async function request(endpoint,params,key){
  const url=new URL('https://api.stlouisfed.org/fred/'+endpoint);
  url.search=new URLSearchParams({...params,api_key:key,file_type:'json'});
  // Never log request URLs or provider error bodies, which could contain credentials.
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  return response.json();
}
export const RELEASE_GROUPS=[
  {series:['CPIAUCSL','CPILFESL'],name:'CPI · Core CPI',url:'https://www.bls.gov/schedule/news_release/cpi.htm'},
  {series:['PPIFIS','WPSFD49116'],name:'PPI · Core PPI',url:'https://www.bls.gov/schedule/news_release/ppi.htm'},
  {series:['UNRATE','PAYEMS','CES0500000003'],name:'고용 보고서',url:'https://www.bls.gov/schedule/news_release/empsit.htm'},
  {series:['GDP','GDPC1','GDPDEF'],name:'GDP',url:'https://www.bea.gov/news/schedule'},
  {series:['PCEPI'],name:'개인소득·소비 / PCE',url:'https://www.bea.gov/news/schedule'}
];
export function releaseDates(rows){
  return [...new Set((rows||[]).map(row=>row.date).filter(date=>/^\d{4}-\d{2}-\d{2}$/.test(date||'')&&Number.isFinite(Date.parse(date))))].sort();
}
export async function collectCalendar(key,previous={},requestFn=request,now=new Date()){
  const groups=[],stamp=now.toISOString();
  for(const group of RELEASE_GROUPS){
    try{
      const info=await requestFn('series/release',{series_id:group.series[0]},key);
      const id=info.releases?.[0]?.id;if(!Number.isInteger(id))throw Error('No release');
      const start=new Date(now);start.setUTCMonth(start.getUTCMonth()-2);
      const data=await requestFn('release/dates',{release_id:id,realtime_start:start.toISOString().slice(0,10),include_release_dates_with_no_data:'true',sort_order:'asc'},key);
      const dates=releaseDates(data.release_dates);if(!dates.length)throw Error('No dates');
      groups.push({...group,dates,fetchedAt:stamp,status:'ok'});
    }catch{
      const old=previous.groups?.find(item=>item.series?.[0]===group.series[0]);
      groups.push({...group,dates:old?.dates||[],fetchedAt:old?.fetchedAt||null,status:'stale'});
    }
  }
  return {groups,checkedAt:stamp};
}
export async function update(){
  const key=process.env.FRED_API_KEY;
  if(!key)throw Error('FRED_API_KEY secret is required');
  const path=new URL('../data/official-data.json',import.meta.url);
  let previous={series:{}};
  try{previous=JSON.parse(await readFile(path,'utf8'));}catch{}
  const now=new Date(),stamp=now.toISOString(),start=new Date(now);
  start.setUTCFullYear(start.getUTCFullYear()-6);
  const series={},failures=[];
  for(const [id,[agency,frequency]] of Object.entries(SERIES)){
    let rightsConfirmed=false;
    try{
      const tags=await request('series/tags',{series_id:id},key);
      const rights=seriesRights(id,tags.tags);
      rightsConfirmed=!!rights;
      if(!rightsConfirmed)throw Error('Rights not confirmed');
      const data=await request('series/observations',{series_id:id,observation_start:start.toISOString().slice(0,10),sort_order:'asc'},key);
      const points=observations(data.observations);
      if(points.length<2)throw Error('No observations');
      let notice='',citation=agency+', '+id+', retrieved from FRED, Federal Reserve Bank of St. Louis.';
      if(rights==='Copyrighted: Citation Required'){
        const metadata=await request('series',{series_id:id},key);
        if(metadata.seriess?.[0]?.id!==id)throw Error('Missing attribution');
        notice=metadata.seriess[0].notes||('Source: '+agency+'. '+rights+'.');
      }
      series[id]={points,source:agency+' / FRED',sourceUrl:'https://fred.stlouisfed.org/series/'+id,frequency,fetchedAt:stamp,status:'ok',rights,notice,citation};
      console.log(id+': '+points.length+' observations, latest '+points.at(-1).date);
    }catch{
      failures.push(id);
      // Keep a last-good snapshot only after this run confirms redistribution rights.
      if(rightsConfirmed&&previous.series?.[id])series[id]={...previous.series[id],status:'stale'};
      console.warn(id+': unavailable (credentials, access, rights or upstream data)');
    }
    await new Promise(resolve=>setTimeout(resolve,600));
  }
  if(series.DGS10&&series.DGS3MO){
    series.T10Y3M={...series.DGS10,points:spreadPoints(series.DGS10.points,series.DGS3MO.points),source:'Federal Reserve / FRED · 10Y minus 3M',sourceUrl:'https://fred.stlouisfed.org/series/T10Y3M',status:[series.DGS10,series.DGS3MO].some(s=>s.status!=='ok')?'stale':'ok'};
  }
  if(series.SOFR&&series.IORB){
    series.SOFRIORB={...series.SOFR,points:spreadPoints(series.SOFR.points,series.IORB.points),source:'NY Fed SOFR − Fed IORB / FRED · 자체 계산',status:[series.SOFR,series.IORB].some(item=>item.status!=='ok')?'stale':'ok'};
  }
  if(series.DGS10){
    series.DGS10VOL20={...series.DGS10,points:yieldVolatility(series.DGS10.points),source:'Federal Reserve DGS10 / FRED · 20일 실현변동성 자체 계산'};
  }
  try{
    const url='https://stats.bis.org/api/v2/data/dataflow/BIS/WS_CBPOL/1.0/D.JP+KR+BR?startPeriod='+start.toISOString().slice(0,10)+'&format=sdmx-json';
    const response=await fetch(url,{signal:AbortSignal.timeout(60000)});
    if(!response.ok)throw Error('BIS HTTP '+response.status);
    const policies=bisPolicySeries(await response.json());
    for(const country of ['JP','KR','BR']){
      const id='BIS_POLICY_'+country,points=policies[id];
      if(!points)throw Error('Missing BIS country '+country);
      series[id]={points,source:'BIS · Central bank policy rates',sourceUrl:'https://data.bis.org/topics/CBPOL/BIS%2CWS_CBPOL%2C1.0/D.'+country,frequency:'daily',fetchedAt:stamp,status:'ok',rights:'BIS: Attribution Required',notice:'Source: BIS. 한국어 설명은 BIS의 공식 번역이 아닙니다.',citation:'Bank for International Settlements, Central bank policy rates, WS_CBPOL 1.0, D.'+country+'.'};
      console.log(id+': '+points.length+' observations, latest '+points.at(-1).date);
    }
  }catch{
    for(const country of ['JP','KR','BR']){const id='BIS_POLICY_'+country;if(series[id])continue;failures.push(id);if(previous.series?.[id])series[id]={...previous.series[id],status:'stale'};}
    console.warn('BIS policy rates: collection incomplete');
  }
  const calendar=await collectCalendar(key,previous.calendar);
  await writeFile(path,JSON.stringify({schemaVersion:1,updatedAt:stamp,failures,series,calendar},null,2)+'\n');
  if(failures.length)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await update();
