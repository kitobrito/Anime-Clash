import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { LEAF, FACTION_LISTS, FACTION_POOLS, copyLimit } from '../src/cards/index.js';
import { allCards, getCard } from '../src/engine/registry.js';
import { validateAllCards } from '../src/cards/validate.js';
import { checkDeck, singleDeckProblem } from '../src/cards/deck-check.js';
import { createGame, getLegalActions, applyAction, run, actingPlayer } from '../src/engine/engine.js';
import { addToHand, summonMinion, hasKeyword, effectiveAttack, dealDamage, emit } from '../src/engine/core.js';
import { chooseAction } from '../src/ai/greedy.js';
const base=FACTION_LISTS[LEAF];
function game(seed=1){const s=createGame({players:[{name:'You',factions:[LEAF],deck:base},{name:'Rival',factions:[LEAF],deck:base}],seed,rules:{mulligan:false,secondPlayerPotions:false,openingHandHelp:false}});for(const p of s.players){p.board=[];p.hand=[];p.mana={current:10,max:10,bonusNextTurn:0};}return s;}
function put(s,p,id,opts={}){const m=summonMinion(s,p,id,{silent:true,...opts});m.sick=false;return m;}
function play(s,id,target){s.players[0].mana.current=10;const i=addToHand(s,0,id);const a=getLegalActions(s).find(a=>a.type==='play'&&a.card===i.uid&&(target==null||a.target===target.uid));assert.ok(a,`legal play ${id}`);applyAction(s,a);return s.players[0].board.find(m=>m.uid===i.uid)||s.players[0].board.findLast(m=>m.cardId===id);}
function end(s){applyAction(s,getLegalActions(s).find(a=>a.type==='endTurn'));}
function event(s,ev){emit(s,ev);s.queue.push(...s.buffer);s.buffer=[];run(s);}
function hit(s,source,target,n){dealDamage(s,source?.uid??null,target.uid,n);s.queue.push(...s.buffer,{kind:'deaths'});s.buffer=[];run(s);}
function attack(s,a,d){applyAction(s,getLegalActions(s).find(x=>x.type==='attack'&&x.attacker===a.uid&&x.defender===d.uid));}

test('45 collectibles: 27 minions, 18 spells, 7 legendaries; all art and definitions valid',()=>{
 const cards=FACTION_POOLS[LEAF].map(getCard);assert.equal(cards.length,45);assert.equal(cards.filter(c=>c.type==='minion').length,27);assert.equal(cards.filter(c=>c.type==='spell').length,18);assert.equal(cards.filter(c=>c.legendary).length,7);
 assert.equal(allCards().filter(c=>c.faction===LEAF&&c.token).length,9);assert.deepEqual(validateAllCards().filter(c=>c.errors.length||c.incomplete.length),[]);
 for(const c of allCards().filter(c=>c.faction===LEAF))assert.ok(fs.existsSync(new URL('../'+c.image,import.meta.url)),c.name);
});
test('deck rules reject wrong sizes, duplicate legends, tokens, hero spells, unknown cards, fusion and foreign factions',()=>{
 assert.equal(singleDeckProblem(LEAF,base),null);assert.ok(singleDeckProblem(LEAF,base.slice(1)));
 for(const id of ['kakashi_hatake','shadow_clone','shadow_clone_technique','invalid'])assert.ok(checkDeck({format:'single',factions:[LEAF],deck:[...base.slice(1),id]}).error,id);
 const d=base.filter(id=>!['kakashi_hatake','sakura_haruno'].includes(id));d.push('konohamaru','konohamaru');assert.ok(singleDeckProblem(LEAF,d));
 assert.ok(checkDeck({format:'pair',factions:[LEAF,LEAF],deck:base}).error);assert.ok(checkDeck({factions:['Akatsuki'],deck:base}).error);
 assert.throws(()=>createGame({players:[{factions:[LEAF,LEAF],deck:base},{factions:[LEAF],deck:base}]}));
 const s=game();assert.equal(s.players[0].fusion,undefined);assert.equal(s.players[0].heroSpells.length,1);
});
test('ordinary duplicates are legal and persist in the single faction lineup',()=>{
 const d=[...base];d[d.indexOf('kakashi_hatake')]='naruto_uzumaki';assert.equal(singleDeckProblem(LEAF,d),null);assert.equal(copyLimit('naruto_uzumaki'),2);assert.equal(copyLimit('minato_namikaze'),1);
});
test('Team 7 bonuses, healing, Kakashi buffs, and Naruto makes exactly one end-turn copy',()=>{
 const s=game();put(s,0,'sasuke_uchiha');const sak=put(s,0,'sakura_haruno');sak.health=1;const naruto=play(s,'naruto_uzumaki');assert.equal(naruto.attack,4);assert.equal(naruto.health,4);
 play(s,'sakura_haruno',sak);assert.equal(sak.health,3);play(s,'kakashi_hatake');assert.equal(naruto.attack,5);end(s);assert.equal(s.players[0].board.filter(m=>m.cardId==='naruto_uzumaki').length,2);end(s);end(s);assert.equal(s.players[0].board.filter(m=>m.cardId==='naruto_uzumaki').length,2);
});
test('Konohamaru, Sasuke, Iruka and Might Guy grant their named stat bonuses',()=>{
 const s=game();put(s,0,'naruto_uzumaki');put(s,0,'sakura_haruno');assert.equal(play(s,'konohamaru').attack,2);assert.equal(play(s,'sasuke_uchiha').attack,5);
 const rock=put(s,0,'rock_lee');play(s,'might_guy');assert.equal(rock.attack,5);
 const s2=game();const clone=put(s2,0,'shadow_clone');play(s2,'iruka_umino',clone);assert.deepEqual([clone.attack,clone.health],[2,2]);
});
test('clone spells and hero spell respect the seven-minion board cap and once-per-turn use',()=>{
 const s=game();put(s,0,'naruto_uzumaki');play(s,'shadow_clone_jutsu');assert.equal(s.players[0].board.length,5);
 const hs=getLegalActions(s).find(a=>a.type==='heroSpell');applyAction(s,hs);assert.equal(s.players[0].board.length,6);assert.ok(!getLegalActions(s).some(a=>a.type==='heroSpell'));
 play(s,'shadow_clone_jutsu');assert.equal(s.players[0].board.length,7);
});
test('Kiba, Jiraiya, Yamato, Sai, Hashirama and both Wood Golem sizes summon correct tokens',()=>{
 for(const [id,token,n,stats] of [['kiba_inuzuka','akamaru',1,[1,1]],['jiraiya','summoned_toad',2,[2,2]],['yamato','wooden_barrier',2,[0,2]],['sai','ink_beast',1,[2,1]],['hashirama_senju','wood_golem',2,[3,5]],['wood_style_deep_forest_emergence','wood_golem',3,[2,4]]]){
  const s=game();play(s,id);const tokens=s.players[0].board.filter(m=>m.cardId===token);assert.equal(tokens.length,n,id);assert.deepEqual([tokens[0].attack,tokens[0].health],stats,id);
 }
 const s=game();put(s,0,'hashirama_senju');play(s,'wood_style_deep_forest_emergence');assert.deepEqual(s.players[0].board.filter(m=>m.cardId==='wood_golem').map(m=>[m.attack,m.health]),[[4,6],[4,6],[4,6]]);
});
test('Shikamaru blocks precisely the next controller turn without freezing',()=>{
 const s=game();const target=put(s,1,'rock_lee');play(s,'shikamaru_nara',target);assert.ok(target.animeBlocks.length);assert.equal(hasKeyword(target,'Frozen'),false);end(s);assert.ok(!getLegalActions(s).some(a=>a.attacker===target.uid));end(s);end(s);assert.ok(getLegalActions(s).some(a=>a.attacker===target.uid));
});
test('Shadow Strangle deals delayed damage when the caster next begins a turn',()=>{
 const s=game();const target=put(s,1,'choji_akimichi');play(s,'shadow_strangle_jutsu',target);assert.equal(target.health,5);end(s);end(s);assert.equal(target.health,2);
});
test('Rasengan deals 1 then 3 when Frozen expires',()=>{
 const s=game();const target=put(s,1,'choji_akimichi');play(s,'rasengan',target);assert.equal(target.health,4);assert.ok(hasKeyword(target,'Frozen'));end(s);end(s);assert.equal(hasKeyword(target,'Frozen'),false);assert.equal(target.health,1);
});
test('temporary attack reductions and Expansion Jutsu expire; Choji keeps Expansion permanently',()=>{
 const s=game();const enemy=put(s,1,'might_guy');const ally=put(s,0,'rock_lee');play(s,'sexy_jutsu',enemy);assert.equal(effectiveAttack(enemy),3);play(s,'expansion_jutsu',ally);assert.equal(ally.maxHealth,6);assert.ok(hasKeyword(ally,'Taunt'));end(s);end(s);assert.equal(effectiveAttack(enemy),5);assert.equal(ally.maxHealth,2);assert.equal(hasKeyword(ally,'Taunt'),false);
 const s2=game();const choji=put(s2,0,'choji_akimichi');play(s2,'expansion_jutsu',choji);end(s2);end(s2);assert.deepEqual([choji.attack,choji.maxHealth],[4,9]);
});
test('Byakugan reveals Stealth and ignores Taunt for the current turn only',()=>{
 const s=game();const attacker=put(s,0,'rock_lee');put(s,1,'choji_akimichi');const hidden=put(s,1,'naruto_uzumaki',{keywords:['Stealth']});play(s,'byakugan',attacker);assert.equal(hasKeyword(hidden,'Stealth'),false);assert.ok(getLegalActions(s).some(a=>a.attacker===attacker.uid&&a.defender===s.players[1].hero.uid));end(s);end(s);assert.ok(!getLegalActions(s).some(a=>a.attacker===attacker.uid&&a.defender===s.players[1].hero.uid));
});
test('Eight Trigrams resolves eight separate hits, consumes Evade, and strips keywords with Hyuga',()=>{
 const s=game();put(s,0,'hinata_hyuga');const target=put(s,1,'hashirama_senju',{keywords:['Evade','Taunt']});play(s,'eight_trigrams_sixty_four_palms',target);assert.equal(target.health,2);assert.equal(allKeywordsOf(target).length,0);
});
function allKeywordsOf(m){return [...m.keywords,...m.tempKeywords,...(m.lingerKeywords??[])];}
test('Ino borrows a low-attack enemy and returns it at end of turn',()=>{
 const s=game();const target=put(s,1,'sakura_haruno');play(s,'ino_yamanaka',target);assert.equal(target.controller,0);end(s);assert.equal(target.controller,1);
});
test('Minato optionally swaps board positions and intercepts the pending attack',()=>{
 const s=game();const a=put(s,0,'rock_lee');const ally=put(s,1,'sakura_haruno');const minato=put(s,1,'minato_namikaze');attack(s,a,ally);assert.equal(s.pending?.type,'choice');assert.equal(actingPlayer(s),1);applyAction(s,{type:'choose',player:1,index:0});assert.equal(ally.health,3);assert.equal(hasKeyword(minato,'Evade'),false);assert.equal(s.players[1].board[0].uid,minato.uid);
});
test('Minato protection can be declined',()=>{
 const s=game();const a=put(s,0,'rock_lee');const ally=put(s,1,'sakura_haruno');put(s,1,'minato_namikaze');attack(s,a,ally);applyAction(s,{type:'choose',player:1,index:1});assert.ok(!s.players[1].board.includes(ally));
});
test('Substitution is reaction-only, returns the ally and puts a Log in its position to receive combat',()=>{
 const s=game();const a=put(s,0,'rock_lee');const ally=put(s,1,'sakura_haruno');addToHand(s,0,'substitution_jutsu');const inst=addToHand(s,1,'substitution_jutsu');assert.ok(!getLegalActions(s).some(a=>a.card===s.players[0].hand[0].uid));attack(s,a,ally);assert.equal(s.pending?.type,'reaction');const qp=getLegalActions(s).find(a=>a.card===inst.uid);assert.ok(qp);applyAction(s,qp);assert.ok(s.players[1].hand.some(c=>c.cardId==='sakura_haruno'));assert.ok(!s.players[1].board.some(c=>c.cardId==='wooden_log'));assert.equal(a.health,2);
});
test('Flying Thunder God bounces the ally and damages or bounces the attacker',()=>{
 for(const minatoPresent of [false,true]){
  const s=game();const a=put(s,0,'might_guy');const ally=put(s,1,'sakura_haruno');if(minatoPresent)put(s,1,'minato_namikaze');const inst=addToHand(s,1,'flying_thunder_god_technique');attack(s,a,ally);
  if(s.pending?.type==='choice')applyAction(s,{type:'choose',player:1,index:1});
  applyAction(s,getLegalActions(s).find(x=>x.card===inst.uid));assert.ok(s.players[1].hand.some(c=>c.cardId==='sakura_haruno'));
  if(minatoPresent)assert.ok(s.players[0].hand.some(c=>c.cardId==='might_guy'));else assert.equal(a.health,2);
 }
});
test('Jutsu listeners activate for ordinary spells and reaction spells, not the Hero Spell',()=>{
 const s=game();put(s,0,'tenten');put(s,0,'kakashi_hatake');put(s,0,'jiraiya');const beast=put(s,0,'ink_beast');put(s,0,'sai');const target=put(s,1,'hashirama_senju');s.players[0].hero.health=20;play(s,'chidori',target);assert.equal(s.players[0].hero.health,22);assert.equal(effectiveAttack(beast),3);const hp=s.players[0].hero.health;applyAction(s,getLegalActions(s).find(a=>a.type==='heroSpell'));assert.equal(s.players[0].hero.health,hp);
});
test('Tobirama counts deaths from its own Arrival; Hiruzen aura disappears with him',()=>{
 const s=game();put(s,1,'shadow_clone');put(s,1,'shadow_clone');play(s,'tobirama_senju');assert.equal(s.players[0].board.filter(m=>m.cardId==='water_clone').length,2);
 const s2=game();const ally=put(s2,0,'rock_lee');const h=play(s2,'hiruzen_sarutobi');assert.equal(effectiveAttack(ally),4);hit(s2,null,h,20);assert.equal(effectiveAttack(ally),3);assert.equal(ally.maxHealth,2);
});
test('Hinata heals Naruto damage, Choji grows, Tsunade rewards actual healing, Hashirama heals at own end',()=>{
 const s=game();put(s,0,'hinata_hyuga');const n=put(s,0,'naruto_uzumaki');const c=put(s,0,'choji_akimichi');put(s,0,'tsunade');put(s,0,'hashirama_senju');hit(s,null,n,1);assert.equal(n.health,3);assert.equal(n.attack,4);hit(s,null,c,1);assert.equal(c.attack,3);end(s);assert.equal(c.health,5);assert.equal(c.attack,4);
});
test('Rock Lee grows after surviving an attack; Shino lowers enemy attack; Asuma deals before combat',()=>{
 const s=game();const rock=put(s,0,'rock_lee');const target=put(s,1,'shadow_clone');attack(s,rock,target);assert.equal(rock.attack,4);
 const s2=game();const shino=put(s2,0,'shino_aburame');const choji=put(s2,1,'choji_akimichi');attack(s2,shino,choji);assert.equal(choji.attack,2); // -1 from Shino, +1 from surviving damage
 const s3=game();put(s3,0,'asuma_sarutobi');const shik=put(s3,0,'shikamaru_nara');const victim=put(s3,1,'sakura_haruno');attack(s3,shik,victim);assert.ok(!s3.players[1].board.includes(victim));assert.equal(shik.health,2);
});
test('Neji and Gentle Fist strip keywords temporarily',()=>{
 const s=game();const neji=put(s,0,'neji_hyuga');const target=put(s,1,'hashirama_senju',{keywords:['Taunt']});attack(s,neji,target);assert.equal(hasKeyword(target,'Taunt'),false);end(s);end(s);assert.equal(hasKeyword(target,'Taunt'),true);
 const s2=game();const rock=put(s2,0,'rock_lee');const big=put(s2,1,'hashirama_senju',{keywords:['Taunt']});play(s2,'gentle_fist',rock);attack(s2,rock,big);assert.equal(hasKeyword(big,'Taunt'),false);
});
test('Anko poison expires after the target controller turn; Eight Gates self-damage at end',()=>{
 const s=game();const target=put(s,1,'hashirama_senju');play(s,'anko_mitarashi',target);assert.ok(hasKeyword(target,'Poisonous'));end(s);end(s);assert.equal(hasKeyword(target,'Poisonous'),false);
 const s2=game();const c=put(s2,0,'choji_akimichi');play(s2,'eight_gates_gate_of_opening',c);assert.equal(effectiveAttack(c),6);end(s2);assert.equal(c.health,2);assert.equal(effectiveAttack(c),3);assert.equal(hasKeyword(c,'Rush'),false);
});
test('Fireball hits only adjacent minions; Sasuke increases splash; Chidori bonus and Gamabunta Rush',()=>{
 const s=game();put(s,0,'sasuke_uchiha');const a=put(s,1,'choji_akimichi'),b=put(s,1,'choji_akimichi'),c=put(s,1,'choji_akimichi'),d=put(s,1,'choji_akimichi');play(s,'fire_style_fireball_jutsu',b);assert.deepEqual([a.health,b.health,c.health,d.health],[3,2,3,5]);play(s,'chidori',s.players[1].hero);assert.equal(s.players[1].hero.health,24);
 const s2=game();put(s2,0,'naruto_uzumaki');play(s2,'summoning_jutsu_gamabunta');assert.ok(hasKeyword(s2.players[0].board.find(m=>m.cardId==='gamabunta'),'Rush'));
});
test('Thousand Years of Death bounces only survivors and draws with Kakashi',()=>{
 const s=game();put(s,0,'kakashi_hatake');const target=put(s,1,'hashirama_senju');play(s,'thousand_years_of_death',target);assert.ok(s.players[1].hand.some(c=>c.cardId==='hashirama_senju'));assert.equal(s.players[0].hand.length,1);
});
test('every collectible plays without engine errors in a target-rich scenario',()=>{
 for(const id of FACTION_POOLS[LEAF]){
  const c=getCard(id);if(c.reactionOnly)continue;const s=game();put(s,0,'naruto_uzumaki');put(s,0,'sasuke_uchiha');put(s,0,'sakura_haruno');const a=put(s,1,'choji_akimichi');const t=c.target?(c.target.side==='friendly'?s.players[0].board.find(m=>!c.target.maxAttack||effectiveAttack(m)<=c.target.maxAttack):a):undefined;
  if(c.target?.side==='friendly'&&!t)put(s,0,'shadow_clone');
  play(s,id,t);assert.ok(!s.log.some(t=>String(t).includes('endless chain')),id);
 }
});
test('serialized games continue identically and complete AI mirror matches',()=>{
 for(let seed=1;seed<=3;seed++){
  const ids=[...base];ids.splice(15,3,'minato_namikaze','hashirama_senju','tobirama_senju');const s=createGame({players:[{factions:[LEAF],deck:ids},{factions:[LEAF],deck:ids}],seed});let steps=0;
  while(!s.gameOver&&steps++<1200){const a=chooseAction(s);assert.ok(a);const clone=JSON.parse(JSON.stringify(s));applyAction(s,a);applyAction(clone,a);assert.deepEqual(clone,s);}
  assert.ok(s.gameOver,`seed ${seed} completes in ${steps} steps`);assert.ok(s.players.every(p=>p.board.length<=7));
 }
});
