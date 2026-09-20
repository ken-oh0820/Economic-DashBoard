# Country statistics

The map and country profile use a checked-in World Bank World Development
Indicators (source 2) snapshot. Browsers request only `data/country-data.json`.
No API key is needed. The weekly workflow runs at 23:17 UTC Sunday (08:17 KST
Monday); GitHub scheduling can be delayed. It also supports manual dispatch.

## Sources and attribution

The explicit 14-indicator allowlist is in `assets/country-data.mjs`. Each
indicator's `https://data.worldbank.org/indicator/{id}` page was reviewed on
2026-09-21 and labeled CC BY 4.0. The snapshot stores World Bank's
`sourceOrganization` and `sourceNote`, and the UI links to the specific
indicator/country, original organizations, license and World Bank terms.
This is not a blanket assumption that every World Bank or third-party dataset
has identical reuse rights. Review newly added indicators separately.

- API: https://api.worldbank.org/v2/
- Documentation: https://datahelpdesk.worldbank.org/knowledgebase/articles/898581
- Terms: https://data.worldbank.org/summary-terms-of-use
- License: https://creativecommons.org/licenses/by/4.0/

## Comparison rules

- Collect the last six completed calendar years, not forecasts for the current
  year. Annual published observations may still be estimates or revised later.
- Map metrics choose the newest year with 85% coverage of the 100 registered
  countries. If none meets that threshold, use the year with the most data
  (most recent year breaks ties). Display both year and coverage.
- Never fill missing countries in that comparison with older observations.
  GDP ranks use competition ranking (ties share a rank). These are not full
  worldwide ranks. The GDP header sums only covered registered countries.
- Profile GDP uses the same year as map GDP and ranking. Other profile metrics
  show each series' latest non-null observation in the collection window and
  clearly label its year; these can differ from map comparison values.
- Trade equals exports plus imports of goods AND services for the same year.
  It is not goods-only customs trade. It is not a trade balance.
- GDP/GNI amounts are current USD; GDP per capita and Atlas-method GNI per
  capita retain separate definitions. Real GDP growth is the published series,
  not a calculation from nominal USD values.
- Unemployment is the modeled ILO annual estimate; CPI inflation is annual.
  Neither is the latest monthly domestic release.
- Population age shares are demographic estimates, not employment ratios.
- Null values stay unavailable; zero and negative growth/inflation are valid.
  Unit conversion, rounding, translation and trade summation are local changes.
- Old unverified economic and debt numbers are no longer shown. Industry,
  resource and alliance layers remain separately labeled legacy editorial data.

## Failure behavior

All API pages must be complete and consistent. A failed indicator collection
retains its previous data and original successful collection time, marked
`stale`; without previous data it is `unavailable`. The job reports failure
even when it publishes healthy series and stale-state metadata. Independently,
the UI warns after 14 days without successful collection. Observation year,
World Bank database update date and local collection date are separate fields.
If the browser cannot load the snapshot, statistics remain unavailable; it does
not substitute old hard-coded numbers.

Run `node scripts/update-country-data.mjs` to refresh and
`node --test scripts/country-data.test.mjs scripts/country-profile.test.mjs`
to check the data pipeline and profile behavior.
