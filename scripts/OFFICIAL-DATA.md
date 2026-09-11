# Official economic data

The `Update Official Economic Data` Actions workflow reads `FRED_API_KEY` only
from the repository Actions secret. Never put a key in browser code, JSON, logs,
URLs shared with users, or a commit. API requests run on GitHub, not in browsers.

Schedule: every three hours at minute 37 UTC, plus manual workflow dispatch.
GitHub scheduling, FRED ingestion, and Pages deployment can add delays. This is
not a real-time trading feed. Observation dates are periods, not publication dates.
The browser rechecks the published snapshot at most once per five minutes.

Only the explicit US government series allowlist is collected. Every run also
requires FRED's `Public Domain: Citation Requested` series tag. An absent tag or
failed rights check removes that series from the published snapshot. An upstream
observation failure after a successful rights check retains the last good series
with a stale flag. Partial failures publish available data and fail the workflow
so the owner can see the problem. Pages builds are explicitly requested because
commits made by GITHUB_TOKEN do not automatically trigger a legacy Pages build.

- BLS: CPI, core CPI, final-demand PPI (PPIFIS, not PPIACO), core PPI, unemployment,
  payrolls and hourly earnings. https://www.bls.gov/bls/linksite.htm
- BEA: GDP, real GDP, PCE prices and GDP deflator.
  https://www.bea.gov/help/faq/147
- Federal Reserve: Treasury constant-maturity yields and monthly effective funds.
- FRED API terms and attribution: https://fred.stlouisfed.org/legal/
- Official observations API: https://fred.stlouisfed.org/docs/api/fred/series_observations.html

GDP/real GDP are seasonally adjusted annual rates. CPI/core CPI/PPI/core PPI/PCE
cards show YoY and MoM changes; payrolls show the monthly change in thousands.
10Y minus 3M uses matching observation dates. Bond changes are percentage points,
previous available observation and a calendar-month-earlier observation (at or
before that date, no more than seven days earlier). No interpolation.

ICE/BofA, VIX, mortgage, foreign yields and other unreviewed market data remain
links. No Yahoo routes or FRED website/CSV/image extraction are restored. Adding
an API key is not permission to redistribute every series offered by FRED.
This narrows risk; it is not legal advice or a guarantee for the entire website.
