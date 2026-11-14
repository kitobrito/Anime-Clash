// Serializable Naruto abilities and delayed effects. Uses the inherited queue,
// combat, healing, summon, and control systems so AI and replay obey identical rules.
import { allKeywords, dealDamage, drawCards, effectiveAttack, findCharacter, hasKeyword, heal, log, removeKeyword } from './core.js';
import { addKeyword, applyBuff, EFFECT_OPS } from './effects.js';
import { getCard } from './registry.js';
import { pickRandom } from './rng.js';
import { NARUTO_TEAMS } from '../cards/naruto-teams.js';
import { nextTurnMana } from './core.js';

// Crystals remain owned by their player; disruption only affects the next refill.
export function jamMana(state,p,amount=1) {
 const mana=state.players[p].mana;
 const added=Math.max(0,Math.min(amount,state.rules.maxMana-(mana.jammedNextTurn??0)));
 mana.jammedNextTurn=(mana.jammedNextTurn??0)+added;
 if(added)log(state,`${state.players[p].name}: ${added} Mana crystal${added===1?'':'s'} Jammed for next turn.`);
 return added;
}
export function resolveJammedMana(state,pl) {
 const m=pl.mana;
 m.jammedThisTurn=Math.min(m.jammedNextTurn??0,m.current);
 m.current-=m.jammedThisTurn;
 m.temp=Math.min(m.temp??0,m.current);
 m.primal=Math.min(m.primal??0,m.current);
 m.jammedNextTurn=0;
 if(m.jammedThisTurn)log(state,`${pl.name} has ${m.jammedThisTurn} Jammed Mana crystals this turn.`);
}
export function checkNarutoTeams(state) {
 for(const pl of state.players) {
  if(pl.board.length<3)continue;
  const board=pl.board.filter(alive);
  for(const team of NARUTO_TEAMS) {
   if(pl.narutoTeamsCompleted?.includes(team.id)||!team.members.every(id=>board.some(m=>m.cardId===id)))continue;
   (pl.narutoTeamsCompleted??=[]).push(team.id); // record before any summon can reenter
   for(const m of board)if(team.members.includes(m.cardId))applyBuff(state,m,{attack:3,health:3,byController:pl.index});
   log(state,`${team.name} complete! Teammates gain +3/+3 (once per game).`);
   if(pl.board.length>=state.rules.maxBoardSize)continue;
   const zone=[pl.hand,pl.deck].find(cards=>cards.some(c=>c.cardId===team.mentor));
   if(!zone)continue;
   const ctx={controller:pl.index};
   EFFECT_OPS.summon(state,{cardId:team.mentor},ctx);
   if(ctx.summoned!=null)zone.splice(zone.findIndex(c=>c.cardId===team.mentor),1);
  }
 }
}
export function narutoCanReact(state,card,p,event,window) {
 if(card.id!=='eight_trigrams_palm_rotation')return true;
 if(state.activePlayer===p||!event)return false;
 if(window==='cardPlayed'&&event.cardType!=='spell')return false;
 return [event.target,event.target2].some(uid=>{const m=findCharacter(state,uid);return alive(m)&&m.controller===p;});
}

const alive = m => m && m.health > 0 && !m.destroyed;
const team7 = ['naruto_uzumaki','sasuke_uchiha','sakura_haruno'];
const trio = ['shikamaru_nara','ino_yamanaka','choji_akimichi'];
function schedule(state, when, player, action, data = {}, next = true) {
 (state.narutoTimers ??= []).push({when, player, created:state.turn, next, action, ...data});
}
function strip(state, m, player, temporary = false) {
 if (!alive(m) || m.kind !== 'minion') return;
 const keywords = [...m.keywords];
 const linger = [...(m.lingerKeywords ?? [])];
 for (const k of allKeywords(m)) removeKeyword(m,k);
 if (temporary) schedule(state,'startOfTurn',player,'restoreKeywords',{uid:m.uid,keywords,linger});
}
function block(state,m,controller) {
 if (!alive(m)) return;
 const tag = state.nextUid++;
 (m.animeBlocks ??= []).push(tag);
 schedule(state,'endOfTurn',m.controller,'unblock',{uid:m.uid,tag});
 log(state,`${getCard(m.cardId).name} cannot attack during its controller's next turn.`);
}
export function narutoTick(state,event) {
 if (!['startOfTurn','endOfTurn'].includes(event.type)) return;
 if(event.type==='endOfTurn') {
  for(const m of state.players.flatMap(pl=>pl.board))if(m.gentleFist?.by===event.player)delete m.gentleFist;
  state.rotationShields=[];
 }
 const due = (state.narutoTimers ?? []).filter(t => t.when === event.type && t.player === event.player && (!t.next || state.turn > t.created));
 state.narutoTimers = (state.narutoTimers ?? []).filter(t => !due.includes(t));
 for (const t of due) {
  const m = findCharacter(state,t.uid);
  if (t.action === 'clone') {
   const original = alive(m) ? m : t.snapshot;
   EFFECT_OPS.summon(state,{cardId:'naruto_uzumaki',attack:original.attack,health:original.health,keywords:[...(original.keywords ?? [])]}, {controller:t.player});
  } else if (t.action === 'damage') {
   if (alive(m)) dealDamage(state,t.source ?? null,m.uid,t.amount,{sourceController:t.by});
  } else if (t.action === 'unblock' && m) m.animeBlocks = (m.animeBlocks ?? []).filter(x => x !== t.tag);
  else if (t.action === 'removePoison' && m && !t.hadPoison) removeKeyword(m,'Poisonous');
  else if (t.action === 'restoreKeywords' && m) {
   for (const k of t.keywords) if (!m.keywords.includes(k)) m.keywords.push(k);
   // This-turn keywords have expired by the caster's next turn; lingering ones
   // owned by a different player still retain their original expiration.
   for (const k of t.linger.filter(k => k.until !== event.player)) (m.lingerKeywords ??= []).push(k);
  }
 }
}

export function resolveNaruto(state,e,ctx) {
 const p=ctx.controller, pl=state.players[p], enemy=state.players[1-p];
 const self=findCharacter(state,ctx.self), target=findCharacter(state,ctx.chosen), ev=ctx.event ?? {};
 const friends=() => pl.board.filter(alive), foes=() => enemy.board.filter(alive);
 const controls=id => friends().some(m=>m.cardId===id);
 const named=ids=>friends().filter(m=>ids.includes(m.cardId));
 const buff=(m,attack=0,health=0,other={})=>{if(alive(m))applyBuff(state,m,{attack,health,byController:p,...other});};
 const damage=(m,n)=>{if(alive(m))return dealDamage(state,ctx.self,m.uid,n,{sourceController:p, spell:!!ctx.cardId && getCard(ctx.cardId).type==='spell'});return 0;};
 const summon=(id,count=1,other={})=>EFFECT_OPS.summon(state,{cardId:id,count,...other},ctx);
 const bounce=m=>{if(alive(m))EFFECT_OPS.returnToHand(state,{target:{uid:m.uid}},ctx);};
 const disable=m=>block(state,m,p);
 if(e.action==='event') {
  if(!alive(self)||self.textLost) return;
  const source=findCharacter(state,ev.source), hit=findCharacter(state,ev.target);
  const friendlyJutsu=ev.type==='cardPlayed'&&ev.player===p&&ev.cardId&&getCard(ev.cardId).jutsu;
  switch(e.ability) {
   case 'kakashi_hatake': if(friendlyJutsu)damage(pickRandom(state,[enemy.hero,...foes()]),1);break;
   case 'tenten': if(friendlyJutsu)damage(pickRandom(state,foes()),1);break;
   case 'jiraiya': if(friendlyJutsu)heal(state,pl.hero.uid,2,{source:self.uid});break;
   case 'sai': if(friendlyJutsu)for(const m of named(['ink_beast']))buff(m,1,0,{temporary:true});break;
   case 'rock_lee': if(ev.source===self.uid)buff(self,1);break;
   case 'might_guy': if(alive(source)&&source.controller===p&&source.kind==='minion')buff(source,1,0,{temporary:true});break;
   case 'hinata_hyuga': if(alive(hit)&&hit.controller===p&&hit.cardId==='naruto_uzumaki')heal(state,hit.uid,2,{source:self.uid});break;
   case 'neji_hyuga': break; // direct Hero damage is handled by narutoDamageEvent
   case 'choji_akimichi': if(ev.target===self.uid&&ev.amount>0)buff(self,1);break;
   case 'shino_aburame': if(ev.source===self.uid&&hit&&hit.controller!==p&&ev.amount>0&&nextTurnMana(state,1-p)>0) {
    const stolen=jamMana(state,1-p,1);pl.mana.bonusNextTurn=(pl.mana.bonusNextTurn??0)+stolen;
   }break;
   case 'tsunade': if(ev.amount>0&&hit?.kind==='minion'&&hit.controller===p)buff(hit,1);break;
   case 'asuma_sarutobi': if(alive(source)&&source.controller===p&&trio.includes(source.cardId))damage(hit,1);break;
   case 'hashirama_senju': if(ev.player===p)for(const m of friends())heal(state,m.uid,2,{source:self.uid});break;
   case 'tobirama_senju': if(ev.player!==p&&state.activePlayer===p)summon('water_clone');break;
   case 'minato_namikaze':
    if(ev.player!==p&&alive(hit)&&hit.controller===p&&hit.kind==='minion'&&hit.uid!==self.uid&&!ev.minatoOffered) {
     ev.minatoOffered=true;
     EFFECT_OPS.chooseOne(state,{prompt:'Flying Thunder God: protect this ally with Minato?',options:[
      {label:'Swap with Minato',effects:[{op:'naruto',action:'minato_swap',uid:self.uid}]},
      {label:'Keep the current target',effects:[{op:'naruto',action:'noop'}]},
     ]},ctx);
    }break;
  }
  return;
 }
 switch(e.action) {
 case 'noop': break;
 case 'minato_swap': {
  const m=findCharacter(state,e.uid), hit=findCharacter(state,ev.target);
  if(!alive(m)||!alive(hit)||m.controller!==hit.controller)break;
  const board=state.players[m.controller].board, a=board.indexOf(m), b=board.indexOf(hit);
  [board[a],board[b]]=[board[b],board[a]];
  for(const step of state.queue) {
   if(step.kind==='combat'&&step.attacker===ev.source&&step.defender===hit.uid)step.defender=m.uid;
   if(step.event?.type==='afterAttack'&&step.event.source===ev.source)step.event.target=m.uid;
  }
  ev.target=m.uid;log(state,'Minato intercepts the attack!');break;
 }
 case 'konohamaru':if(controls('naruto_uzumaki'))buff(self,1,1);break;
 case 'naruto_uzumaki':
  if(self)schedule(state,'endOfTurn',p,'clone',{uid:self.uid,snapshot:{attack:self.attack,health:self.health,keywords:[...self.keywords]}},false);break;
 case 'sakura_haruno':if(target)heal(state,target.uid,3,{source:ctx.self});break;
 case 'sasuke_uchiha':break;
 case 'kakashi_hatake':for(const m of named(team7))buff(m,1,1);break;
 case 'might_guy':for(const m of named(['rock_lee']))buff(m,2,2);break;
 case 'hinata_hyuga':buff(target,-1,0,{lingerUntil:p});break;
 case 'shikamaru_nara':case 'kurenai_yuhi':case 'shadow_possession_jutsu':case 'shadow_strangle_jutsu':
  disable(target);
  if(e.action==='kurenai_yuhi'&&['hinata_hyuga','kiba_inuzuka','shino_aburame'].some(controls))drawCards(state,p,1);
  if(e.action==='shadow_possession_jutsu')drawCards(state,p,1);
  if(e.action==='shadow_strangle_jutsu'&&target)schedule(state,'startOfTurn',p,'damage',{uid:target.uid,amount:3,by:p});break;
 case 'ino_yamanaka':if(target)EFFECT_OPS.takeControlTemporarily(state,{target:'chosen',until:'endOfTurn'},ctx);break;
 case 'kiba_inuzuka':summon('akamaru');break;
 case 'jiraiya':summon('summoned_toad',2);break;
 case 'tsunade':for(const m of [pl.hero,...friends()])heal(state,m.uid,5,{source:ctx.self});break;
 case 'hiruzen_sarutobi':for(const m of foes())damage(m,2);break;
 case 'rasengan':
  damage(target,1);if(alive(target)){addKeyword(target,'Frozen',false,state);(target.rasenganMarks ??= []).push({by:p});}break;
 case 'sexy_jutsu':case 'harem_jutsu': {
  for(const m of e.action==='harem_jutsu'?foes():[target])buff(m,e.action==='harem_jutsu'?-3:-2,0,{lingerUntil:p});
  const narutos=named(['naruto_uzumaki']);for(const m of e.action==='harem_jutsu'?narutos:narutos.slice(0,1))buff(m,0,e.action==='harem_jutsu'?2:1,{keywords:['Taunt']});break;
 }
 case 'chidori':damage(target,controls('sasuke_uchiha')?6:4);break;
 case 'shadow_clone_jutsu':summon('shadow_clone',controls('naruto_uzumaki')?4:2);break;
 case 'shadow_clone_technique':summon('shadow_clone');break;
 case 'fire_style_fireball_jutsu': {
  if(!target)break;const board=enemy.board, idx=board.indexOf(target), adjacent=[board[idx-1],board[idx+1]].filter(Boolean);
  damage(target,3);for(const m of adjacent)damage(m,controls('sasuke_uchiha')?2:1);break;
 }
 case 'substitution_jutsu':case 'flying_thunder_god_technique': {
  const victim=findCharacter(state,ev.target), attacker=findCharacter(state,ev.source);
  if(!alive(victim)||victim.kind!=='minion'||victim.controller!==p)break;
  const index=pl.board.indexOf(victim);bounce(victim);
  if(e.action==='substitution_jutsu'){
   summon('wooden_log');const m=findCharacter(state,ctx.summoned);
   if(m){pl.board.splice(pl.board.indexOf(m),1);pl.board.splice(index,0,m);for(const step of state.queue)if(step.kind==='combat'&&step.attacker===ev.source)step.defender=m.uid;ev.target=m.uid;}
  } else if(controls('minato_namikaze'))bounce(attacker);else damage(attacker,3);
  break;
 }
 case 'gentle_fist':buff(target,2,0,{temporary:true});if(target)target.gentleFist={by:p};break;
 case 'eight_trigrams_palm_rotation': {
  if(!narutoCanReact(state,getCard('eight_trigrams_palm_rotation'),p,ev,ev.type))break;
  if(ev.type==='attackDeclared') {
   const combat=state.queue.find(s=>s.kind==='combat'&&s.attacker===ev.source);
   if(combat)combat.preventDefenderDamage=true;
   if(controls('neji_hyuga'))damage(findCharacter(state,ev.source),3);
  } else for(const uid of [ev.target,ev.target2]) {
   const m=findCharacter(state,uid);
   if(alive(m)&&m.controller===p)(state.rotationShields??=[]).push({source:ev.source,target:uid,turn:state.turn});
  }
  log(state,'Eight Trigrams Palm Rotation deflects incoming damage.');break;
 }
 case 'eight_gates_gate_of_opening':buff(target,4,0,{temporary:true,temporaryKeywords:['Rush']});if(target)schedule(state,'endOfTurn',p,'damage',{uid:target.uid,amount:3,by:p},false);break;
 case 'summoning_jutsu_gamabunta':summon('gamabunta',1,{keywords:['Taunt',...(['naruto_uzumaki','jiraiya'].some(controls)?['Rush']:[])]});break;
 case 'thousand_years_of_death':damage(target,2);bounce(target);if(controls('kakashi_hatake'))drawCards(state,p,1);break;
 case 'iruka_umino':buff(target,1,1);break;
 case 'anko_mitarashi':damage(target,1);if(alive(target)){const hadPoison=hasKeyword(target,'Poisonous');addKeyword(target,'Poisonous',false,state);schedule(state,'endOfTurn',target.controller,'removePoison',{uid:target.uid,hadPoison});}break;
 case 'asuma_sarutobi':for(const m of named(trio))buff(m,1,1);break;
 case 'yamato':summon('wooden_barrier',2);break;
 case 'sai':summon('ink_beast');break;
 case 'minato_namikaze':bounce(target);break;
 case 'hashirama_senju':summon('wood_golem',2);break;
 case 'tobirama_senju':for(const m of foes())damage(m,3);break;
 case 'byakugan':for(const m of foes())removeKeyword(m,'Stealth');buff(target,1,0,{temporary:true});if(target)target.ignoreTauntTurn=state.turn;break;
 case 'eight_trigrams_sixty_four_palms': {
  // Each hit is its own queue step: damage triggers (including Hinata) resolve
  // between hits, and dead targets cannot take later hits.
  const steps=Array.from({length:8},()=>({kind:'effect',effect:{op:'naruto',action:'palms_hit'},ctx:{...ctx}}));
  state.queue.unshift(...steps);break;
 }
 case 'palms_hit': {
  const victim=pickRandom(state,foes())??enemy.hero;
  if(damage(victim,1)>0&&victim.kind==='hero')jamMana(state,1-p,1);
  state.queue.unshift({kind:'deaths'});break;
 }
 case 'expansion_jutsu':if(target)buff(target,2,4,target.cardId==='choji_akimichi'?{keywords:['Taunt']}:{lingerUntil:p,temporaryHealth:true,lingerKeywords:['Taunt']});break;
 case 'wood_style_deep_forest_emergence':{const bonus=controls('hashirama_senju')?2:0;summon('wood_golem',3,{attack:2+bonus,health:4+bonus});break;}
 }
}

// Gentle Fist is attached to the attacker, so its next successful hit works even
// if the caster has left the battlefield. Expiration follows the caster's turn.
export function narutoDamageEvent(state,event) {
 if(event.type!=='damageDealt'||event.amount<=0)return;
 const source=findCharacter(state,event.source), target=findCharacter(state,event.target);
 if(!source||target?.kind!=='hero'||source.controller===target.controller||!event.combat||event.attacker!==source.uid)return;
 if(['neji_hyuga','hinata_hyuga'].includes(source.cardId)&&!source.textLost&&!hasKeyword(source,'Silenced'))jamMana(state,target.controller,1);
 if(source.gentleFist){jamMana(state,target.controller,1);delete source.gentleFist;}
}

// Check after each atomic step, so breaking or expiring Freeze releases Rasengan.
export function checkRasengan(state) {
 for (const m of state.players.flatMap(p=>p.board)) {
  if (!alive(m) || !m.rasenganMarks?.length || hasKeyword(m,'Frozen')) continue;
  const marks=m.rasenganMarks; delete m.rasenganMarks;
  for (const mark of marks) if(alive(m)) dealDamage(state,null,m.uid,3,{sourceController:mark.by});
  state.buffer.push({kind:'deaths'});
 }
}
