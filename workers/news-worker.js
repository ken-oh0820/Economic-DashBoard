const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
    if (url.pathname !== '/news') return json({ error: 'Not found' }, 404);

    const limit = clamp(Number(url.searchParams.get('limit') || 30), 4, 30);
    const cache = caches.default;
    const cacheKey = new Request(url.origin + '/news?limit=' + limit);
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const providers = await Promise.allSettled([
      fetchMarketaux(env),
      fetchAlphaVantage(env),
      fetchNaver(env),
    ]);

    const items = dedupe(providers.flatMap(result => result.status === 'fulfilled' ? result.value : []))
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
      .slice(0, limit);

    const response = json({
      sourceLabel: 'Marketaux+Alpha+Naver',
      count: items.length,
      updatedAt: new Date().toISOString(),
      items,
    }, items.length ? 200 : 502, {
      'Cache-Control': 'public, max-age=60',
    });

    if (items.length) ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
};

async function fetchMarketaux(env) {
  if (!env.MARKETAUX_API_TOKEN) return [];
  const url = new URL('https://api.marketaux.com/v1/news/all');
  url.searchParams.set('api_token', env.MARKETAUX_API_TOKEN);
  url.searchParams.set('language', 'en,ko');
  url.searchParams.set('countries', 'us,kr');
  url.searchParams.set('entity_types', 'index,equity,currency,commodity');
  url.searchParams.set('must_have_entities', 'true');
  url.searchParams.set('filter_entities', 'true');
  url.searchParams.set('group_similar', 'true');
  url.searchParams.set('sort', 'published_at');
  url.searchParams.set('limit', '20');

  const data = await fetchJson(url);
  return (data.data || []).map(item => ({
    id: item.uuid,
    title: cleanHtml(item.title),
    summary: cleanHtml(item.snippet || item.description),
    url: item.url,
    source: item.source || 'Marketaux',
    provider: 'Marketaux',
    publishedAt: item.published_at,
    sentiment: averageSentiment(item.entities),
    tickers: (item.entities || []).map(entity => entity.symbol).filter(Boolean).slice(0, 6),
  })).filter(isValidNews);
}

async function fetchAlphaVantage(env) {
  if (!env.ALPHAVANTAGE_API_KEY) return [];
  const url = new URL('https://www.alphavantage.co/query');
  url.searchParams.set('function', 'NEWS_SENTIMENT');
  url.searchParams.set('topics', 'economy_macro,economy_monetary,financial_markets');
  url.searchParams.set('sort', 'LATEST');
  url.searchParams.set('limit', '20');
  url.searchParams.set('apikey', env.ALPHAVANTAGE_API_KEY);

  const data = await fetchJson(url);
  return (data.feed || []).map(item => ({
    id: item.url,
    title: cleanHtml(item.title),
    summary: cleanHtml(item.summary),
    url: item.url,
    source: item.source || 'Alpha Vantage',
    provider: 'Alpha Vantage',
    publishedAt: alphaTimeToIso(item.time_published),
    sentiment: Number(item.overall_sentiment_score || 0),
    tickers: (item.ticker_sentiment || []).map(t => t.ticker).filter(Boolean).slice(0, 6),
  })).filter(isValidNews);
}

async function fetchNaver(env) {
  if (!env.NAVER_CLIENT_ID || !env.NAVER_CLIENT_SECRET) return [];
  const url = new URL('https://openapi.naver.com/v1/search/news.json');
  url.searchParams.set('query', '경제 증시 금리 환율');
  url.searchParams.set('display', '20');
  url.searchParams.set('sort', 'date');

  const data = await fetchJson(url, {
    headers: {
      'X-Naver-Client-Id': env.NAVER_CLIENT_ID,
      'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET,
    },
  });

  return (data.items || []).map(item => ({
    id: item.originallink || item.link,
    title: cleanHtml(item.title),
    summary: cleanHtml(item.description),
    url: item.originallink || item.link,
    source: sourceFromUrl(item.originallink || item.link) || 'Naver',
    provider: 'Naver',
    publishedAt: item.pubDate,
    sentiment: null,
    tickers: [],
  })).filter(isValidNews);
}

async function fetchJson(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { 'Accept': 'application/json', ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(url.hostname + ' ' + res.status);
  return res.json();
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      ...headers,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function cleanHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidNews(item) {
  return item.title && /^https?:\/\//i.test(item.url || '');
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = (item.url || '').replace(/[?#].*$/, '') + '|' + item.title.slice(0, 48).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function alphaTimeToIso(value) {
  const match = String(value || '').match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (!match) return value || '';
  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:00Z`;
}

function averageSentiment(entities = []) {
  const scores = entities.map(entity => Number(entity.sentiment_score)).filter(Number.isFinite);
  if (!scores.length) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function sourceFromUrl(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
