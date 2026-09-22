// Editorial overview: service listings are evidence of advertised connections,
// not confirmation of a particular sailing, booking availability or AIS track.
export const US_GEOGRAPHY_REVIEWED='2026-09-23';
export const US_GEOGRAPHY_SOURCES={
  ports:{label:'MARAD · 미국 항만 목록',url:'https://www.maritime.dot.gov/data-reports/ports/list'},
  la:{label:'로스앤젤레스항 · 항만 소개',url:'https://portoflosangeles.org/about'},
  nw:{label:'NWSA · 시애틀·타코마',url:'https://www.nwseaportalliance.com/'},
  ny:{label:'뉴욕·뉴저지항 · 철도 연결 (2019 PDF)',url:'https://www.panynj.gov/content/dam/port/customer-library-pdfs/rail-guide-2019.pdf'},
  savannah:{label:'조지아항만청 · Garden City',url:'https://gaports.com/facilities/port-of-savannah/garden-city-terminal/'},
  virginia:{label:'버지니아항 · 터미널 안내',url:'https://operations.portofvirginia.com/terminal-directions/'},
  houston:{label:'Port Houston · 화물·선박 일정',url:'https://porthouston.com/toolbox/multi-purpose-terminals/schedules-gate-information/'},
  nola:{label:'Port NOLA · 화물 연결망',url:'https://portnola.com/business/cargo'},
  duluth:{label:'덜루스·슈피리어항 · 화물',url:'https://duluthport.com/business/cargo-and-trade/'},
  lakes:{label:'MARAD · 오대호 권역',url:'https://www.maritime.dot.gov/about-us/gateway-offices/great-lakes-gateway-office-chicago'},
  alaska:{label:'Port of Alaska · 앵커리지',url:'https://www.portofalaska.com/'},
  matsonAlaska:{label:'Matson · 알래스카 서비스',url:'https://www.matson.com/oilandgas'},
  matsonHawaii:{label:'Matson · 하와이 서비스',url:'https://www.matson.com/matnav/services/hawaii.html'},
  matsonAsia:{label:'Matson · Alaska–Asia Express',url:'https://www.matson.com/asia.html'},
  matsonSchedule:{label:'Matson 최신 운항 일정',url:'https://www.matson.com/matnav/schedules/index.html'},
  vts:{label:'미 해안경비대 · 수로별 관제',url:'https://navcen.uscg.gov/vessel-traffic-services-locations'},
  florida:{label:'NOAA · 멕시코만과 해협 연결',url:'https://www.aoml.noaa.gov/phod/gom/'},
  unimak:{label:'NOAA Coast Pilot 9 · 알래스카 (PDF)',url:'https://nauticalcharts.noaa.gov/publications/coast-pilot/files/cp9/CPB9_WEB.pdf'},
  bering:{label:'NOAA · 베링 해협',url:'https://www.fisheries.noaa.gov/feature-story/strait-connecting-pacific-and-arctic-oceans-larger-previously-measured'},
  seaway:{label:'미 교통부 · 오대호–세인트로렌스',url:'https://www.seaway.dot.gov/about/great-lakes-st-lawrence-seaway-system'},
  eia:{label:'EIA · 세계 해상 수송 요충지',url:'https://www.eia.gov/international/content/analysis/special_topics/World_Oil_Transit_Chokepoints/'},
  terrain:{label:'USGS · 본토 지형 구분 (PDF)',url:'https://pubs.usgs.gov/gip/70039236/report.pdf'},
  alaskaTerrain:{label:'USGS · 알래스카 지형 (1965 PDF)',url:'https://pubs.usgs.gov/pp/0482/report.pdf'},
  hawaiiTerrain:{label:'USGS · 하와이 제도 지질',url:'https://www.usgs.gov/publications/geology-hawaiian-islands'},
  pacific:{label:'Hapag-Lloyd · 태평양 서비스 목록',url:'https://www.hapag-lloyd.com/en/services-information/routes-trades/trades/trans-pacific.html'},
  laRotation:{label:'로스앤젤레스항 · 기항지 안내 (PDF)',url:'https://kentico.portoflosangeles.org/getmedia/6092f0f7-9e77-4b80-9b65-f6c6b4b5f9e1/Shipping-Line-Services-and-Port-Rotations-by-Terminal-2020'},
  atlantic:{label:'Hapag-Lloyd · 대서양 서비스·터미널',url:'https://www.hapag-lloyd.com/en/services-information/routes-trades/trades/trans-atlantic.html'},
  hlSchedule:{label:'Hapag-Lloyd 최신 운항 일정',url:'https://www.hapag-lloyd.com/solutions/schedule/'}
};

export const US_GEOGRAPHY_GROUPS=[
  {key:'ports',label:'권역별 항만',title:'태평양부터 대서양·오대호까지',icon:'anchor',note:'본토 48개 주·알래스카·하와이의 대표 거점입니다. 모든 항만이나 미국령을 포괄하는 목록은 아닙니다.',items:[
    {id:'california',title:'캘리포니아 · LA·롱비치·오클랜드',meta:'태평양 연안',sources:['la','ports','pacific'],fact:'남부의 LA·롱비치와 북부의 오클랜드는 태평양 교역에 연결되는 주요 항만입니다. LA는 컨테이너뿐 아니라 자동차와 벌크 화물도 취급합니다.',reading:'서부 소비시장과 내륙으로 향하는 수입 물류를 함께 봅니다. 항만에서 철도·트럭으로 갈아타는 구간의 비용이 최종 도착지까지의 경쟁력을 좌우합니다.'},
    {id:'northwest',title:'태평양 북서부 · 시애틀·타코마',meta:'워싱턴주 · NWSA',sources:['nw'],fact:'NWSA는 시애틀과 타코마의 해상 화물 사업을 연결하며 아시아 교역과 알래스카 운송을 안내합니다.',reading:'아시아와의 해상 연결, 북서부 배후시장, 알래스카 보급망을 함께 보는 거점입니다. 해상 거리만으로 전체 물류비가 낮다고 단정하지 않습니다.'},
    {id:'northeast',title:'북동부 · 뉴욕·뉴저지항',meta:'대서양 연안',sources:['ny'],fact:'뉴욕·뉴저지항은 해상 터미널과 ExpressRail 철도 연결망을 갖추고 있습니다.',reading:'북동부 소비지 접근성과 중서부 내륙 연결을 함께 평가할 수 있습니다. 항만 규모와 별도로 도심 도로·철도 환적 여건을 확인해야 합니다.'},
    {id:'southeast',title:'남동부 · 버지니아·서배너',meta:'노퍽·포츠머스 / 조지아주',sources:['virginia','savannah'],fact:'버지니아항에는 Norfolk International Terminals 등이 있으며, 서배너의 Garden City는 컨테이너와 철도 환적을 연결합니다.',reading:'남동부 생산·소비 지역과 내륙 배송망을 살펴보는 거점입니다. 같은 동부 항만이라도 배후시장과 철도 목적지가 다릅니다.'},
    {id:'gulf',title:'멕시코만 연안 · 휴스턴·뉴올리언스',meta:'텍사스·루이지애나',sources:['houston','nola'],fact:'휴스턴은 중량물·벌크·철강 등 여러 화물을 취급합니다. 뉴올리언스는 미시시피강과 철도·도로를 연결하는 심수항입니다.',reading:'산업 화물과 내륙 수운이 만나는 권역입니다. 수출입 물량을 볼 때 컨테이너와 에너지·벌크를 구분하고 항로 수위와 기상 영향을 함께 확인합니다.'},
    {id:'great-lakes',title:'오대호 · 덜루스·슈피리어·클리블랜드',meta:'내륙 항만 권역',sources:['duluth','lakes','ports'],fact:'오대호에도 상업 항만망이 있습니다. 덜루스·슈피리어는 철광석·곡물·석회석 같은 벌크와 일반 화물을 취급합니다.',reading:'중서부 원료·제조업 물류를 보는 축입니다. 호수 안에서 움직이는 화물과 대서양까지 나가는 국제 화물을 구분해야 합니다.'},
    {id:'alaska',title:'알래스카 · 앵커리지·코디액·더치하버',meta:'본토와 떨어진 북방 공급망',sources:['alaska','matsonAlaska'],fact:'앵커리지의 Port of Alaska는 주내 화물 유통의 거점이며, 선사는 타코마와 앵커리지·코디액·더치하버의 연결 서비스를 안내합니다.',reading:'생활물자 보급과 수산물·산업 물류를 함께 볼 수 있습니다. 알래스카 남부 항만 접근과 북극해 항해는 서로 다른 경로입니다.'},
    {id:'hawaii',title:'하와이 · 호놀룰루와 이웃 섬 항만',meta:'중부 태평양 도서 물류',sources:['matsonHawaii'],fact:'Matson은 미국 서안과 호놀룰루를 연결하고 카훌루이·힐로 등 이웃 섬 항만 서비스도 안내합니다.',reading:'본토–섬과 섬–섬 연결을 나눠 보면 물자 조달 구조가 드러납니다. 국내 해상 운송이며 국제 무역 물량에 그대로 합산하지 않습니다.'}
  ]},
  {key:'waterways',label:'해협·운하·수로',title:'해상 출입구와 내륙 수운의 연결',icon:'route',note:'자연 해협, 인공 운하, 항만 진입로와 하천은 서로 다른 시설·지형입니다. 항해 지침이나 현재 통항 허가를 제공하지 않습니다.',items:[
    {id:'juan-de-fuca',title:'후안데푸카 해협·퓨젓사운드',meta:'미국·캐나다 인접 수역',sources:['vts'],fact:'미국과 캐나다의 관제기관은 후안데푸카 해협과 인접 수역의 선박 교통을 협력 관리합니다.',reading:'시애틀·타코마 방향의 바다 출입구를 이해하는 데 중요합니다. 해협을 미국 단독 소유 자산으로 보지 않습니다.'},
    {id:'florida',title:'플로리다 해협',meta:'멕시코만–대서양 연결',sources:['florida'],fact:'멕시코만은 플로리다 해협으로 대서양과, 유카탄 해협으로 카리브해와 연결됩니다.',reading:'미국 남부 항만의 외해 접근을 보는 연결 지점입니다. 유카탄 해협은 멕시코·쿠바 사이의 해외 수로이며 미국 국내 운하가 아닙니다.'},
    {id:'unimak',title:'유니맥 수로',meta:'알래스카 · 알류샨 열도',sources:['unimak'],fact:'유니맥은 알래스카반도 남서쪽에서 베링해로 들어가는 통로이며 일부 북태평양 선박의 통과 경로이기도 합니다.',reading:'알래스카·북태평양 연결을 살펴보는 지점입니다. 베링 해협과 다른 위치이며, 실제 통과 여부는 선박·기상·배선에 따라 달라집니다.'},
    {id:'bering',title:'베링 해협',meta:'알래스카·러시아 사이 · 북극 연결',sources:['bering'],fact:'베링 해협은 태평양 쪽 바다와 북극해를 연결하는 좁고 얕은 해협입니다.',reading:'전략적 연결성은 크지만 지리적 통로의 존재가 연중 정기 컨테이너 서비스의 운영을 뜻하지 않습니다. 아래 정기 노선 목록과 구분합니다.'},
    {id:'seaway',title:'오대호–세인트로렌스 수로',meta:'미국·캐나다 공유 수로 체계',sources:['seaway'],fact:'대서양과 북미 내륙 오대호를 연결하는 호수·하천·운하 체계입니다.',reading:'내륙에서 바다까지 연결되는 강점이 있으나 갑문·선박 규격과 운항 시즌을 확인해야 합니다. 모든 외항선이 모든 호수 항만에 들어갈 수 있는 것은 아닙니다.'},
    {id:'mississippi',title:'미시시피강·지류와 하구',meta:'미국 내륙–멕시코만',sources:['nola'],fact:'뉴올리언스 항만은 미시시피강과 지류, 멕시코만 연안 수로에 연결됩니다.',reading:'내륙 벌크 화물을 바다로 보내는 연결망입니다. 수위·준설·갑문 조건과 바지선에서 외항선으로의 환적 비용을 함께 봅니다.'},
    {id:'houston-channel',title:'휴스턴 선박수로',meta:'자국 항만 진입로 · 자연 해협 아님',sources:['vts'],fact:'Houston–Galveston 관제 구역에는 휴스턴 선박수로와 여러 항만 연결 수로가 포함됩니다.',reading:'외해에서 산업시설까지 연결되지만 수로 폭·굴곡·교통 관리의 영향을 받습니다. 자연적으로 열린 해안 항만과 조건이 다릅니다.'},
    {id:'panama',title:'파나마 운하',meta:'해외 교역로 · 파나마',sources:['eia'],fact:'대서양과 태평양을 잇는 인공 운하이며 미국 영토의 수로가 아닙니다.',reading:'아시아–미국 동부·멕시코만의 일부 항로에 중요합니다. 모든 아시아발 동부 노선이 이 운하를 지나는 것은 아니며 수에즈·희망봉 경유도 배선에 따라 달라집니다.'}
  ]},
  {key:'terrain',label:'국토의 지형',title:'서부 산지·중앙 평원·동부 해안·비연속 주',icon:'mountain',note:'지형 자체와 산업·물류에 대한 해석을 구분합니다. 매장량이나 채굴 경제성, 지역별 생산 순위는 이 설명에서 추정하지 않습니다.',items:[
    {id:'pacific-ranges',title:'태평양 연안 산지와 계곡',meta:'캘리포니아·북서부',sources:['terrain'],fact:'서부 연안에는 산지와 분지·계곡이 분포하고 캘리포니아에는 넓은 평야도 있습니다.',reading:'연안 입지와 내륙 연결을 동시에 봐야 합니다. 산지를 넘는 교통망, 가용 토지와 용수에 따라 사업 입지의 비용이 달라집니다.'},
    {id:'rockies',title:'로키산맥·산간 고원과 분지',meta:'서부 내륙',sources:['terrain'],fact:'서부 내륙에는 로키산맥과 고원·분지 지형이 이어집니다.',reading:'동서 물류는 산지 통과 경로에 집중될 수 있습니다. 광물·에너지 가능성과 실제 채굴 허가·수자원·수송 능력은 별개입니다.'},
    {id:'great-plains',title:'대평원',meta:'로키산맥 동쪽',sources:['terrain'],fact:'대평원은 로키산맥 동쪽의 넓은 지형 권역이며 전체가 완전히 평평한 것은 아닙니다.',reading:'넓은 토지 활용을 볼 수 있지만 농업·에너지 사업의 경제성에는 강수·관개·송전·운송 여건이 추가로 필요합니다.'},
    {id:'central-lowlands',title:'중앙 저지대·미시시피 수계',meta:'중서부·내륙',sources:['terrain','nola'],fact:'중앙 저지대와 남쪽의 미시시피 충적평야는 서부 산지와 구별되며 내륙 하천망과 이어집니다.',reading:'내륙 시장과 수운의 연결이 강점이 될 수 있습니다. 낮은 고도만으로 홍수에 안전하거나 모든 지역이 항행 가능하다고 판단하지 않습니다.'},
    {id:'appalachians',title:'애팔래치아 고지·피드몬트',meta:'동부 내륙',sources:['terrain'],fact:'동부에는 애팔래치아 산지·고원과 해안 쪽의 피드몬트 구릉이 분포합니다.',reading:'동부 해안과 내륙 사이의 교통 통로와 산업 입지를 함께 보는 지형입니다. 산악 지역의 운송비를 국가 평균과 구분해야 합니다.'},
    {id:'coastal-plains',title:'대서양·멕시코만 해안평야',meta:'동부·남부 연안',sources:['terrain'],fact:'해안평야는 낮은 구릉에서 거의 평탄한 지형까지 포함하며 해안과 내륙을 잇습니다.',reading:'항만·산업·도시 입지에 유리할 수 있지만 저지대 침수와 폭풍 위험, 지반·방재 비용까지 함께 확인해야 합니다.'},
    {id:'alaska-land',title:'알래스카 · 산맥·내륙 고원·북부 평야',meta:'비연속 주 · 북방',sources:['alaskaTerrain'],fact:'알래스카에는 북부와 남부의 큰 산맥, 그 사이 고원·저지대와 북극 연안 평야가 분포합니다.',reading:'긴 거리와 지형 장벽은 공급망 유지 비용을 높일 수 있습니다. 남부 항만·내륙·북극 연안의 접근성을 같은 조건으로 보지 않습니다.'},
    {id:'hawaii-land',title:'하와이 · 화산섬과 고립된 해상 입지',meta:'비연속 주 · 중부 태평양',sources:['hawaiiTerrain'],fact:'하와이는 태평양의 화산섬 사슬이며 지하수는 식수와 농업용수의 주요 공급원입니다.',reading:'해상 물자 조달과 섬별 물·토지 제약을 함께 보는 것이 중요합니다. 태평양 한가운데 있다는 이유만으로 모든 국제 항로의 환적 중심지라고 보지 않습니다.'}
  ]},
  {key:'routes',label:'정기 무역항로',title:'국제 6개 · 국내 연안 2개',icon:'ship',note:'확인 시점에 선사 공식 목록에 안내된 대표 서비스입니다. 기항지는 일부 발췌이며 전체 순서·직항·양방향 동일 운항을 뜻하지 않습니다. 선박별 출항·결항·예약 가능 여부는 일정 원문에서 확인해야 합니다.',items:[
    {id:'wc2',title:'아시아–미국 서부',meta:'국제 · Hapag-Lloyd WC2 / Maersk TP8',sources:['pacific','laRotation'],schedule:'hlSchedule',connection:'부산·상하이 — 로스앤젤레스·오클랜드',fact:'선사 태평양 목록의 WC2와 LA항의 기항 안내에 연결이 등재되어 있습니다.',reading:'아시아 교역과 미국 서부 관문을 잇는 컨테이너 서비스 사례입니다. 서부 입항 후 동부까지의 철도 운송은 해상 구간과 구분합니다.'},
    {id:'us2',title:'아시아–미국 동부·서부 연계',meta:'국제 · Hapag-Lloyd US2 / Maersk TP12',sources:['pacific','laRotation'],schedule:'hlSchedule',connection:'닝보·상하이·부산 — 카르타헤나 — 뉴욕·노퍽 / LA',fact:'US2는 선사 목록에 있으며 LA항 안내에는 아시아·카르타헤나·미국 양안 기항이 포함됩니다.',reading:'동부와 서부 기항이 포함된 서비스이지 모든 구간이 양방향 직항인 것은 아닙니다. 실제 운하 경유와 기항 순서는 해당 항차에서 확인합니다.'},
    {id:'al2',title:'북유럽–미국 북동부',meta:'국제 · Hapag-Lloyd AL2',sources:['atlantic'],schedule:'hlSchedule',connection:'함부르크·로테르담·르아브르 — 뉴욕·노퍽·필라델피아',fact:'선사의 AL2 서비스·터미널 목록에 이들 항만이 표시되어 있습니다.',reading:'유럽과 미국 북동부의 해상 교역을 보는 사례입니다. 표기된 항만 사이의 순서나 전체 소요 시간을 이 목록에서 추정하지 않습니다.'},
    {id:'al3',title:'북유럽–미국 남동부',meta:'국제 · Hapag-Lloyd AL3',sources:['atlantic'],schedule:'hlSchedule',connection:'함부르크·앤트워프·런던게이트웨이 — 노퍽·서배너·찰스턴',fact:'선사의 AL3 서비스·터미널 목록에 북유럽과 미국 남동부 연결이 표시됩니다.',reading:'미국 남동부 시장에 대한 해상 접근 사례입니다. 같은 대서양 노선이라도 미국 북동부 노선과 배후 지역이 다릅니다.'},
    {id:'al4',title:'북유럽–미국 멕시코만 연안',meta:'국제 · Hapag-Lloyd AL4',sources:['atlantic'],schedule:'hlSchedule',connection:'함부르크·앤트워프·르아브르 — 휴스턴',fact:'AL4 목록에는 휴스턴 기항과 멕시코 항만 연결이 안내됩니다. 뉴올리언스는 알타미라 환적으로 별도 표기됩니다.',reading:'휴스턴 직기항과 환적 연결을 구분해야 합니다. 내륙 산업 화물의 조달·판매 경로를 볼 때 해상 운임 외에 환적 비용도 확인합니다.'},
    {id:'aax',title:'알래스카–아시아',meta:'국제 · Matson Alaska–Asia Express (AAX)',sources:['matsonAsia'],schedule:'matsonSchedule',connection:'더치하버 → 닝보·상하이',fact:'Matson은 더치하버에서 닝보·상하이로 향하는 서향 서비스를 안내하며, 다른 아시아 목적지는 파트너망 연결을 구분합니다.',reading:'알래스카의 아시아 수출 연결 사례입니다. 반대 방향에도 동일한 직항 서비스가 있다고 해석하지 않습니다.'},
    {id:'hawaii-service',title:'미국 서부–하와이',meta:'국내 연안 · Matson Hawaii Service',sources:['matsonHawaii'],schedule:'matsonSchedule',connection:'롱비치·오클랜드 — 호놀룰루 / 이웃 섬 연결',fact:'Matson은 본토 서안에서 하와이로 향하는 정기 서비스와 이웃 섬 연결을 안내합니다.',reading:'하와이 물자 조달망을 보는 국내 운송 사례입니다. 국제 수출입과는 별도이며 화물 종류와 섬에 따라 운항편·환적 조건이 다릅니다.'},
    {id:'alaska-service',title:'미국 북서부–알래스카',meta:'국내 연안 · Matson Alaska Service',sources:['matsonAlaska'],schedule:'matsonSchedule',connection:'타코마 — 앵커리지·코디액·더치하버',fact:'Matson은 타코마와 알래스카의 세 항만을 잇는 서비스를 안내합니다.',reading:'본토와 알래스카 공급망을 연결하는 국내 노선입니다. 북극해 통과 서비스가 아니며 각 항만의 빈도와 기항 순서는 일정 원문을 따릅니다.'}
  ]}
];

export function usRouteReviewLabel(now=Date.now()){
  const checked=Date.parse(`${US_GEOGRAPHY_REVIEWED}T00:00:00+09:00`);
  if(!Number.isFinite(now)||now<checked)return '확인 날짜 점검 필요';
  return now-checked>=30*86400000?'확인 후 30일 경과 · 원문 재확인 필요':'공식 서비스 안내 확인 · 항차별 운항 미확인';
}
