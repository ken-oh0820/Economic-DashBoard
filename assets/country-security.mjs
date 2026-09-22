import {finite,observation,SERIES} from './country-data.mjs?v=20260922-registry1';

export const SECURITY_KEYS=['militarySpending','militaryGdp','militaryBudget','militaryPersonnel'];
export const SECURITY_INFO={
  militarySpending:{basis:'명목 USD · SIPRI 추정 포함',color:'blue',meaning:'SIPRI의 공통 정의로 집계한 군사 지출입니다. 인건비·운영비·장비 조달·군사 연구개발 등을 포함하며 각국이 발표하는 국방 예산과 범위가 다를 수 있습니다.',caution:'현재 가격의 달러 환산액입니다. 물가·환율 변화가 포함되므로 실질 구매력 증가나 실제 전투력 증가와 같지 않습니다.'},
  militaryGdp:{basis:'GDP 대비 · %',color:'violet',meaning:'국가 경제 규모에 비해 군사 지출이 얼마나 큰지를 보여줍니다. 경제가 감당하는 군사 지출의 상대적 부담을 살펴봅니다.',caution:'GDP가 줄어도 비율이 높아질 수 있습니다. NATO의 목표 이행 평가와는 통계 정의가 다를 수 있으므로 직접 대체하지 않습니다.'},
  militaryBudget:{basis:'일반정부 총지출 대비 · %',color:'rose',meaning:'일반정부 총지출 중 군사 지출의 비중입니다. 재정 자원 배분에서 국방이 차지하는 위치를 살펴봅니다.',caution:'GDP 대비 비율과 분모가 다릅니다. 복지·이자비용 등 다른 지출 변동으로 비중이 바뀔 수 있으며 중앙정부 예산 비율과도 다릅니다.'},
  militaryPersonnel:{basis:'현역 및 요건을 충족하는 준군사조직',color:'teal',meaning:'현역 군인과 군사 임무를 수행할 수 있는 일부 준군사조직을 포함한 인원입니다. World Bank가 제공하는 IISS 계열 통계입니다.',caution:'예비군 전체나 전시 동원 가능 인구가 아닙니다. 최신 병력 현황으로 해석하지 않으며, 장비·훈련·보급·지휘 능력은 인원수만으로 알 수 없습니다.'}
};
const format=(value,digits=2)=>new Intl.NumberFormat('ko-KR',{maximumFractionDigits:digits}).format(value);
export function securityValue(key,value){
  if(!finite(value))return '자료 없음';
  if(key==='militarySpending')return `${format(value/1e8)}억 USD`;
  if(key==='militaryPersonnel')return `${format(value,0)}명`;
  return `${format(value)}%`;
}
export function securityChange(snapshot,key,code){
  const current=observation(snapshot,key,code);
  if(!current)return null;
  const previous=observation(snapshot,key,code,current.year-1);
  if(!previous)return null;
  const difference=current.value-previous.value;
  const percent=SERIES[key][2]==='%';
  if(!percent&&previous.value<=0)return null;
  return {from:previous.year,to:current.year,value:percent?difference:difference/previous.value*100,unit:percent?'%p':'%'};
}

// Manually verified membership facts, not an automatically refreshed treaty database.
export const MEMBERSHIP_CHECKED='2026-09-22';
export const DIPLOMACY=[
  {name:'NATO',type:'정치·군사동맹',members:['AL','BE','BG','CA','HR','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IT','LV','LT','LU','ME','NL','MK','NO','PL','PT','RO','SK','SI','ES','SE','TR','GB','US'],url:'https://nato.int/en/about-us/organization/nato-member-countries',note:'파트너국과 회원국은 다릅니다. 비회원이라는 표시는 다른 양자 방위조약이나 안보 협력이 없다는 뜻이 아닙니다.'},
  {name:'G7',type:'경제·정책 협의체',members:['CA','FR','DE','IT','JP','GB','US'],url:'https://www.consilium.europa.eu/en/meetings/international-summit/2026/06/15-17/',note:'7개 국가와 EU가 참여합니다. EU 회원국 모두가 개별 G7 회원국인 것은 아니며, G7 자체는 군사동맹이 아닙니다.'},
  {name:'BRICS',type:'경제·정치 협의체',members:null,url:'https://brics.br/en/about-the-brics',note:'회원국·파트너국·초청국을 구분해야 합니다. 이 화면에서는 가입 상태를 자동 판정하지 않으며, 2025년 브라질 의장국의 공식 안내로 연결합니다. 군사동맹이 아닙니다.'}
];
export function membershipLabel(group,code){
  if(!/^[A-Z]{2}$/.test(code||''))return '국가 코드 확인 필요';
  if(!group.members)return '원문에서 확인';
  return group.members.includes(code)?'회원국':'회원국 아님';
}
