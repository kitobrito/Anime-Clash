import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { LEAF, STRAW_HATS, FACTION_LISTS, FACTION_POOLS } from '../src/cards/index.js';
import { ANIME_PRESETS } from '../src/cards/anime-presets.js';
import { allCards, getCard } from '../src/engine/registry.js';
import { validateAllCards } from '../src/cards/validate.js';
import { checkDeck, singleDeckProblem } from '../src/cards/deck-check.js';
import { createGame, getLegalActions, applyAction, run, actingPlayer } from '../src/engine/engine.js';
import { addToHand, summonMinion, hasKeyword, effectiveAttack, dealDamage, heal, emit } from '../src/engine/core.js';
import { addKeyword, EFFECT_OPS, applyBuff } from '../src/engine/effects.js';
import { isFruitUser } from '../src/engine/one-piece.js';
import { chooseAction } from '../src/ai/greedy.js';
function game(seed=1,opponent=LEAF){const s=createGame({players:[{factions:[STRAW_HATS],deck:ANIME_PRESETS[STRAW_HATS]['Gear Evolution']},{factions:[opponent],deck:FACTION_LISTS[opponent]}],seed,rules:{mulligan:false,secondPlayerPotions:false,openingHandHelp:false}});for(const p of s.players){p.board=[];p.hand=[];p.mana={current:10,max:10,bonusNextTurn:0};}return s;}
function put(s,p,id,opts={}){const m=summonMinion(s,p,id,{silent:true,...opts});m.sick=false;m.enteredOnTurn=-1;return m;}
function flush(s){s.queue.push(...s.buffer,{kind:'deaths'});s.buffer=[];run(s);}
function event(s,event){emit(s,event);flush(s);}
function hit(s,m,n,opts={}){dealDamage(s,null,m.uid,n,opts);flush(s);}
function play(s,id,target,p=0){s.players[p].mana.current=10;const inst=addToHand(s,p,id);assert.ok(inst,`hand space: ${id}`);const a=getLegalActions(s).find(a=>a.type==='play'&&a.card===inst.uid&&(target==null||a.target===target.uid));assert.ok(a,`legal ${id}`);applyAction(s,a);return s.players[p].board.findLast(m=>m.cardId===id);}
function end(s){assert.equal(s.pending,null);applyAction(s,getLegalActions(s).find(a=>a.type==='endTurn'));}
function round(s){end(s);end(s);}
function attack(s,m,target){const a=getLegalActions(s).find(a=>a.type==='attack'&&a.attacker===m.uid&&a.defender===target.uid);assert.ok(a,`attack by ${m.cardId}`);applyAction(s,a);}
function gear(s,m){const a=getLegalActions(s).find(a=>a.type==='gearShift'&&a.minion===m.uid);assert.ok(a);applyAction(s,a);}
function noGear(s,m){assert.ok(!getLegalActions(s).some(a=>a.type==='gearShift'&&a.minion===m.uid));}

test('136 collectibles across three factions, 22 Straw Hat minions, 23 spells and 11 Legendary cards; all assets and nine decks valid',()=>{
 assert.equal(Object.values(FACTION_POOLS).flat().length,136);
 const c=FACTION_POOLS[STRAW_HATS].map(getCard);assert.equal(c.length,45);assert.equal(c.filter(x=>x.type==='minion').length,22);assert.equal(c.filter(x=>x.type==='spell').length,23);assert.equal(c.filter(x=>x.legendary).length,11);
 assert.equal(allCards().filter(x=>x.luffy).length,6);assert.deepEqual(validateAllCards().filter(c=>c.errors.length||c.incomplete.length),[]);
 for(const c of allCards().filter(c=>c.faction===STRAW_HATS))assert.ok(fs.existsSync(new URL('../'+c.image,import.meta.url)),c.name);
 for(const [f,decks] of Object.entries(ANIME_PRESETS))for(const ids of Object.values(decks))assert.equal(singleDeckProblem(f,ids),null);
 const d=[...ANIME_PRESETS[STRAW_HATS]['Gear Evolution']];d[0]='naruto_uzumaki';assert.ok(singleDeckProblem(STRAW_HATS,d));d[0]='op_gear2';assert.ok(singleDeckProblem(STRAW_HATS,d));assert.ok(checkDeck({format:'pair',factions:[LEAF,STRAW_HATS],deck:d}).error);
});
test('Gear Shift begins the turn after summoning, costs Mana, and works once per turn',()=>{
 const s=game();const m=play(s,'op_luffy');noGear(s,m);round(s);assert.equal(s.players[0].mana.current,10);gear(s,m);assert.equal(m.cardId,'op_gear2');assert.equal(s.players[0].mana.current,8);noGear(s,m);
});
test('Gear Shift preserves UID, owner, damage, permanent and temporary buffs, and attacks already used',()=>{
 const s=game();const m=put(s,0,'op_luffy');m.health=3;applyBuff(s,m,{attack:2,health:3});m.tempAttack=1;m.attacksThisTurn=1;const uid=m.uid;gear(s,m);
 assert.equal(m.uid,uid);assert.deepEqual([m.attack,m.maxHealth,m.health,m.tempAttack,m.attacksThisTurn],[6,9,7,1,1]);assert.equal(isFruitUser(m),true);
 const victim=put(s,1,'hashirama_senju');attack(s,m,victim);assert.equal(m.attacksThisTurn,2);assert.ok(!getLegalActions(s).some(a=>a.attacker===uid));
});
test('Gear 2 has two attacks and recoil; shifting to Gear 3 does not refresh attacks',()=>{
 const s=game();const m=put(s,0,'op_gear2');const v=put(s,1,'shadow_clone');attack(s,m,v);assert.equal(m.health,4); // one retaliation and one recoil
 m.attacksThisTurn=2;gear(s,m);assert.equal(m.cardId,'op_gear3');assert.equal(m.attacksThisTurn,2);assert.ok(!getLegalActions(s).some(a=>a.attacker===m.uid));
});
test('Gear 3 splash hits adjacent enemy minions and both Gear 4 branches are real player choices',()=>{
 for(const [index,id] of [[0,'op_bounceman'],[1,'op_snakeman']]){const s=game();const m=put(s,0,'op_gear3');const a=put(s,1,'choji_akimichi'),b=put(s,1,'choji_akimichi'),c=put(s,1,'choji_akimichi');attack(s,m,b);assert.equal(a.health,3);assert.equal(c.health,3);gear(s,m);assert.equal(s.pending.type,'choice');applyAction(s,{type:'choose',player:0,index});assert.equal(m.cardId,id);assert.equal(m.attacksThisTurn,1);}
});
test('Bounceman reduces only the first damage per turn; Snakeman ignores Taunt',()=>{
 const s=game();const b=put(s,0,'op_bounceman');hit(s,b,5);assert.equal(b.health,7);hit(s,b,2);assert.equal(b.health,5);const n=put(s,0,'op_snakeman');put(s,1,'choji_akimichi');assert.ok(getLegalActions(s).some(a=>a.attacker===n.uid&&a.defender===s.players[1].hero.uid));
});
test('Gear 5 lasts three own turns, reverts with one Health, and enforces one recovery turn',()=>{
 const s=game();const m=put(s,0,'op_snakeman');gear(s,m);assert.equal(m.cardId,'op_gear5');end(s);assert.equal(m.gear5Remaining,2);end(s);round(s);end(s);assert.equal(m.cardId,'op_luffy');assert.equal(m.health,1);end(s);noGear(s,m);round(s);assert.ok(getLegalActions(s).some(a=>a.type==='gearShift'&&a.minion===m.uid));
});
test('Gear 5 Rubber Toy transformation restores only a surviving instance at owner next-turn end',()=>{
 const s=game();const m=put(s,0,'op_gear5');const victim=put(s,1,'hashirama_senju');attack(s,m,s.players[1].hero);assert.equal(victim.cardId,'op_rubber_toy');assert.deepEqual([victim.attack,victim.health],[1,1]);end(s);end(s);assert.equal(victim.cardId,'hashirama_senju');assert.equal(victim.health,9);
 const s2=game();const n=put(s2,0,'op_gear5');const v=put(s2,1,'hashirama_senju');attack(s2,n,s2.players[1].hero);hit(s2,v,1);round(s2);assert.ok(!s2.players[1].board.some(x=>x.uid===v.uid));
});
test('all natural Fruit Users and transformed Luffy forms are excluded from Fruit targets; duplicate consumption is illegal',()=>{
 const s=game();const l=put(s,0,'op_luffy'),ordinary=put(s,0,'op_usopp');const inst=addToHand(s,0,'op_mera');const options=getLegalActions(s).filter(a=>a.card===inst.uid);assert.deepEqual(options.map(a=>a.target),[ordinary.uid]);applyAction(s,options[0]);const next=addToHand(s,0,'op_goro');assert.ok(!getLegalActions(s).some(a=>a.card===next.uid));assert.ok(isFruitUser(l));
 assert.throws(()=>applyAction(s,{type:'play',player:0,card:next.uid,target:ordinary.uid}));
});
test('protected Fruit stats, powers and drawbacks survive Silence, keyword removal, and generic transformation',()=>{
 const s=game();const m=put(s,0,'op_franky');play(s,'op_tori',m);applyBuff(s,m,{attack:5,health:5,keywords:['Taunt']});addKeyword(m,'Silenced',false,s);assert.equal(m.textLost,true);assert.equal(effectiveAttack(m),7);assert.equal(m.maxHealth,9);assert.ok(hasKeyword(m,'Reborn'));assert.ok(hasKeyword(m,'Lifesteal'));assert.equal(hasKeyword(m,'Taunt'),false);
 EFFECT_OPS.removeKeyword(s,{target:{uid:m.uid},all:true},{controller:1});assert.ok(hasKeyword(m,'Lifesteal'));EFFECT_OPS.transform(s,{target:{uid:m.uid},into:'op_carrot'},{controller:1});assert.equal(m.devilFruit.kind,'tori');assert.equal(effectiveAttack(m),5);assert.equal(m.maxHealth,6);
});
test('Fruit powers do not persist through bounce or Reborn; Phoenix gives one fresh return',()=>{
 const s=game();const m=put(s,0,'op_usopp');play(s,'op_tori',m);hit(s,m,50);const reborn=s.players[0].board.find(x=>x.cardId==='op_usopp');assert.ok(reborn);assert.equal(reborn.health,1);assert.equal(isFruitUser(reborn),false);assert.equal(hasKeyword(reborn,'Reborn'),false);assert.equal(hasKeyword(reborn,'Lifesteal'),false);
 const s2=game();const n=put(s2,0,'op_franky');play(s2,'op_mera',n);EFFECT_OPS.returnToHand(s2,{target:{uid:n.uid}},{controller:0});assert.ok(s2.players[0].hand.some(i=>i.cardId==='op_franky'));const fresh=play(s2,'op_franky');assert.equal(isFruitUser(fresh),false);
});
test('Flame Fruit burns on attack and damages its bearer at each own end even Silenced',()=>{
 const s=game();const m=put(s,0,'op_franky'),v=put(s,1,'hashirama_senju',{attack:0});play(s,'op_mera',m);addKeyword(m,'Silenced',false,s);attack(s,m,v);assert.ok(v.burn>0);const before=m.health;end(s);assert.equal(m.health,before-1);
});
test('Rumble Fruit deals random attack damage and reflects every damage instance to its Hero',()=>{
 const s=game();const m=put(s,0,'op_carrot');play(s,'op_goro',m);const v=put(s,1,'hashirama_senju');attack(s,m,s.players[1].hero);assert.equal(v.health,7);hit(s,m,1);assert.equal(s.players[0].hero.health,29);
});
test('Ice Fruit freezes targets and forbids consecutive own turns but allows the following turn',()=>{
 const s=game();const m=put(s,0,'op_franky');play(s,'op_hie',m);attack(s,m,s.players[1].hero);assert.ok(hasKeyword(s.players[1].hero,'Frozen'));round(s);assert.ok(!getLegalActions(s).some(a=>a.attacker===m.uid));round(s);assert.ok(getLegalActions(s).some(a=>a.attacker===m.uid));
});
test('Flower Fruit produces hands and pays for each friendly hand death',()=>{
 const s=game();const m=put(s,0,'op_franky');play(s,'op_hana',m);end(s);const hand=s.players[0].board.find(x=>x.cardId==='op_flower_hand');assert.ok(hand);const before=m.health;hit(s,hand,1);assert.equal(m.health,before-1);
});
test('Chop Fruit Evade is consumable but cannot be stripped; spells deal two extra damage',()=>{
 const s=game();const m=put(s,0,'op_franky');play(s,'op_bara',m);addKeyword(m,'Silenced',false,s);assert.ok(hasKeyword(m,'Evade'));hit(s,m,1);assert.equal(hasKeyword(m,'Evade'),false);const before=m.health;hit(s,m,1,{spell:true});assert.equal(m.health,before-3);
});
test('Dice Fruit reduces attack damage and blocks healing, including after Silence',()=>{
 const s=game();const m=put(s,0,'op_franky');play(s,'op_supa',m);addKeyword(m,'Silenced',false,s);hit(s,m,3,{combat:true});assert.equal(m.health,4);assert.equal(heal(s,m.uid,3),0);assert.equal(m.health,4);
});
test('Bomb Fruit damages adjacent allies on attack and keeps its Exit after Silence',()=>{
 const s=game();const left=put(s,0,'op_carrot'),m=put(s,0,'op_franky'),right=put(s,0,'op_carrot'),v=put(s,1,'hashirama_senju');play(s,'op_bomu',m);addKeyword(m,'Silenced',false,s);attack(s,m,s.players[1].hero);assert.deepEqual([left.health,right.health],[2,2]);hit(s,m,50);assert.equal(v.health,6);
});
test('Phoenix has Lifesteal and its recurring Mana penalty survives Silence',()=>{
 const s=game();const m=put(s,0,'op_franky');play(s,'op_tori',m);addKeyword(m,'Silenced',false,s);s.players[0].hero.health=20;attack(s,m,s.players[1].hero);assert.equal(s.players[0].hero.health,27);round(s);assert.equal(s.players[0].mana.current,8);
});
test('Sea-Prism requires a User, doubles damage, silences only removable abilities, and expires Attack setting',()=>{
 const s=game();const m=put(s,1,'hashirama_senju');EFFECT_OPS.onePiece(s,{action:'tori'},{controller:1,chosen:m.uid});applyBuff(s,m,{attack:4,health:4,keywords:['Taunt']});const non=put(s,1,'choji_akimichi');const inst=addToHand(s,0,'op_shackles');const options=getLegalActions(s).filter(a=>a.card===inst.uid);assert.deepEqual(options.map(a=>a.target),[m.uid]);applyAction(s,options[0]);assert.equal(m.health,6);assert.equal(effectiveAttack(m),1);assert.equal(m.textLost,true);assert.ok(hasKeyword(m,'Lifesteal'));assert.equal(hasKeyword(m,'Taunt'),false);round(s);assert.equal(effectiveAttack(m),9);assert.ok(!isFruitUser(non));
});
test('Nami adds the defined Weather spell and draws only once per turn for Weather',()=>{
 const s=game();play(s,'op_nami');assert.ok(s.players[0].hand.some(i=>i.cardId==='op_thunderbolt'));const before=s.players[0].deck.length;play(s,'op_thunderbolt');play(s,'op_thunderbolt');assert.equal(s.players[0].deck.length,before-1);
});
test('Usopp and Robin trigger once per turn before enemy combat',()=>{
 const s=game();put(s,0,'op_usopp');put(s,0,'op_robin');const a=put(s,1,'naruto_uzumaki'),b=put(s,1,'naruto_uzumaki');s.activePlayer=1;attack(s,a,s.players[0].hero);assert.equal(a.health,2);assert.equal(s.players[0].board.filter(m=>m.cardId==='op_flower_guard').length,1);const hand=s.players[0].board.find(m=>m.cardId==='op_flower_guard');attack(s,b,hand);assert.equal(b.health,2);assert.equal(s.players[0].board.filter(m=>m.cardId==='op_flower_guard').length,0);
});
test('Chopper rewards actual healing, Brook freezes on Reborn, and Merry/Sunny support Straw Hats',()=>{
 const s=game();const ch=play(s,'op_chopper',s.players[0].hero);const ally=put(s,0,'op_nami');ally.health=1;heal(s,ally.uid,1,{source:ch.uid});flush(s);assert.deepEqual([ally.health,ally.maxHealth],[3,4]);const brook=put(s,0,'op_brook'),enemy=put(s,1,'choji_akimichi');hit(s,brook,50);assert.ok(hasKeyword(enemy,'Frozen'));put(s,0,'op_going_merry');put(s,0,'op_thousand_sunny');end(s);assert.ok(s.players[0].board.some(m=>m.cardId==='op_crewman'));
 const s2=game();put(s2,0,'op_thousand_sunny');const n=play(s2,'op_nami');assert.deepEqual([n.attack,n.health],[3,4]);
});
test('Zoro gains Evade and kill Attack; Sanji heals and gains a temporary crew bonus',()=>{
 const s=game();put(s,0,'op_luffy');const z=play(s,'op_zoro');assert.ok(hasKeyword(z,'Evade'));const v=put(s,1,'shadow_clone');attack(s,z,v);assert.equal(z.attack,6);
 const s2=game();put(s2,0,'op_nami');const san=put(s2,0,'op_sanji');s2.players[0].hero.health=20;attack(s2,san,s2.players[1].hero);assert.equal(s2.players[0].hero.health,22);assert.equal(effectiveAttack(san),6);
});
test('Jinbe and Bartolomeo prevent damage only for the appropriate allies',()=>{
 const s=game();const j=put(s,0,'op_jinbe');hit(s,j,3);assert.equal(j.health,5);const b=put(s,0,'op_bartolomeo'),n=put(s,0,'op_nami'),far=put(s,0,'op_carrot');hit(s,n,2);assert.equal(n.health,2);hit(s,far,2);assert.equal(far.health,1);
});
test('Law swaps enemy stats and positions once per turn; Petrify blocks activated abilities',()=>{
 const s=game();const enemy=put(s,1,'choji_akimichi');const law=play(s,'op_law',enemy);assert.deepEqual([enemy.attack,enemy.health],[5,2]);const n=put(s,0,'op_nami');let a=getLegalActions(s).find(a=>a.type==='lawSwap'&&a.target===law.uid&&a.target2===n.uid);assert.ok(a);applyAction(s,a);assert.equal(s.players[0].board[0].uid,n.uid);assert.ok(!getLegalActions(s).some(a=>a.type==='lawSwap'));
});
test('Bepo, Yamato, Carrot, Kinemon, and Fleet Captain apply their conditional bonuses',()=>{
 const s=game();put(s,0,'op_law');const b=play(s,'op_bepo');assert.deepEqual([b.attack,b.health],[5,6]);put(s,0,'op_luffy');const y=play(s,'op_yamato');assert.equal(y.attack,7);const c=play(s,'op_carrot');assert.equal(effectiveAttack(c),5);assert.ok(hasKeyword(c,'Evade'));play(s,'op_kinemon',b);assert.equal(effectiveAttack(b),7);
 const s2=game();const n=put(s2,0,'op_nami');put(s2,0,'op_usopp');const before=s2.players[0].deck.length;play(s2,'op_fleet_captain',n);assert.equal(n.attack,3);assert.equal(s2.players[0].deck.length,before-1);
});
test('Ace and Sabo burn and reward Fire spells; Hancock Petrifies after combat even when killed',()=>{
 const s=game();const v=put(s,1,'hashirama_senju');put(s,0,'op_ace');play(s,'op_diable',put(s,0,'op_sanji'));assert.equal(s.players[1].hero.health+v.health,37);const l=put(s,0,'op_luffy'),sabo=put(s,0,'op_sabo');attack(s,sabo,s.players[1].hero);assert.ok(s.players[1].hero.burn>0);assert.equal(effectiveAttack(l),5);
 const s2=game();const boa=put(s2,0,'op_hancock');boa.health=1;const a=put(s2,1,'hashirama_senju');s2.activePlayer=1;attack(s2,a,boa);assert.ok(a.petrified.length);assert.ok(!getLegalActions(s2).some(x=>x.attacker===a.uid));
});
test('Haki immunity blocks Naruto and Conqueror Attack reductions; Nakama heals with two Straw Hats',()=>{
 const s=game();const m=put(s,0,'op_carrot');play(s,'op_armament',m);applyBuff(s,m,{attack:-4,temporary:true});assert.equal(effectiveAttack(m),5);s.players[0].hero.health=20;put(s,0,'op_nami');put(s,0,'op_usopp');const hs=getLegalActions(s).find(a=>a.type==='heroSpell'&&a.target===m.uid);applyAction(s,hs);assert.equal(s.players[0].hero.health,22);assert.equal(effectiveAttack(m),6);
});
test('Gatling uses six/eight separate hits; Thunderbolt hits up to three distinct enemies and freezes damaged ones',()=>{
 for(const gearForm of [false,true]){const s=game();if(gearForm)put(s,0,'op_gear2');const v=put(s,1,'hashirama_senju',{health:20});play(s,'op_gatling');assert.equal(v.health,gearForm?12:14);}
 const s=game();put(s,0,'op_nami');const a=put(s,1,'choji_akimichi'),b=put(s,1,'choji_akimichi'),c=put(s,1,'choji_akimichi');play(s,'op_thunderbolt');for(const m of [a,b,c]){assert.equal(m.health,3);assert.ok(hasKeyword(m,'Frozen'));}
});
test('Pistol, Red Hawk, Oni Giri, Diable Jambe, Meat, Fleet, Buster Call and Conqueror have correct effects',()=>{
 const s=game();put(s,0,'op_luffy');const v=put(s,1,'hashirama_senju');play(s,'op_pistol',v);assert.equal(v.health,4);play(s,'op_red_hawk',s.players[1].hero);assert.equal(s.players[1].hero.health,25);assert.ok(s.players[1].hero.burn>0);
 const z=put(s,0,'op_zoro');play(s,'op_oni_giri',z);assert.equal(z.bonusAttacks,1);assert.equal(effectiveAttack(z),8);const san=put(s,0,'op_sanji');play(s,'op_diable',san);attack(s,san,s.players[1].hero);assert.ok(s.players[1].hero.burn>=2);const l=s.players[0].board.find(m=>m.cardId==='op_luffy');l.health=1;play(s,'op_meat',l);assert.equal(l.health,5);assert.equal(l.attack,4);
 const s2=game();put(s2,0,'op_luffy');play(s2,'op_grand_fleet');assert.equal(s2.players[0].board.filter(m=>m.cardId==='op_fleet_pirate'&&m.attack===4).length,4);
 const s3=game();const n=put(s3,0,'op_luffy'),b=put(s3,1,'hashirama_senju');play(s3,'op_buster');assert.equal(n.health,2);assert.equal(b.health,4);
 const s4=game();put(s4,1,'shadow_clone');const big=put(s4,1,'hashirama_senju');play(s4,'op_conqueror');assert.equal(s4.players[1].board.length,1);assert.equal(effectiveAttack(big),5);round(s4);assert.equal(effectiveAttack(big),7);
});
test('Observation is restricted to an attacked friendly minion and expires even if the attack is redirected',()=>{
 const s=game();const defender=put(s,0,'op_franky'),a=put(s,1,'rock_lee');const inst=addToHand(s,0,'op_observation');s.activePlayer=1;attack(s,a,defender);assert.equal(s.pending?.type,'reaction');applyAction(s,getLegalActions(s).find(a=>a.card===inst.uid));assert.equal(defender.health,6);assert.equal(hasKeyword(defender,'Evade'),false);assert.equal(s.players[0].hand.length,1);
});
test('Emergency Gear Shift reacts to enemy attacks and targeted spells, makes Gear 4 choices, and excludes Gear 5',()=>{
 for(const targetedSpell of [false,true]){const s=game();const l=put(s,0,'op_gear3'),a=put(s,1,'rock_lee');const inst=addToHand(s,0,'op_emergency');s.activePlayer=1;
  if(targetedSpell)play(s,'chidori',l,1);else attack(s,a,l);
  assert.equal(s.pending?.type,'reaction');applyAction(s,getLegalActions(s).find(a=>a.card===inst.uid));assert.equal(s.pending?.type,'choice');applyAction(s,{type:'choose',player:0,index:1});assert.equal(l.cardId,'op_snakeman');assert.equal(hasKeyword(l,'Evade'),false);
 }
 const s=game();const m=put(s,0,'op_gear5');addToHand(s,0,'op_emergency');s.activePlayer=1;const a=put(s,1,'rock_lee');attack(s,a,m);assert.equal(s.pending,null);
});
test('The Will of D. targets only Legendary minions and refreshes one discounted Gear activation without refreshing attacks',()=>{
 const s=game();const l=put(s,0,'op_luffy');put(s,0,'op_nami');gear(s,l);l.attacksThisTurn=1;play(s,'op_will',l);assert.ok(hasKeyword(l,'Reborn'));const before=s.players[0].mana.current;gear(s,l);assert.equal(s.players[0].mana.current,before-1);assert.equal(l.cardId,'op_gear3');assert.equal(l.attacksThisTurn,1);
});
test('a Fruit consumed during Rubber Toy form stays intact after restoration, and fresh copies get no Fruit',()=>{
 const s=game();const l=put(s,0,'op_gear5'),v=put(s,1,'hashirama_senju');attack(s,l,s.players[1].hero);
 EFFECT_OPS.onePiece(s,{action:'tori'},{controller:1,chosen:v.uid});assert.equal(v.maxHealth,4);round(s);
 assert.equal(v.cardId,'hashirama_senju');assert.equal(v.maxHealth,12);assert.equal(v.health,12);assert.ok(hasKeyword(v,'Lifesteal'));
 EFFECT_OPS.summon(s,{copyOf:{uid:v.uid}},{controller:1});const copy=s.players[1].board.find(m=>m.uid!==v.uid&&m.cardId==='hashirama_senju');assert.ok(copy);assert.equal(isFruitUser(copy),false);assert.equal(copy.maxHealth,9);
});
test('every collectible resolves in a valid scenario and matches remain deterministic across save/load',()=>{
 for(const id of FACTION_POOLS[STRAW_HATS]){const c=getCard(id);if(c.reactionOnly)continue;const s=game();const l=put(s,0,'op_luffy'),ordinary=put(s,0,'op_franky');const enemy=put(s,1,'hashirama_senju');let t;
  if(c.target){t=c.target.side==='friendly'?(c.target.legendary?l:ordinary):enemy;if(c.target.devilFruitUser)EFFECT_OPS.onePiece(s,{action:'tori'},{controller:1,chosen:enemy.uid});}
  play(s,id,t);assert.ok(!s.gameOver,id);
 }
 for(let seed=1;seed<=3;seed++){
  const fs=seed===1?[STRAW_HATS,LEAF]:[STRAW_HATS,STRAW_HATS];const s=createGame({players:fs.map((f,i)=>({factions:[f],deck:f===STRAW_HATS?Object.values(ANIME_PRESETS[f])[i%3]:FACTION_LISTS[f]})),seed});let steps=0;
  while(!s.gameOver&&steps++<1400){const a=chooseAction(s);assert.ok(a);const clone=JSON.parse(JSON.stringify(s));applyAction(s,a);applyAction(clone,a);assert.deepEqual(s,clone);}
  assert.ok(s.gameOver,`seed ${seed} completes`);assert.ok(s.players.every(p=>p.board.length<=7));
 }
});
