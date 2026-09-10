import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../assets/dashboard-ui.css',import.meta.url),'utf8');

test('workspace loads shared styles last and starts with a consistent light theme',()=>{
  assert.ok(html.indexOf('assets/dashboard-ui.css')>html.indexOf('</style>'));
  assert.match(html,/<body class="menu-mode light">/);
  assert.match(html,/let curMetric='gdp',isLight=true/);
  assert.match(html,/aria-label="메인 메뉴"/);
  assert.match(html,/aria-label="어두운 테마로 전환"/);
});

test('Fed preserves its isolated PDF application and lazy-loading contract',()=>{
  assert.match(html,/<iframe class="fed-frame" id="fedFrame" src="about:blank" data-src="fed-dashboard.html\?v=20260621-help" title="Fed Balance Sheet Dashboard"><\/iframe>/);
  assert.doesNotMatch(css,/\.fed-frame\s*\{/);
  assert.doesNotMatch(css,/\.map-container\s*\{|#map\s*\{|\.left-cluster\s*\{/);
});

test('expanded schedules have no clipping cap and collapsed links are hidden',()=>{
  assert.match(css,/\.rate-schedule-body\{[^}]*visibility:hidden/);
  assert.match(css,/\.rate-schedule-panel\.open \.rate-schedule-body\{[^}]*max-height:none[^}]*visibility:visible/);
});

test('light theme retains five sentiment bands and distinct maturity colors',()=>{
  for(const name of ['extreme-fear','fear','neutral','greed','extreme-greed']){
    assert.ok(css.includes('body.light .sentiment-'+name+'{'));
  }
  const colors=[...css.matchAll(/body\.light \.bond-tenor-[^{]+\{background:([^;]+)/g)].map(match=>match[1]);
  assert.equal(new Set(colors).size,8);
});
