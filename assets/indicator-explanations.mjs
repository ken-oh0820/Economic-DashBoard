// Editorial summaries, not provider text or additional market-data requests.
const entry = (definition, reading, caution, source) => ({definition, reading, caution, source});
const cpiSource = 'https://www.bls.gov/cpi/questions-and-answers.htm';
const jobsSource = 'https://www.bls.gov/ces/';
const gdpSource = 'https://www.bea.gov/data/gdp/gross-domestic-product';
export const INDICATOR_EXPLANATIONS = {
  fng: entry('CNN이 미국 주식시장의 공포와 탐욕을 0~100으로 표현하는 시장 심리 지수입니다.', '낮은 값은 공포, 높은 값은 탐욕 쪽의 심리를 뜻합니다. 점수의 방향과 가격·거래량을 함께 비교합니다.', '암호화폐 공포탐욕지수와는 별개입니다. 극단적인 값도 지속될 수 있으므로 매수·매도 신호로 단정하지 않습니다.', 'https://www.cnn.com/markets/fear-and-greed'),
  cfng: entry('Alternative.me가 제공하는 비트코인 중심의 시장 심리 지수입니다. 0은 극단적 공포, 100은 극단적 탐욕을 뜻합니다.', '최근 점수의 변화로 시장 심리가 어느 쪽으로 이동하는지 봅니다.', 'CNN 지수와 대상·구성 방식이 다르며 모든 암호화폐의 상태를 대표하지는 않습니다. 투자 수익을 예측하는 지표가 아닙니다.', 'https://alternative.me/crypto/fear-and-greed-index/'),
  vix: entry('시카고 연준 NFCI의 위험 하위지수입니다. 변동성과 자금조달 위험을 반영하는 주간 지수입니다.', '0보다 높으면 해당 위험 여건이 장기 평균보다 긴축적이고, 낮으면 완화적입니다.', 'VIX 대신 사용하는 공개 참고 지표입니다. 옵션 내재변동성이나 0~100 공포 점수가 아니며 VIX의 20·30 기준을 적용하면 안 됩니다.', 'https://fred.stlouisfed.org/series/NFCIRISK'),
  dxy: entry('연준의 명목 광의 무역가중 달러지수입니다. 2006년 1월=100 기준입니다.', '상승하면 주요 교역 상대국 통화 바스켓 대비 달러가 강해졌다는 뜻입니다.', 'ICE DXY와 구성 통화·가중치·기준 시점이 달라 수준을 직접 비교할 수 없습니다.', 'https://fred.stlouisfed.org/series/DTWEXBGS'),
  hy: entry('시카고 연준 NFCI의 신용 하위지수로 신용 여건을 나타냅니다.', '양수는 평균보다 긴축적, 음수는 완화적인 신용 여건을 뜻합니다.', '하이일드 채권의 옵션조정 스프레드 OAS가 아닙니다. 단위는 %가 아닌 지수입니다.', 'https://fred.stlouisfed.org/series/NFCICREDIT'),
  wti: entry('EIA가 제공하는 미국 Cushing의 WTI 일간 현물가격입니다. 단위는 달러/배럴입니다.', '현물 원유 가격과 이전 관측값 대비 변화율을 확인합니다.', '거래소 원유 선물 최근월물이나 실시간 체결 가격과는 다릅니다.', 'https://fred.stlouisfed.org/series/DCOILWTICO'),
  brent: entry('EIA가 제공하는 유럽 Brent 일간 현물가격입니다. 단위는 달러/배럴입니다.', 'WTI 현물과 같은 날짜를 비교해 가격 차이의 흐름을 봅니다.', '거래소 선물 가격과 다르며 일간 관측값도 발표 시차가 있습니다.', 'https://fred.stlouisfed.org/series/DCOILBRENTEU'),
  dubai: entry('IMF의 두바이유 월평균 가격입니다. 단위는 달러/배럴입니다.', '해당 관측월의 평균 수준과 전월 변화를 확인합니다.', '오늘 시세가 아니며 WTI·Brent의 특정일 가격과 직접 비교하지 않습니다.', 'https://fred.stlouisfed.org/series/POILDUBUSDM'),
  usdjpy: entry('연준 H.10의 달러당 엔 환율입니다. 1달러에 해당하는 엔화 수입니다.', '수치 상승은 달러 강세·엔 약세, 하락은 엔 강세를 뜻합니다.', '공식 일간 관측값으로 실시간 매수·매도 호가가 아닙니다.', 'https://fred.stlouisfed.org/series/DEXJPUS'),
  eurusd: entry('연준 H.10의 유로당 달러 환율입니다. 1유로에 해당하는 달러 수입니다.', '수치 상승은 유로 강세·달러 약세를 뜻합니다.', '달러/엔과 표시 방향이 다릅니다. 실시간 환전 호가가 아닙니다.', 'https://fred.stlouisfed.org/series/DEXUSEU'),
  sofr: entry('미국 국채 담보 익일물 Repo 거래의 조달금리를 나타내는 거래금액 가중 중앙값입니다.', '다른 단기금리와 비교하여 국채 담보 현금 조달 비용을 봅니다.', '전 영업일 거래를 바탕으로 발표하며 표시는 연율입니다. 특정 기관의 실제 차입금리와 다를 수 있습니다.', 'https://www.newyorkfed.org/markets/reference-rates/sofr'),
  iorb: entry('연준이 적격 금융기관의 준비금 잔액에 지급하는 정책 운용 이자율입니다.', 'SOFR와 비교해 시장 조달금리와 준비금 이자율 사이 차이를 봅니다.', '준비금 총량을 나타내는 지표가 아니며 모든 시장금리의 절대적 하한선도 아닙니다.', 'https://www.federalreserve.gov/monetarypolicy/reserve-balances.htm'),
  tgcr: entry('미국 국채를 담보로 하는 익일물 삼자간 일반담보 Repo 거래의 거래금액 가중 중앙값입니다.', 'SOFR·IORB와 함께 담보부 달러 조달 비용을 비교합니다. GCF Repo와 연준이 거래 상대방인 거래는 제외합니다.', '전체 Repo 시장의 모든 거래를 포괄하지 않습니다. 전 영업일 거래 관측값이며 실시간 호가가 아닙니다.', 'https://fred.stlouisfed.org/series/TGCRRATE'),
  srf: entry('상설 Repo 제도에서 연준이 적격 거래 상대방에게 담보를 받고 자금을 공급할 때 적용하는 운영금리입니다. FRED의 SRFTSYD 시리즈입니다.', '시장 Repo 금리가 연준 운영금리와 얼마나 가까운지 비교하여 조달 여건을 살펴봅니다.', 'SRF 이용금액이나 민간시장 실제 거래금리가 아닙니다. 이 금리만으로 자금시장 스트레스를 확정할 수 없습니다.', 'https://fred.stlouisfed.org/series/SRFTSYD'),
  'repo-spread': entry('동일한 관측일의 SOFR에서 IORB를 뺀 차이입니다. 단위는 %포인트입니다.', '차이가 커질수록 준비금 이자율 대비 Repo 조달금리가 높아진 것입니다.', 'Cash-Futures Basis/OABNOC 수익률이 아닙니다. 분기 말 일시적 상승을 포함해 지속 기간을 함께 봅니다.', 'https://www.newyorkfed.org/markets/reference-rates/sofr'),
  'treasury-vol': entry('미국 10년 국채 금리의 최근 20거래일 일간 변화에 대한 표본 표준편차에 √252를 곱한 자체 계산값입니다.', '연율화 bp 단위로 최근 실현된 금리 움직임의 크기를 비교합니다.', 'MOVE 내재변동성과 산식·단위가 다르고 국채 호가나 시장 깊이를 직접 측정하지 않습니다.', 'https://fred.stlouisfed.org/series/DGS10'),
  'bond-us-mortgage30': entry('Freddie Mac PMMS의 미국 30년 고정 주택담보대출 평균 금리입니다. 국채 금리가 아닙니다.', '주택 구입자의 금융 비용과 국채 금리 대비 차이를 함께 봅니다.', '주간 평균이며, 개인에게 제시되는 금리는 신용도·계약 조건에 따라 다릅니다. 이 사이트에서는 제공처 원문으로 연결합니다.', 'https://www.freddiemac.com/pmms'),
  'macro-cpi': entry('도시 소비자가 구매하는 상품·서비스의 가격 변화를 측정합니다. 차트는 CPI 지수의 전년 동월 대비 상승률입니다.', '상승률이 높아지면 물가 상승 속도가 빨라진 것입니다. 전월 대비 변화와 주거비·에너지 등 세부 항목도 함께 봅니다.', '상승률 하락은 가격 수준 하락과 다릅니다. 계절조정 여부와 기저효과에 따라 보도 수치와 차이가 날 수 있습니다.', cpiSource),
  'macro-core-cpi': entry('CPI에서 식품과 에너지를 제외한 근원 소비자물가입니다. 차트는 전년 동월 대비 상승률입니다.', '변동성이 큰 항목을 제외한 물가 흐름을 보되 주거비와 서비스 물가를 함께 확인합니다.', '식품·에너지를 제외한다고 모든 일시적 변동이 사라지는 것은 아닙니다. Core PCE와는 대상과 가중치가 다릅니다.', cpiSource),
  'macro-ppi': entry('국내 생산자가 판매하는 최종 수요 상품·서비스의 가격 변화를 측정합니다. 차트는 전년 동월 대비 상승률입니다.', '생산 단계의 가격 압력과 소비자물가의 차이를 비교합니다.', '생산자 가격 변화가 소비자 가격으로 그대로 전가되지는 않습니다. 수요와 기업 마진도 영향을 줍니다.', 'https://www.bls.gov/ppi/overview.htm'),
  'macro-core-ppi': entry('여기서는 최종 수요 PPI 중 식품·에너지·무역서비스를 제외한 WPSFD49116 시리즈를 사용합니다.', '전년 동월 대비 상승률로 해당 항목을 제외한 생산자 가격 흐름을 봅니다.', '식품·에너지만 제외한 다른 Core PPI와 범위가 다릅니다. 같은 이름이라도 시리즈 정의를 확인해야 합니다.', 'https://fred.stlouisfed.org/series/WPSFD49116'),
  'macro-unrate': entry('경제활동인구 중 실업자의 비율인 U-3 실업률입니다. 차트는 증감률이 아닌 실업률 수준입니다.', '고용 약화 여부를 경제활동참가율과 비농업고용 증감에 대조합니다.', '구직을 멈춘 사람은 실업자로 분류되지 않을 수 있습니다. 실업률 하락만으로 고용 개선을 단정하지 않습니다.', 'https://www.bls.gov/cps/definitions.htm'),
  'macro-payems': entry('사업체 조사로 집계한 비농업 부문 일자리 수의 전월 대비 순증감입니다.', '양수는 전월보다 일자리가 늘었다는 뜻입니다. 최근 몇 달의 평균과 이전 발표치 수정도 함께 봅니다.', '사람 수가 아닌 일자리 수이며, 월별 자료는 수정됩니다. 실업률은 별도 가계조사에서 나옵니다.', jobsSource),
  'macro-ahe': entry('민간 비농업 부문 근로자의 평균 시간당 임금입니다. 차트는 전년 동월 대비 증가율입니다.', '임금의 구매력은 물가 상승률과 비교하고, 고용·노동시간 변화도 함께 봅니다.', '평균 임금은 고임금·저임금 일자리 구성 변화의 영향을 받습니다. 모든 근로자의 임금 인상률을 뜻하지 않습니다.', jobsSource),
  'macro-ngdp': entry('미국 내에서 생산된 최종 재화·서비스의 가치를 현재 가격으로 나타낸 명목 GDP입니다.', '차트는 계절조정 연율 환산 규모입니다. 경제 규모가 커진 원인이 생산 증가인지 물가 상승인지 실질 GDP와 비교합니다.', '분기 중 실제 지출 합계나 성장률이 아닙니다. 명목 GDP 증가에는 물가 변화가 포함됩니다.', gdpSource),
  'macro-rgdp': entry('가격 변동을 조정한 실질 GDP입니다. 차트는 연쇄가격 기준의 계절조정 연율 환산 규모입니다.', '생산량의 추세를 보고, 성장 기여도가 소비·투자·정부지출·순수출 중 어디에서 왔는지 확인합니다.', '규모와 전분기 성장률을 구분해야 합니다. 속보치 이후 수정될 수 있습니다.', gdpSource),
  'macro-inflation': entry('개인소비지출 PCE 가격지수의 전년 동월 대비 상승률입니다. 식품·에너지를 포함한 전체 지수입니다.', '소비 전반의 물가 추세를 CPI 및 근원 PCE와 비교합니다.', '이 항목은 Core PCE가 아닙니다. CPI와는 포괄 범위·가중치·계산 방식이 달라 수치가 같지 않을 수 있습니다.', 'https://www.bea.gov/data/personal-consumption-expenditures-price-index'),
  'macro-gdpdef': entry('국내 생산 전체의 가격 변화를 나타내는 GDP 디플레이터입니다. 차트는 전분기 대비 변화를 연율화한 값입니다.', '계산은 [(이번 분기 지수 / 전분기 지수)^4 - 1] × 100입니다. 소비자물가보다 넓은 국내 생산 가격 범위를 봅니다.', '전년 동기 대비 수치가 아닙니다. 수입품을 직접 포함하지 않아 CPI·PCE와 범위가 다릅니다.', 'https://fred.stlouisfed.org/series/GDPDEF'),
  'rate-us': entry('실제로 거래된 연방기금금리의 월평균입니다. FOMC가 정하는 목표금리 범위와 구분합니다.', '단기 달러 조달 환경과 정책금리 변화가 실제 거래금리에 반영되는 흐름을 봅니다.', '월평균이므로 최근 회의 직후의 금리나 오늘의 일간 금리와 다를 수 있습니다.', 'https://fred.stlouisfed.org/series/FEDFUNDS'),
  'bond-us-spread': entry('미국 국채 10년물 수익률에서 3개월물 수익률을 뺀 금리 차입니다. 단위는 %포인트입니다.', '음수이면 단기금리가 장기금리보다 높은 역전 상태입니다. 차이가 움직인 원인을 각각의 금리에서 확인합니다.', '역전이나 역전 해소만으로 경기침체 시점 또는 주가 방향을 확정할 수 없습니다.', 'https://fred.stlouisfed.org/series/T10Y3M')
};

export function indicatorExplanation(key) {
  if (INDICATOR_EXPLANATIONS[key]) return INDICATOR_EXPLANATIONS[key];
  if (/^bond-us-(3m|1y|2y|5y|10y|20y|30y)$/.test(key)) return entry(
    '해당 만기의 미국 국채 시장 수익률을 일정 만기 기준으로 나타낸 금리입니다. 채권 가격 자체가 아닙니다.',
    '전일·전월 대비 금리 차와 다른 만기의 움직임을 함께 비교합니다. 금리 차의 단위는 %포인트입니다.',
    '일반적으로 같은 채권의 가격과 수익률은 반대로 움직입니다. 금리 변화를 채권 투자 수익률로 읽으면 안 됩니다.',
    'https://www.federalreserve.gov/releases/h15/');
  return null;
}
