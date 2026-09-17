// Editorial summaries, not provider text or additional market-data requests.
const entry = (definition, reading, caution, source) => ({definition, reading, caution, source});
const cpiSource = 'https://www.bls.gov/cpi/questions-and-answers.htm';
const jobsSource = 'https://www.bls.gov/ces/';
const gdpSource = 'https://www.bea.gov/data/gdp/gross-domestic-product';
export const INDICATOR_EXPLANATIONS = {
  fng: entry('CNN이 미국 주식시장의 공포와 탐욕을 0~100으로 표현하는 시장 심리 지수입니다.', '낮은 값은 공포, 높은 값은 탐욕 쪽의 심리를 뜻합니다. 점수의 방향과 가격·거래량을 함께 비교합니다.', '암호화폐 공포탐욕지수와는 별개입니다. 극단적인 값도 지속될 수 있으므로 매수·매도 신호로 단정하지 않습니다.', 'https://www.cnn.com/markets/fear-and-greed'),
  cfng: entry('Alternative.me가 제공하는 비트코인 중심의 시장 심리 지수입니다. 0은 극단적 공포, 100은 극단적 탐욕을 뜻합니다.', '최근 점수의 변화로 시장 심리가 어느 쪽으로 이동하는지 봅니다.', 'CNN 지수와 대상·구성 방식이 다르며 모든 암호화폐의 상태를 대표하지는 않습니다. 투자 수익을 예측하는 지표가 아닙니다.', 'https://alternative.me/crypto/fear-and-greed-index/'),
  vix: entry('S&P 500 옵션 가격에 반영된 가까운 미래의 예상 변동성을 나타내는 Cboe 지수입니다.', '상승은 시장이 더 큰 가격 변동을 반영한다는 뜻입니다. 주가 방향보다는 불확실성의 정도를 봅니다.', '주가 하락률이나 공포탐욕 점수가 아닙니다. VIX 현물 지수와 VIX 선물·연계 상품의 수익률도 다릅니다.', 'https://www.cboe.com/tradable-products/vix/'),
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
