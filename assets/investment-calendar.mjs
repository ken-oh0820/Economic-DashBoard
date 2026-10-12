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
        return `<td class="${date.inMonth ? '' : 'outside-month'}${isToday ? ' calendar-current-day' : ''}"><time datetime="${date.iso}" aria-label="${date.year}년 ${date.month}월 ${date.day}일"${isToday ? ' aria-current="date"' : ''}>${date.day}</time></td>`;
      }).join('') + '</tr>').join('');
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
  window.addEventListener('app-view-change', event => {if (event.detail === 'sites') render();});
  document.addEventListener('visibilitychange', () => {if (!document.hidden) render();});
  render();
}
