import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');

test('map news, metals and energy drawer and its controls are removed',()=>{
  assert.doesNotMatch(html,/id="(?:sidebarRight|rightDesktopToggle|newsPanel|commodityPanel|energyPanel)"|onclick="toggleSidebar\('right'\)"/);
  assert.doesNotMatch(html,/fetchNews\b|fetchCommodities\b|renderEnergyLinks\b|NEWS_API_ENDPOINT|latest.currency-api|@fawazahmed0/);
  assert.match(html,/id="leftCluster"/);
  assert.match(html,/id="countryDetail"/);
  assert.match(html,/function fetchUsNewsDesk\(/);
  assert.match(html,/function stripNewsHtml\(/);
  assert.match(html,/function dedupeNews\(/);
  assert.match(html,/setInterval\(fetchExchangeRates/);
});

test('mobile map drawer and menu exit work without a right-hand drawer',()=>{
  const nodes=new Map(['leftCluster','mobileOverlay'].map(id=>[id,{classList:new Set()}]));
  for(const node of nodes.values())node.classList.remove=node.classList.delete;
  const ctx=vm.createContext({document:{getElementById:id=>nodes.get(id)},map:null});
  const functions=['closeSidebars','toggleSidebar'].map(name=>html.match(new RegExp('function '+name+'\\([^]*?^}', 'm'))[0]);
  vm.runInContext(functions.join('\n'),ctx);
  vm.runInContext("toggleSidebar('left')",ctx);
  assert.ok(nodes.get('leftCluster').classList.has('open'));
  assert.ok(nodes.get('mobileOverlay').classList.has('active'));
  vm.runInContext('closeSidebars()',ctx);
  assert.equal(nodes.get('leftCluster').classList.has('open'),false);
  assert.equal(nodes.get('mobileOverlay').classList.has('active'),false);
});
