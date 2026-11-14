import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium,webkit}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const base=process.env.TG_TEST_URL??'http://127.0.0.1:4174',out=new URL('../dist/hero-picker-checks/',import.meta.url);fs.mkdirSync(out,{recursive:true});
const browser=await (process.env.MENU_BROWSER==='webkit'?webkit:chromium).launch(process.env.MENU_BROWSER==='webkit'?{headless:true}:{headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
async function path(p,key){await p.locator(`[data-tg-path=${key}]`).click();await p.waitForFunction(key=>document.querySelector(`[data-tg-path="${key}"]`)?.getAttribute('aria-pressed')==='true',key);}
const saved=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('anime-clash-v1-match')));
const deck=p=>p.evaluate(async()=>JSON.parse(localStorage.getItem('anime-clash-v1-decks'))?.['Tokyo Ghoul']??Object.values((await import('/src/cards/anime-presets.js')).ANIME_PRESETS['Tokyo Ghoul'])[0]);
async function chosen(p,key){await p.waitForFunction(key=>document.querySelector(`[data-tg-hero="${key}"]`)?.getAttribute('aria-pressed')==='true',key);assert.equal(await p.locator(`[data-tg-hero=${key}]`).getAttribute('aria-pressed'),'true');assert.match(await p.locator('.tg-selected-hero').innerText(),/This Hero will lead your next match/);}
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},hasTouch:mobile,isMobile:mobile});const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/#decks');await p.locator('[data-faction="Tokyo Ghoul"]').click();await chosen(p,'kaneki');assert.equal(await p.locator('.tg-hero-option').count(),4);
  await path(p,'investigator');assert.equal(await p.locator('[data-start]').isDisabled(),true);assert.equal(await p.locator('.tg-hero-option').count(),4);
  await p.locator('[data-tg-hero=arima]').click();await p.locator('[data-cancel-hero]').click();assert.ok(!(await deck(p)).includes('tg_arima'));
  await p.locator('[data-tg-hero=arima]').click();await p.locator('[data-hero-swap]').first().click();await chosen(p,'arima');assert.equal((await deck(p)).length,30);assert.equal((await deck(p)).filter(id=>id==='tg_arima').length,1);
  await p.reload();await chosen(p,'arima');assert.equal(await p.locator('[data-start]').isDisabled(),false);
  await p.locator('.tg-hero-choice').scrollIntoViewIfNeeded();await p.screenshot({path:new URL(`investigator-${mobile?'mobile':'desktop'}.png`,out).pathname,fullPage:false});
  // Battle setup repeats the actual selected Hero, portrait and power.
  await p.locator('a.nav-item[href="#battle"]').click();assert.equal(await p.locator('.tg-hero-choice').count(),1);assert.match(await p.locator('.lobby-card h2').innerText(),/Arima/);assert.match(await p.locator('.lobby-card').innerText(),/Perfect Quinque/);
  await p.locator('[data-start]').click();await p.locator('[data-keep]').click();let s=await saved(p);assert.equal(s.players[0].tokyo.hero,'arima');assert.equal(s.players[0].hero.armor,8);assert.equal(s.players[0].deck.length+s.players[0].hand.length,29);assert.match(await p.locator('[data-hero-spell]').innerText(),/Perfect Quinque/);
  await p.locator('a.nav-item[href="#decks"]').click();await path(p,'ghoul');await p.locator('[data-tg-hero=touka]').click();await p.locator('[data-hero-swap]').first().click();await chosen(p,'touka');assert.equal((await deck(p)).length,30);assert.ok(!(await deck(p)).includes('tg_arima'));assert.equal((await saved(p)).players[0].tokyo.hero,'arima');
  await path(p,'investigator');await p.locator('[data-tg-hero=investigator]').click();await chosen(p,'investigator');assert.equal((await deck(p)).length,30);
  await p.locator('[data-tg-hero=amon]').click();await p.locator('[data-hero-swap]').first().click();await chosen(p,'amon');await p.locator('[data-tg-hero=akira]').click();await chosen(p,'akira');assert.equal((await deck(p)).length,30);assert.ok((await deck(p)).includes('tg_akira'));assert.ok(!(await deck(p)).includes('tg_amon'));
  await p.reload();await chosen(p,'akira');
  // Exercise the real attack UI: Yukimura overrides Stealth only for this Hero,
  // and grants two attacks while Arima is the active Hero.
  await p.evaluate(async()=>{
   const {createGame,getLegalActions,applyAction}=await import('/src/engine/engine.js'),{summonMinion,addToHand}=await import('/src/engine/core.js'),{ANIME_PRESETS}=await import('/src/cards/anime-presets.js');const presets=ANIME_PRESETS['Tokyo Ghoul'];
   const s=createGame({players:[{factions:['Tokyo Ghoul'],deck:presets['CCG Quinque Hunter'],hero:'arima'},{factions:['Tokyo Ghoul'],deck:presets['Cannibalism Kakuja'],hero:'kaneki'}],seed:35,rules:{mulligan:false,secondPlayerPotions:false,coinCardId:null,openingHandHelp:false}});
   for(const pl of s.players){pl.board=[];pl.hand=[];pl.mana={current:10,max:10,bonusNextTurn:0};}
   const hidden=summonMinion(s,1,'tg_assassin',{silent:true});hidden.health=hidden.maxHealth=12;const card=addToHand(s,0,'tg_yukimura');applyAction(s,getLegalActions(s).find(a=>a.type==='play'&&a.card===card.uid));localStorage.setItem('anime-clash-v1-match',JSON.stringify(s));
  });await p.goto(base+'/#battle');await p.reload();await p.waitForSelector('.battlefield');s=await saved(p);const hidden=s.players[1].board[0].uid;
  for(const [health,durability] of [[8,2],[6,1]]){
   await p.locator('.tg-equipment [data-character]').click();await p.waitForFunction(uid=>document.querySelector(`[data-character="${uid}"]`)?.classList.contains('targetable'),hidden);await p.locator(`[data-character="${hidden}"]`).click();await p.waitForFunction(n=>JSON.parse(localStorage.getItem('anime-clash-v1-match')).players[1].board[0].health===n,health);s=await saved(p);assert.equal(s.players[0].hero.weapon.durability,durability);
  }
  await p.waitForFunction(()=>document.querySelector('.tg-equipment [data-character]')?.disabled);assert.equal(await p.locator('.tg-equipment [data-character]').isDisabled(),true);assert.equal(s.players[0].hero.attacksThisTurn,2);assert.ok(s.players[1].board[0].keywords.includes('Stealth'));
  assert.deepEqual(errors,[]);console.log(`${mobile?'Mobile':'Desktop'}: explicit Hero paths, all choices, safe deck swaps/cancel, persistence, real match initialization, Yukimura Stealth attacks and Arima Twin Strike passed`);await context.close();
 }
}finally{await browser.close();}
