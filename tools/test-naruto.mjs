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

test('46 collectibles: 27 minions, 19 spells, 7 legendaries; all art and definitions valid',()=>{
 const cards=FACTION_POOLS[LEAF].map(getCard);assert.equal(cards.length,46);assert.equal(cards.filter(c=>c.type==='minion').length,27);assert.equal(cards.filter(c=>c.type==='spell').length,19);assert.equal(cards.filter(c=>c.legendary).length,7);
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
 const d=[...base];d[d.indexOf('kakashi_hatake')]='neji_hyuga';assert.equal(singleDeckProblem(LEAF,d),null);assert.equal(copyLimit('naruto_uzumaki'),2);assert.equal(copyLimit('minato_namikaze'),1);
});
test('Team 7 bonuses, healing, Kakashi buffs, and Naruto makes exactly one end-turn copy',()=>{
 const s=game();put(s,0,'sasuke_uchiha');const sak=put(s,0,'sakura_haruno');sak.health=1;const naruto=play(s,'naruto_uzumaki');assert.equal(naruto.attack,6);assert.equal(naruto.health,6);
 play(s,'sakura_haruno',sak);assert.equal(sak.health,6);play(s,'kakashi_hatake');assert.equal(naruto.attack,7);end(s);assert.equal(s.players[0].board.filter(m=>m.cardId==='naruto_uzumaki').length,2);end(s);end(s);assert.equal(s.players[0].board.filter(m=>m.cardId==='naruto_uzumaki').length,2);
});
test('Konohamaru, Sasuke, Iruka and Might Guy grant their named stat bonuses',()=>{
 const s=game();put(s,0,'naruto_uzumaki');put(s,0,'sakura_haruno');assert.equal(play(s,'konohamaru').attack,2);assert.equal(play(s,'sasuke_uchiha').attack,7);
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
test('Eight Trigrams resolves eight separate hits, consumes Evade, and preserves minion keywords',()=>{
 const s=game();put(s,0,'hinata_hyuga');const target=put(s,1,'hashirama_senju',{keywords:['Evade','Taunt']});play(s,'eight_trigrams_sixty_four_palms');assert.equal(target.health,2);assert.ok(hasKeyword(target,'Taunt'));assert.equal(s.players[1].mana.jammedNextTurn??0,0);
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
test('Rock Lee grows after surviving an attack; Shino steals next-turn Mana; Asuma deals before combat',()=>{
 const s=game();const rock=put(s,0,'rock_lee');const target=put(s,1,'shadow_clone');attack(s,rock,target);assert.equal(rock.attack,4);
 const s2=game();const shino=put(s2,0,'shino_aburame');const choji=put(s2,1,'choji_akimichi');attack(s2,shino,choji);assert.equal(choji.attack,3);assert.equal(s2.players[1].mana.jammedNextTurn,1);assert.equal(s2.players[0].mana.bonusNextTurn,1); // Choji still grows from surviving damage
 const s3=game();put(s3,0,'asuma_sarutobi');const shik=put(s3,0,'shikamaru_nara');const victim=put(s3,1,'sakura_haruno');attack(s3,shik,victim);assert.ok(!s3.players[1].board.includes(victim));assert.equal(shik.health,2);
});
test('Neji and Gentle Fist preserve minion keywords and do not Jam on minion hits',()=>{
 const s=game();const neji=put(s,0,'neji_hyuga');const target=put(s,1,'hashirama_senju',{keywords:['Taunt']});attack(s,neji,target);assert.ok(hasKeyword(target,'Taunt'));assert.equal(s.players[1].mana.jammedNextTurn??0,0);
 const s2=game();const rock=put(s2,0,'rock_lee');const big=put(s2,1,'hashirama_senju',{keywords:['Taunt']});play(s2,'gentle_fist',rock);attack(s2,rock,big);assert.ok(hasKeyword(big,'Taunt'));assert.equal(s2.players[1].mana.jammedNextTurn??0,0);
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

// Regression coverage for team rewards, next-turn disruption and Palm Rotation.
const {NARUTO_TEAMS}=await import('../src/cards/naruto-teams.js');
const {checkNarutoTeams,jamMana}=await import('../src/engine/naruto.js');
const {nextTurnMana,quickPlayBudget}=await import('../src/engine/core.js');
const {ANIME_PRESETS}=await import('../src/cards/anime-presets.js');
for(const team of NARUTO_TEAMS)for(const zone of ['hand','deck'])test(`${team.name}: +3/+3 and mentor from ${zone}, once per player per game`,()=>{
 const s=game();for(const pl of s.players){pl.hand=[];pl.deck=[];}
 const mentor=addToHand(s,0,team.mentor);
 if(zone==='deck'){s.players[0].hand=[];s.players[0].deck=[mentor];}
 const units=team.members.map(id=>put(s,0,id));
 const stats=units.map(m=>[m.attack,m.health]);checkNarutoTeams(s);s.queue.push(...s.buffer);s.buffer=[];run(s);
 units.forEach((m,i)=>assert.deepEqual([m.attack,m.health],[stats[i][0]+3,stats[i][1]+3]));
 assert.equal(s.players[0].board.filter(m=>m.cardId===team.mentor).length,1);
 assert.equal(s.players[0][zone].length,0);assert.deepEqual(s.players[0].narutoTeamsCompleted,[team.id]);
 const saved=JSON.parse(JSON.stringify(s));saved.players[0].board=[];
 team.members.forEach(id=>put(saved,0,id));addToHand(saved,0,team.mentor);checkNarutoTeams(saved);
 assert.equal(saved.players[0].board[0].attack,getCard(team.members[0]).attack);
 assert.equal(saved.players[0].hand.length,1);
 team.members.forEach(id=>put(saved,1,id));checkNarutoTeams(saved);
 assert.deepEqual(saved.players[1].narutoTeamsCompleted,[team.id]);
});
test('team completion ignores enemy/dead teammates; duplicate species do not complete a team',()=>{
 const s=game();put(s,0,'naruto_uzumaki');put(s,0,'naruto_uzumaki');put(s,0,'sakura_haruno');put(s,1,'sasuke_uchiha');checkNarutoTeams(s);assert.equal(s.players[0].narutoTeamsCompleted,undefined);
 const sasuke=put(s,0,'sasuke_uchiha');sasuke.health=0;checkNarutoTeams(s);assert.equal(s.players[0].narutoTeamsCompleted,undefined);
 sasuke.health=1;checkNarutoTeams(s);assert.deepEqual(s.players[0].board.slice(0,2).map(m=>m.attack),[6,6]);
});
test('full board keeps the mentor in hand; absent mentors are never fabricated',()=>{
 for(const available of [true,false]){
  const s=game();s.players[0].hand=[];s.players[0].deck=[];NARUTO_TEAMS[0].members.forEach(id=>put(s,0,id));
  if(available){addToHand(s,0,'kakashi_hatake');for(let i=0;i<4;i++)put(s,0,'shadow_clone');}
  checkNarutoTeams(s);assert.equal(s.players[0].board.some(m=>m.cardId==='kakashi_hatake'),false);
  assert.equal(s.players[0].hand.length,available?1:0);assert.equal(s.players[0].board[0].attack,6);
 }
});
test('Kiba Arrival summons Akamaru and completes Team 8 immediately',()=>{
 const s=game();s.players[0].deck=[];put(s,0,'shino_aburame');put(s,0,'hinata_hyuga');addToHand(s,0,'kurenai_yuhi');play(s,'kiba_inuzuka');
 assert.deepEqual(s.players[0].narutoTeamsCompleted,['team8']);assert.equal(s.players[0].board.find(m=>m.cardId==='akamaru').attack,4);assert.ok(s.players[0].board.some(m=>m.cardId==='kurenai_yuhi'));
});
test('Palms clears minions before hitting Hero; only Hero hits Jam, up to eight',()=>{
 for(const minionHealth of [0,1,4,8,10]){
  const s=game();if(minionHealth)put(s,1,'wood_golem',{health:minionHealth});
  const hero=s.players[1].hero;play(s,'eight_trigrams_sixty_four_palms');
  const face=Math.max(0,8-minionHealth);assert.equal(hero.health,30-face);assert.equal(s.players[1].mana.jammedNextTurn??0,face);
 }
});
test('Palms returns to new minions summoned between hits instead of striking the Hero',()=>{
 const s=game();put(s,1,'op_brook'); // Brook Reborn must be removed before any face hits
 play(s,'eight_trigrams_sixty_four_palms');
 assert.equal(s.players[1].board.length,0);assert.ok(s.players[1].hero.health>22);
 assert.equal(s.players[1].mana.jammedNextTurn,30-s.players[1].hero.health);
});
test('Neji and Hinata direct Hero attacks Jam; Evade and retaliation do not',()=>{
 for(const id of ['neji_hyuga','hinata_hyuga'])for(const evade of [false,true]){
  const s=game();const a=put(s,0,id);if(evade)s.players[1].hero.keywords.push('Evade');attack(s,a,s.players[1].hero);
  assert.equal(s.players[1].mana.jammedNextTurn??0,evade?0:1);
 }
 const s=game();const neji=put(s,1,'neji_hyuga');s.players[0].hero.attack=1;attack(s,s.players[0].hero,neji);assert.equal(s.players[0].mana.jammedNextTurn??0,0);
 const muted=game();const n=put(muted,0,'neji_hyuga');n.textLost=true;attack(muted,n,muted.players[1].hero);assert.equal(muted.players[1].mana.jammedNextTurn??0,0);
});
test('Gentle Fist Jams on its next successful direct Hero attack and expires at own turn end',()=>{
 const s=game();const rock=put(s,0,'rock_lee');play(s,'gentle_fist',rock);attack(s,rock,s.players[1].hero);assert.equal(s.players[1].mana.jammedNextTurn,1);assert.equal(rock.gentleFist,undefined);
 const s2=game();const r=put(s2,0,'rock_lee');play(s2,'gentle_fist',r);end(s2);assert.equal(r.gentleFist,undefined);
});
test('Jammed stacks, reduces next refill and borrowing, then fully releases next round',()=>{
 const s=game();s.players[1].mana={max:3,current:0,bonusNextTurn:0};jamMana(s,1,8);
 assert.equal(nextTurnMana(s,1),0);assert.equal(quickPlayBudget(s,1),0);end(s);
 assert.equal(s.players[1].mana.max,4);assert.equal(s.players[1].mana.current,0);assert.equal(s.players[1].mana.jammedThisTurn,4);assert.equal(s.players[1].mana.jammedNextTurn,0);
 end(s);end(s);assert.equal(s.players[1].mana.max,5);assert.equal(s.players[1].mana.current,5);assert.equal(s.players[1].mana.jammedThisTurn,0);
});
test('Shino drains only available next-turn crystals and gets temporary Mana for one turn',()=>{
 const s=game();const a=put(s,0,'shino_aburame');s.players[1].mana={max:3,current:3,bonusNextTurn:0};attack(s,a,s.players[1].hero);
 assert.equal(s.players[0].mana.bonusNextTurn,1);assert.equal(s.players[1].mana.jammedNextTurn,1);end(s);assert.equal(s.players[1].mana.current,3);end(s);
 assert.equal(s.players[0].mana.current,11);assert.equal(s.players[0].mana.max,10);assert.equal(s.players[0].mana.bonusNextTurn,0);end(s);end(s);assert.equal(s.players[0].mana.current,10);
 const s2=game();const b=put(s2,0,'shino_aburame');jamMana(s2,1,10);attack(s2,b,s2.players[1].hero);assert.equal(s2.players[0].mana.bonusNextTurn,0);
});
function rotation(s,inst){const a=getLegalActions(s).find(a=>a.type==='quickPlay'&&a.card===inst.uid);assert.ok(a,'Palm Rotation reaction offered');applyAction(s,a);}
test('Palm Rotation protects Hero and minion; Neji deals 3 to attacker, including lethal',()=>{
 for(const hero of [true,false])for(const neji of [true,false])for(const lethal of [true,false]){
  const s=game();const a=put(s,0,lethal?'rock_lee':'might_guy');const d=hero?s.players[1].hero:put(s,1,'sakura_haruno');if(neji)put(s,1,'neji_hyuga');
  const inst=addToHand(s,1,'eight_trigrams_palm_rotation');const hp=d.health;attack(s,a,d);rotation(s,inst);assert.equal(d.health,hp);
  if(neji)assert.equal(s.players[0].board.includes(a),!lethal&&hero);
  if(neji&&!lethal)assert.equal(a.health,hero?2:0); // Neji's 3 and normal defender retaliation
  assert.equal(s.pending,null);
 }
});
test('Palm Rotation protection expires after this attack; it cannot be cast proactively or on own turn',()=>{
 const s=game();const a=put(s,0,'might_guy'),b=put(s,0,'might_guy');const inst=addToHand(s,1,'eight_trigrams_palm_rotation');attack(s,a,s.players[1].hero);rotation(s,inst);attack(s,b,s.players[1].hero);assert.equal(s.players[1].hero.health,23);
 const s2=game();const i=addToHand(s2,0,'eight_trigrams_palm_rotation');assert.ok(!getLegalActions(s2).some(a=>a.card===i.uid));
});
test('Palm Rotation deflects targeted enemy spell damage, but not unrelated later damage',()=>{
 for(const hero of [true,false]){
  const s=game();const d=hero?s.players[1].hero:put(s,1,'choji_akimichi');const inst=addToHand(s,1,'eight_trigrams_palm_rotation');const hp=d.health;
  play(s,'chidori',d);rotation(s,inst);assert.equal(d.health,hp);hit(s,null,d,1);assert.equal(d.health,hp-1);
 }
});
test('Palm Rotation is in all three legal 30-card Naruto presets and has supplied artwork',()=>{
 for(const deck of Object.values(ANIME_PRESETS[LEAF])){assert.equal(deck.length,30);assert.ok(deck.includes('eight_trigrams_palm_rotation'));assert.equal(singleDeckProblem(LEAF,deck),null);}
 assert.ok(fs.existsSync(new URL('../'+getCard('eight_trigrams_palm_rotation').image,import.meta.url)));
});

test('tuned team pieces are playable at 3 Mana and keep their original stats and abilities',()=>{
 const expected={naruto_uzumaki:[3,3],sasuke_uchiha:[4,3],ino_yamanaka:[2,3],neji_hyuga:[4,4],shino_aburame:[3,5]};
 for(const [id,stats] of Object.entries(expected)){
  const s=game();s.players[0].mana.current=3;put(s,1,'shadow_clone');const inst=addToHand(s,0,id);
  const action=getLegalActions(s).find(a=>a.type==='play'&&a.card===inst.uid);assert.ok(action,`${id} is legal at 3 Mana`);applyAction(s,action);assert.equal(s.players[0].mana.current,0);
  const m=s.players[0].board.find(m=>m.cardId===id);assert.deepEqual([m.attack,m.maxHealth],stats);assert.ok(getCard(id).text.length>0);
 }
});
test('tuned Team 7 default and preset share a lineup with duplicate teammates and useful Jutsu',()=>{
 const team=ANIME_PRESETS[LEAF]['Team 7 Combo'];assert.deepEqual(base,team);
 for(const id of ['naruto_uzumaki','sasuke_uchiha','sakura_haruno','chidori','shadow_possession_jutsu','eight_trigrams_sixty_four_palms','eight_trigrams_palm_rotation'])assert.equal(team.filter(x=>x===id).length,2,id);
});
test('tuned control starter contains both full trios, their mentors and protection; all nine presets remain legal',()=>{
 const d=ANIME_PRESETS[LEAF]['Ino–Shika–Cho Control'];
 for(const id of ['shikamaru_nara','ino_yamanaka','choji_akimichi','neji_hyuga','rock_lee','tenten'])assert.equal(d.filter(x=>x===id).length,2,id);
 for(const id of ['asuma_sarutobi','might_guy'])assert.ok(d.includes(id));
 for(const [f,presets] of Object.entries(ANIME_PRESETS))for(const deck of Object.values(presets))assert.equal(singleDeckProblem(f,deck),null);
});
