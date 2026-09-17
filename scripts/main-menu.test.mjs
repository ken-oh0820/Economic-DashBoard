import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('main menu has four destinations with monitoring and guide unified',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const menu=html.match(/<main class="main-menu"[\s\S]*?<\/main>/)?.[0];
  assert.ok(menu);
  assert.equal((menu.match(/<button /g)||[]).length,4);
  const destinations=[...menu.matchAll(/onclick="switchView\('([^']+)'\)"/g)].map(match=>match[1]);
  assert.deepEqual(destinations,['map','dashboard','sites','fed']);
  assert.deepEqual([...menu.matchAll(/class="menu-card-index">([^<]+)/g)].map(match=>match[1]),['01','02','03','04']);
  assert.match(html,/04 \/ FED BALANCE SHEET/);
  assert.match(html,/03 \/ RESEARCH HUB/);
  assert.match(menu,/aria-label="경제 지표"/);
  assert.doesNotMatch(html,/companyDashboard|company-financials|company-view-open|company-mode/);
  assert.equal((menu.match(/<button[^>]*aria-label="/g)||[]).length,4);
  assert.match(menu,/id="mainMenuTitle">Economic Dashboard/);
  assert.match(menu,/Made by <strong>Ken/);
  assert.match(html,/assets\/main-menu.css/);
  assert.match(html,/assets\/main-menu.js/);
});

test('Valley AI is a normal official external link in the Korean resources section',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const korean=html.slice(html.indexOf('<div class="sites-country"><span>KR</span>'),html.indexOf('<section class="us-news-desk"'));
  assert.match(korean,/href="https:\/\/www.valley.town\/" target="_blank" rel="noopener noreferrer"/);
  assert.match(korean,/Valley AI 바로가기/);
  assert.doesNotMatch(korean,/site-empty|iframe|script/);
  const workspace=await readFile(new URL('../assets/workspace.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(workspace,/company-selected|recentCompanies|미국 기업 재무 분석/);
});
