import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const code=await readFile(new URL('../assets/workspace.mjs',import.meta.url),'utf8');
const css=await readFile(new URL('../assets/workspace.css',import.meta.url),'utf8');

test('connection status reuses the live list, removes its old panel and opens only on click',()=>{
  const events={};
  const panel={removed:false,remove(){this.removed=true;}};
  const list={innerHTML:'pending',closest:()=>panel};
  const dialog={open:false,append(node){this.list=node;},showModal(){this.open=true;},close(){this.open=false;}};
  const trigger={addEventListener(name,fn){events[name]=fn;}};
  const ctx=vm.createContext({
    $:selector=>selector==='#marketSourceList'?list:trigger,
    makeDialog(id,title,body){assert.equal(id,'workspaceConnections');assert.equal(title,'데이터 연결 상태');assert.equal(body,'');return dialog;},
    window:{addEventListener(name,fn){events[name]=fn;}}
  });
  vm.runInContext(code.match(/function initConnectionStatus\([^]*?^}/m)[0]+'\ninitConnectionStatus()',ctx);
  assert.equal(panel.removed,true);
  assert.equal(dialog.list,list);
  assert.equal(dialog.open,false);
  events.click();assert.equal(dialog.open,true);
  list.innerHTML='updated after refresh';assert.equal(dialog.list.innerHTML,'updated after refresh');
  events['app-view-change']({detail:'dashboard'});assert.equal(dialog.open,true);
  events['app-view-change']({detail:'map'});assert.equal(dialog.open,false);
  events.click();assert.equal(dialog.open,true);
});

test('toolbar status control is beside reload and dialog retains shared close behavior',()=>{
  assert.match(html,/aria-label="지표 새로고침"[^]*?<\/button>\s*<button type="button" id="marketConnectionButton"[^]*?aria-haspopup="dialog" aria-controls="workspaceConnections"/);
  assert.equal([...html.matchAll(/id="marketSourceList"/g)].length,1);
  assert.match(code,/\[\s*'monitorSources','원문 링크'\]/);
  assert.doesNotMatch(code,/원문·연결 상태/);
  assert.match(code,/dialog\.className='workspace-dialog'/);
  assert.match(code,/addEventListener\('click',\(\)=>dialog\.close\(\)\)/);
  assert.match(css,/#monitorSources \.dashboard-sections\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(css,/#workspaceConnections\{max-width:640px\}/);
  assert.ok(html.includes('assets/workspace.css?v=20260927-connections'));
  assert.ok(html.includes('assets/workspace.mjs?v=20260929-watch-left'));
});
