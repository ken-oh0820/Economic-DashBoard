import {SERIES,finite} from './country-data.mjs?v=20260922-compare1';

export const RESOURCE_GROUPS = [
  {title:'국토와 자연 기반',keys:['landArea','arableLand','forestArea','freshwater'],note:'면적과 자연조건은 산업의 기반입니다. 이용 가능한 토지·용수나 생산성을 직접 나타내지는 않습니다.'},
  {title:'자원과 경제의 연결',keys:['resourceRents','fuelExports','metalExports'],note:'경제적 렌트와 수출 구성은 서로 다른 개념입니다. 비중이 높을수록 무조건 유리한 것은 아닙니다.'}
];
export const RESOURCE_KEYS = RESOURCE_GROUPS.flatMap(group=>group.keys);
export const RESOURCE_INFO = {
  landArea:{basis:'내륙 수역 제외',color:'blue',meaning:'호수·주요 하천 등 내륙 수역을 제외한 육지 면적입니다. 농업·도시·산업 입지의 물리적 규모를 살펴볼 수 있습니다.',caution:'영해·배타적경제수역(EEZ) 면적이 아닙니다. 사막·산악·보호구역도 포함되므로 넓다고 개발 가능한 땅이 많다는 뜻은 아닙니다.'},
  arableLand:{basis:'육지 면적 대비',color:'green',meaning:'일시적 작물 재배지, 일시적 목초지, 텃밭과 일시 휴경지 등을 포함하는 경작지의 비중입니다.',caution:'영구작물 재배지와 영구 목초지를 포함한 전체 농업용지 비중과 다릅니다. 식량 자급률·생산성·앞으로 개간 가능한 면적을 뜻하지 않습니다.'},
  forestArea:{basis:'육지 면적 대비',color:'teal',meaning:'자연림과 조림지를 포함한 산림 면적의 비중입니다. 생태계·수자원·임업의 기반을 살펴보는 지표입니다.',caution:'상업적으로 벌채할 수 있는 산림이나 목재 매장량이 아닙니다. 보호 규정·수종·접근성에 따라 이용 가능성이 달라집니다.'},
  freshwater:{basis:'국내 발생 수자원 · 인구 대비',color:'blue',meaning:'국내 강수로 형성되는 재생가능 지표수·지하수의 장기평균 연간 유량을 인구로 나눈 값입니다.',caution:'해외에서 유입되는 물은 제외합니다. 해당 연도의 강수량·저수량·실제 공급량이 아니며, 수질·지역 편차·수입·담수화까지 반영한 물 부족 지수도 아닙니다.'},
  resourceRents:{basis:'GDP 대비 · 추정치',color:'violet',meaning:'석유·천연가스·석탄·광물·산림에서 얻는 경제적 렌트의 합계를 GDP와 비교합니다. 자원 가치에서 추출·생산 비용을 뺀 경제적 잉여의 추정치입니다.',caution:'정부 세수·기업 순이익·자원 매장량이 아닙니다. 자원 가격과 비용에도 민감하며, 높은 비중은 자원 수익 기반과 가격 변동에 대한 노출을 함께 보여줍니다.'},
  fuelExports:{basis:'전체 상품 수출 대비',color:'rose',meaning:'광물성 연료·윤활유 및 관련 물질 수출액이 상품 수출에서 차지하는 비중입니다. 에너지 관련 수출 구조를 살펴봅니다.',caution:'정제유·재수출도 포함될 수 있습니다. 수출 비중만으로 산유국·에너지 자급국이라 판단하거나 국내 원유 매장량을 추정하지 않습니다.'},
  metalExports:{basis:'전체 상품 수출 대비',color:'violet',meaning:'공식 무역 분류에 따른 광석·금속 수출액의 상품 수출 대비 비중입니다. 광업·금속 공급망과 해외 수요의 연관성을 살펴봅니다.',caution:'가공·재수출이 포함될 수 있고 모든 금속 완제품을 포괄하지 않습니다. 특정 광물의 매장량·세계 점유율·채굴 가능량을 뜻하지 않습니다.'}
};

export function resourceValue(key,value) {
  if(!finite(value)) return '자료 없음';
  const unit=SERIES[key]?.[2];
  const digits=unit==='%'?2:0;
  const formatted=new Intl.NumberFormat('ko-KR',{maximumFractionDigits:digits}).format(value);
  return `${formatted}${unit==='%'?'%':` ${unit}`}`;
}

export function resourceAge(year,now=Date.now()) {
  return Number.isInteger(year) && new Date(now).getUTCFullYear()-year>3 ? '3년 초과 경과 자료' : '';
}
