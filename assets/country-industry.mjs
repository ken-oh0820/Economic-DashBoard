import {observation,points,finite} from './country-data.mjs?v=20260922-registry1';

export const INDUSTRY_GROUPS = [
  {title:'경제를 구성하는 산업',keys:['services','industry','agriculture','manufacturing'],note:'GDP 대비 부가가치 비중. 제조업은 산업에 포함되므로 중복 합산하지 않습니다. 순생산물세 등으로 합계가 100%와 다를 수 있습니다.'},
  {title:'수출 구조',keys:['exportIntensity','manufacturedExports','highTechExports','ictServiceExports'],note:'지표마다 분모가 다릅니다. 수출 비중은 세계시장 점유율이나 국내 기업의 이익률이 아닙니다.'},
  {title:'혁신에 투입하는 자원',keys:['research'],note:'투자 규모를 나타내며 기술 성과나 수익률을 직접 측정하지 않습니다.'}
];
export const INDUSTRY_KEYS=INDUSTRY_GROUPS.flatMap(g=>g.keys);
export const INDUSTRY_INFO = {
  services:{basis:'GDP 대비',color:'teal',meaning:'금융·유통·운송·정보통신·공공서비스 등 서비스업이 국내에서 창출한 부가가치의 비중입니다.',caution:'금융이나 소프트웨어만의 비중이 아닙니다. 비중 상승은 다른 산업의 축소 때문에 나타날 수도 있습니다.'},
  industry:{basis:'GDP 대비',color:'blue',meaning:'광업·제조업·건설·전기·가스·수도 등 산업 부문의 부가가치 비중입니다.',caution:'제조업 수치를 이미 포함합니다. 자원 채굴과 건설도 포함하므로 이 값만으로 제조 경쟁력을 판단하지 않습니다.'},
  agriculture:{basis:'GDP 대비',color:'green',meaning:'농업·임업·어업이 국내에서 창출한 부가가치의 비중입니다.',caution:'생산성이나 식량 자급률과 다릅니다. 원자재 가격·기후·다른 산업의 규모에도 영향을 받습니다.'},
  manufacturing:{basis:'GDP 대비 · 산업의 일부',color:'violet',meaning:'원재료를 가공해 제품을 만드는 제조업의 부가가치 비중입니다.',caution:'수출액이나 세계 점유율이 아닙니다. 제조업 비중이 높아도 자체 기술·브랜드·마진이 높다는 뜻은 아닙니다.'},
  exportIntensity:{basis:'GDP 대비 · 상품+서비스',color:'blue',meaning:'상품·서비스 수출 총액을 GDP와 비교한 비율입니다. 해외 수요와의 연관성을 살펴보는 지표입니다.',caution:'수출은 총거래액, GDP는 부가가치입니다. 재수출·글로벌 생산망 때문에 100%를 넘을 수 있으며 외국 수요의 GDP 기여율과 같지 않습니다.'},
  manufacturedExports:{basis:'전체 상품 수출 대비',color:'teal',meaning:'상품 수출 중 제조품이 차지하는 비중입니다. 서비스 수출은 분모에 포함되지 않습니다.',caution:'World Bank의 SITC 기반 제조품 분류입니다. 국민계정의 제조업과 범위가 다르고, 제조품 수출이 많다고 첨단기술 비중도 높은 것은 아닙니다.'},
  highTechExports:{basis:'제조품 수출 대비',color:'violet',meaning:'제조품 수출 중 연구개발 집약도가 높은 제품으로 분류된 품목의 비중입니다.',caution:'반도체만의 비중이나 기술력 순위가 아닙니다. 외국 기업의 조립·가공·재수출도 포함될 수 있습니다.'},
  ictServiceExports:{basis:'전체 서비스 수출 대비',color:'green',meaning:'국제수지 기준 서비스 수출 중 정보통신기술 관련 서비스가 차지하는 비중입니다.',caution:'상품 수출은 포함하지 않습니다. 국제 기업의 소재지와 회계 처리의 영향을 받을 수 있어 국내 부가가치와 동일시하면 안 됩니다.'},
  research:{basis:'GDP 대비 · 공공+민간',color:'rose',meaning:'기업·정부·대학 등 국내 연구개발 지출을 GDP에 대비한 비율입니다.',caution:'투입 지표이지 성과 지표가 아닙니다. 발표가 늦을 수 있으며 특허의 질·상용화·기업 수익성과 함께 봐야 합니다.'}
};

export function industryMetric(snapshot,key,code,codes=[]) {
  codes=[...new Set(codes)];
  const current=observation(snapshot,key,code);
  if(!current)return {current:null,change:null,baselineYear:null,median:null,count:0,total:codes.length};
  const baselineYear=current.year-3, baseline=observation(snapshot,key,code,baselineYear);
  const peers=codes.map(c=>observation(snapshot,key,c,current.year)?.value).filter(finite).sort((a,b)=>a-b);
  const middle=Math.floor(peers.length/2);
  const median=peers.length<10?null:peers.length%2?peers[middle]:(peers[middle-1]+peers[middle])/2;
  return {current,baselineYear,change:baseline?current.value-baseline.value:null,median,count:peers.length,total:codes.length};
}
export function industryHeadline(snapshot,code) {
  const keys=['services','industry','agriculture'];
  const years=Object.keys(points(snapshot,'services',code)).map(Number).sort((a,b)=>b-a);
  const year=years.find(y=>keys.every(k=>observation(snapshot,k,code,y)));
  if(!year)return '산업구조: 같은 연도 비교 자료 부족';
  const values=keys.map(key=>({key,value:observation(snapshot,key,code,year).value})).sort((a,b)=>b.value-a.value);
  if(values[0].value===values[1].value)return `${year}년 산업구조 · 최대 비중 공동`;
  const labels={services:'서비스업',industry:'산업(건설 포함)',agriculture:'농림어업'};
  return `${labels[values[0].key]} ${values[0].value.toFixed(1)}% · GDP 내 최대 비중 (${year}년)`;
}
export function industryScale(key,value) {
  const base=key==='research'?10:100;
  const max=finite(value)?Math.max(base,Math.ceil(value/base)*base):base;
  return {max,width:finite(value)?Math.max(0,Math.min(100,value/max*100)):0};
}
