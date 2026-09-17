export function initEconomyTabs(root, navigate) {
  const tabs = [...root.querySelectorAll('[data-economy-view]')];
  function sync(view) {
    tabs.forEach(tab => {
      const selected = tab.dataset.economyView === view;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => navigate(tab.dataset.economyView));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      navigate(tabs[next].dataset.economyView);
      tabs[next].focus();
    });
  });
  return sync;
}
