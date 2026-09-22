# Country statistics

The map and country profile use a checked-in World Bank World Development
Indicators (source 2) snapshot. Browsers request only `data/country-data.json`.
No API key is needed. The weekly workflow runs at 23:17 UTC Sunday (08:17 KST
Monday); GitHub scheduling can be delayed. It also supports manual dispatch.

## Sources and attribution

The explicit 34-indicator allowlist is in `assets/country-data.mjs`. Each
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
- Old unverified economic and debt numbers are no longer shown. Legacy industry
  notes are collapsed and explicitly unverified. Resource and alliance layers
  remain separately labeled legacy editorial data.

## Industry structure (stage 3)

Nine additional WDI indicators have individually reviewed CC BY 4.0 indicator
pages (2026-09-21): NV.SRV.TOTL.ZS, NV.IND.TOTL.ZS, NV.AGR.TOTL.ZS,
NV.IND.MANF.ZS, NE.EXP.GNFS.ZS, TX.VAL.MANF.ZS.UN, TX.VAL.TECH.MF.ZS,
BX.GSR.CCIS.ZS and GB.XPD.RSDV.GD.ZS. Upstream source organizations, including
UN/WITS, IMF and UNESCO, are retained in the snapshot and UI attribution.

The industry tab contains nine compact disclosures with denominator, year,
reading/caution, source and collection date. Three-year changes subtract the
exact year-minus-three observation in percentage points; missing baselines are
not interpolated. Peer medians use only registered countries with an observation
in the selected country's observation year, with equal country weights. Medians
are suppressed with fewer than ten valid peers and coverage is always shown.
No competitiveness score, world ranking or investment recommendation is inferred.

The profile headline compares services, industry and agriculture only in their
latest common year for that country. Manufacturing is a subset of industry, not
a fourth additive sector. Ratios are not normalized to sum to 100. Export/GDP
can exceed 100 because gross trade and domestic value added are different
concepts; its bar scale expands and displays its maximum. R&D uses a separate,
labeled scale. Export metrics have distinct denominators: GDP, merchandise
exports, manufactured exports, or service exports.

Detailed commodity TOP 10 is NOT connected in this stage. A normal link to
https://comtradeplus.un.org/ is provided; no direct Comtrade collection or raw
data redistribution is added. The WDI summary series with their own published
license are not treated as permission for arbitrary Comtrade datasets. Before
adding detailed trade rankings, separately check publication/access conditions:
https://uncomtrade.org/docs/faqs-on-use-and-re-dissemination/ and
https://comtradeplus.un.org/LicenseAgreement . A commodity-export ranking would
not represent service sectors or overall industry competitiveness.

## Resources and geography (stage 4)

Seven additional indicator pages were individually checked for CC BY 4.0 on
2026-09-21: AG.LND.TOTL.K2, AG.LND.ARBL.ZS, AG.LND.FRST.ZS, ER.H2O.INTR.PC,
NY.GDP.TOTL.RT.ZS, TX.VAL.FUEL.ZS.UN and TX.VAL.MMTL.ZS.UN. The source links
follow https://data.worldbank.org/indicator/{indicator}. FAO/AQUASTAT, World
Bank estimates and UN/WITS attributions are retained from API metadata.

The country tab shows seven compact disclosures grouped into natural foundations
and the resource economy. Each reports its original unit, denominator, observation
year, source link, interpretation limits and collection timestamp. Observations
more than three calendar years old carry an age label independently of collection
freshness. No trend or ranking is invented from mixed-year resource statistics.

Land area excludes inland water, and is not EEZ or developable land. Arable land
is not total agricultural land or food self-sufficiency. Forest cover is not
harvestable timber. Internal renewable freshwater uses long-term average annual
flow divided by population: it is not annual rainfall, water delivered, current
drought severity, or external inflows. Natural resource rents are estimated
economic surplus, not revenue, taxes, company net income, or reserves. Fuel and
metal exports may include processing and re-exports; they do not establish
domestic deposits. Percentage values keep two decimals; physical quantities are
rounded to whole units without currency conversion.

Mineral reserves, economically recoverable quantities, and country-specific
ports/straits/terrain are NOT connected. USGS and EIA are normal source links,
not scraped data. Legacy resource notes stay collapsed and explicitly unverified;
they do not become validated by the new WDI statistics. The existing legacy map
resource overlay is unchanged.

## Military and diplomacy (stage 5)

Four WDI indicator pages were individually checked for CC BY 4.0 on 2026-09-22:
MS.MIL.XPND.CD, MS.MIL.XPND.GD.ZS, MS.MIL.XPND.ZS and MS.MIL.TOTL.P1.
Their WDI source organizations are SIPRI (spending) and IISS (personnel).
This does not grant permission to redistribute arbitrary SIPRI/IISS publications.
The collector uses only the corresponding allowlisted World Bank API series.

Military spending is nominal current USD, shown in Korean hundred-million-dollar
units independently of the dashboard currency toggle. The GDP and general
government expenditure ratios have different denominators and are not replaced
by calculations from other WDI series. Personnel includes active personnel and
qualifying paramilitary forces, not all reservists. Its latest WDI observations
can be old (the reviewed page ends in 2020); age and missing data remain explicit.
No observation window is extended merely to make missing figures look current.
Year-over-year changes require the exact prior year: percent for USD/personnel,
percentage points for spending shares. Nonpositive growth baselines are suppressed.
Neither a combat-power score nor a military-strength rank is calculated.

NATO membership (32 countries) was manually checked against
https://nato.int/en/about-us/organization/nato-member-countries on 2026-09-22.
The seven G7 countries and EU participation were checked against
https://www.consilium.europa.eu/en/meetings/international-summit/2026/06/15-17/ .
The check date is static and visible, not automatically refreshed with WDI data.
Nonmembership is not interpreted as absence of bilateral alliances or partnerships.
BRICS links to https://brics.br/en/about-the-brics (2025 Brazil presidency) and
does not infer membership from the old map classification. G7 and BRICS are not
military alliances. The legacy map overlays remain explicitly unverified and
separate from the sourced country-profile membership facts.

## Country comparison (stage 6)

The native modal compares up to three distinct registered countries across five
tabs and all 34 allowlisted series plus same-year total trade. The map is not
resized. Selections survive dialog closure during the page session; reset clears
them. Opening from a country profile puts that country first while retaining up
to two other selections. Duplicate choices are disabled in the native selectors.

For each indicator, the table takes the latest year in the intersection of all
selected countries' observations. Without a common year, every cell remains
unavailable. The table never mixes each country's latest year, interpolates, or
uses a missing value as zero. Trade first requires matching export/import years
inside each country and then the same common year across countries. Comparison
years can therefore differ from the map, individual profiles, and adjacent rows.

All amounts use nominal USD regardless of the global currency toggle. Each row
shows its year and denominator, with age warnings over three calendar years and
separate collection-delay labels. Original per-country WDI links and upstream
organizations are retained. The new view makes no new external data requests,
collection workflow, strength score, or ranking. Missing-data countries may
prevent a particular row from being compared even when others have data.

## Full Country and Area Registry

`data/country-registry.json` now contains all 217 non-aggregate World Bank
economies returned on 2026-09-22, replacing the manually selected 100 countries.
The original response is retained in `data/country-registry-source.json`.
Entries with `region.id === "NA"` (world, income groups, regional aggregates)
are excluded. Coverage is a statistical classification, not a sovereignty claim;
it does not imply every territory on the map is included in the World Bank list.

Provider ISO2 codes are stored explicitly, including JG for Channel Islands.
Unicode CLDR numeric mappings are retained in `data/country-code-mappings.json`
with `data/UNICODE-LICENSE.txt`. Korean names use Node's ICU/CLDR display names
with a small explicit naming override table. World Bank regional classifications
are used consistently, with Korean translations; they are not physical continents.

Refresh the two recorded source URLs in the registry, then run
`node scripts/update-country-registry.mjs` and
`node scripts/update-country-data.mjs` to rebuild the reviewed registry and data.
The weekly workflow refreshes all allowlisted indicators for the full committed
registry; it does not silently add new identities without review.

The browser loads the bundled registry before statistics. Registry failure is
shown explicitly, never as zero countries; statistics failure still permits
search and country selection. Search supports Korean/English names and provider
codes. Country comparison includes all registered economies.

Existing numeric map IDs remain stable. Missing boundary mappings are not guessed
from names. Search opens the profile even without a boundary; a selected location
marker uses an existing label position, the World Bank reference coordinate, or
the matching boundary's center. Markers are reference points, not national borders.
No coordinates are invented for entries with neither boundaries nor positions.
Current map geometry is unchanged; small areas can be reached through search.

Run `node --test scripts/country-registry.test.mjs` for registry coverage,
aggregation exclusion, mapping, and data-failure checks.

## Ports, Waterways and Terrain

`assets/country-geography.mjs` contains manually reviewed representative examples
for US, CN, DE, JP, GB, IN, FR, RU, IT and CA. The initial cohort is the top ten
by common-year 2025 nominal GDP in the site's snapshot, selected on 2026-09-23.
It is fixed at review time, not automatically reselected when WDI revises GDP.

Each country has three native disclosures at the top of the resources/geography
tab: a port example, a waterway connection, and a terrain/inland connection.
Domestic ports, shared waters and foreign trade routes are explicitly distinguished.
These are not complete inventories, port rankings, navigational advice or live
traffic conditions. Other countries show a pending-coverage message, not absence
of ports or geographical advantages. The seven WDI resource indicators and
quantitative comparison remain unchanged.

Every short factual summary links to its government, public authority or official
port source. Economic interpretations are separately labelled as this site's
analysis. No source images, complete articles or third-party traffic data are
republished, and no scraping, proxy, API or background collection is added.
The source dictionary retains exact source URLs and publication editions where
relevant; the visible review date is separate from the underlying publication
date. This editorial content is not covered by the WDI attribution below it.

Run `node --test scripts/country-geography.test.mjs` for coverage, source-link,
foreign-route labelling, collapsed disclosure and missing-country checks.

## US Geography Extension

The US view replaces the three short examples with four collapsed groups in
`assets/country-geography-us.mjs`: eight port regions, eight waterways, eight
terrain regions, and eight advertised liner-service examples. Coverage spans
the contiguous states, Alaska and Hawaii; it is not an exhaustive inventory of
ports, territories, tanker/LNG/bulk voyages or all US trading partners.

Services were checked against carrier listings on 2026-09-23. Hapag-Lloyd's
Transpacific directory confirms WC2/US2 service listing, with representative
ports from the LA port's linked rotation report (its legacy URL contains 2020,
but the reviewed content names Gemini TP8/WC2 and TP12/US2). The current Atlantic
terminal matrix supports AL2/AL3/AL4 port connections and explicitly marks
New Orleans as transshipment via Altamira. Matson's Hawaii, Alaska and Asia
service pages support the remaining connections. Schedule links are separate
from service descriptions. These checks do not confirm a sailing on a given
date, booking availability, ocean path, frequency or live vessel position.

International services and domestic coastwise services are labelled separately;
AAX is explicitly westbound. Partial port connections are not full rotations
or promises of direct/bidirectional carriage. Bering Strait is geographical
context, not a claimed year-round Arctic liner service. No invented route lines
are added to the map and no source map artwork is republished.

The manual review date never advances automatically. After 30 days, the route
group asks for source rechecking; individual departures always remain unverified.
Factual summaries link to port authorities, USGS, NOAA, USCG, MARAD or carriers,
and economic interpretation is separately labelled. Older sources are used
for stable terrain or network structure only, without recycling old capacity,
population or traffic totals. Existing data collection and map behavior remain
unchanged. Run `node --test scripts/country-geography-us.test.mjs` for coverage,
source integrity, service scope, stale review labels and rendering checks.

## Failure Handling

All API pages must be complete and consistent. A failed indicator collection
retains its previous data and original successful collection time, marked
`stale`; without previous data it is `unavailable`. The job reports failure
even when it publishes healthy series and stale-state metadata. Independently,
the UI warns after 14 days without successful collection. Observation year,
World Bank database update date and local collection date are separate fields.
If the browser cannot load the snapshot, statistics remain unavailable; it does
not substitute old hard-coded numbers.

Run `node scripts/update-country-data.mjs` to refresh and
`node --test scripts/country-data.test.mjs scripts/country-profile.test.mjs scripts/country-industry.test.mjs scripts/country-resources.test.mjs scripts/country-security.test.mjs scripts/country-compare.test.mjs`
to check the data pipeline and profile behavior.
