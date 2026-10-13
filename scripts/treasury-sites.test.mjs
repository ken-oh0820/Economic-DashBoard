import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

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
