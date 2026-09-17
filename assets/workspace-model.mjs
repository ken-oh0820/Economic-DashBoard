export const DEFAULT_FAVORITES = ['macro-cpi','macro-core-cpi','macro-unrate','macro-payems','bond-us-10y','bond-us-spread'];

export function cleanFavorites(value, allowed) {
  return Array.isArray(value) ? [...new Set(value.filter(key => allowed.includes(key)))].slice(0,8) : [...DEFAULT_FAVORITES];
}

export function observationLabel(date, frequency) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return '기준일 미제공';
  const [year,month] = date.split('-').map(Number);
  if (frequency === 'monthly') return year+'년 '+month+'월';
  if (frequency === 'quarterly') return year+'년 '+Math.ceil(month/3)+'분기';
  return date;
}

export function timestampLabel(value) {
  if (value == null || value === '') return '미제공';
  const n = Number(value);
  const date = new Date(Number.isFinite(n) ? (n < 1e12 ? n*1000 : n) : value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})+' KST' : '미제공';
}

export function readPreference(storage, key, fallback) {
  try { const raw=storage.getItem(key); return raw===null ? fallback : JSON.parse(raw); }
  catch { return fallback; }
}

export function savePreference(storage, key, value) {
  try { storage.setItem(key,JSON.stringify(value)); return true; }
  catch { return false; }
}
