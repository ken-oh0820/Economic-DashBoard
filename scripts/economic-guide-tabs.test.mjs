import test from 'node:test';
import assert from 'node:assert/strict';
import {initGuideTabs} from '../assets/economic-guide.mjs';
import {readFile} from 'node:fs/promises';

function fixture() {
  const ids = ['guide-important', 'guide-terms'];
  const panels = ids.map(() => ({hidden:false}));
  const tabs = ids.map(id => ({
    attrs:{'aria-controls':id}, events:{}, focused:false,
    getAttribute(key){return this.attrs[key];},
    setAttribute(key,value){this.attrs[key]=value;},
    addEventListener(key,handler){this.events[key]=handler;},
    focus(){this.focused=true;}
  }));
  const tablist = {hidden:true,querySelectorAll:()=>tabs};
  const root = {querySelector:selector=>selector==='[role="tablist"]'?tablist:panels[ids.indexOf(selector.slice(1))]};
  initGuideTabs(root);
  return {tabs,panels,tablist};
}

test('important indicators are the default, and clicks switch accessible panels without losing details',()=>{
  const {tabs,panels,tablist}=fixture();
  assert.equal(tablist.hidden,false);
  assert.deepEqual(panels.map(p=>p.hidden),[false,true]);
  assert.deepEqual(tabs.map(t=>t.tabIndex),[0,-1]);
  panels[0].openDetails=3;
  tabs[1].events.click();
  assert.deepEqual(panels.map(p=>p.hidden),[true,false]);
  assert.deepEqual(tabs.map(t=>t.attrs['aria-selected']),['false','true']);
  tabs[0].events.click();
  assert.deepEqual(panels.map(p=>p.hidden),[false,true]);
  assert.equal(panels[0].openDetails,3);
});

test('tab keyboard navigation wraps, supports Home/End, and leaves unrelated keys alone',()=>{
  const {tabs,panels}=fixture();
  const press=(index,key,expected)=>{
    let prevented=false;
    tabs[index].events.keydown({key,preventDefault(){prevented=true;}});
    assert.equal(prevented,true);
    assert.equal(tabs[expected].attrs['aria-selected'],'true');
    assert.equal(tabs[expected].focused,true);
    assert.equal(panels[expected].hidden,false);
    assert.deepEqual(tabs.map(t=>t.tabIndex),expected===0?[0,-1]:[-1,0]);
  };
  press(0,'ArrowLeft',1);
  press(1,'ArrowRight',0);
  press(0,'End',1);
  press(1,'Home',0);
  tabs[0].events.keydown({key:'Tab',preventDefault(){assert.fail('Tab must remain native');}});
  assert.doesNotThrow(()=>initGuideTabs(null));
});

test('tab and panel associations match and sections remain readable without JavaScript',async()=>{
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const id of ['guide-important','guide-terms']){
    assert.ok(html.includes('id="'+id+'-tab" role="tab" aria-controls="'+id+'"'));
    assert.ok(html.includes('<section id="'+id+'" role="tabpanel" aria-labelledby="'+id+'-tab" tabindex="0">'));
  }
  assert.match(html,/class="guide-tabs"[^>]* hidden>/);
  assert.match(html,/<script type="module" src="assets\/economic-guide.mjs\?v=/);
});
