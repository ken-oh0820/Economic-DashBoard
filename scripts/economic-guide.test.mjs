import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../assets/economic-guide.css',import.meta.url),'utf8');
const guide=html.slice(html.indexOf('<div class="us-guide-dashboard"'),html.indexOf('<div class="site-help-modal"'));

test('all eight indicators are collapsed native disclosures with their descriptions intact',()=>{
  const items=[...guide.matchAll(/<details class="us-guide-item">([\s\S]*?)<\/details>/g)];
  assert.equal(items.length,8);
  const terms=['Repo Rate','Treasury Basis','Primary Dealer Balance Sheet','Dealer Financing','CFTC TFF Positioning','Treasury Auction Tail','Swap Spread','Collateral'];
  items.forEach(([full,item],i)=>{
    assert.ok(item.includes('class="us-guide-term">'+terms[i]));
    assert.match(item,/<summary class="us-guide-row">[\s\S]*?<\/summary>/);
    assert.match(item,/<h3>지표의 의미<\/h3><p>[^<]+<\/p>/);
    assert.match(item,/<h3>함께 확인할 항목<\/h3><p>[^<]+<\/p>/);
    assert.doesNotMatch(full,/<details[^>]*\sopen/);
  });
  assert.doesNotMatch(guide,/class="us-guide-card"/);
});

test('list stays single-column with scoped, responsive styles and keyboard focus',()=>{
  assert.ok(html.indexOf('assets/economic-guide.css')>html.indexOf('assets/dashboard-ui.css'));
  assert.match(css,/\.us-guide-list\{display:flex;flex-direction:column/);
  assert.match(css,/\.us-guide-row:focus-visible/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.doesNotMatch(css,/height:268px|\.fed-frame/);
});
