/* Only the dashboard's own same-origin frame inherits its host theme. */
(function () {
  function host() {
    try {
      if (window.parent !== window && window.frameElement?.id === 'fedFrame' &&
          typeof window.parent.toggleTheme === 'function') return window.parent;
    } catch (_) { /* Standalone or cross-origin embeds keep their own settings. */ }
    return null;
  }
  window.FedTheme = {
    current(fallback) {
      const parent = host();
      return parent ? (parent.document.body.classList.contains('light') ? 'light' : 'dark') : fallback;
    },
    request(theme) {
      const parent = host();
      if (!parent) return false;
      if (this.current() !== theme) parent.toggleTheme();
      return true;
    },
    observe(refresh) {
      const parent = host();
      if (!parent) return;
      const observer = new MutationObserver(refresh);
      observer.observe(parent.document.body, { attributes: true, attributeFilter: ['class'] });
      window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
      window.addEventListener('pageshow', event => {
        if (event.persisted) {
          observer.observe(parent.document.body, { attributes: true, attributeFilter: ['class'] });
          refresh();
        }
      });
    }
  };
})();
