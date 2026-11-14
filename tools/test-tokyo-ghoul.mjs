import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TOKYO_GHOUL as F,LEAF,FACTION_POOLS,FACTION_LISTS} from '../src/cards/index.js';
import {ANIME_PRESETS} from '../src/cards/anime-presets.js';
import {TG_HEROES,TG_KAGUNES} from '../src/cards/tokyo-ghoul.js';
import {getCard} from '../src/engine/registry.js';
import {validateAllCards} from '../src/cards/validate.js';
import {checkDeck,singleDeckProblem} from '../src/cards/deck-check.js';
import {createGame,getLegalActions,applyAction,run,actingPlayer} from '../src/engine/engine.js';
import {addToHand,summonMinion,hasKeyword,effectiveAttack,dealDamage,emit} from '../src/engine/core.js';
import {EFFECT_OPS,addKeyword} from '../src/engine/effects.js';
import {tgWearWeapon,tgIncomingDamage} from '../src/engine/tokyo-ghoul.js';
import {chooseAction} from '../src/ai/greedy.js';
const id=n=>'tg_'+n;
function deck(hero){return TG_HEROES[hero]?.card?ANIME_PRESETS[F]['CCG Quinque Hunter'].map(c=>c==='tg_arima'?TG_HEROES[hero].card:c):FACTION_LISTS[F];}
function game(hero='kaneki',other='kaneki'){const s=createGame({players:[{factions:[F],deck:deck(hero),hero},{factions:[F],deck:deck(other),hero:other}],seed:35,rules:{mulligan:false,secondPlayerPotions:false,openingHandHelp:false}});for(const p of s.players){p.board=[];p.hand=[];p.mana={current:10,max:10,bonusNextTurn:0};}return s;}
function put(s,p,name){const m=summonMinion(s,p,name.startsWith('tg_')?name:id(name),{silent:true});assert.ok(m);m.sick=false;m.enteredOnTurn=-1;return m;}
function flush(s){s.queue.push(...s.buffer,{kind:'deaths'});s.buffer=[];run(s);}
function event(s,e){emit(s,e);flush(s);}
function play(s,name,t,t2,p=0){s.players[p].mana.current=10;const inst=addToHand(s,p,id(name));assert.ok(inst);const a=getLegalActions(s).find(a=>a.type==='play'&&a.card===inst.uid&&(t==null||a.target===t.uid)&&(t2==null||a.target2===t2.uid));assert.ok(a,`play ${name}`);applyAction(s,a);return s.players[p].board.findLast(m=>m.cardId===id(name));}
function end(s){const a=getLegalActions(s).find(a=>a.type==='endTurn');assert.ok(a);applyAction(s,a);}
function round(s){end(s);end(s);}
function attack(s,a,d){const action=getLegalActions(s).find(x=>x.type==='attack'&&x.attacker===a.uid&&x.defender===d.uid);assert.ok(action,'attack '+a.cardId);applyAction(s,action);}
function feed(s,a,d){const action=getLegalActions(s).find(x=>x.type==='feed'&&x.minion===a.uid&&x.target===d.uid);assert.ok(action,'feed');applyAction(s,action);}
function hit(s,m,n){dealDamage(s,null,m.uid,n);flush(s);}
function power(s){const a=getLegalActions(s).find(x=>x.type==='heroSpell');assert.ok(a);applyAction(s,a);}

test('Tokyo Ghoul has 45 collectibles, correct types, 13 Legendaries, complete rules and artwork',()=>{
 const cards=FACTION_POOLS[F].map(getCard);assert.equal(cards.length,45);assert.deepEqual(['minion','hero','spell','trap','weapon'].map(t=>cards.filter(c=>c.type===t).length),[21,3,10,5,6]);assert.equal(cards.filter(c=>c.legendary).length,13);assert.deepEqual(validateAllCards().filter(c=>c.errors.length||c.incomplete.length),[]);for(const c of cards)assert.ok(fs.existsSync(new URL('../'+c.image,import.meta.url)),c.name);for(const d of Object.values(ANIME_PRESETS[F]))assert.equal(singleDeckProblem(F,d),null);
});
test('all eight Hero selections initialize their armor, equipment and Hero Spell',()=>{
 for(const [key,v] of Object.entries(TG_HEROES)){const s=game(key),p=s.players[0];assert.equal(p.hero.health,30);assert.equal(p.hero.armor,v.armor+(v.kagune==='koukaku'?2:0));assert.equal(p.heroSpells[0].cardId,v.spell);assert.equal(p.tokyo.path,v.path);if(v.kagune){assert.equal(p.hero.weapon.cardId,id(v.kagune));assert.equal(p.hero.weapon.durability,TG_KAGUNES[v.kagune].durability);}else assert.ok(!p.hero.weapon);}
});
test('Investigator Hero card counts toward 30 but is excluded from the draw pile and cannot be summoned or played',()=>{
 const cfg={factions:[F],deck:deck('arima'),hero:'arima'};const s=createGame({players:[cfg,cfg],rules:{mulligan:false,secondPlayerPotions:false,coinCardId:null,openingHandHelp:false}});for(const p of s.players){assert.equal(p.deck.length+p.hand.length,29);assert.ok(![...p.deck,...p.hand].some(c=>c.cardId==='tg_arima'));}assert.equal(summonMinion(s,0,'tg_arima'),null);
 const d=[...deck('arima')];d[1]='tg_amon';assert.ok(singleDeckProblem(F,d));assert.ok(checkDeck({...cfg,hero:'kaneki'}).error);assert.ok(checkDeck({factions:[F],deck:deck('kaneki'),hero:'arima'}).error);
});
test('Hunger increments at own end, starves at three, and Starving Ghoul begins at two',()=>{
 const s=game(),m=put(s,0,'nishiki'),n=put(s,0,'starving');assert.equal(n.hunger,2);end(s);assert.equal(m.hunger,1);assert.equal(n.hunger,3);assert.equal(n.health,1);end(s);round(s);round(s);assert.equal(m.hunger,3);assert.equal(m.health,2);
});
test('Aogiri reduces starvation damage, Silence removes that ability, and Yoshimura suppresses Ghoul Hunger',()=>{
 const s=game(),a=put(s,0,'aogiri'),g=put(s,0,'nishiki'),half=put(s,0,'amon_ghoul');a.hunger=3;end(s);assert.equal(a.health,3);end(s);addKeyword(a,'Silenced',false,s);put(s,0,'yoshimura');const before=g.hunger;end(s);assert.equal(a.health,2);assert.equal(g.hunger,before);assert.equal(half.hunger,2);
});
test('Feed requires an available attack and Mana, consumes a Human token, heals, and spends the turn’s attacks',()=>{
 const s=game(),m=put(s,0,'nishiki'),human=put(s,0,'civilian');m.health=1;m.hunger=3;const mana=s.players[0].mana.current;feed(s,m,human);assert.equal(m.health,3);assert.equal(m.hunger,0);assert.equal(s.players[0].mana.current,mana-1);assert.ok(!getLegalActions(s).some(a=>a.minion===m.uid||a.attacker===m.uid));end(s);assert.equal(m.hunger,0);
});
test('Feed cannot select Heroes, itself, friendly non-token Humans, healthy enemies, or enemies above two Health',()=>{
 const s=game(),m=put(s,0,'nishiki'),human=put(s,0,'hirako'),high=put(s,1,'nishiki'),healthy=put(s,1,'starving');const valid=getLegalActions(s).filter(a=>a.type==='feed'&&a.minion===m.uid);for(const target of [m,human,high,healthy,s.players[1].hero])assert.ok(!valid.some(a=>a.target===target.uid));m.sick=true;assert.ok(!getLegalActions(s).some(a=>a.type==='feed'&&a.minion===m.uid));
});
test('Ghoul and Half-Ghoul consumption apply different stat/healing benefits and Cannibalism caps at four',()=>{
 for(const [victim,gainA,gainH,healN] of [['nishiki',1,2,0],['amon_ghoul',0,1,3]]){const s=game(),m=put(s,0,'hinami'),v=put(s,1,victim);m.health=1;v.health=2;s.players[0].tokyo.stacks=4;feed(s,m,v);assert.equal(m.attack,2+gainA);assert.equal(m.maxHealth,4+gainH);assert.equal(m.health,1+gainH+healN);assert.equal(s.players[0].tokyo.stacks,4);}
});
test('Kaneki and Starving Ghoul gain consume Attack, and Tsukiyama rewards Human prey',()=>{
 const s=game(),m=put(s,0,'kaneki'),shuu=put(s,0,'tsukiyama'),v=put(s,0,'civilian');m.health=1;feed(s,m,v);assert.equal(m.attack,6);assert.deepEqual([shuu.attack,shuu.maxHealth],[4,6]);const n=put(s,0,'starving'),other=put(s,1,'nishiki');other.health=2;feed(s,n,other);assert.equal(n.attack,5);
});
test('two-target consume spells reject self-consumption, reset Hunger and give the extra Feast stack',()=>{
 const s=game(),m=put(s,0,'nishiki'),v=put(s,0,'aogiri');m.hunger=3;const c=addToHand(s,0,'tg_cannibalistic_feast');assert.ok(!getLegalActions(s).some(a=>a.card===c.uid&&a.target===a.target2));play(s,'cannibalistic_feast',m,v);assert.equal(s.players[0].tokyo.stacks,2);assert.equal(m.hunger,0);const enemy=put(s,1,'nishiki');enemy.health=2;play(s,'feeding_frenzy',m,enemy);assert.equal(s.players[0].tokyo.stacks,3);assert.equal(m.attacksThisTurn,0);
});
test('Human Prey summons two protected, non-attacking Civilians',()=>{
 const s=game();play(s,'human_prey');assert.equal(s.players[0].board.length,2);assert.ok(s.players[0].board.every(m=>m.attack===0&&m.health===2));const m=put(s,0,'kaneki'),v=put(s,1,'civilian');v.health=1;assert.ok(!getLegalActions(s).some(a=>a.type==='feed'&&a.minion===m.uid&&a.target===v.uid));const inst=addToHand(s,0,'tg_kaneki');assert.ok(!getLegalActions(s).some(a=>a.card===inst.uid&&a.target===v.uid));round(s);assert.ok(getLegalActions(s).some(a=>a.type==='feed'&&a.minion===m.uid&&a.target===v.uid));
});
test('Kagune exhausts without destruction and repairs into an attack-capable weapon',()=>{
 const s=game(),h=s.players[0].hero;h.weapon.durability=1;attack(s,h,s.players[1].hero);assert.ok(h.weapon.kagune);assert.equal(h.weapon.exhausted,true);assert.equal(effectiveAttack(h),0);round(s);assert.ok(!getLegalActions(s).some(a=>a.attacker===h.uid));play(s,'kagune_manifestation');assert.equal(h.weapon.durability,2);assert.equal(effectiveAttack(h),4);assert.ok(getLegalActions(s).some(a=>a.attacker===h.uid));
});
test('Ghoul Heroes cannot equip Quinques and Investigators cannot cast Ghoul-only spells',()=>{
 const s=game(),w=addToHand(s,0,'tg_jason');assert.ok(!getLegalActions(s).some(a=>a.card===w.uid));const i=game('investigator'),m=addToHand(i,0,'tg_kagune_manifestation');assert.ok(!getLegalActions(i).some(a=>a.card===m.uid));
});
test('all original Kagunes awaken once, choose a distinct type, preserve Hero identity and refill durability',()=>{
 for(const key of ['kaneki','touka','tsukiyama','nishiki']){const s=game(key),pl=s.players[0],h=pl.hero,uid=h.uid,base=h.weapon.attack;pl.tokyo.stacks=4;h.weapon.durability=1;applyAction(s,getLegalActions(s).find(a=>a.type==='kakuja'));assert.equal(s.pending.options.length,3);applyAction(s,{type:'choose',player:0,index:0});assert.equal(pl.tokyo.hero,key);assert.equal(h.uid,uid);assert.equal(h.weapon.attack,base+2);assert.equal(h.weapon.durability,h.weapon.maxDurability);assert.equal(new Set(h.weapon.types).size,2);assert.ok(hasKeyword(h,'Lifesteal'));assert.ok(h.armor>=6);pl.tokyo.stacks=4;assert.ok(!getLegalActions(s).some(a=>a.type==='kakuja'));}
});
test('Kakuja Awakening falls back to a Lifesteal Ghoul and draw, or evolves at four stacks with temporary Attack',()=>{
 const s=game(),n=s.players[0].hand.length;play(s,'kakuja_awakening');assert.equal(s.players[0].hand.length,n+1);assert.ok(s.players[0].board.some(m=>m.cardId==='tg_ravenous'));const q=game();q.players[0].tokyo.stacks=4;play(q,'kakuja_awakening');assert.equal(q.pending.type,'choice');applyAction(q,{type:'choose',player:0,index:0});assert.equal(q.players[0].hero.tempAttack,2);
});
test('Hero powers select only remaining deck Quinques, remove the chosen card, and cannot repeat in a turn',()=>{
 const s=game('arima');s.players[0].deck=[];for(const name of ['ixa','jason','yukimura']){const inst=addToHand(s,0,id(name));s.players[0].deck.push(s.players[0].hand.pop());assert.ok(inst);}power(s);assert.equal(s.pending.options.length,3);const chosen=s.pending.options[0].uid;applyAction(s,{type:'choose',player:0,index:0});assert.ok(s.players[0].hand.some(c=>c.uid===chosen));assert.ok(!s.players[0].deck.some(c=>c.uid===chosen));assert.ok(!getLegalActions(s).some(a=>a.type==='heroSpell'));
});
test('Investigator Hero Spell variants repair, buff, add Armor or draw while a Quinque is equipped',()=>{
 for(const hero of ['investigator','arima','amon','akira']){const s=game(hero);play(s,'doujima');const p=s.players[0],armor=p.hero.armor,hand=p.hand.length;power(s);if(hero==='amon')assert.equal(p.hero.armor,armor+2);else if(hero==='akira')assert.equal(p.hand.length,hand+1);else assert.equal(p.hero.weapon.durability,4);if(hero==='arima')assert.equal(p.hero.tempAttack,1);}
});
test('Akira discounts only the first Quinque equip, Juuzou gains temporary Attack, and IXA adds armor',()=>{
 const s=game('akira'),m=put(s,0,'juuzou');play(s,'ixa');assert.equal(s.players[0].mana.current,7);assert.equal(s.players[0].hero.armor,9);assert.equal(effectiveAttack(m),6);play(s,'doujima');assert.equal(s.players[0].mana.current,7);
});
test('IXA reduces only the first positive damage each turn',()=>{
 const s=game('investigator');play(s,'ixa');const h=s.players[0].hero;h.armor=0;assert.equal(tgIncomingDamage(s,h,0),0);hit(s,h,4);assert.equal(h.health,28);hit(s,h,2);assert.equal(h.health,26);round(s);hit(s,h,3);assert.equal(h.health,25);
});
test('Arima Evade prevents retaliation and expires, Amon bonuses damage against Ghouls, and Bikaku adds first-attack damage',()=>{
 const a=game('arima');play(a,'doujima');const v=put(a,1,'nishiki');const h=a.players[0].hero,armor=h.armor;attack(a,h,v);assert.equal(h.armor,armor+2);assert.ok(!hasKeyword(h,'Evade'));const s=game('amon');play(s,'yukimura');const t=put(s,1,'yomo');attack(s,s.players[0].hero,t);assert.equal(t.health,2);const b=game('nishiki');attack(b,b.players[0].hero,b.players[1].hero);assert.equal(b.players[1].hero.health,26);
});
test('Jason bypasses Taunt and repairs a killing final-durability strike before breaking',()=>{
 const s=game('investigator');play(s,'jason');put(s,1,'hinami');const v=put(s,1,'nishiki');s.players[0].hero.weapon.durability=1;assert.ok(getLegalActions(s).some(a=>a.attacker===s.players[0].hero.uid&&a.defender===s.players[1].hero.uid));attack(s,s.players[0].hero,v);assert.equal(s.players[0].hero.weapon.cardId,'tg_jason');assert.equal(s.players[0].hero.weapon.durability,1);
});
test('Narukami hits another enemy; Fueguchi hits two distinct enemy minions; Yukimura checks Evade',()=>{
 const s=game('investigator');play(s,'narukami');const v=put(s,1,'yomo');attack(s,s.players[0].hero,s.players[1].hero);assert.equal(v.health,2);const f=game('investigator');play(f,'fueguchi');const a=put(f,1,'yomo'),b=put(f,1,'amon_ghoul');attack(f,f.players[0].hero,f.players[1].hero);assert.equal(a.health,4);assert.equal(b.health,5);const y=game('investigator');play(y,'yukimura');const e=put(y,1,'juuzou');attack(y,y.players[0].hero,e);assert.equal(e.health,3);assert.ok(!hasKeyword(e,'Evade')); // the bonus hit is blocked by Evade
});
test('regeneration and hunger spells apply their timers and caps',()=>{
 const s=game(),m=put(s,0,'nishiki');m.health=1;m.hunger=3;play(s,'rc_regeneration',m);assert.equal(m.health,3);assert.equal(m.hunger,0);play(s,'uncontrollable_hunger',m);assert.equal(effectiveAttack(m),6);end(s);assert.equal(m.hunger,2);assert.equal(effectiveAttack(m),3);
});
test('CCG Reinforcements, maintenance, and Extermination respect species and weapon maximum',()=>{
 const s=game('investigator');play(s,'ccg_reinforcements');assert.equal(s.players[0].board.length,2);assert.ok(s.players[0].board.every(m=>hasKeyword(m,'Rush')));play(s,'ixa');s.players[0].hero.weapon.durability=4;play(s,'quinque_maintenance');assert.equal(s.players[0].hero.weapon.durability,5);const human=put(s,1,'ui'),ghoul=put(s,1,'yomo');play(s,'extermination');assert.equal(human.health,1);assert.ok(!s.players[1].board.some(m=>m.uid===ghoul.uid));
});
test('Predator’s Ambush redirects an attack, while a full defending board retains the trap',()=>{
 const s=game();play(s,'predators_ambush');const m=put(s,1,'hinami');end(s);const health=s.players[0].hero.health;attack(s,m,s.players[0].hero);assert.equal(s.players[0].hero.health,health);assert.equal(s.players[0].traps.length,0);
 const f=game();play(f,'predators_ambush');for(let i=0;i<7;i++)put(f,0,'nishiki');const a=put(f,1,'hinami');end(f);attack(f,a,f.players[0].hero);assert.equal(f.players[0].traps.length,1);
});
test('Desperate Regeneration saves a Ghoul at one Health and does not strip printed Lifesteal on expiry',()=>{
 const s=game(),m=put(s,0,'nishiki');play(s,'desperate_regeneration');hit(s,m,20);assert.equal(m.health,1);assert.ok(hasKeyword(m,'Lifesteal'));round(s);assert.ok(!hasKeyword(m,'Lifesteal'));const r=put(s,0,'rize');play(s,'desperate_regeneration');hit(s,r,20);round(s);assert.ok(hasKeyword(r,'Lifesteal'));
});
test('Hidden in Plain Sight counters a targeting spell after spending it and draws a card',()=>{
 const s=game(),m=put(s,0,'nishiki');play(s,'hidden_plain_sight');end(s);const inst=addToHand(s,1,'tg_feeding_frenzy'),enemy=put(s,1,'nishiki');m.health=2;const action=getLegalActions(s).find(a=>a.card===inst.uid&&a.target===enemy.uid&&a.target2===m.uid);assert.ok(action);const hand=s.players[0].hand.length;applyAction(s,action);assert.ok(s.players[0].board.some(c=>c.uid===m.uid));assert.ok(hasKeyword(m,'Elusive'));assert.equal(s.players[0].hand.length,hand+1);assert.equal(s.players[0].traps.length,0);
});
test('CCG Surprise Raid kills an attacking Ghoul before combat and Counterattack adds Armor and strikes back',()=>{
 const s=game('investigator');play(s,'surprise_raid');const m=put(s,1,'nishiki');end(s);const hp=s.players[0].hero.health;attack(s,m,s.players[0].hero);assert.equal(s.players[0].hero.health,hp);assert.ok(!s.players[1].board.some(x=>x.uid===m.uid));const c=game('investigator');play(c,'doujima');play(c,'counterattack');const n=put(c,1,'hinami');end(c);attack(c,n,c.players[0].hero);assert.equal(c.players[0].hero.armor,6);assert.equal(n.health,1);
});
test('Touka returns to Stealth after attacks, Nishiki heals itself, and Noro grows after surviving damage',()=>{
 const s=game(),t=put(s,0,'touka');attack(s,t,s.players[1].hero);assert.ok(hasKeyword(t,'Stealth'));round(s);assert.ok(!hasKeyword(t,'Stealth'));const n=put(s,0,'nishiki'),v=put(s,1,'yomo');n.health=1;v.attack=0;attack(s,n,v);assert.equal(n.health,3);const r=put(s,0,'noro');hit(s,r,2);assert.equal(r.attack,5);end(s);assert.equal(r.health,r.maxHealth);
});
test('Arrival effects heal or buff correct species, and Eto damages all other minions',()=>{
 const s=game(),m=put(s,0,'nishiki'),human=put(s,0,'hirako');play(s,'hinami',m);assert.equal(m.maxHealth,5);play(s,'uta',m);assert.ok(hasKeyword(m,'Stealth'));const ally=play(s,'amon_ghoul');assert.deepEqual([ally.attack,ally.health],[5,7]);play(s,'hirako',human);assert.ok(hasKeyword(human,'Evade'));const e=game(),a=put(e,0,'noro'),b=put(e,1,'noro');play(e,'eto');assert.equal(a.health,6);assert.equal(b.health,6);
});
test('Kaneki consumes a damaged Arrival target and Yomo gains stats for kills',()=>{
 const s=game(),v=put(s,1,'nishiki');v.health=2;const k=play(s,'kaneki',v);assert.equal(k.attack,7);assert.equal(s.players[0].tokyo.stacks,1);const y=put(s,0,'yomo'),d=put(s,1,'aogiri');attack(s,y,d);assert.deepEqual([y.attack,y.maxHealth],[6,6]);
});
test('every collectible resolves without errors in a target-rich valid scenario',()=>{
 for(const cid of FACTION_POOLS[F]){const c=getCard(cid);if(c.type==='hero')continue;const s=game(c.heroPath==='investigator'?'investigator':'kaneki');for(const [p,ids] of [[0,['nishiki','amon_ghoul','civilian','hirako']],[1,['nishiki','yomo','civilian']]])for(const n of ids){const m=put(s,p,n);if(m.health>2)m.health=2;}const inst=addToHand(s,0,cid),a=getLegalActions(s).find(a=>a.type==='play'&&a.card===inst.uid);assert.ok(a,cid);applyAction(s,a);while(s.pending?.type==='choice')applyAction(s,{type:'choose',player:s.pending.player,index:0});}
});
test('save/load remains deterministic and Ghoul and Investigator AI matches advance legally',()=>{
 for(const hero of ['kaneki','arima']){let s=game(hero,'touka');for(let i=0;i<100&&!s.gameOver;i++){const a=chooseAction(s);assert.ok(a);const clone=JSON.parse(JSON.stringify(s));applyAction(s,a);applyAction(clone,a);assert.deepEqual(clone,s);}assert.ok(s.turn>3||s.gameOver);}
});

test('Ghoul Hero species participates in hunting bonuses and Predatory Instinct rewards Kagune damage',()=>{
 const s=game('amon');play(s,'yukimura');attack(s,s.players[0].hero,s.players[1].hero);assert.equal(s.players[1].hero.health,27);
 const g=game();g.players[0].hero.health=20;attack(g,g.players[0].hero,g.players[1].hero);assert.equal(g.players[0].hero.health,23);power(g);assert.equal(g.players[0].hero.health,26);
});
