import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('main menu preserves six destinations and accessible names',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const menu=html.match(/<main class="main-menu"[\s\S]*?<\/main>/)?.[0];
  assert.ok(menu);
  assert.equal((menu.match(/<button /g)||[]).length,6);
  const destinations=[...menu.matchAll(/onclick="switchView\('([^']+)'\)"/g)].map(match=>match[1]);
  assert.deepEqual(destinations,['map','dashboard','company','sites','guide','fed']);
  assert.deepEqual([...menu.matchAll(/class="menu-card-index">([^<]+)/g)].map(match=>match[1]),['01','02','03','04','05','06']);
  assert.match(html,/06 \/ FED BALANCE SHEET/);
  const company=await readFile(new URL('../assets/company-financials.mjs',import.meta.url),'utf8');
  assert.match(company,/03 \/ COMPANY FINANCIALS/);
  assert.equal((menu.match(/<button[^>]*aria-label="/g)||[]).length,6);
  assert.match(menu,/id="mainMenuTitle">Economic Dashboard/);
  assert.match(menu,/Made by <strong>Ken/);
  assert.match(html,/assets\/main-menu.css/);
  assert.match(html,/assets\/main-menu.js/);
});
