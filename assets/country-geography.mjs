// Manually reviewed representative examples, not live port or route status.
export const GEOGRAPHY_REVIEWED = '2026-09-23';
export const GEOGRAPHY_COHORT_YEAR = 2025;
export const GEOGRAPHY_GROUPS = [
  {key:'ports',label:'대표 항만',icon:'anchor'},
  {key:'waterways',label:'해협·운하·수로',icon:'route'},
  {key:'terrain',label:'지형·내륙 연결',icon:'mountain'}
];
export const GEOGRAPHY_SOURCES = {
  eia:{label:'EIA · 세계 에너지 수송 요충지',url:'https://www.eia.gov/international/content/analysis/special_topics/World_Oil_Transit_Chokepoints/'},
  la:{label:'로스앤젤레스항 · 항만 소개',url:'https://portoflosangeles.org/about'},
  mississippi:{label:'미 육군 공병단 · 미시시피강 항행',url:'https://www.mvm.usace.army.mil/Missions/Navigation/'},
  shanghai:{label:'상하이시 · 도시 안내 (PDF)',url:'https://english.shanghai.gov.cn/cmsres/b2/b28c98aa466c4e0a9c1ec572ff6e51f0/4870ef4d844b264c050bc9ad4be6bf71.pdf'},
  china:{label:'중국 지질조사국 · 지형',url:'https://en.cgs.gov.cn/Facts/201603/t20160309_266151.html'},
  hamburg:{label:'함부르크항 · 배후 철도망',url:'https://www.hafen-hamburg.de/en/hinterland/rail/'},
  rhine:{label:'독일 연방수문연구소 · 2020–2021 연보 (PDF)',url:'https://doi.bafg.de/BfG/2022/BfG-Jahresbericht_2020_2021_EN.pdf'},
  nagoya:{label:'나고야항 관리조합 · 항만 개요',url:'https://www.port-of-nagoya.jp/english/aboutport/1001385.html'},
  japan:{label:'일본 통계국 · Statistical Handbook 2024 (PDF)',url:'https://www.stat.go.jp/english/data/handbook/pdf/2024all.pdf'},
  felixstowe:{label:'펠릭스토항 · 공식 안내',url:'https://www.portoffelixstowe.co.uk/'},
  dover:{label:'영국 해사·해안경비청 · 도버 해협',url:'https://www.gov.uk/government/publications/dover-strait-crossings-channel-navigation-information-service'},
  uk:{label:'영국 기상청 · 지형과 강수',url:'https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/rain/how-much-does-it-rain-in-the-uk'},
  jnpa:{label:'JNPA · 항만 위치·연결망',url:'https://www.jnport.gov.in/page/location-/SVdqV3piUHlEaDVMQ2xyTmtuMkh0UT09'},
  india:{label:'인도 정부 · 지형 개요',url:'https://www.india.gov.in/explore-india/facts-of-india/physical-background/physical-features'},
  haropa:{label:'HAROPA PORT · 센강 항만 체계',url:'https://www.haropaport.com/en/who-we-are'},
  russiaPorts:{label:'Rosmorport · 해역별 항만',url:'https://www.rosmorport.com/services/seaports/'},
  siberia:{label:'NASA Earth Observatory · 중앙시베리아',url:'https://science.nasa.gov/earth/earth-observatory/from-russia-with-questions-147960/'},
  genoa:{label:'유럽투자은행 · 제노바항 사업',url:'https://www.eib.org/en/projects/all/20230776'},
  po:{label:'유럽 환경청 Climate-ADAPT · 포 평야',url:'https://climate-adapt.eea.europa.eu/en/metadata/projects/helping-enhanced-soil-functions-and-adaptation-to-climate-change-by-sustainable-conservation-agriculture-techniques'},
  vancouver:{label:'캐나다 교통부 · 교통 연보 2024 (PDF)',url:'https://tc.canada.ca/sites/default/files/2025-06/transportation-canada-annual-report-2024.pdf'},
  seaway:{label:'미 교통부 · 오대호–세인트로렌스 수로',url:'https://www.seaway.dot.gov/about/great-lakes-st-lawrence-seaway-system'},
  canada:{label:'캐나다 천연자원부 · 지형 구분',url:'https://open.canada.ca/data/dataset/028dd58d-320c-53fb-b5bc-8188fd5d5edf'}
};

export const COUNTRY_GEOGRAPHY = {
  US:{
    ports:{title:'로스앤젤레스항',relation:'자국 항만',source:'la',
      fact:'태평양 연안 산페드로만의 항만으로, 컨테이너·자동차·벌크 등 여러 화물을 취급합니다.',
      reading:'아시아 교역과 미국 내륙 운송을 잇는 거점으로 볼 수 있습니다. 항만 처리 능력뿐 아니라 철도·트럭 연결과 내륙 재고를 함께 봐야 합니다.'},
    waterways:{title:'파나마 운하',relation:'해외 교역로 · 파나마',source:'eia',
      fact:'대서양과 태평양을 잇는 운하이며 미국 영토의 수로는 아닙니다.',
      reading:'이 운하를 이용하는 미국 항로는 통항 제약 시 우회 거리와 운송비가 늘어날 수 있습니다. 미국의 모든 해상 무역이 이곳을 지나는 것은 아닙니다.'},
    terrain:{title:'미시시피강 내륙 수계',relation:'대표 내륙 연결망',source:'mississippi',
      fact:'미시시피강에는 미 육군 공병단이 유지·관리하는 내륙 항행 구간이 있습니다.',
      reading:'내륙 벌크 화물 운송의 이점을 살펴볼 수 있습니다. 수위 저하·항로 유지·항만 환적 비용에 따라 실제 운송 경제성은 달라집니다.'}
  },
  CN:{
    ports:{title:'상하이항·양쯔강 하구',relation:'자국 항만',source:'shanghai',
      fact:'상하이는 중국 동부의 양쯔강 하구에 위치한 해상 교역 거점입니다.',
      reading:'연안 항만과 양쯔강 배후 지역의 연결을 함께 보는 것이 중요합니다. 항만 규모만으로 내륙 모든 지역의 물류 접근성이 좋다고 판단할 수는 없습니다.'},
    waterways:{title:'말라카 해협',relation:'해외 교역로 · 동남아시아',source:'eia',
      fact:'인도양과 태평양을 연결하는 해협으로 중동–동아시아 에너지 수송의 주요 경로입니다.',
      reading:'중국으로 향하는 해당 항로의 공급망 민감도를 살펴보는 지점입니다. 중국이 소유·통제하는 수로가 아니며 대체 항로와 육상 수송도 구분해야 합니다.'},
    terrain:{title:'서고동저·내륙 고원과 동부 저지대',relation:'대표 지형',source:'china',
      fact:'중국은 서쪽의 고원·산지에서 동쪽으로 대체로 낮아지는 지형을 보입니다.',
      reading:'연안과 내륙의 고도·거리 차이는 철도·도로 건설과 물류 비용을 다르게 만듭니다. 같은 국가 안에서도 산업 입지 조건을 지역별로 봐야 합니다.'}
  },
  DE:{
    ports:{title:'함부르크항·철도 배후망',relation:'자국 항만',source:'hamburg',
      fact:'함부르크항의 터미널들은 독일 및 유럽 내륙을 연결하는 철도망과 연계됩니다.',
      reading:'항만 자체의 처리량보다 배후 제조업 지역으로 얼마나 안정적으로 연결되는지가 중요합니다. 철도 용량과 환적 지연은 별도 확인 대상입니다.'},
    waterways:{title:'덴마크 해협',relation:'해외 인접 수로 · 발트해 연결',source:'eia',
      fact:'덴마크 해협은 발트해를 드나드는 해상 경로이며 킬 운하와는 별개입니다.',
      reading:'독일의 발트해 항만과 북해 항만은 해상 접근 경로가 다릅니다. 이 수로를 함부르크항의 필수 통과 구간이나 독일 소유 해협으로 해석하지 않습니다.'},
    terrain:{title:'라인강 수계·수위 제약',relation:'국제 하천의 독일 구간',source:'rhine',
      fact:'라인강의 항행에서는 얕은 구간과 낮은 수위가 운송 가능한 적재량을 제약할 수 있습니다.',
      reading:'수운의 비용 이점과 가뭄 때의 적재량 감소를 함께 봅니다. 철도·도로로 대체할 수 있는 용량에 따라 산업 물류의 충격이 달라집니다.'}
  },
  JP:{
    ports:{title:'나고야항',relation:'자국 항만',source:'nagoya',
      fact:'이세만 안쪽의 항만으로 자동차 산업을 배후에 두며, 완성차·부품·기계류와 에너지 원료 등을 취급합니다.',
      reading:'자동차 수출과 제조업 원료 조달을 함께 살펴볼 수 있는 거점입니다. 취급 품목의 구성과 기업별 공급망을 구분해야 합니다.'},
    waterways:{title:'말라카 해협',relation:'해외 교역로 · 동남아시아',source:'eia',
      fact:'중동에서 동아시아로 향하는 석유·가스 해상 수송의 주요 경로입니다.',
      reading:'일본의 에너지 수입 항로를 평가할 때 볼 연결 지점입니다. 일본의 자국 해협이 아니며 모든 수입 물량이 통과하는 것으로 계산하지 않습니다.'},
    terrain:{title:'산지·구릉이 많은 열도',relation:'대표 지형',source:'japan',
      fact:'일본은 섬들로 이루어져 있으며 산지·구릉의 비중이 크고 평야가 산지 사이에 분포합니다.',
      reading:'가용 평지와 항만 접근성은 공장·도시 입지에 중요한 조건입니다. 산지를 넘는 교통망의 비용과 지역별 재해 노출도는 별도로 확인해야 합니다.'}
  },
  GB:{
    ports:{title:'펠릭스토항',relation:'자국 항만',source:'felixstowe',
      fact:'컨테이너를 취급하며 영국 내륙을 연결하는 철도 서비스를 갖춘 항만입니다.',
      reading:'수입 화물이 소비지·물류센터로 이동하는 연결망을 보는 거점입니다. 통관·철도·도로의 실제 처리 능력까지 확인해야 합니다.'},
    waterways:{title:'도버 해협',relation:'영국·프랑스 사이 해협',source:'dover',
      fact:'도버 해협의 선박 항행에는 무선·레이더 기반의 Channel VTS 안전 관제가 제공됩니다.',
      reading:'유럽 대륙과의 해상 연결에서 교통 밀도와 운항 안전을 함께 보는 구간입니다. 이 설명은 현재의 운항 중단·대기 시간을 제공하지 않습니다.'},
    terrain:{title:'북서부 산지·지역별 강수 차이',relation:'대표 지형·기후 조건',source:'uk',
      fact:'영국의 북쪽과 서쪽 고지대는 지형성 강수의 영향을 받아 남동부보다 대체로 습합니다.',
      reading:'물 관리·배수·교통 인프라의 조건이 지역별로 다를 수 있습니다. 강수량이나 풍부한 물만으로 농업·에너지 경쟁력을 단정하지 않습니다.'}
  },
  IN:{
    ports:{title:'자와할랄 네루항 (JNPA)',relation:'자국 항만 · 뭄바이 인근',source:'jnpa',
      fact:'인도 서해안 뭄바이 인근의 항만으로 도로·철도를 통해 배후 지역과 연결됩니다.',
      reading:'서부 해안과 내륙 생산·소비 지역을 잇는 물류 거점으로 볼 수 있습니다. 항만에서 목적지까지의 전체 운송 시간과 비용이 중요합니다.'},
    waterways:{title:'호르무즈 해협',relation:'해외 에너지 교역로 · 중동',source:'eia',
      fact:'페르시아만의 에너지 수송이 외해로 나가는 주요 해협입니다.',
      reading:'인도의 중동발 에너지 조달 중 이 해협을 지나는 항로의 노출을 확인하는 지점입니다. 실제 의존도는 공급국·품목·기간별로 따로 계산해야 합니다.'},
    terrain:{title:'히말라야·북부 평야·반도 고원',relation:'대표 지형',source:'india',
      fact:'인도 본토에는 북부 산악 지대, 큰 하천의 평야, 사막, 남부 반도 지역이 함께 분포합니다.',
      reading:'농업·도시·제조업의 입지 조건이 매우 다양합니다. 국토 면적만으로 연결성을 판단하지 말고 산악 통과 구간과 지역별 운송망을 함께 봅니다.'}
  },
  FR:{
    ports:{title:'르아브르·루앙·파리 (HAROPA)',relation:'자국 해항·내륙 항만 체계',source:'haropa',
      fact:'HAROPA PORT는 르아브르·루앙·파리를 연결하는 센강 축의 해항·내륙 항만 체계입니다.',
      reading:'해상 수입에서 내륙 소비지까지 이어지는 물류 구조를 볼 수 있습니다. 세 거점을 단일 해안 항구로 보거나 처리량을 중복 합산하지 않습니다.'},
    waterways:{title:'도버 해협',relation:'프랑스·영국 사이 해협',source:'dover',
      fact:'영국과 프랑스 사이의 도버 해협에는 선박의 안전 항행을 위한 교통 관제 체계가 있습니다.',
      reading:'영국과 유럽 대륙 사이의 해상 연결을 평가할 때 참고할 구간입니다. 해협 자체와 개별 항만·페리 노선의 운항 상태는 구분해야 합니다.'},
    terrain:{title:'센강 축·파리 배후권',relation:'대표 내륙 연결망',source:'haropa',
      fact:'센강 항만 체계는 해안의 르아브르에서 루앙과 파리의 내륙 거점으로 이어집니다.',
      reading:'수운·철도·도로를 조합할 수 있는 조건을 살펴봅니다. 내륙 수송은 수위·갑문·환적 시설의 제약도 있어 지리적 연결만으로 효율을 보장하지 않습니다.'}
  },
  RU:{
    ports:{title:'노보로시스크·우스티루가',relation:'자국 항만 · 흑해/발트해',source:'russiaPorts',
      fact:'노보로시스크는 흑해 항만군, 우스티루가는 발트해 항만군에 속합니다.',
      reading:'출구 해역이 다르므로 같은 러시아 항만이라도 이후 항로와 시장 접근성이 다릅니다. 현행 제재·보험·접항 가능 여부는 별도 확인이 필요합니다.'},
    waterways:{title:'보스포루스·다르다넬스 해협',relation:'해외 교역로 · 튀르키예',source:'eia',
      fact:'튀르키예 해협은 흑해와 지중해를 연결하는 해상 통로입니다.',
      reading:'러시아 흑해 항만의 외해 접근을 살펴보는 구간입니다. 러시아 소유 수로가 아니며 현재의 통항 규칙이나 선박별 제한은 원문에서 따로 확인해야 합니다.'},
    terrain:{title:'북부 중앙시베리아 고원·영구동토',relation:'대표 지역 지형',source:'siberia',
      fact:'중앙시베리아 고원 북부에는 영구동토가 분포합니다.',
      reading:'이 지역의 도로·기초 시설은 지반 안정성과 유지 비용을 함께 봐야 합니다. 러시아 전체가 동일한 동토 조건이라는 뜻은 아닙니다.'}
  },
  IT:{
    ports:{title:'제노바항',relation:'자국 항만',source:'genoa',
      fact:'철도와 연결된 항만으로, 유럽투자은행은 외곽 방파제 확장·재배치 사업을 소개하고 있습니다.',
      reading:'해상 접근 공간과 배후 철도망은 항만 활용도를 좌우합니다. 발표된 인프라 계획과 이미 사용 가능한 처리 능력은 구분해야 합니다.'},
    waterways:{title:'수에즈 운하',relation:'해외 교역로 · 이집트',source:'eia',
      fact:'지중해와 홍해를 연결하는 운하로 이집트에 위치합니다.',
      reading:'이탈리아–아시아 간 이 항로를 쓰는 화물은 우회 시 시간과 비용이 늘어날 수 있습니다. 이탈리아 자국 운하가 아니며 현재 통항 상태를 뜻하지 않습니다.'},
    terrain:{title:'포 평야·알프스와 아펜니노 산록',relation:'대표 지역 지형',source:'po',
      fact:'이탈리아 북부의 포 평야와 주변 산록은 토양·물 관리 및 농업 적응 사업의 대상 지역입니다.',
      reading:'평지의 활용 이점과 관개·홍수·가뭄 관리를 함께 봅니다. 북부의 조건을 남부·도서 지역에 그대로 적용해서는 안 됩니다.'}
  },
  CA:{
    ports:{title:'밴쿠버항',relation:'자국 항만 · 태평양 연안',source:'vancouver',
      fact:'밴쿠버항은 철도 배후망과 연결되는 캐나다 태평양 연안의 주요 교역 거점입니다.',
      reading:'아시아 교역과 내륙 자원·상품 수송을 잇는 역할을 살펴볼 수 있습니다. 긴 내륙 운송 거리와 철도 용량을 함께 확인해야 합니다.'},
    waterways:{title:'오대호–세인트로렌스 수로',relation:'미국·캐나다 공유 수로 체계',source:'seaway',
      fact:'대서양에서 북미 내륙 오대호까지 이어지는 하천·호수·운하의 수로 체계입니다.',
      reading:'내륙 산업과 해상 무역을 연결하는 통로입니다. 자연 해협 하나가 아니며 갑문 규격·운항 시즌 등 실제 이용 조건은 별도 확인이 필요합니다.'},
    terrain:{title:'캐나다 순상지·내륙 평원·서부 산지',relation:'대표 지형',source:'canada',
      fact:'캐나다에는 오래된 암반의 순상지, 내륙 평원, 서부 산지 등 서로 다른 지형 구역이 있습니다.',
      reading:'광업·농업·교통망의 입지 조건을 지역별로 나눠 보게 합니다. 특정 지형이 있다는 사실만으로 채굴 가능한 매장량이나 사업 수익성을 추정하지 않습니다.'}
  }
};
