import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const base=process.env.TG_TEST_URL??'http://127.0.0.1:4174',out=new URL('../dist/tokyo-ghoul-checks/',import.meta.url);fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const errors=[];
const saved=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('anime-clash-v1-match')));
async function fixture(p,hero='kaneki'){
 await p.evaluate(async hero=>{
  const {createGame,run}=await import('/src/engine/engine.js'),{summonMinion,addToHand}=await import('/src/engine/core.js'),{ANIME_PRESETS}=await import('/src/cards/anime-presets.js');
  const ccg=ANIME_PRESETS['Tokyo Ghoul']['CCG Quinque Hunter'],ghoul=ANIME_PRESETS['Tokyo Ghoul']['Cannibalism Kakuja'];
  const s=createGame({players:[{factions:['Tokyo Ghoul'],deck:hero==='arima'?ccg:ghoul,hero},{factions:['Tokyo Ghoul'],deck:ghoul,hero:'kaneki'}],seed:27,rules:{mulligan:false,secondPlayerPotions:false,coinCardId:null,openingHandHelp:false}});
  for(const pl of s.players){pl.board=[];pl.hand=[];pl.mana={current:10,max:10,bonusNextTurn:0};}
  const put=(p,id)=>{const m=summonMinion(s,p,'tg_'+id,{silent:true});m.sick=false;m.enteredOnTurn=-1;return m;};
  const m=put(0,'nishiki');m.health=1;m.hunger=2;put(0,'civilian');const v=put(1,'yomo');v.health=2;
  if(hero==='kaneki'){s.players[0].tokyo.stacks=3;addToHand(s,0,'tg_feeding_frenzy');s.players[0].hero.health=20;}
  s.queue.push(...s.buffer,{kind:'deaths'});s.buffer=[];run(s);localStorage.setItem('anime-clash-v1-match',JSON.stringify(s));
 },hero);await p.goto(base+'/#battle');await p.reload();await p.waitForSelector('.battlefield');
}
try{
 for(const mobile of [false,true]){
  const c=await b.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:mobile?2:1}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&r.url().includes('/art/'))errors.push('Asset: '+r.url());});
  await p.goto(base+'/#collection');await p.locator('[data-faction="Tokyo Ghoul"]').click();assert.equal(await p.locator('.card-grid .card').count(),45);
  for(const [filter,n] of [['hero',3],['weapon',6],['trap',5],['legendary',13],['tokens',8]]){await p.locator(`[data-filter="${filter}"]`).click();assert.equal(await p.locator('.card-grid .card').count(),n);}
  await p.locator('[data-filter="all"]').click();await p.locator('[data-nav="decks"]').first().click();assert.equal(await p.locator('#tg-hero').inputValue(),'kaneki');await p.locator('#tg-hero').selectOption('touka');await p.reload();assert.equal(await p.locator('#tg-hero').inputValue(),'touka');
  await p.locator('#preset').selectOption('CCG Quinque Hunter');assert.equal(await p.locator('#tg-hero').inputValue(),'arima');assert.equal(await p.locator('#tg-hero').isDisabled(),true);assert.match(await p.locator('.tg-hero-choice').innerText(),/29 cards/);
  await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(100);assert.equal(await p.locator('.rules-parchment p').first().evaluate(e=>getComputedStyle(e).minHeight),'0px');
  await p.locator('[data-filter="hero"]').click();await p.locator('.card-grid [data-zoom="tg_arima"]').click();assert.equal(await p.locator('.framed-inspect .realm-frame').count(),1);await p.locator('.modal-close').click();
  if(!mobile)await p.screenshot({path:new URL('ccg-deck.png',out).pathname});
  const waitDownload=p.waitForEvent('download');await p.locator('[data-export]').click();const download=await waitDownload,content=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(content.hero,'arima');assert.equal(content.cards.length,30);
  await p.locator('[data-start]').click();await p.locator('[data-keep]').click();assert.equal((await saved(p)).players[0].tokyo.hero,'arima');assert.ok(!(await saved(p)).players[0].hand.some(c=>c.cardId==='tg_arima'));assert.match(await p.locator('[data-hero-spell]').innerText(),/Perfect Quinque/);
  await fixture(p);let s=await saved(p);const m=s.players[0].board.find(m=>m.cardId==='tg_nishiki'),civil=s.players[0].board.find(m=>m.cardId==='tg_civilian'),enemy=s.players[1].board[0];
  await p.locator(`[data-feed="${m.uid}"]`).click();await p.locator(`[data-character="${civil.uid}"]`).click();s=await saved(p);assert.equal(s.players[0].board.find(x=>x.uid===m.uid).health,3);assert.equal(s.players[0].board.length,1);
  const spell=s.players[0].hand.find(c=>c.cardId==='tg_feeding_frenzy');await p.locator(`[data-hand="${spell.uid}"]`).click();await p.locator(`[data-character="${m.uid}"]`).click();await p.waitForFunction(uid=>document.querySelector(`[data-character="${uid}"]`)?.classList.contains('targetable'),enemy.uid);assert.equal(await p.locator(`[data-character="${enemy.uid}"]`).evaluate(e=>e.classList.contains('targetable')),true);await p.locator(`[data-character="${enemy.uid}"]`).click();s=await saved(p);assert.equal(s.players[0].tokyo.stacks,4);assert.equal(s.players[1].board.length,0);
  await p.locator('[data-kakuja]').click();assert.equal(await p.locator('[data-choice]').count(),3);await p.locator('[data-choice="0"]').click();s=await saved(p);assert.equal(s.players[0].tokyo.evolved,true);assert.match(await p.locator('.tg-equipment').innerText(),/Hybrid Kakuja/);
  await p.locator('.tg-equipment [data-character]').click();await p.locator(`[data-character="${s.players[1].hero.uid}"]`).click();assert.equal((await saved(p)).players[0].hero.attacksThisTurn,1);await p.locator('[data-hero-spell]').click();assert.equal((await saved(p)).players[0].heroSpells[0].uses,1);
  if(!mobile)await p.screenshot({path:new URL('kakuja-match.png',out).pathname});
  await fixture(p,'arima');await p.locator('[data-hero-spell]').click();assert.ok(await p.locator('[data-choice]').count()>0);await p.locator('[data-choice="0"]').click();s=await saved(p);const w=s.players[0].hand.find(c=>['tg_narukami','tg_ixa','tg_jason','tg_doujima','tg_fueguchi','tg_yukimura'].includes(c.cardId));assert.ok(w);await p.locator(`[data-hand="${w.uid}"]`).click();s=await saved(p);assert.equal(s.players[0].hero.weapon.cardId,w.cardId);await p.waitForFunction(()=>document.querySelector('.tg-equipment')?.textContent.includes('Durability'));assert.match(await p.locator('.tg-equipment').innerText(),/Durability/);
  await p.reload();assert.equal((await saved(p)).players[0].hero.weapon.cardId,w.cardId);await p.locator('a.nav-item[href="#collection"]').click();await p.locator('[data-faction="Naruto"]').click();assert.equal(await p.locator('.card-grid .card').count(),46);await p.locator('[data-faction="One Piece"]').click();assert.equal(await p.locator('.card-grid .card').count(),45);
  await c.close();console.log((mobile?'Mobile':'Desktop')+': 45 cards, filters, named Hero, saved choice, export, Feed, two-target spell, Kakuja, Hero attack, Hero Spell and Quinque equip passed');
 }
 assert.deepEqual(errors,[]);
}finally{await b.close();}
