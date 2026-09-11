# 🌐 Economic DashBoard — 글로벌 경제 대시보드 2026

99개국 경제 데이터를 인터랙티브 세계지도 위에 시각화한 대시보드입니다.

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 📊 경제 지표 | GDP · 무역규모 · 실업률 · 인플레이션율 |
| 🗺️ 지도 오버레이 | NATO · BRICS · G7 · 정치체제 · 천연자원 (석유/가스 생산·수출 TOP10) |
| 💱 일간 환율 | ExchangeRate-API의 일간 기준 환율 |
| 🛢️ 원자재 | 에너지·금 시장 지표는 원문 링크, 지도 귀금속 패널은 별도 제공처 |
| 📰 글로벌 뉴스 | Google/BBC/NYT 경제 뉴스 실시간 피드 |
| 🌙 다크/라이트 | 테마 전환 지원 |

## 🚀 배포

GitHub Pages에서 저장소 루트를 배포합니다. `assets/`, `data/`, 연준 앱 파일도 함께 필요합니다.

1. 이 저장소를 GitHub에 생성
2. Settings → Pages → Source: `main` / `/ (root)` → Save
3. `https://유저명.github.io/economic-atlas/` 에서 접속

## 📡 주요 외부 연결

- **지도 타일**: [CartoDB](https://carto.com/) (dark/light nolabels)
- **국경 데이터**: [Natural Earth TopoJSON](https://github.com/topojson/world-atlas) via jsDelivr
- **환율**: [ExchangeRate-API](https://www.exchangerate-api.com/)의 공개 일간 API
- **에너지·시장 지표**: TradingView 등 제공처 원문 링크 (Yahoo 수집 없음)
- **미국 매크로·미국 국채**: FRED 공식 API로 BLS·BEA·Federal Reserve 공개 통계를 3시간마다 확인. 서버에서 API 키 사용, 사이트는 공개 스냅샷만 조회
- **모기지·ICE 하이일드·미확인 시장 지표**: 원문 링크 유지. FRED 웹페이지/CSV/차트 이미지 추출 없음
- **Treasury 포지션**: OFR/CFTC 공식 API
- **뉴스**: Google News / BBC / NYT RSS via rss2json + allorigins

## 📊 데이터 출처

- IMF World Economic Outlook (Oct 2025)
- EIA / Energy Institute Statistical Review 2025
- USGS Mineral Commodity Summaries 2025
- World Nuclear Association 2024

## 📝 라이선스

프로젝트 코드: MIT License. 외부 데이터·상표·이미지의 사용권까지 포함하지 않습니다.

## 데이터 접근 변경 (2026-09-11)

2026-09-12 업데이트: [공식 데이터 연결 정책](scripts/OFFICIAL-DATA.md)에 따라
명시적으로 허용한 미국 정부 통계만 FRED 공식 API로 복원합니다. 매번 공개 도메인
분류를 확인하며, API 키가 있다는 이유로 모든 FRED 자료를 재배포하지 않습니다.
아래 내용은 이전 변경 이력입니다.

법적 위험 점검 1~3번에 따라 Yahoo 자동 시세/차트 수집, FRED CSV/이미지 추출,
ICE BofA 하이일드 수치 재표시를 제거했습니다. 국채·모기지·글로벌 정책금리 및
FRED 의존 매크로는 외부 링크로 전환했고, 배포 스냅샷의 FRED 값도 삭제했습니다.
SOFR는 뉴욕 연준 원문으로 연결합니다. 링크 대상의 약관과 접근 제한은 그대로 적용됩니다.

이 변경은 전체 사이트의 법적 적합성을 보장하지 않습니다. CNN·뉴스·귀금속 등
다른 제공처와 기존 이미지의 권리는 이번 범위 밖입니다. 과거 Git 이력 및 별도로
배포된 Cloudflare Worker의 코드는 이 저장소 변경만으로 삭제되지 않습니다.
