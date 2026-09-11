import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

// Only US government statistical series; adding a series requires a rights review.
export const SERIES={
  CPIAUCSL:['BLS','monthly'],CPILFESL:['BLS','monthly'],PPIFIS:['BLS','monthly'],
  WPSFD49116:['BLS','monthly'],UNRATE:['BLS','monthly'],PAYEMS:['BLS','monthly'],
  CES0500000003:['BLS','monthly'],GDP:['BEA','quarterly'],GDPC1:['BEA','quarterly'],
  PCEPI:['BEA','monthly'],GDPDEF:['BEA','quarterly'],FEDFUNDS:['Federal Reserve','monthly'],
  DGS3MO:['Federal Reserve','daily'],DGS1:['Federal Reserve','daily'],DGS2:['Federal Reserve','daily'],
  DGS5:['Federal Reserve','daily'],DGS10:['Federal Reserve','daily'],DGS20:['Federal Reserve','daily'],DGS30:['Federal Reserve','daily']
};
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
      rightsConfirmed=tags.tags?.some(tag=>tag.name==='public domain: citation requested')===true;
      if(!rightsConfirmed)throw Error('Rights not confirmed');
      const data=await request('series/observations',{series_id:id,observation_start:start.toISOString().slice(0,10),sort_order:'asc'},key);
      const points=observations(data.observations);
      if(points.length<2)throw Error('No observations');
      series[id]={points,source:agency+' / FRED',sourceUrl:'https://fred.stlouisfed.org/series/'+id,frequency,fetchedAt:stamp,status:'ok',rights:'Public Domain: Citation Requested'};
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
  await writeFile(path,JSON.stringify({schemaVersion:1,updatedAt:stamp,failures,series},null,2)+'\n');
  if(failures.length)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await update();
