import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const base=process.env.TG_TEST_URL??'http://127.0.0.1:4174';
const out=new URL('../dist/naruto-buff-checks/',import.meta.url);fs.mkdirSync(out,{recursive:true});
const browser=await (process.env.MENU_BROWSER==='webkit'?webkit:chromium).launch(process.env.MENU_BROWSER==='webkit'?{headless:true}:{executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const errors=[];
try {
 for(const mobile of [false,true]) {
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:mobile?2:1});
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&r.url().includes('/art/'))errors.push(r.url());});
  await p.goto(base+'/#collection');await p.locator('[data-faction="Naruto"]').click();
  assert.equal(await p.locator('.card-grid .card').count(),46);
  await p.locator('[data-zoom="eight_trigrams_palm_rotation"]').click();await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(350);
  assert.match(await p.locator('.framed-inspect').getAttribute('aria-label'),/Palm Rotation/);
  await p.screenshot({path:new URL(mobile?'palm-rotation-mobile.png':'palm-rotation-desktop.png',out).pathname});await p.locator('.modal-close').click();
  await p.locator('a[href="#decks"]').click();
  for(const name of ['Team 7 Combo','Ino–Shika–Cho Control','Will of Fire']){await p.locator('#preset').selectOption(name);assert.match(await p.locator('.deck-list').textContent(),/Palm Rotation/);}
  await p.evaluate(async()=>{
   const {createGame,applyAction}=await import('/src/engine/engine.js');const {summonMinion,addToHand}=await import('/src/engine/core.js');const {FACTION_LISTS}=await import('/src/cards/index.js');
   const s=createGame({players:[{factions:['Naruto'],deck:FACTION_LISTS.Naruto},{factions:['Naruto'],deck:FACTION_LISTS.Naruto}],seed:27,rules:{mulligan:false,secondPlayerPotions:false,openingHandHelp:false}});
   for(const pl of s.players){pl.board=[];pl.hand=[];pl.mana={current:10,max:10,bonusNextTurn:0};}
   s.activePlayer=1;
   const a=summonMinion(s,1,'shino_aburame',{silent:true});a.sick=false;
   summonMinion(s,0,'neji_hyuga',{silent:true});addToHand(s,0,'eight_trigrams_palm_rotation');
   applyAction(s,{type:'attack',player:1,attacker:a.uid,defender:s.players[0].hero.uid});
   localStorage.setItem('anime-clash-v1-match',JSON.stringify(s));
  });
  await p.goto(base+'/#battle');await p.reload();await p.waitForSelector('.hand [data-hand]');
  const get=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('anime-clash-v1-match')));
  let s=await get();assert.equal(s.pending.player,0);const spell=s.players[0].hand.find(c=>c.cardId==='eight_trigrams_palm_rotation');
  await p.locator(`.hand [data-hand="${spell.uid}"]`)[mobile?'tap':'click']();s=await get();assert.equal(s.players[0].hero.health,30);assert.equal(s.players[1].board[0].health,2);assert.equal(s.players[0].mana.jammedNextTurn??0,0);
  await p.locator('a.nav-item[href="#collection"]').click();
  await p.evaluate(async()=>{
   const {createGame,run}=await import('/src/engine/engine.js'),{summonMinion,addToHand}=await import('/src/engine/core.js'),{FACTION_LISTS}=await import('/src/cards/index.js');
   const s=createGame({players:[{factions:['Naruto'],deck:FACTION_LISTS.Naruto},{factions:['One Piece'],deck:FACTION_LISTS['One Piece']}],seed:4,rules:{mulligan:false,secondPlayerPotions:false}});
   for(const pl of s.players){pl.board=[];pl.hand=[];pl.mana={current:10,max:10,bonusNextTurn:0};}
   for(const id of ['naruto_uzumaki','sasuke_uchiha','sakura_haruno'])summonMinion(s,0,id,{silent:true});addToHand(s,0,'kakashi_hatake');
   s.players[1].mana.jammedNextTurn=8;s.queue.push({kind:'deaths'});run(s);localStorage.setItem('anime-clash-v1-match',JSON.stringify(s));
  });
  await p.goto(base+'/#battle');await p.reload();await p.waitForSelector('.naruto-teams');
  assert.match(await p.locator('.naruto-teams summary').innerText(),/1\/4/);assert.match(await p.locator('.jammed-status').innerText(),/8 Jammed next turn/);
  await p.locator('.naruto-teams summary').click();assert.match(await p.locator('.naruto-teams').innerText(),/Kakashi/);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await p.screenshot({path:new URL(mobile?'team-and-jam-mobile.png':'team-and-jam-desktop.png',out).pathname});
  await context.close();console.log(`${mobile?'Mobile touch':'Desktop'}: supplied art, 46 cards, 30-card presets, real Quick Play, Neji counter, team progress and Jammed HUD passed`);
 }
 assert.deepEqual(errors,[]);
} finally {await browser.close();}
