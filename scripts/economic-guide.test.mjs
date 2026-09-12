import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../assets/economic-guide.css',import.meta.url),'utf8');
const guide=html.slice(html.indexOf('<div class="us-guide-dashboard"'),html.indexOf('<div class="site-help-modal"'));

test('all eighteen indicators are collapsed native disclosures with their descriptions intact',()=>{
  const items=[...guide.matchAll(/<details class="us-guide-item">([\s\S]*?)<\/details>/g)];
  assert.equal(items.length,18);
  const terms=['Repo Rate','Treasury Basis','Primary Dealer Balance Sheet','Dealer Financing','CFTC TFF Positioning','Treasury Auction Tail','Swap Spread','Collateral','ROIC','Incremental Margin','Backlog Conversion','Capex Intensity','Working Capital','Deferred Revenue','Take Rate','Free Cash Flow Conversion','Unit Economics','Net Revenue Retention'];
  items.forEach(([full,item],i)=>{
    assert.ok(item.includes('class="us-guide-term">'+terms[i]));
    assert.match(item,/<summary class="us-guide-row">[\s\S]*?<\/summary>/);
    assert.match(item,/<h3>지표의 의미<\/h3><p>[^<]+<\/p>/);
    assert.match(item,/<h3>함께 확인할 항목<\/h3><p>[^<]+<\/p>/);
    assert.doesNotMatch(full,/<details[^>]*\sopen/);
    assert.ok(item.includes('class="us-guide-number">'+String(i+1).padStart(2,'0')));
    if(i>=8){
      for(const heading of ['계산·확인 방법','가상 계산 예시','해석과 주의점','참고 자료'])assert.ok(item.includes('<h3>'+heading+'</h3>'));
      assert.match(item,/가상 예시:/);
      assert.match(item,/<a href="https:\/\/[^" ]+" target="_blank" rel="noopener noreferrer">/);
    }
  });
  assert.doesNotMatch(guide,/class="us-guide-card"/);
  assert.match(guide,/18 CORE INDICATORS/);
});

test('company metric caveats preserve definition and cash-versus-revenue distinctions',()=>{
  assert.match(guide,/신규 고객 매출은 제외/);
  assert.match(guide,/영업현금흐름−CAPEX/);
  assert.match(guide,/회사에 따라 분모가 EBITDA/);
  assert.match(guide,/청구할 권리가 생겼지만/);
  assert.match(guide,/회계상 순운전자본 = 유동자산−유동부채/);
  assert.match(guide,/신규 주문에서 발생한 당기 매출은.*분자에서 제외/);
  assert.match(guide,/매출 변화가 0이면 계산할 수 없습니다/);
});

test('list stays single-column with scoped, responsive styles and keyboard focus',()=>{
  assert.ok(html.indexOf('assets/economic-guide.css')>html.indexOf('assets/dashboard-ui.css'));
  assert.match(css,/\.us-guide-list\{display:flex;flex-direction:column/);
  assert.match(css,/\.us-guide-row:focus-visible/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.doesNotMatch(css,/height:268px|\.fed-frame/);
});
