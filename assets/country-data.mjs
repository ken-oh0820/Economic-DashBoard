// Only indicators whose World Bank pages identify CC BY 4.0 are allowlisted.
export const SERIES = {
  gdp: ['NY.GDP.MKTP.CD', '명목 GDP', 'USD'],
  gdpPc: ['NY.GDP.PCAP.CD', '1인당 GDP', 'USD'],
  growth: ['NY.GDP.MKTP.KD.ZG', '실질 GDP 성장률', '%'],
  gni: ['NY.GNP.MKTP.CD', 'GNI 총액', 'USD'],
  gniPc: ['NY.GNP.PCAP.CD', '1인당 GNI · Atlas 방식', 'USD'],
  exports: ['NE.EXP.GNFS.CD', '상품·서비스 수출', 'USD'],
  imports: ['NE.IMP.GNFS.CD', '상품·서비스 수입', 'USD'],
  unemployment: ['SL.UEM.TOTL.ZS', '실업률 · ILO 모형 추정', '%'],
  inflation: ['FP.CPI.TOTL.ZG', '소비자물가 상승률 · 연간', '%'],
  population: ['SP.POP.TOTL', '총인구', '명'],
  popGrowth: ['SP.POP.GROW', '인구 증가율', '%'],
  workingAge: ['SP.POP.1564.TO.ZS', '15–64세 인구 비중', '%'],
  elderly: ['SP.POP.65UP.TO.ZS', '65세 이상 인구 비중', '%'],
  fertility: ['SP.DYN.TFRT.IN', '합계출산율', '명/여성']
};
export const finite = value => typeof value === 'number' && Number.isFinite(value);
export function iso2FromFlag(flag) {
  const code = Array.from(flag).map(c => String.fromCharCode(c.codePointAt(0) - 0x1f1e6 + 65)).join('');
  if (!/^[A-Z]{2}$/.test(code)) throw new Error('Invalid country flag');
  return code;
}
export function observations(rows, indicator, allowed, maxYear) {
  const countries = {};
  for (const row of rows) {
    const code = row.country?.id, year = Number(row.date);
    if (!allowed.has(code) || row.indicator?.id !== indicator || !Number.isInteger(year) || year < maxYear - 5 || year > maxYear || !finite(row.value)) continue;
    countries[code] ??= {};
    countries[code][year] = row.value;
  }
  return countries;
}
export function points(snapshot, key, code) {
  if (key !== 'trade') return snapshot?.series?.[key]?.countries?.[code] || {};
  const a = points(snapshot, 'exports', code), b = points(snapshot, 'imports', code);
  return Object.fromEntries(Object.entries(a).filter(([year,value]) => finite(value) && finite(b[year])).map(([year,value]) => [year,value + b[year]]));
}
export function observation(snapshot, key, code, year = null) {
  const values = points(snapshot,key,code);
  const selected = year ?? Object.keys(values).filter(y=>finite(values[y])).map(Number).sort((a,b)=>b-a)[0];
  return finite(values[selected]) ? {year:Number(selected),value:values[selected]} : null;
}
export function comparison(snapshot, key, codes) {
  const counts = {};
  for (const code of codes) for (const [year,value] of Object.entries(points(snapshot,key,code))) if(finite(value)) counts[year]=(counts[year]||0)+1;
  const years=Object.keys(counts).map(Number).sort((a,b)=>b-a);
  // Prefer a recent year covering at least 85% of this map; never fill holes from other years.
  const year=years.find(y=>counts[y]>=Math.ceil(codes.length*0.85)) ?? years.sort((a,b)=>counts[b]-counts[a]||b-a)[0] ?? null;
  return {year,count:counts[year]||0,total:codes.length};
}
export function seriesKeys(key) {return key==='trade'?['exports','imports']:[key];}
export function sourceUrl(key,code) {return `https://data.worldbank.org/indicator/${SERIES[key][0]}?locations=${encodeURIComponent(code)}`;}
export function stale(snapshot,key,now=Date.now()) {
  return seriesKeys(key).some(k=>{
    const s=snapshot?.series?.[k], time=Date.parse(s?.fetchedAt);
    return !s || s.status!=='ok' || !Number.isFinite(time) || now-time>14*86400000;
  });
}
export function rankFor(snapshot,code,codes,year) {
  const value=observation(snapshot,'gdp',code,year)?.value;
  return finite(value)?1+codes.filter(c=>(observation(snapshot,'gdp',c,year)?.value??-Infinity)>value).length:null;
}
export function validateSnapshot(snapshot) {
  if(snapshot?.schemaVersion!==1 || !snapshot.series || !Number.isFinite(Date.parse(snapshot.attemptedAt))) throw new Error('Invalid country snapshot');
  for(const [key,s] of Object.entries(snapshot.series)) {
    if(!SERIES[key] || s.indicator!==SERIES[key][0] || !s.countries || !['ok','stale','unavailable'].includes(s.status)) throw new Error('Invalid country series');
    for(const [code,values] of Object.entries(s.countries)) {
      if(!/^[A-Z]{2}$/.test(code)) throw new Error('Invalid country code');
      for(const [year,value] of Object.entries(values)) if(!/^\d{4}$/.test(year)||!finite(value)) throw new Error('Invalid observation');
    }
  }
  return snapshot;
}
