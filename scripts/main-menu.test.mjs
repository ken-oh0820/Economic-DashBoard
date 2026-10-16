import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('indicator home is visible on entry and three secondary destinations remain in the header',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const menu=html.match(/<nav class="primary-nav"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(menu);
  assert.equal((menu.match(/<button /g)||[]).length,3);
  const destinations=[...menu.matchAll(/onclick="switchView\('([^']+)'\)"/g)].map(match=>match[1]);
  assert.deepEqual(destinations,['map','sites','fed']);
  assert.match(html,/<body class="dashboard-mode light">/);
  assert.doesNotMatch(html,/<main class="main-menu"|assets\/main-menu\.(css|js)/);
  assert.match(html,/04 \/ FED BALANCE SHEET/);
  assert.match(html,/03 \/ RESEARCH HUB/);
  assert.match(html,/onclick="switchView\('dashboard'\)" aria-label="경제 지표 홈"/);
  assert.doesNotMatch(html,/companyDashboard|company-financials|company-view-open|company-mode/);
  assert.match(html,/class="logo-main">Economic Dashboard/);
  assert.match(html,/class="logo-sub">Made by Ken/);
  assert.match(html,/assets\/home-shell.css/);
});

test('view transitions return legacy home requests to indicators and preserve lazy Fed loading',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const source=html.slice(html.indexOf('function switchView(view)'),html.indexOf('function updateDesktopPanelButtons'));
  const modes=new Set(['light','dashboard-mode']),events=[];
  let clears=0,closed=0;
  const frame={src:'about:blank',dataset:{src:'fed-dashboard.html?test'},getAttribute(){return this.src;}};
  const context=vm.createContext({document:{body:{classList:{remove(...items){items.forEach(item=>modes.delete(item));},add(item){modes.add(item);}}},getElementById:id=>id==='fedFrame'?frame:{classList:{remove(){}}}},map:null,clearMapTransientUi:()=>clears++,closeSiteHelp:()=>closed++,window:{dispatchEvent:event=>events.push(event.detail)},CustomEvent:class{constructor(type,init){this.detail=init.detail;}},setTimeout:()=>{}});
  vm.runInContext(source,context);
  for(const [requested,expected] of [['map','map'],['sites','sites'],['fed','fed'],['guide','guide'],['dashboard','dashboard'],['menu','dashboard'],['unknown','dashboard']]){
    vm.runInContext('switchView('+JSON.stringify(requested)+')',context);
    assert.deepEqual([...modes].filter(mode=>mode.endsWith('-mode')),[expected+'-mode']);
    assert.equal(events.at(-1),expected);
  }
  assert.equal(frame.src,'fed-dashboard.html?test');
  assert.equal(clears,6);
  assert.equal(closed,7);
});

test('navigation highlights the active destination and treats the dictionary as part of indicator home',async()=>{
  const code=await readFile(new URL('../assets/workspace.mjs',import.meta.url),'utf8');
  const source=code.slice(code.indexOf('function syncPrimaryNavigation(view)'),code.indexOf("syncPrimaryNavigation('dashboard');"));
  const node=view=>({dataset:{view},attrs:{},setAttribute(key,value){this.attrs[key]=value;},removeAttribute(key){delete this.attrs[key];}});
  const home=node('dashboard'),buttons=['map','sites','fed'].map(node);
  const context=vm.createContext({$:()=>home,document:{querySelectorAll:()=>buttons}});
  vm.runInContext(source,context);
  for(const view of ['dashboard','map','sites','fed','guide','dashboard']){
    vm.runInContext('syncPrimaryNavigation('+JSON.stringify(view)+')',context);
    assert.equal(home.attrs['aria-current'],['dashboard','guide'].includes(view)?'page':undefined);
    assert.deepEqual(buttons.filter(button=>button.attrs['aria-current']==='page').map(button=>button.dataset.view),['dashboard','guide'].includes(view)?[]:[view]);
  }
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
