import {SERIES,iso2FromFlag,observation,comparison,validateSnapshot,stale} from './country-data.mjs?v=20260922-security1';
import {INDUSTRY_KEYS,industryMetric,industryHeadline} from './country-industry.mjs?v=20260922-security1';

export function buildAtlasData(snapshot,countries,now=Date.now()) {
  validateSnapshot(snapshot);
  const identities=Object.entries(countries).map(([id,c])=>[id,iso2FromFlag(c.flag)]);
  const codes=identities.map(([,code])=>code);
  const comparisons=Object.fromEntries(['gdp','trade','unemployment','inflation'].map(key=>[key,comparison(snapshot,key,codes)]));
  const profiles={},mapValues={};
  for(const [id,code] of identities) {
    const stats=Object.fromEntries([...Object.keys(SERIES),'trade'].map(key=>[key,key==='gdp'&&!comparisons.gdp.year?null:observation(snapshot,key,code,key==='gdp'?comparisons.gdp.year:null)]));
    const industryMetrics=Object.fromEntries(INDUSTRY_KEYS.map(key=>[key,industryMetric(snapshot,key,code,codes)]));
    profiles[id]={code,stats,industryMetrics,industryHeadline:industryHeadline(snapshot,code)};mapValues[id]={};
    for(const key of Object.keys(comparisons)) {
      const value=comparisons[key].year?observation(snapshot,key,code,comparisons[key].year)?.value:null;
      mapValues[id][key]=Number.isFinite(value)?value/(['gdp','trade'].includes(key)?1e9:1):null;
    }
  }
  const delayed=Object.keys(SERIES).filter(k=>stale(snapshot,k,now));
  return {snapshot,comparisons,profiles,mapValues,status:delayed.length?`World Bank 연간 통계 · ${delayed.length}개 지표 갱신 지연`:'World Bank 연간 통계 · 추정치 포함'};
}
export async function loadAtlasData(window,request=fetch) {
  try {
    const response=await request(new URL('../data/country-data.json',import.meta.url),{cache:'no-cache',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error(`Country data HTTP ${response.status}`);
    window.applyAtlasCountryData(buildAtlasData(await response.json(),window.getAtlasCountries()));
  } catch(error) {
    console.warn('Country statistics unavailable:',error.message);
    window.failAtlasCountryData();
  }
}
if(typeof window!=='undefined'&&window.getAtlasCountries)await loadAtlasData(window);
