import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {runInNewContext} from 'node:vm';
import {SERIES,iso2FromFlag,observations,validateSnapshot} from '../assets/country-data.mjs';

export async function readPages(url,request=fetch) {
  let page=1, pages=1, total=null, lastUpdated=null;
  const rows=[];
  do {
    const target=new URL(url);target.searchParams.set('page',page);
    const response=await request(target,{signal:AbortSignal.timeout(45000)});
    if(!response.ok) throw new Error(`World Bank HTTP ${response.status}`);
    const payload=await response.json();
    if(!Array.isArray(payload)||!Array.isArray(payload[1])||Number(payload[0]?.page)!==page) throw new Error('Unexpected World Bank response');
    const metadata=payload[0];
    if(page===1) {pages=Number(metadata.pages);total=Number(metadata.total);lastUpdated=metadata.lastupdated||null;}
    if(!Number.isInteger(pages)||pages<1||pages>100||!Number.isInteger(total)||total<1||Number(metadata.pages)!==pages||Number(metadata.total)!==total|| (metadata.lastupdated||null)!==lastUpdated) throw new Error('Inconsistent World Bank pagination');
    rows.push(...payload[1]);page++;
  } while(page<=pages);
  if(rows.length!==total) throw new Error('Incomplete World Bank response');
  return {rows,lastUpdated};
}
export function failedSeries(previous,indicator) {
  return {...(previous||{indicator,countries:{},fetchedAt:null}),status:previous?.fetchedAt?'stale':'unavailable'};
}
export async function collect() {
  const output=new URL('../data/country-data.json',import.meta.url);
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const countries=runInNewContext('('+html.match(/const eData=(\{[^\r\n]+\});/)[1]+')',{}, {timeout:1000});
  const codes=Object.values(countries).map(c=>iso2FromFlag(c.flag));
  if(new Set(codes).size!==codes.length) throw new Error('Duplicate country codes');
  let previous;try{previous=validateSnapshot(JSON.parse(await readFile(output,'utf8')));}catch{previous=null;}
  const now=new Date(), maxYear=now.getUTCFullYear()-1;
  const snapshot={schemaVersion:1,attemptedAt:now.toISOString(),license:'CC BY 4.0',provider:'World Bank, World Development Indicators',series:{}};
  const allowed=new Set(codes);let failures=0;
  for(const [key,[indicator]] of Object.entries(SERIES)) {
    try {
      const url=`https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json&source=2&date=${maxYear-5}:${maxYear}&per_page=20000`;
      const result=await readPages(url);
      const data=observations(result.rows,indicator,allowed,maxYear);
      if(Object.keys(data).length<codes.length/2) throw new Error('Unexpectedly low country coverage');
      const metadata=await readPages(`https://api.worldbank.org/v2/indicator/${indicator}?format=json&source=2`);
      const info=metadata.rows.find(r=>r.id===indicator&&String(r.source?.id)==='2');
      if(!info?.sourceOrganization) throw new Error('Missing attribution');
      snapshot.series[key]={indicator,status:'ok',fetchedAt:new Date().toISOString(),providerUpdatedAt:result.lastUpdated,sourceOrganization:info.sourceOrganization,sourceNote:info.sourceNote,apiUrl:url,countries:data};
      console.log(`${key}: ${Object.keys(data).length}/${codes.length} countries`);
    } catch(error) {
      failures++;
      snapshot.series[key]=failedSeries(previous?.series?.[key],indicator);
      console.error(`${key}: ${error.message}`);
    }
  }
  validateSnapshot(snapshot);
  await mkdir(new URL('../data/',import.meta.url),{recursive:true});
  await writeFile(new URL('../data/country-data.json.tmp',import.meta.url),JSON.stringify(snapshot,null,2)+'\n');
  await rename(new URL('../data/country-data.json.tmp',import.meta.url),output);
  if(failures) process.exitCode=1;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) await collect();
