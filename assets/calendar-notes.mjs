export const CALENDAR_STORAGE_KEY = 'ken-investment-calendar-v1';
export const MAX_NOTE_LENGTH = 10000;
export const MAX_BACKUP_BYTES = 2000000;

export function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const value = new Date(date + 'T00:00:00Z');
  return Number.isFinite(+value) && value.toISOString().slice(0,10) === date
    && Number(date.slice(0,4)) >= 1900 && Number(date.slice(0,4)) <= 2100;
}

export function parseCalendar(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES) throw Error('일정 파일의 크기 또는 형식이 올바르지 않습니다.');
  const data = JSON.parse(raw);
  if (data?.schemaVersion !== 1 || !data.entries || typeof data.entries !== 'object' || Array.isArray(data.entries)) throw Error('지원하지 않는 일정 파일입니다.');
  const entries = {};
  for (const [date, entry] of Object.entries(data.entries)) {
    if (!validDate(date) || !entry || typeof entry.text !== 'string' || !entry.text.trim()
      || entry.text.length > MAX_NOTE_LENGTH || typeof entry.updatedAt !== 'string'
      || !Number.isFinite(Date.parse(entry.updatedAt))) throw Error('유효하지 않은 날짜 또는 일정이 포함되어 있습니다.');
    entries[date] = {text:entry.text, updatedAt:entry.updatedAt};
  }
  return {schemaVersion:1, entries};
}

export function readCalendar(storage) {
  if (!storage) throw Error('이 브라우저에서 저장 공간을 사용할 수 없습니다.');
  const raw = storage.getItem(CALENDAR_STORAGE_KEY);
  return raw === null ? {schemaVersion:1, entries:{}} : parseCalendar(raw);
}

function writeCalendar(storage, data) {
  const raw = JSON.stringify(data);
  parseCalendar(raw);
  storage.setItem(CALENDAR_STORAGE_KEY, raw);
  return data;
}

export function saveCalendarDay(storage, date, text, expectedEntry, now = new Date()) {
  if (!validDate(date) || typeof text !== 'string' || text.length > MAX_NOTE_LENGTH) throw Error('일정은 10,000자 이내로 입력해 주세요.');
  const data = readCalendar(storage);
  // Re-read before each write so editing one date preserves changes on other dates.
  if (JSON.stringify(data.entries[date] ?? null) !== JSON.stringify(expectedEntry ?? null)) throw Error('다른 창에서 이 날짜가 변경되었습니다. 입력 내용을 복사한 뒤 창을 다시 열어 주세요.');
  if (text.trim()) data.entries[date] = {text:text.trim(), updatedAt:now.toISOString()};
  else delete data.entries[date];
  return writeCalendar(storage, data);
}

export function restoreCalendar(storage, imported) {
  const checked = parseCalendar(JSON.stringify(imported));
  const current = readCalendar(storage);
  return writeCalendar(storage, {schemaVersion:1, entries:{...current.entries, ...checked.entries}});
}

export function escapeCalendarText(text) {
  return String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
