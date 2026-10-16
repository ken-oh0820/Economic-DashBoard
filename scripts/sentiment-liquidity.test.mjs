import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gaugeState} from '../assets/sentiment-gauges.mjs';
import {SERIES,seriesRights} from './update-official-data.mjs';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
test('fear gauges have valid bounds and missing data does not become zero',()=>{
  for(const [value,label] of [[0,'극단적 공포'],[24,'극단적 공포'],[25,'공포'],[45,'중립'],[55,'중립'],[56,'탐욕'],[76,'극단적 탐욕'],[100,'극단적 탐욕']])assert.equal(gaugeState(value).label,label);
  for(const value of [NaN,Infinity,-1,101])assert.equal(gaugeState(value),null);
  assert.equal(gaugeState(-.4,true).label,'평균보다 완화적');
  assert.equal(gaugeState(0,true).position,50);
  assert.equal(gaugeState(4,true).position,100);
});
test('liquidity moves existing rows exactly once, includes reviewed official series, removes rate schedule panel',()=>{
  const panel=html.match(/<section class="dashboard-panel liquidity-panel"[^]*?<\/section>/)[0];
  for(const key of ['sofr','iorb','tgcr','srf']){
    assert.ok(panel.includes('id="watch-'+key+'"'));
    assert.equal(html.split('id="watch-'+key+'"').length-1,1);
  }
  assert.ok(!html.includes('id="rateSchedulePanel"'));
  for(const id of ['TGCRRATE','SRFTSYD']){
    assert.ok(SERIES[id]);
    assert.equal(seriesRights(id,[{name:'Copyrighted: Citation Required'}]),'Copyrighted: Citation Required');
    assert.equal(seriesRights(id,[{name:'Copyrighted: Pre-Approval Required'}]),null);
  }
});
