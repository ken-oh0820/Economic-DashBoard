import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../assets/economic-guide.css',import.meta.url),'utf8');
const guide=html.slice(html.indexOf('<div class="us-guide-dashboard"'),html.indexOf('<div class="site-help-modal"'));
const termsGuide=guide.slice(guide.indexOf('<section id="guide-terms"'));
const importantGuide=guide.slice(guide.indexOf('<section id="guide-important"'),guide.indexOf('<section id="guide-terms"'));

test('all eighteen indicators are collapsed native disclosures with their descriptions intact',()=>{
  const items=[...termsGuide.matchAll(/<details class="us-guide-item">([\s\S]*?)<\/details>/g)];
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
  assert.match(guide,/중요 지표 20 · 용어 해설 18/);
});

test('twenty important indicators have four groups, complete explanations and source links',()=>{
  const items=[...importantGuide.matchAll(/<details class="us-guide-item">([\s\S]*?)<\/details>/g)];
  const expected=['미국 10년 실질금리','미국 2년물 금리·예상 정책금리 경로','Core PCE·Core CPI','ISM 신규주문 지수','신규·계속 실업수당 청구건수','실질 개인소비지출·실질 가처분소득','하이일드 신용스프레드','은행 지급준비금·TGA·ON RRP','SOFR−IORB 스프레드','SLOOS 대출태도·대출 수요','섹터별 EPS 추정치 상향·하향','섹터 상대강도','시장 폭·상승 참여도','섹터 ETF 순유입·순유출','주요 고객사의 CAPEX 계획·신규 수주','섹터별 재고·재고/매출 비율','Forward P/E·FCF Yield','ROIC−WACC','FCF 성장·FCF Conversion','Incremental Margin'];
  assert.equal(items.length,20);
  items.forEach(([full,item],i)=>{
    assert.ok(item.includes('class="us-guide-term">'+expected[i]));
    assert.ok(item.includes('class="us-guide-number">'+String(i+1).padStart(2,'0')));
    assert.doesNotMatch(full,/<details[^>]*\sopen/);
    for(const heading of ['지표의 의미','계산·확인 방법','해석과 주의점','함께 확인할 항목','참고 자료'])assert.ok(item.includes('<h3>'+heading+'</h3>'));
    assert.match(item,/<a href="https:\/\/[^" ]+" target="_blank" rel="noopener noreferrer">/);
  });
  const groups=importantGuide.split('<section class="important-guide-group"').slice(1);
  assert.deepEqual(groups.map(group=>(group.match(/<details /g)||[]).length),[6,4,6,4]);
  assert.match(importantGuide,/주식시장 유입액이 아닙니다/);
  assert.match(importantGuide,/전체 PCE 물가 기준/);
  assert.match(importantGuide,/매출 변화가 0이면 계산할 수 없고/);
  assert.match(importantGuide,/운용자산\(AUM\) 증가에는 가격 상승도 포함/);
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
