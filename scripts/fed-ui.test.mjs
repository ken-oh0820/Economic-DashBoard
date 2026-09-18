import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const theme = read('../assets/fed-theme.js');
const html = read('../fed-dashboard.html');
const css = read('../assets/fed-ui.css');

function setup(embedded = true) {
  let light = true, refresh, observations = 0, disconnects = 0;
  const events = {};
  const parent = {
    document: {body: {classList: {contains: () => light}}},
    toggleTheme() { light = !light; }
  };
  const window = {parent, frameElement: {id: 'fedFrame'}, addEventListener: (key, fn) => { events[key] = fn; }};
  if (!embedded) window.parent = window;
  class MutationObserver {
    constructor(fn) { refresh = fn; }
    observe() { observations++; }
    disconnect() { disconnects++; }
  }
  vm.runInNewContext(theme, {window, MutationObserver});
  return {api: window.FedTheme, window, events, refresh: () => refresh(),
    observations: () => observations, disconnects: () => disconnects};
}

test('embedded Fed inherits the host and switches both themes without loops', () => {
  const {api} = setup();
  assert.equal(api.current('dark'), 'light');
  assert.equal(api.request('dark'), true);
  assert.equal(api.current('light'), 'dark');
  api.request('dark');
  assert.equal(api.current(), 'dark');
  api.request('light');
  assert.equal(api.current(), 'light');
});

test('standalone and unrelated embeds retain their independent preferences', () => {
  const standalone = setup(false);
  assert.equal(standalone.api.current('dark'), 'dark');
  assert.equal(standalone.api.request('light'), false);
  const other = setup();
  other.window.frameElement.id = 'unrelated';
  assert.equal(other.api.current('dark'), 'dark');
  assert.equal(other.api.request('light'), false);
  Object.defineProperty(other.window, 'frameElement', {get() { throw Error('cross-origin'); }});
  assert.equal(other.api.current('light'), 'light');
});

test('host theme observation survives browser history restoration', () => {
  const env = setup();
  let updates = 0;
  env.api.observe(() => updates++);
  env.refresh();
  assert.equal(updates, 1);
  env.events.pagehide();
  assert.equal(env.disconnects(), 1);
  env.events.pageshow({persisted: true});
  assert.equal(env.observations(), 2);
  assert.equal(updates, 2);
});

test('Fed presentation loads last and keeps responsive tables and modal bounds', () => {
  assert.ok(html.indexOf('assets/fed-ui.css') > html.indexOf('</style>'));
  assert.match(html, /window.FedTheme\?\.observe\(applySettings\)/);
  assert.match(html, /settings.theme = window.FedTheme\?\.current\(settings.theme\) \?\? settings.theme/);
  assert.match(css, /\.hd, \.dark \.hd\s*\{[^}]*background: transparent/);
  assert.match(css, /\.tbl-box, \.stmt-sec\s*\{ overflow-x: auto/);
  assert.match(css, /width: min\(640px, calc\(100vw - 32px\)\)/);
  assert.match(css, /prefers-reduced-motion/);
});
