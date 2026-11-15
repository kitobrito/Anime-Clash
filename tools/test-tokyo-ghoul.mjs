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
function deck(hero){return TG_HEROES[hero]?.path==='investigator'?ANIME_PRESETS[F]['CCG Quinque Hunter']:FACTION_LISTS[F];}
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

test('Tokyo Ghoul has 44 playable collectibles, separate Heroes and 10 Legendaries, complete rules and artwork',()=>{
 const cards=FACTION_POOLS[F].map(getCard);assert.equal(cards.length,44);assert.deepEqual(['minion','hero','spell','trap','weapon'].map(t=>cards.filter(c=>c.type===t).length),[21,0,10,5,8]);assert.equal(cards.filter(c=>c.legendary).length,10);assert.deepEqual(validateAllCards().filter(c=>c.errors.length||c.incomplete.length),[]);for(const c of cards)assert.ok(fs.existsSync(new URL('../'+c.image,import.meta.url)),c.name);for(const d of Object.values(ANIME_PRESETS[F]))assert.equal(singleDeckProblem(F,d),null);
});
test('all eight Hero selections initialize their armor, equipment and Hero Spell',()=>{
 for(const [key,v] of Object.entries(TG_HEROES)){const s=game(key),p=s.players[0];assert.equal(p.hero.health,30);assert.equal(p.hero.armor,v.armor+(v.kagune==='koukaku'?2:0));assert.equal(p.heroSpells[0].cardId,v.spell);assert.equal(p.tokyo.path,v.path);if(v.kagune){assert.equal(p.hero.weapon.cardId,id(v.kagune));assert.equal(p.hero.weapon.durability,TG_KAGUNES[v.kagune].durability);}else assert.ok(!p.hero.weapon);}
});
test('every Hero is separate from a full 30-card draw pool; legacy Hero cards cannot be played',()=>{
 for(const hero of Object.keys(TG_HEROES)){
  const cfg={factions:[F],deck:deck(hero),hero};assert.ok(!checkDeck(cfg).error);const s=createGame({players:[cfg,cfg],rules:{mulligan:false,secondPlayerPotions:false,coinCardId:null,openingHandHelp:false}});
  for(const p of s.players){assert.equal(p.deck.length+p.hand.length,30);assert.ok(![...p.deck,...p.hand].some(c=>getCard(c.cardId).investigatorHero));}
 }
 const d=[...deck('arima')];d[0]='tg_arima';assert.ok(singleDeckProblem(F,d));assert.equal(summonMinion(game(),0,'tg_arima'),null);assert.ok(checkDeck({factions:[F],deck:deck('kaneki'),hero:'unknown'}).error);
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
 for(const hero of ['arima','amon','akira']){const s=game(hero);play(s,'doujima');const p=s.players[0],armor=p.hero.armor,hand=p.hand.length;power(s);if(hero==='amon')assert.equal(p.hero.armor,armor+2);else if(hero==='akira')assert.equal(p.hand.length,hand+1);else assert.equal(p.hero.weapon.durability,4);if(hero==='arima')assert.equal(p.hero.tempAttack,1);}
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
 for(const hero of ['kaneki','arima','investigator']){let s=game(hero,'touka');for(let i=0;i<100&&!s.gameOver;i++){const a=chooseAction(s);assert.ok(a);const clone=JSON.parse(JSON.stringify(s));applyAction(s,a);applyAction(clone,a);assert.deepEqual(clone,s);}assert.ok(s.turn>3||s.gameOver);}
});

test('Ghoul Hero species participates in hunting bonuses and Ravenous Regeneration rewards Kagune damage',()=>{
 const s=game('amon');play(s,'yukimura');attack(s,s.players[0].hero,s.players[1].hero);assert.equal(s.players[1].hero.health,27);
 const g=game();g.players[0].hero.health=20;attack(g,g.players[0].hero,g.players[1].hero);assert.equal(g.players[0].hero.health,23);power(g);assert.equal(g.players[0].hero.health,27);
});

test('Yukimura alone lets the armed Hero attack Stealth; minions and targeted spells cannot',()=>{
 const s=game('investigator');const hidden=put(s,1,'assassin');hidden.health=hidden.maxHealth=10;const ally=put(s,0,'nishiki');play(s,'yukimura');const h=s.players[0].hero;
 assert.ok(getLegalActions(s).some(a=>a.type==='attack'&&a.attacker===h.uid&&a.defender===hidden.uid));assert.ok(!getLegalActions(s).some(a=>a.type==='attack'&&a.attacker===ally.uid&&a.defender===hidden.uid));
 const spell=addToHand(s,0,'chidori');assert.ok(!getLegalActions(s).some(a=>a.card===spell.uid&&a.target===hidden.uid));
 attack(s,h,hidden);assert.equal(hidden.health,6);assert.ok(hasKeyword(hidden,'Stealth'));assert.equal(h.weapon.durability,2);
});
test('Yukimura respects visible Taunt, frozen chambers, normal weapons, and its active weapon slot',()=>{
 const s=game('amon');const hidden=put(s,1,'assassin'),taunt=put(s,1,'hinami');play(s,'yukimura');const h=s.players[0].hero;
 const mayHit=()=>getLegalActions(s).some(a=>a.type==='attack'&&a.attacker===h.uid&&a.defender===hidden.uid);
 assert.equal(mayHit(),false);taunt.keywords=[];assert.equal(mayHit(),true);hidden.encased=1;assert.equal(mayHit(),false);hidden.encased=0;
 h.weapon.exhausted=true;assert.equal(mayHit(),false);h.weapon.exhausted=false;const yuki={...h.weapon};play(s,'doujima');assert.equal(mayHit(),false);
 h.weapon2=yuki;h.dualWield=true;h.bonusAttacks=1;assert.equal(mayHit(),false);h.attacksThisTurn=1;assert.equal(mayHit(),true);
});
test('Yukimura grants Arima exactly two attacks; only the first receives its conditional +2',()=>{
 const s=game('arima');const hidden=put(s,1,'assassin');hidden.health=hidden.maxHealth=12;play(s,'yukimura');const h=s.players[0].hero;
 assert.ok(hasKeyword(h,'Twin Strike'));attack(s,h,hidden);assert.equal(hidden.health,8);attack(s,h,hidden);assert.equal(hidden.health,6);assert.equal(h.weapon.durability,1);assert.ok(!getLegalActions(s).some(a=>a.type==='attack'&&a.attacker===h.uid));
 const plain=game('investigator');play(plain,'yukimura');assert.equal(hasKeyword(plain.players[0].hero,'Twin Strike'),false);
});
test('Yukimura Twin Strike disappears on replacement or break, and survives saving correctly',()=>{
 for(const breakIt of [true,false]){
  const s=game('arima');play(s,'yukimura');const h=s.players[0].hero;if(breakIt)h.weapon.durability=1;attack(s,h,s.players[1].hero);
  if(!breakIt)play(s,'doujima');h.tempAttack=2;assert.equal(hasKeyword(h,'Twin Strike'),false);assert.ok(!getLegalActions(s).some(a=>a.type==='attack'&&a.attacker===h.uid));
 }
 const s=game('arima');play(s,'yukimura');const saved=JSON.parse(JSON.stringify(s));assert.ok(hasKeyword(saved.players[0].hero,'Twin Strike'));const hidden=put(saved,1,'assassin');assert.ok(getLegalActions(saved).some(a=>a.type==='attack'&&a.defender===hidden.uid));
});

test('Mado equips two independent Quinques, enhances Fueguchi One and Two, and attacks with each',()=>{
 const s=game('investigator');play(s,'fueguchi');play(s,'fueguchi_two');const h=s.players[0].hero;
 assert.equal(TG_HEROES.investigator.name,'Kureo Mado');assert.equal(h.dualWield,undefined);assert.equal(h.weapon.attack,3);assert.equal(h.weapon.durability,5);assert.equal(h.weapon2.attack,4);assert.equal(h.weapon2.durability,4);assert.ok(hasKeyword(h,'Twin Strike'));
 attack(s,h,s.players[1].hero);assert.equal(s.players[1].hero.health,27);assert.equal(h.weapon.durability,4);assert.equal(h.weapon2.durability,4);
 attack(s,h,s.players[1].hero);assert.equal(s.players[1].hero.health,23);assert.equal(h.weapon.durability,4);assert.equal(h.weapon2.durability,3);assert.ok(!getLegalActions(s).some(a=>a.type==='attack'&&a.attacker===h.uid));
 const other=game('arima');play(other,'fueguchi');play(other,'fueguchi_two');assert.equal(other.players[0].hero.weapon.attack,3);assert.equal(other.players[0].hero.weapon.durability,3);assert.ok(!other.players[0].hero.weapon2);
});
test('Fueguchi Two grants Armor only after its own attack on a minion, even if it kills',()=>{
 for(const last of [false,true]){
  const s=game('investigator');play(s,'fueguchi');play(s,'fueguchi_two');const h=s.players[0].hero,enemy=put(s,1,'juuzou');enemy.keywords=[];enemy.attack=0;enemy.health=3;
  const armor=h.armor;attack(s,h,s.players[1].hero);assert.equal(h.armor,armor);if(last)h.weapon2.durability=1;attack(s,h,enemy);assert.equal(h.armor,armor+2);assert.equal(s.players[1].board.length,0);if(last)assert.equal(h.weapon2,null);
 }
});
test('Mado chooses which full Quinque slot to replace, with a serializable choice',()=>{
 const s=game('investigator');play(s,'fueguchi');play(s,'fueguchi_two');play(s,'ixa');assert.equal(s.pending.prompt,'Choose a Quinque to replace');assert.equal(s.players[0].hero.weapon.cardId,'tg_fueguchi');assert.equal(s.players[0].hero.weapon2.cardId,'tg_fueguchi_two');
 const copy=JSON.parse(JSON.stringify(s));for(const x of [s,copy])applyAction(x,{type:'choose',player:0,index:1});assert.deepEqual(copy,s);assert.equal(s.players[0].hero.weapon2.cardId,'tg_ixa');assert.equal(s.players[0].tokyo.quinquesEquipped,3);
});
test('Mado can equip identical Quinques and a breaking first weapon promotes the second without bonus growth',()=>{
 const s=game('investigator');play(s,'fueguchi_two');play(s,'fueguchi_two');const h=s.players[0].hero;assert.ok(hasKeyword(h,'Twin Strike'));h.weapon.durability=1;const enemy=put(s,1,'nishiki');enemy.attack=0;enemy.health=1;
 attack(s,h,enemy);assert.equal(h.weapon2,null);assert.equal(h.weapon.attack,4);assert.equal(h.weapon.durability,4);assert.equal(h.attack,4);attack(s,h,s.players[1].hero);assert.equal(h.weapon.durability,3);assert.ok(!getLegalActions(s).some(a=>a.type==='attack'&&a.attacker===h.uid));
 round(s);assert.equal(hasKeyword(h,'Twin Strike'),false);attack(s,h,s.players[1].hero);assert.ok(!getLegalActions(s).some(a=>a.type==='attack'&&a.attacker===h.uid));
});
test('secondary Quinques use their own targeting, damage triggers, passive reduction and last-hit repair',()=>{
 const s=game('investigator');play(s,'doujima');play(s,'yukimura');const h=s.players[0].hero,hidden=put(s,1,'assassin');hidden.health=12;
 assert.ok(!getLegalActions(s).some(a=>a.type==='attack'&&a.defender===hidden.uid));attack(s,h,s.players[1].hero);assert.ok(getLegalActions(s).some(a=>a.type==='attack'&&a.defender===hidden.uid));attack(s,h,hidden);assert.equal(hidden.health,10);
 const n=game('investigator');play(n,'doujima');play(n,'narukami');const min=put(n,1,'yomo');attack(n,n.players[0].hero,n.players[1].hero);assert.equal(min.health,5);attack(n,n.players[0].hero,n.players[1].hero);assert.equal(min.health,2);
 const i=game('investigator');play(i,'doujima');play(i,'ixa');i.players[0].hero.armor=0;hit(i,i.players[0].hero,5);assert.equal(i.players[0].hero.health,27);
 const j=game('investigator');play(j,'doujima');play(j,'jason');const target=put(j,1,'nishiki');target.attack=0;j.players[0].hero.weapon2.durability=1;attack(j,j.players[0].hero,j.players[1].hero);attack(j,j.players[0].hero,target);assert.equal(j.players[0].hero.weapon2.durability,1);
});
test('Mado Arsenal discovers into an empty slot, repairs both when full, and Maintenance caps each weapon',()=>{
 const s=game('investigator');play(s,'fueguchi');s.players[0].deck=s.players[0].deck.filter(c=>c.cardId==='tg_fueguchi_two');power(s);assert.equal(s.pending.options[0].cardId,'tg_fueguchi_two');applyAction(s,{type:'choose',player:0,index:0});
 const inst=s.players[0].hand.find(c=>c.cardId==='tg_fueguchi_two');applyAction(s,getLegalActions(s).find(a=>a.type==='play'&&a.card===inst.uid));const h=s.players[0].hero;round(s);power(s);assert.equal(h.weapon.durability,6);assert.equal(h.weapon2.durability,5);
 play(s,'quinque_maintenance');assert.equal(h.weapon.durability,6);assert.equal(h.weapon2.durability,5);h.weapon.durability=1;h.weapon2.durability=2;play(s,'quinque_maintenance');assert.equal(h.weapon.durability,4);assert.equal(h.weapon2.durability,4);
});

test('Mado ignores Taunt only when the next attacking Quinque is Jason',()=>{
 for(const first of [true,false]){const s=game('investigator');play(s,first?'jason':'doujima');play(s,first?'doujima':'jason');const h=s.players[0].hero,t=put(s,1,'hinami');t.attack=0;t.health=t.maxHealth=20;const mayHitHero=()=>getLegalActions(s).some(a=>a.type==='attack'&&a.attacker===h.uid&&a.defender===s.players[1].hero.uid);assert.equal(mayHitHero(),first);attack(s,h,first?s.players[1].hero:t);assert.equal(mayHitHero(),!first);}
});

test('Amon equips a 4/4 Doujima, gains 3 Armor against both Ghoul species, and stacks his Ghoul Hunter damage',()=>{
 for(const name of ['yomo','amon_ghoul']){
  const s=game('amon');play(s,'doujima');const h=s.players[0].hero,t=put(s,1,name);t.attack=0;t.health=t.maxHealth=20;
  assert.deepEqual([h.weapon.attack,h.weapon.durability,h.weapon.maxDurability],[4,4,4]);const armor=h.armor;attack(s,h,t);assert.equal(t.health,15);assert.equal(h.armor,armor+3);assert.equal(h.weapon.durability,3);
 }
 const s=game('amon','akira');s.players[1].hero.armor=0;play(s,'doujima');const h=s.players[0].hero,armor=h.armor;attack(s,h,s.players[1].hero);assert.equal(s.players[1].hero.health,26);assert.equal(h.armor,armor);
});
test('Doujima specialist bonuses belong only to Amon; other Investigators keep 3/3 and the original 2 Armor',()=>{
 for(const hero of ['arima','akira','investigator']){
  const s=game(hero);play(s,'doujima');const h=s.players[0].hero,t=put(s,1,'yomo');t.attack=0;const armor=h.armor;assert.deepEqual([h.weapon.attack,h.weapon.maxDurability],[3,3]);attack(s,h,t);assert.equal(t.health,2);assert.equal(h.armor,armor+2);
 }
});
test('Akira discounts Amatsu once, alternates Whip and Piercing attacks, and preserves wear, buffs and equip count',()=>{
 const s=game('akira');play(s,'amatsu');const p=s.players[0],h=p.hero;assert.equal(p.mana.current,8);assert.equal(p.tokyo.quinquesEquipped,1);const w=h.weapon;w.attack++;h.attack++;const armor=h.armor;
 attack(s,h,s.players[1].hero);assert.equal(s.players[1].hero.health,26);assert.equal(h.armor,armor+2);assert.equal(w.cardId,'tg_amatsu_piercing');assert.equal(w.name,'Amatsu — Piercing');assert.deepEqual([w.attack,w.durability,w.maxDurability],[4,3,4]);assert.ok(!getLegalActions(s).some(a=>a.type==='attack'&&a.attacker===h.uid));
 round(s);const t=put(s,1,'yomo');t.attack=0;t.health=t.maxHealth=20;attack(s,h,t);assert.equal(t.health,14);assert.equal(h.armor,armor+2);assert.equal(w.cardId,'tg_amatsu');assert.equal(w.durability,2);assert.equal(p.tokyo.quinquesEquipped,1);
 round(s);attack(s,h,s.players[1].hero);assert.equal(h.armor,armor+4);assert.equal(w.cardId,'tg_amatsu_piercing');assert.equal(w.durability,1);
 round(s);attack(s,h,s.players[1].hero);assert.equal(s.players[1].hero.health,18);assert.equal(h.weapon,null);assert.equal(h.attack,0);assert.equal(h.armor,armor+4);
 play(s,'amatsu');assert.equal(p.mana.current,6);assert.equal(h.weapon.cardId,'tg_amatsu');assert.deepEqual([h.weapon.attack,h.weapon.durability],[3,4]);
});
test('Amatsu form, Durability and effects survive a saved match and repair without resetting or re-equipping',()=>{
 let s=game('akira');play(s,'amatsu');attack(s,s.players[0].hero,s.players[1].hero);s=JSON.parse(JSON.stringify(s));let h=s.players[0].hero;assert.equal(h.weapon.cardId,'tg_amatsu_piercing');play(s,'quinque_maintenance');assert.equal(h.weapon.durability,4);assert.equal(h.weapon.cardId,'tg_amatsu_piercing');round(s);const t=put(s,1,'civilian');t.health=t.maxHealth=10;attack(s,h,t);assert.equal(t.health,5);assert.equal(h.weapon.cardId,'tg_amatsu');assert.equal(h.weapon.durability,3);
});
test('Amatsu keeps Whip form for other Heroes and wears only its own slot under Kureo Mado',()=>{
 for(const hero of ['amon','arima','investigator']){
  const s=game(hero,'akira');s.players[1].hero.armor=0;if(hero==='investigator')play(s,'doujima');play(s,'amatsu');const h=s.players[0].hero,w=hero==='investigator'?h.weapon2:h.weapon,armor=h.armor;
  if(hero==='investigator')attack(s,h,s.players[1].hero);attack(s,h,s.players[1].hero);assert.equal(w.cardId,'tg_amatsu');assert.equal(w.durability,3);assert.equal(h.armor,armor+2);if(hero==='investigator')assert.equal(h.weapon.durability,2);
 }
});
test('Amatsu uses both supplied images; Piercing is an alternate form outside decks and the Discover pool',()=>{
 const c=getCard('tg_amatsu'),form=getCard('tg_amatsu_piercing');assert.ok(FACTION_POOLS[F].includes(c.id));assert.ok(!FACTION_POOLS[F].includes(form.id));assert.deepEqual(c.formCards,[c.id,form.id]);assert.ok(form.token);assert.notEqual(c.image,form.image);assert.ok(fs.existsSync(new URL('../'+form.image,import.meta.url)));
 const d=[...deck('akira')];d[0]=form.id;assert.ok(singleDeckProblem(F,d));assert.ok(ANIME_PRESETS[F]['CCG Quinque Hunter'].includes(c.id));
});

test('each Ghoul has a distinct 2-Mana Hero Spell outside the deck, usable once per own turn',()=>{
 const ids=[];for(const key of ['kaneki','touka','tsukiyama','nishiki']){const s=game(key),p=s.players[0],hs=p.heroSpells[0],c=getCard(hs.cardId);ids.push(c.id);assert.equal(c.cost,2);assert.ok(c.heroSpell);assert.ok(!FACTION_POOLS[F].includes(c.id));p.hero.health=10;const mana=p.mana.current;power(s);assert.equal(p.mana.current,mana-2);assert.equal(hs.uses,1);assert.ok(!getLegalActions(s).some(a=>a.type==='heroSpell'));round(s);assert.ok(getLegalActions(s).some(a=>a.type==='heroSpell'));}assert.equal(new Set(ids).size,4);
});
test('Kaneki heals 3 normally, 4 after successful Kagune damage, and loses the bonus next turn',()=>{
 const s=game('kaneki'),h=s.players[0].hero;h.health=10;power(s);assert.equal(h.health,13);round(s);attack(s,h,s.players[1].hero);const before=h.health;power(s);assert.equal(h.health,before+4);round(s);h.health=10;power(s);assert.equal(h.health,13);
 const blocked=game('kaneki'),k=blocked.players[0].hero,t=put(blocked,1,'juuzou');k.health=10;t.attack=0;attack(blocked,k,t);power(blocked);assert.equal(k.health,13);assert.notEqual(k.tgKaguneDamagedTurn,blocked.turn);
});
test('Touka heals 2 and earns one Evade only after successful Kagune damage during the current turn',()=>{
 const s=game('touka'),h=s.players[0].hero;h.health=10;hit(s,h,1);assert.ok(!hasKeyword(h,'Evade'));power(s);assert.equal(h.health,12);assert.ok(!hasKeyword(h,'Evade'));round(s);const t=put(s,1,'civilian');t.health=t.maxHealth=20;attack(s,h,t);power(s);assert.equal(h.health,14);assert.ok(hasKeyword(h,'Evade'));hit(s,h,5);assert.equal(h.health,14);assert.ok(!hasKeyword(h,'Evade'));round(s);power(s);assert.ok(!hasKeyword(h,'Evade'));
});
test('Gourmet’s Instinct rewards friendly consumption of Humans and Half-Humans, including after save/load',()=>{
 for(const human of ['civilian','hirako']){let s=game('tsukiyama');const h=s.players[0].hero,m=put(s,0,'nishiki'),t=put(s,human==='civilian'?0:1,human);if(human==='hirako')t.health=2;h.health=10;feed(s,m,t);assert.equal(s.players[0].tokyo.humanConsumedTurn,s.turn);s=JSON.parse(JSON.stringify(s));power(s);assert.equal(s.players[0].hero.health,12);assert.equal(s.players[0].hero.armor,4);round(s);power(s);assert.equal(s.players[0].hero.armor,4);}
});
test('Gourmet’s Instinct does not reward Ghoul consumption, ordinary kills or the opposing player’s consumption',()=>{
 const g=game('tsukiyama'),m=put(g,0,'nishiki'),t=put(g,1,'aogiri');t.health=2;feed(g,m,t);power(g);assert.equal(g.players[0].hero.armor,2);
 const killed=game('tsukiyama'),h=killed.players[0].hero,c=put(killed,1,'civilian');attack(killed,h,c);power(killed);assert.equal(h.armor,2);
 const s=game('tsukiyama','tsukiyama'),n=put(s,1,'nishiki'),v=put(s,1,'civilian');end(s);feed(s,n,v);end(s);power(s);assert.equal(s.players[0].hero.armor,2);
});
test('Survival Instinct heals and revives an exhausted Kagune, caps repair and preserves Kakuja equipment',()=>{
 const s=game('nishiki'),h=s.players[0].hero;h.health=10;h.weapon.durability=1;tgWearWeapon(s,h);assert.equal(effectiveAttack(h),0);power(s);assert.equal(h.health,12);assert.equal(h.weapon.durability,1);assert.ok(!h.weapon.exhausted);assert.equal(effectiveAttack(h),3);assert.ok(getLegalActions(s).some(a=>a.type==='attack'&&a.attacker===h.uid));round(s);h.weapon.durability=h.weapon.maxDurability;power(s);assert.equal(h.weapon.durability,4);
 const k=game('nishiki');k.players[0].tokyo.stacks=4;applyAction(k,getLegalActions(k).find(a=>a.type==='kakuja'));applyAction(k,{type:'choose',player:0,index:0});const w=k.players[0].hero.weapon,types=[...w.types],atk=w.attack;w.durability=1;power(k);assert.equal(w.durability,2);assert.deepEqual(w.types,types);assert.equal(w.attack,atk);assert.equal(w.maxDurability,7);
});
test('legacy shared Ghoul powers migrate to the selected Hero without restoring uses or cooldowns',()=>{
 for(const hero of ['kaneki','touka','tsukiyama','nishiki']){const s=game(hero);s.players[0].heroSpells=[{cardId:'tg_predatory_instinct',uses:1,cooldown:2}];const restored=JSON.parse(JSON.stringify(s));getLegalActions(restored);assert.deepEqual(restored.players[0].heroSpells,[{cardId:TG_HEROES[hero].spell,uses:1,cooldown:2}]);assert.ok(!getLegalActions(restored).some(a=>a.type==='heroSpell'));assert.equal(restored.players[0].hero.weapon.cardId,TG_HEROES[hero].kagune?'tg_'+TG_HEROES[hero].kagune:null);}
 const s=game('arima'),before=JSON.stringify(s.players[0].heroSpells);getLegalActions(s);assert.equal(JSON.stringify(s.players[0].heroSpells),before);
});
