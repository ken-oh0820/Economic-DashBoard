import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');

test('sites panel contains official Treasury QRA and buyback links before the news desk',()=>{
  const start=html.indexOf('<section class="sites-panel treasury-sites"');
  const end=html.indexOf('<section class="us-news-desk"');
  assert.ok(start>html.indexOf('<section id="investmentLinksPanel"') && start<end);
  const section=html.slice(start,end);
  assert.match(section,/aria-labelledby="treasurySitesTitle"/);
  assert.match(section,/id="treasurySitesTitle"[^>]*>.*미국 국채/);
  const links=[...section.matchAll(/<a\b([^>]+)>/g)].map(match=>match[1]);
  assert.equal(links.length,2);
  assert.ok(links[0].includes('href="https://home.treasury.gov/policy-issues/financing-the-government/quarterly-refunding"'));
  assert.ok(links[1].includes('href="https://treasurydirect.gov/auctions/announcements-data-results/buy-backs/"'));
  for(const link of links){
    assert.match(link,/target="_blank"/);
    assert.match(link,/rel="noopener noreferrer"/);
  }
});

test('buyback help opens from its card and explains the supplied image without treating it as live data',async()=>{
  assert.match(html,/onclick="openSiteHelp\('buyback'\)"[^>]+aria-label="BUYBACK 사용법"/);
  const source=html.slice(html.indexOf('const siteGuides='),html.indexOf('let siteHelpReturnFocus='));
  const guide=vm.runInNewContext(source+';siteGuides.buyback');
  assert.equal(guide.title,'BUYBACK 사용법');
  for(const label of ['Operation Date','Settlement Date','Maturity Date Range','Maximum Par Amount to be Redeemed','Total Par Amount Offered','Total Par Amount Accepted','Number of Issues Eligible','Number of Issues Accepted'])assert.ok(guide.body.includes(label));
  for(const text of ['148억 8,600만','40.3%','2.48배','최신 결과가 아닙니다','액면금액','QE가 아니며','buyback-faqs/'])assert.ok(guide.body.includes(text));
  const png=await readFile(new URL('../assets/treasury-buyback-results-example.png',import.meta.url));
  assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
  assert.ok(png.readUInt32BE(16)>1000);
  for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(script[1].trim()&&!script[0].includes('type="module"'))new vm.Script(script[1]);
});

test('shared site help restores focus and scrolls new guides to the start',()=>{
  const classes=new Set();
  const modal={classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c)}};
  const dialog={scrollTop:999};
  let focused='trigger';
  const trigger={isConnected:true,focus:()=>{focused='trigger';}};
  const close={focus:()=>{focused='close';}};
  const ids={siteHelpModal:modal,siteHelpBody:{},siteHelpKicker:{},siteHelpTitle:{}};
  const context=vm.createContext({document:{activeElement:trigger,getElementById:id=>ids[id],querySelector:selector=>selector.endsWith('.site-help-dialog')?dialog:close,addEventListener:()=>{}}});
  vm.runInContext(html.slice(html.indexOf('const siteGuides='),html.indexOf('const US_NEWS_SOURCES=')),context);
  vm.runInContext("openSiteHelp('buyback')",context);
  assert.equal(focused,'close');
  assert.equal(dialog.scrollTop,0);
  assert.ok(classes.has('show'));
  assert.match(ids.siteHelpBody.innerHTML,/buyback-example/);
  vm.runInContext('closeSiteHelp()',context);
  assert.equal(focused,'trigger');
  assert.ok(!classes.has('show'));
});
