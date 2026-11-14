// Optional integration runner; Playwright is a development tool, not a game dependency.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const base=process.env.BOARD_TEST_URL??'http://127.0.0.1:4173';
const out=new URL('../dist/board-checks/',import.meta.url);fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});
const errors=[],results=[];
const ready=p=>p.waitForFunction(()=>document.querySelector('.board-art')?.dataset.ready==='true');
async function openBoard(p,key,orientation){
 await p.goto(base+'/#boards');await p.locator('#board-orientation').selectOption(orientation);await p.locator('#board-theme').selectOption(key);await ready(p);await p.locator('.board-stage').scrollIntoViewIfNeeded();await p.waitForTimeout(150);
}
async function point(p,id){return p.evaluate(id=>{
 const s=document.querySelector('.board-art').boardController,prop=s.props.get(id),box=s.el.getBoundingClientRect();
 const candidates=[prop.anchor];const [l,t,w,h]=prop.sprite.bounds;for(let y=t+h*.15;y<t+h*.9;y+=Math.max(2,h/12))for(let x=l+w*.15;x<l+w*.9;x+=Math.max(2,w/12))candidates.push([x,y]);
 for(const [x,y] of candidates){const px=box.left+x/1000*box.width,py=box.top+y/1000*box.height,hit=document.elementFromPoint(px,py);if(s.hitTest(px,py)===id&&hit?.getAttribute('data-hit')===id)return {x:px,y:py};}
 throw new Error('No unobstructed painted hit point: '+id);
},id);}
try{
 for(const touch of [false,true]){
  const context=await browser.newContext({viewport:touch?{width:390,height:844}:{width:1440,height:1100},hasTouch:touch,isMobile:touch,deviceScaleFactor:touch?3:1});
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('favicon.ico'))errors.push(m.text());});
  for(const key of ['gourmet','cochlea']){
   const orientation=touch?'portrait':'landscape';await openBoard(p,key,orientation);
   assert.equal(await p.locator('.scene-prop[data-primary=true]').count(),4);
   const ids=await p.evaluate(()=>[...document.querySelector('.board-art').boardController.props.keys()]);
   await p.locator('.board-stage').screenshot({path:new URL(key+'-'+orientation+'-rest.png',out).pathname});
   for(const id of ids){const q=await point(p,id);touch?await p.touchscreen.tap(q.x,q.y):await p.mouse.click(q.x,q.y);
    assert.equal(await p.locator(`[data-prop="${id}"]`).getAttribute('data-count'),'1',`${key} ${orientation} ${id}`);
    assert.equal(await p.evaluate(id=>document.querySelector('.board-art').boardController.trigger(id),id),false,'spam is blocked');
   }
   await p.waitForTimeout(1100);await p.locator('.board-stage').screenshot({path:new URL(key+'-'+orientation+'-active.png',out).pathname});
   assert.equal(await p.evaluate(()=>document.querySelector('.board-art').boardController.rig.records.size),4);
   assert.equal(await p.evaluate(()=>[...document.querySelectorAll('.environment-piece')].filter(n=>n.dataset.piece!=='chandelier'&&n.dataset.piece!=='curtain').every(n=>n.getAnimations().some(a=>a.playState==='running'))),true);
   // An empty central card surface has no decorative pointer target.
   assert.equal(await p.evaluate(()=>{const s=document.querySelector('.board-art').boardController,r=s.el.getBoundingClientRect(),[x,y,w,h]=s.def.play;const px=r.left+(x+w/2)*r.width,py=r.top+(y+h/2)*r.height;return s.hitTest(px,py);}),null);
   await p.waitForFunction(()=>document.querySelector('.board-art').boardController.rig.records.size===0,{},{timeout:6000});await p.waitForTimeout(800);
   for(const id of ids){assert.equal(await p.locator(`[data-prop="${id}"]`).getAttribute('data-active'),'false');const q=await point(p,id);touch?await p.touchscreen.tap(q.x,q.y):await p.mouse.click(q.x,q.y);assert.equal(await p.locator(`[data-prop="${id}"]`).getAttribute('data-count'),'2');}
   // Pointer drag is scrolling/dragging, not a decorative click.
   await p.evaluate(()=>{const s=document.querySelector('.board-art').boardController;s.rig.clear();s.gate.clear();for(const v of s.props.values())v.root.dataset.active='false';});
   const q=await point(p,ids[0]);await p.mouse.move(q.x,q.y);await p.mouse.down();await p.mouse.move(q.x+30,q.y+25);await p.mouse.up();assert.equal(await p.locator(`[data-prop="${ids[0]}"]`).getAttribute('data-count'),'2');
   // Same-scene UI rerender keeps the existing controller and counters.
   await p.evaluate(()=>{window.previousScene=document.querySelector('.board-art').boardController;window.audioRequests=[];if(window.boardAudioHandler)window.removeEventListener('board-audio-request',window.boardAudioHandler);window.boardAudioHandler=e=>window.audioRequests.push(e.detail);window.addEventListener('board-audio-request',window.boardAudioHandler);});
   await p.locator('[data-board-sound]').click();assert.equal(await p.evaluate(()=>window.previousScene===document.querySelector('.board-art').boardController),true);
   await p.evaluate(id=>{const s=document.querySelector('.board-art').boardController;s.setSound(false);s.trigger(id);},ids[0]);assert.equal(await p.evaluate(()=>window.audioRequests.length),0);
   await p.evaluate(()=>{const s=document.querySelector('.board-art').boardController;s.gate.clear();s.rig.clear();s.setSound(true);s.trigger(''+[...s.props.keys()][0]);});assert.equal(await p.evaluate(()=>window.audioRequests.length),1);assert.equal(await p.evaluate(()=>window.audioRequests[0].available),false);
   await p.locator('#board-quality').selectOption('low');assert.equal(await p.evaluate(()=>document.querySelector('.board-art').boardController.quality.fps),30);
   // Reduced motion immediately cancels movement and still responds with feedback.
   await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(80);assert.equal(await p.evaluate(()=>document.querySelector('.board-art').boardController.motion.matches),true);
   assert.equal(await p.evaluate(()=>document.querySelector('.board-art').boardController.rig.nodes.every(n=>!n.animation)),true);
   await p.evaluate(id=>{const s=document.querySelector('.board-art').boardController;s.gate.clear();s.trigger(id);},ids[0]);await p.waitForTimeout(600);assert.equal(await p.evaluate(()=>document.querySelector('.board-art').boardController.rig.records.size),0);
   await p.emulateMedia({reducedMotion:'no-preference'});
   // Rare event is silent/decorative and postpones itself during a gameplay decision.
   await p.evaluate(()=>{const s=document.querySelector('.board-art').boardController;s.rig.clear();s.rig.nextRare=0;s.setActivity(true);});await p.waitForTimeout(160);assert.equal(await p.evaluate(()=>document.querySelector('.board-art').boardController.rig.records.size),0);
   await p.evaluate(()=>document.querySelector('.board-art').boardController.setActivity(false));await p.waitForTimeout(180);assert.equal(await p.evaluate(()=>document.querySelector('.board-art').boardController.rig.records.size),1);
   // Keyboard uses the same shaped control; hidden boards pause active timelines.
   await p.evaluate(()=>{const s=document.querySelector('.board-art').boardController;s.rig.clear();s.gate.clear();s.rig.rareEnabled=false;});
   const before=Number(await p.locator(`[data-prop="${ids[0]}"]`).getAttribute('data-count'));
   await p.locator(`[data-hit="${ids[0]}"]`).press('Enter');assert.equal(Number(await p.locator(`[data-prop="${ids[0]}"]`).getAttribute('data-count')),before+1);
   await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
   assert.equal(await p.evaluate(()=>document.querySelector('.board-art').boardController.frame),0);
   assert.equal(await p.evaluate(()=>document.querySelector('.board-art').boardController.rig.nodes.filter(n=>n.animation).every(n=>n.animation.playState==='paused')),true);
   await p.waitForTimeout(120);await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
   assert.equal(await p.evaluate(()=>document.querySelector('.board-art').boardController.rig.pausedAt),null);
   // Resizing retains relative object positions and all four accessible paths.
   await p.setViewportSize(touch?{width:430,height:932}:{width:1280,height:900});await p.waitForTimeout(100);for(const id of ids)assert.ok(await point(p,id));
   await p.evaluate(()=>{window.oldBoard=document.querySelector('.board-art').boardController;window.oldBoard.rig.clear();});
   await p.locator('#board-theme').selectOption(key==='gourmet'?'cochlea':'gourmet');await ready(p);assert.equal(await p.evaluate(()=>window.oldBoard.dead&&window.oldBoard.frame===0&&window.oldBoard.rig.nodes.length===0&&window.oldBoard.rig.pool.size===0&&window.oldBoard.props.size===0),true);
   results.push(`${key} ${orientation}: clicks/taps, repeated use, cooldown, reset, pass-through, mute, quality, reduced motion, rare event, resize, cleanup`);
  }
  // Layout switching maps to a separate source painting and destroys previous view.
  await p.locator('#board-orientation').selectOption(touch?'landscape':'portrait');await ready(p);assert.equal(await p.locator('.scene-prop[data-primary=true]').count(),4);
  await context.close();
 }
 // Missing optional assets degrade to original artwork and lighting without a crash.
 const context=await browser.newContext({viewport:{width:1400,height:1000}}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*-underpaint.webp',route=>route.abort());await openBoard(p,'cochlea','landscape');assert.equal(await p.locator('.board-art').getAttribute('data-asset-fallback'),'lighting-only');assert.equal(await p.evaluate(()=>document.querySelector('.board-art').boardController.trigger('rack')),true);await context.close();
 // Actual battle overlay retains target controls over a Tokyo Ghoul environment.
 const battle=await browser.newPage({viewport:{width:1440,height:1000}});battle.on('pageerror',e=>errors.push(e.message));await battle.goto(base+'/#battle');await battle.locator('[data-start]').first().click();await battle.locator('[data-keep]').click();await battle.locator('#board-theme').selectOption('gourmet');await ready(battle);await battle.locator('.board-stage').scrollIntoViewIfNeeded();
 for(const id of ['platter','masks','mechanism','door'])assert.ok(await point(battle,id));
 const end=battle.locator('[data-end]');await end.waitFor({state:'visible'});const bb=await end.boundingBox();assert.equal(await battle.evaluate(({x,y})=>document.elementFromPoint(x,y)?.hasAttribute('data-end'),{x:bb.x+bb.width/2,y:bb.y+bb.height/2}),true);await battle.close();
 assert.deepEqual(errors,[]);console.log(results.join('\n'));console.log('PASS: 16 primary corner/layout activations, repeat interactions and lifecycle checks; no page errors.');
}finally{await browser.close();}
