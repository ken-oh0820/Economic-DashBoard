import {CALENDAR_STORAGE_KEY, MAX_BACKUP_BYTES, readCalendar, saveCalendarDay, parseCalendar, restoreCalendar, escapeCalendarText} from './calendar-notes.mjs?v=20261012-notes';

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

export function koreaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric', day: 'numeric'
  }).formatToParts(now);
  const read = type => Number(parts.find(part => part.type === type).value);
  return {year: read('year'), month: read('month'), day: read('day')};
}

export function moveMonth(year, month, offset) {
  const index = Math.max(MIN_YEAR * 12, Math.min(MAX_YEAR * 12 + 11, year * 12 + month - 1 + offset));
  return {year: Math.floor(index / 12), month: index % 12 + 1};
}

export function monthDays(year, month) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  // UTC arithmetic avoids daylight-saving shifts; every month has six stable rows.
  return Array.from({length: 42}, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, 1 - first.getUTCDay() + index));
    return {
      year: date.getUTCFullYear(), month: date.getUTCMonth() + 1,
      day: date.getUTCDate(), iso: date.toISOString().slice(0, 10),
      inMonth: date.getUTCMonth() === month - 1
    };
  });
}

export function initInvestmentCalendar(root) {
  const $ = selector => root.querySelector(selector);
  const tabs = [...root.querySelectorAll('.investment-tabs [role="tab"]')];
  const yearSelect = $('#investmentCalendarYear');
  const monthSelect = $('#investmentCalendarMonth');
  const previous = $('#investmentCalendarPrevious');
  const next = $('#investmentCalendarNext');
  const dialog = $('#investmentCalendarEditor');
  const textarea = $('#calendarNoteText');
  const feedback = $('#calendarNoteFeedback');
  const status = $('#calendarStorageStatus');
  let storage;
  try {storage = window.localStorage;} catch {}
  let notes = {}, selectedDate, originalEntry;
  const showError = error => {
    if (error.name === 'QuotaExceededError') return '저장 공간이 가득 찼습니다. 입력 내용은 저장되지 않았습니다.';
    if (error.name === 'SecurityError') return '브라우저가 저장 공간 접근을 차단했습니다.';
    if (error.name === 'SyntaxError') return '일정 데이터 형식이 올바르지 않습니다.';
    return error.message;
  };
  function loadNotes() {
    try {notes = readCalendar(storage).entries; return true;}
    catch {status.textContent = '일정을 불러올 수 없습니다. 브라우저 저장 설정 또는 저장 데이터를 확인해 주세요. 기존 데이터는 변경하지 않았습니다.'; return false;}
  }
  function isDirty() {return textarea.value !== (originalEntry?.text ?? '');}
  function closeEditor() {
    if (isDirty() && !window.confirm('저장하지 않은 내용을 버리고 닫을까요?')) return;
    dialog.close();
    $('#investmentCalendarDays [data-date="' + selectedDate + '"]')?.focus();
  }
  function openEditor(date) {
    if (!loadNotes()) return;
    selectedDate = date;
    originalEntry = notes[date] ?? null;
    $('#calendarNoteTitle').textContent = date.replace(/^(\d+)-(\d+)-(\d+)$/, '$1년 $2월 $3일');
    textarea.value = originalEntry?.text ?? '';
    feedback.textContent = '';
    $('#calendarNoteDelete').hidden = !originalEntry;
    dialog.showModal();
    textarea.focus();
  }
  function saveNote(text) {
    if (!text.trim() && originalEntry && !window.confirm('이 날짜의 일정을 삭제할까요?')) return;
    try {
      notes = saveCalendarDay(storage, selectedDate, text, originalEntry).entries;
      originalEntry = notes[selectedDate] ?? null;
      textarea.value = originalEntry?.text ?? '';
      render();
      status.textContent = text.trim() ? '이 브라우저에 저장했습니다.' : '일정을 삭제했습니다.';
      closeEditor();
    } catch (error) {feedback.textContent = showError(error) + ' 입력 내용은 이 창에 남아 있습니다.';}
  }
  $('#calendarNoteForm').addEventListener('submit', event => {event.preventDefault(); saveNote(textarea.value);});
  $('#calendarNoteDelete').addEventListener('click', () => saveNote(''));
  $('#calendarNoteClose').addEventListener('click', closeEditor);
  dialog.addEventListener('cancel', event => {event.preventDefault(); closeEditor();});
  $('#investmentCalendarDays').addEventListener('click', event => {
    const button = event.target.closest('button[data-date]');
    if (button && !button.disabled) openEditor(button.dataset.date);
  });
  window.addEventListener('beforeunload', event => {if (dialog.open && isDirty()) {event.preventDefault(); event.returnValue = '';}});
  window.addEventListener('storage', event => {
    if (event.key === CALENDAR_STORAGE_KEY || event.key === null) {loadNotes(); render();}
  });
  $('#calendarBackup').addEventListener('click', () => {
    try {
      const data = readCalendar(storage);
      const url = URL.createObjectURL(new Blob([JSON.stringify(data)], {type:'application/json'}));
      const link = document.createElement('a');
      link.href = url; link.download = 'investment-calendar-' + new Date().toISOString().slice(0,10) + '.json';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      status.textContent = '일정 백업 파일 다운로드를 요청했습니다.';
    } catch (error) {status.textContent = showError(error);}
  });
  const fileInput = $('#calendarRestoreFile');
  $('#calendarRestore').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES) throw Error('2 MB 이하의 일정 백업 파일을 선택해 주세요.');
      const imported = parseCalendar(await file.text());
      const count = Object.keys(imported.entries).length;
      if (!count) throw Error('백업에 저장된 일정이 없습니다.');
      if (!window.confirm(`${count}개 날짜의 일정을 복원할까요? 같은 날짜의 기존 일정은 백업 내용으로 바뀝니다. 나머지 날짜는 유지됩니다.`)) return;
      notes = restoreCalendar(storage, imported).entries;
      render();
      status.textContent = `${count}개 날짜의 일정을 복원했습니다.`;
    } catch (error) {status.textContent = '복원하지 못했습니다. ' + showError(error);}
  });
  loadNotes();
  let current = koreaDate();
  yearSelect.innerHTML = Array.from({length: MAX_YEAR - MIN_YEAR + 1}, (_, i) =>
    `<option value="${MIN_YEAR + i}">${MIN_YEAR + i}년</option>`).join('');
  monthSelect.innerHTML = Array.from({length: 12}, (_, i) => `<option value="${i + 1}">${i + 1}월</option>`).join('');

  function render() {
    const today = koreaDate();
    yearSelect.value = String(current.year);
    monthSelect.value = String(current.month);
    $('#investmentCalendarTitle').textContent = `${current.year}년 ${current.month}월`;
    previous.disabled = current.year === MIN_YEAR && current.month === 1;
    next.disabled = current.year === MAX_YEAR && current.month === 12;
    const days = monthDays(current.year, current.month);
    $('#investmentCalendarDays').innerHTML = Array.from({length: 6}, (_, week) =>
      '<tr>' + days.slice(week * 7, week * 7 + 7).map(date => {
        const isToday = date.year === today.year && date.month === today.month && date.day === today.day;
        const text = notes[date.iso]?.text ?? '';
        const disabled = date.year < MIN_YEAR || date.year > MAX_YEAR;
        return `<td class="${date.inMonth ? '' : 'outside-month'}${isToday ? ' calendar-current-day' : ''}"><button type="button" class="calendar-day" data-date="${date.iso}" aria-label="${date.year}년 ${date.month}월 ${date.day}일 ${text ? '일정 수정' : '일정 추가'}"${disabled ? ' disabled' : ''}><time datetime="${date.iso}"${isToday ? ' aria-current="date"' : ''}>${date.day}</time><span class="calendar-note-preview">${escapeCalendarText(text)}</span></button></td>`;
      }).join('') + '</tr>').join('');
    const count = days.filter(date => date.inMonth && notes[date.iso]).length;
    $('#calendarMonthCount').textContent = count ? `일정 ${count}일` : '등록된 일정 없음';
  }
  function activate(tab) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      $('#' + item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (tab === tabs[0]) render();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });
  previous.addEventListener('click', () => {current = moveMonth(current.year, current.month, -1); render();});
  next.addEventListener('click', () => {current = moveMonth(current.year, current.month, 1); render();});
  yearSelect.addEventListener('change', () => {current.year = Number(yearSelect.value); render();});
  monthSelect.addEventListener('change', () => {current.month = Number(monthSelect.value); render();});
  $('#investmentCalendarToday').addEventListener('click', () => {current = koreaDate(); render();});
  window.addEventListener('app-view-change', event => {if (event.detail === 'sites') {loadNotes(); render();}});
  document.addEventListener('visibilitychange', () => {if (!document.hidden) {loadNotes(); render();}});
  render();
}
