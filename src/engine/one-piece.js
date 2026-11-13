// Straw Hat rules. Permanent Fruit powers live outside removable card text,
// and every timer, choice, and transformation is serializable for save/AI parity.
import { addToHand, allKeywords, applyBurn, dealDamage, drawCards, effectiveAttack, emit, findCharacter, hasKeyword, heal, log, removeKeyword } from './core.js';
import { addKeyword, applyBuff, EFFECT_OPS } from './effects.js';
import { getCard } from './registry.js';
import { pickRandom } from './rng.js';
const live=m=>m&&m.health>0&&!m.destroyed;
export const isLuffy=m=>!!m?.cardId&&!!getCard(m.cardId).luffy;
export const isFruitUser=m=>!!m&&(!!m.devilFruitUser||!!m.devilFruit||!!(m.cardId&&getCard(m.cardId).devilFruitUser));
const crew=m=>(m.tribes??[]).includes('Straw Hat');
const printedActive=m=>live(m)&&!m.textLost&&!hasKeyword(m,'Silenced');
const currentBoard=(s,p)=>s.players[p].board.filter(live);
function buff(s,m,a=0,h=0,mods={}){if(live(m))applyBuff(s,m,{attack:a,health:h,...mods});}
function hurt(s,source,m,n,opts={}){if(!live(m))return 0;return dealDamage(s,source?.uid??null,m.uid,n,{sourceController:source?.controller,...opts});}
function summon(s,p,id,count=1,mods={}){const ctx={controller:p};EFFECT_OPS.summon(s,{cardId:id,count,...mods},ctx);return findCharacter(s,ctx.summoned);}
function later(s,type,player,action,data={},next=true){(s.onePieceTimers??=[]).push({type,player,action,created:s.turn,next,...data});}
function freeze(s,m){if(live(m))addKeyword(m,'Frozen',false,s);}
function petrify(s,m){if(!live(m)||m.kind!=='minion')return;const tag=s.nextUid++;(m.petrified??=[]).push(tag);later(s,'endOfTurn',m.controller,'unPetrify',{uid:m.uid,tag});}
function adjacent(s,m){if(!m)return[];const b=s.players[m.controller].board,i=b.indexOf(m);return [b[i-1],b[i+1]].filter(live);}
export function initOnePieceMinion(s,m,card){m.enteredOnTurn=s.turn;if(card.devilFruitUser)m.devilFruitUser=true;}
export function fruitKeywords(m){return m?.devilFruit?.keywords??[];}
export function onePieceIncomingDamage(s,m,amount,opts){
 if(!live(m))return amount;
 if(m.devilFruit?.kind==='bara'&&opts.spell)amount+=2;
 if(opts.seaPrism&&isFruitUser(m))amount*=2;
 if(opts.buster&&m.controller===opts.sourceController&&crew(m))amount-=2;
 if(opts.combat&&m.devilFruit?.kind==='supa')amount-=1;
 const allies=currentBoard(s,m.controller);
 if((m.tribes??[]).includes('Fish-Man'))amount-=allies.filter(x=>x.cardId==='op_jinbe'&&printedActive(x)).length;
 amount-=adjacent(s,m).filter(x=>x.cardId==='op_bartolomeo'&&printedActive(x)).length;
 if(m.cardId==='op_bounceman'&&printedActive(m)&&m.firstBounceHit!==s.turn){m.firstBounceHit=s.turn;amount-=3;}
 return Math.max(0,amount);
}
export const onePieceHealBlocked=m=>m?.devilFruit?.kind==='supa';
export function silenceRemovable(s,m){
 if(!m||m.kind!=='minion')return;
 const card=getCard(m.cardId),missing=Math.max(0,m.maxHealth-m.health);
 m.attack=card.attack;m.maxHealth=card.health+(m.devilFruit?.health??0);m.health=m.maxHealth-missing;
 m.tempAttack=0;m.lingerAttack=[];m.tempHealth=0;m.lingerHealth=[];m.auraHealth=0;
 m.keywords=[];m.tempKeywords=[];m.lingerKeywords=[];m.grantedTriggers=[];m.textLost=true;
 delete m.armament;delete m.diableTurn;delete m.gentleFist;delete m.attackSet;
 log(s,`${card.name}'s removable abilities are Silenced. Permanent Devil Fruit powers remain.`);
}
const nextForms={op_luffy:['op_gear2',2],op_gear2:['op_gear3',3],op_gear3:[null,4],op_bounceman:['op_gear5',5],op_snakeman:['op_gear5',5]};
export function gearCost(m){return Math.max(0,(nextForms[m.cardId]?.[1]??0)-(m.gearDiscount??0));}
export function canGear(s,m,emergency=false){
 const p=m?.controller;
 return live(m)&&isLuffy(m)&&!!nextForms[m.cardId]&&!m.textLost&&!m.petrified?.length&&!m.animeBlocks?.length&&m.gearUsedTurn!==s.turn&&!(s.players[p].turnsTaken<=(m.gearBlockedThrough??-1))&&(emergency||s.turn>(m.enteredOnTurn??-1));
}
export function onePieceLegalActions(s,p){
 const out=[];
 for(const m of currentBoard(s,p)){
  if(canGear(s,m)&&gearCost(m)<=s.players[p].mana.current)out.push({type:'gearShift',player:p,minion:m.uid});
  if(m.cardId==='op_law'&&printedActive(m)&&!m.animeBlocks?.length&&!m.petrified?.length&&m.lawUsedTurn!==s.turn){
   for(const pl of s.players)for(let i=0;i<pl.board.length;i++)for(let j=i+1;j<pl.board.length;j++){
    const a=pl.board[i],b=pl.board[j];if(live(a)&&live(b))out.push({type:'lawSwap',player:p,minion:m.uid,target:a.uid,target2:b.uid});
   }
  }
 }
 return out;
}
export function shiftBody(s,m,into){
 const old=getCard(m.cardId),card=getCard(into);
 // Changing printed bases retains permanent buffs, damage, temporary buffs,
 // attack usage, identity, and status. No summon or Arrival occurs.
 m.attack+=card.attack-old.attack;m.maxHealth+=card.health-old.health;m.health+=card.health-old.health;
 const extras=m.keywords.filter(k=>!(old.keywords??[]).includes(k));
 m.cardId=into;m.keywords=[...new Set([...(card.keywords??[]),...extras])];m.tribes=[...card.tribes];m.devilFruitUser=true;
 if(into==='op_gear5')m.gear5Remaining=3;
 emit(s,{type:'gearShifted',source:m.uid,player:m.controller,from:old.id,cardId:into});
 log(s,`Luffy transforms into ${card.name}. Damage and attacks used carry over.`);
}
export function activateGear(s,m,emergency=false){
 if(!canGear(s,m,emergency))return;
 if(!emergency){s.players[m.controller].mana.current-=gearCost(m);m.gearDiscount=0;}
 m.gearUsedTurn=s.turn;
 const into=nextForms[m.cardId][0];
 if(into)shiftBody(s,m,into);
 else EFFECT_OPS.chooseOne(s,{prompt:'Gear 4: choose Luffy’s next form',options:[
  {label:'Bounceman · 8/9 · Taunt & damage reduction',effects:[{op:'onePiece',action:'gearBranch',into:'op_bounceman'}]},
  {label:'Snakeman · 6/7 · Evade, two attacks & ignores Taunt',effects:[{op:'onePiece',action:'gearBranch',into:'op_snakeman'}]},
 ]},{self:m.uid,controller:m.controller});
}
export function applyOnePieceAction(s,a){
 const m=findCharacter(s,a.minion);
 if(a.type==='gearShift')activateGear(s,m);
 else if(a.type==='lawSwap'){
  const x=findCharacter(s,a.target),y=findCharacter(s,a.target2),b=s.players[x.controller].board;
  const i=b.indexOf(x),j=b.indexOf(y);[b[i],b[j]]=[b[j],b[i]];m.lawUsedTurn=s.turn;log(s,'Law swaps two minions’ positions.');
 }
}
export function onePieceCanReact(s,card,p,event,window){
 if(card.id==='op_observation'){
  const m=findCharacter(s,event?.target);return window==='attackDeclared'&&event?.player!==p&&live(m)&&m.kind==='minion'&&m.controller===p;
 }
 if(card.id==='op_emergency'){
  const m=findCharacter(s,event?.target);
  return event?.player!==p&&(window==='attackDeclared'||window==='cardPlayed'&&event.cardType==='spell')&&m?.controller===p&&canGear(s,m,true);
 }
 return true;
}
const fruitStats={mera:[2,0],goro:[3,0],hie:[1,3],hana:[1,2],bara:[0,2],supa:[3,0],bomu:[2,0],tori:[2,3]};
function eatFruit(s,m,kind){
 if(!live(m)||isFruitUser(m))throw new Error('A minion may consume only one Devil Fruit.');
 const [attack,health]=fruitStats[kind];
 m.devilFruit={kind,attack,health,keywords:kind==='bara'?['Evade']:kind==='tori'?['Reborn','Lifesteal']:[]};m.devilFruitUser=true;m.maxHealth+=health;m.health+=health;
 log(s,`${getCard(m.cardId).name} gains permanent ${getCard('op_'+kind).name} powers and drawbacks.`);
}
const bodyKeys=['cardId','attack','health','maxHealth','tempAttack','lingerAttack','tempHealth','lingerHealth','auraHealth','keywords','tempKeywords','lingerKeywords','statics','tribes','faction','textLost','grantedTriggers','armament'];
function rubberToy(s,m){
 if(!live(m))return;
 const snapshot=m.toyOriginal??Object.fromEntries(bodyKeys.map(k=>[k,JSON.parse(JSON.stringify(m[k]??null))]));
 const fruit=m.devilFruit;const tag=s.nextUid++;
 m.toyOriginal=snapshot;m.toyTag=tag;m.toyFruitHealth=fruit?.health??0;
 Object.assign(m,{cardId:'op_rubber_toy',attack:1,maxHealth:1+(fruit?.health??0),health:1+(fruit?.health??0),tempAttack:0,lingerAttack:[],tempHealth:0,lingerHealth:[],auraHealth:0,keywords:[],tempKeywords:[],lingerKeywords:[],statics:[],tribes:[],textLost:false,grantedTriggers:[]});delete m.armament;
 later(s,'endOfTurn',m.owner,'restoreToy',{uid:m.uid,tag});
 log(s,'Sun God Nika turns an enemy into a Rubber Toy!');
}
function timers(s,event){
 const due=(s.onePieceTimers??[]).filter(t=>t.type===event.type&&t.player===event.player&&(!t.next||s.turn>t.created));
 s.onePieceTimers=(s.onePieceTimers??[]).filter(t=>!due.includes(t));
 for(const t of due){const m=findCharacter(s,t.uid);if(!m)continue;
  if(t.action==='unPetrify')m.petrified=(m.petrified??[]).filter(x=>x!==t.tag);
  if(t.action==='removeObservation'&&m.observationEvadeTag===t.tag){if(!t.hadEvade)removeKeyword(m,'Evade');delete m.observationEvadeTag;}
  if(t.action==='restoreToy'&&m.toyTag===t.tag){
   const fruitHealthChange=(m.devilFruit?.health??0)-(m.toyFruitHealth??0);
   const original=m.toyOriginal;for(const key of bodyKeys){if(original[key]===null)delete m[key];else m[key]=original[key];}m.maxHealth+=fruitHealthChange;m.health+=fruitHealthChange;delete m.toyOriginal;delete m.toyTag;delete m.toyFruitHealth;
  }
 }
}
export function onePieceEvents(s,event){
 const deadBefore=new Set(s.players.flatMap(p=>p.board).filter(m=>!live(m)).map(m=>m.uid));
 const type=event.type;
 if(type==='startOfTurn'||type==='endOfTurn')timers(s,event);
 const source=findCharacter(s,event.source),target=findCharacter(s,event.target);
 if(type==='afterAttack'){
  const record=s.onePieceCombat?.[event.source];
  if(record?.hancock&&live(source))petrify(s,source);
  if(record?.gear2&&live(source))hurt(s,source,source,1);
  if(record?.observation){const m=findCharacter(s,record.observation.uid);if(m&&m.observationEvadeTag===record.observation.tag){if(!record.observation.hadEvade)removeKeyword(m,'Evade');delete m.observationEvadeTag;}}
  if(s.onePieceCombat)delete s.onePieceCombat[event.source];
 }
 if(type==='attackDeclared'){
  (s.onePieceCombat??={})[event.source]={gear2:source?.cardId==='op_gear2'&&printedActive(source),hancock:target?.cardId==='op_hancock'&&printedActive(target)};
  if(live(source)){
   if(source.devilFruit?.kind==='hie')source.fruitLastAttackOwnTurn=s.players[source.controller].turnsTaken;
   if(source.devilFruit?.kind==='mera')if(live(target))applyBurn(s,target,1);
   if(source.devilFruit?.kind==='hie')freeze(s,target);
   if(source.devilFruit?.kind==='goro')hurt(s,source,pickRandom(s,currentBoard(s,1-source.controller)),2);
   if(source.devilFruit?.kind==='bomu')for(const m of adjacent(s,source))hurt(s,source,m,1);
   if(printedActive(source)){
    if(source.cardId==='op_gear3')for(const m of adjacent(s,target))hurt(s,source,m,2);
    if(source.cardId==='op_gear5')rubberToy(s,pickRandom(s,currentBoard(s,1-source.controller)));
    if(source.cardId==='op_sanji'){heal(s,s.players[source.controller].hero.uid,2,{source:source.uid});if(currentBoard(s,source.controller).some(m=>['op_nami','op_robin'].includes(m.cardId)))buff(s,source,2,0,{temporary:true});}
    if(source.cardId==='op_sabo'){if(live(target))applyBurn(s,target,1);for(const m of currentBoard(s,source.controller).filter(isLuffy))buff(s,m,2,0,{temporary:true});}
    if(source.cardId==='op_yamato')freeze(s,target);
    if(source.cardId==='op_kinemon')for(const m of [s.players[source.controller].hero,...currentBoard(s,source.controller)]){delete m.burn;delete m.burnLeft;removeKeyword(m,'Burned');}
   }
  }
 }
 if(type==='damageDealt'&&event.amount>0){
  if(target?.devilFruit?.kind==='goro')hurt(s,target,s.players[target.controller].hero,1);
  if(source&&source.diableTurn===s.turn&&live(target)&&source.controller!==target.controller)applyBurn(s,target,1);
 }
 if(type==='minionDied'&&event.dead?.devilFruit?.kind==='bomu')for(const m of currentBoard(s,1-event.player))dealDamage(s,event.source,m.uid,3,{sourceController:event.player});
 for(const p of [s.activePlayer,1-s.activePlayer])for(const m of [...currentBoard(s,p)]){
  if(!live(m))continue;const own=type==='endOfTurn'&&event.player===p;
  // Protected Fruit drawbacks and powers run even when the card's text is lost.
  if(own&&m.devilFruit?.kind==='mera')hurt(s,m,m,1);
  if(own&&live(m)&&m.devilFruit?.kind==='hana')summon(s,p,'op_flower_hand');
  if(type==='startOfTurn'&&event.player===p&&m.devilFruit?.kind==='tori')s.players[p].mana.current=Math.max(0,s.players[p].mana.current-2);
  if(type==='minionDied'&&event.player===p&&getCard(event.cardId).flowerHand&&m.devilFruit?.kind==='hana')hurt(s,m,m,1);
  if(own&&m.gear5Remaining){
   m.gear5Remaining--;if(m.gear5Remaining===0){delete m.toyOriginal;delete m.toyTag;shiftBody(s,m,'op_luffy');m.health=1;m.gearBlockedThrough=s.players[p].turnsTaken+1;log(s,'Gear 5 expires. Luffy reverts at 1 Health and must recover for one turn.');}
  }
  if(type==='startOfTurn'&&m.attackSet?.until===event.player)delete m.attackSet;
  if(type==='endOfTurn'&&m.diableTurn===s.turn)delete m.diableTurn;
  if(!printedActive(m))continue;
  if(type==='attackDeclared'&&source?.kind==='minion'&&event.player!==p){
   if(m.cardId==='op_usopp'&&m.usoppTurn!==s.turn){m.usoppTurn=s.turn;hurt(s,m,source,1);}
   if(m.cardId==='op_robin'&&m.robinTurn!==s.turn){m.robinTurn=s.turn;summon(s,p,'op_flower_guard');}
  }
  if(type==='damageDealt'&&event.target===m.uid&&m.cardId==='op_franky')buff(s,m,1);
  if(type==='characterHealed'&&event.amount>0&&target?.kind==='minion'&&target.controller===p&&m.cardId==='op_chopper')buff(s,target,0,1);
  if(type==='minionReborn'&&event.source===m.uid&&m.cardId==='op_brook')freeze(s,pickRandom(s,currentBoard(s,1-p)));
  if(type==='minionDied'&&event.killer===m.uid&&m.cardId==='op_zoro')buff(s,m,1);
  if(type==='cardPlayed'&&event.player===p){
   if(event.cardType==='spell'){
    const card=getCard(event.cardId);
    if(m.cardId==='op_nami'&&card.weather&&m.weatherTurn!==s.turn){m.weatherTurn=s.turn;drawCards(s,p,1);}
    if(m.cardId==='op_ace'&&card.fire)hurt(s,m,pickRandom(s,[s.players[1-p].hero,...currentBoard(s,1-p)]),2);
   }
   if(m.cardId==='op_thousand_sunny'&&event.cardType==='minion'&&live(source)&&source.uid!==m.uid&&crew(source))buff(s,source,1,1);
  }
  if(own){
   if(m.cardId==='op_going_merry')for(const ally of currentBoard(s,p).filter(crew))heal(s,ally.uid,1,{source:m.uid});
   if(m.cardId==='op_thousand_sunny')summon(s,p,'op_crewman');
  }
 }
 if(s.players.some(p=>p.board.some(m=>!live(m)&&!deadBefore.has(m.uid))))s.buffer.push({kind:'deaths'});
}
export function resolveOnePiece(s,e,ctx){
 const p=ctx.controller,pl=s.players[p],enemy=s.players[1-p];const self=findCharacter(s,ctx.self),t=findCharacter(s,ctx.chosen),ev=ctx.event??{};
 const friends=()=>currentBoard(s,p),foes=()=>currentBoard(s,1-p),controls=id=>friends().some(m=>m.cardId==='op_'+id),luffy=()=>friends().some(isLuffy);
 const damage=(m,n,extra={})=>hurt(s,{uid:ctx.self,controller:p},m,n,{spell:!!ctx.cardId&&getCard(ctx.cardId).type==='spell',...extra});
 const draw=()=>drawCards(s,p,1);
 if(fruitStats[e.action]){eatFruit(s,t,e.action);return;}
 switch(e.action){
 case 'gearBranch':if(live(self)&&self.cardId==='op_gear3')shiftBody(s,self,e.into);break;
 case 'zoro':if(luffy())addKeyword(self,'Evade',false,s);break;
 case 'nami':addToHand(s,p,pickRandom(s,['op_thunderbolt']));break;
 case 'chopper':if(t)heal(s,t.uid,3,{source:ctx.self});break;
 case 'franky':damage(pickRandom(s,foes()),2);break;
 case 'jinbe':case 'ace':for(const m of foes())damage(m,e.action==='ace'?3:2);break;
 case 'law':if(live(t)){const a=effectiveAttack(t),h=t.health;t.attack=h;t.maxHealth=a+(t.devilFruit?.health??0);t.health=t.maxHealth;t.tempAttack=0;t.lingerAttack=[];}break;
 case 'bepo':if(controls('law'))buff(s,self,2,2);break;
 case 'hancock':petrify(s,t);break;
 case 'yamato':if(luffy())buff(s,self,1,1);break;
 case 'carrot':if(pl.mana.max>=5)buff(s,self,2,0,{temporary:true,temporaryKeywords:['Evade']});break;
 case 'kinemon':buff(s,t,2,0,{temporary:true});break;
 case 'fleet_captain':buff(s,t,1,1);if(friends().filter(crew).length>=3)draw();break;
 case 'pistol':damage(t,luffy()?5:3);break;
 case 'gatling':{
  const n=friends().some(m=>isLuffy(m)&&m.cardId!=='op_luffy')?8:6;
  s.queue.unshift(...Array.from({length:n},()=>({kind:'effect',effect:{op:'onePiece',action:'gatlingHit'},ctx:{...ctx}})));break;
 }
 case 'gatlingHit':damage(pickRandom(s,foes()),1);s.queue.unshift({kind:'deaths'});break;
 case 'red_hawk':{const next=adjacent(s,t);damage(t,5);if(live(t))applyBurn(s,t,1);if(luffy())for(const m of next)damage(m,2);break;}
 case 'oni_giri':buff(s,t,3,0,{temporary:true});if(t?.cardId==='op_zoro')t.bonusAttacks=(t.bonusAttacks??0)+1;break;
 case 'diable':buff(s,t,2,0,{temporary:true,temporaryKeywords:['Rush']});if(t?.cardId==='op_sanji')t.diableTurn=s.turn;break;
 case 'thunderbolt':{
  const pool=foes();for(let i=0;i<3&&pool.length;i++){const m=pickRandom(s,pool);pool.splice(pool.indexOf(m),1);if(damage(m,2)>0&&controls('nami'))freeze(s,m);}break;
 }
 case 'armament':buff(s,t,2,2);if(t)t.armament=true;break;
 case 'observation':{
  const m=findCharacter(s,ev.target);if(!live(m)||m.controller!==p)break;
  const hadEvade=hasKeyword(m,'Evade'),tag=s.nextUid++;addKeyword(m,'Evade',false,s);m.observationEvadeTag=tag;
  const record=(s.onePieceCombat??={})[ev.source]??={};record.observation={uid:m.uid,tag,hadEvade};s.onePieceCombat[ev.source]=record;
  // If the attack fizzles or is redirected the guard still expires this turn.
  later(s,'endOfTurn',s.activePlayer,'removeObservation',{uid:m.uid,tag,hadEvade},false);draw();break;
 }
 case 'emergency':activateGear(s,findCharacter(s,ev.target),true);break;
 case 'conqueror':for(const m of foes()){if(effectiveAttack(m)<=2)m.destroyed=true;else buff(s,m,-2,0,{lingerUntil:p,byController:p});}break;
 case 'grand_fleet':summon(s,p,'op_fleet_pirate',4,luffy()?{attack:4,health:4}:{});break;
 case 'meat':if(t){heal(s,t.uid,4,{source:ctx.self});if(isLuffy(t))buff(s,t,1);}break;
 case 'shackles':if(t){addKeyword(t,'Silenced',false,s);t.attackSet={value:1,until:p};damage(t,3,{seaPrism:true});}break;
 case 'buster':for(const m of [...friends(),...foes()])damage(m,5,{buster:true});break;
 case 'will':if(t){buff(s,t,3,3,{keywords:['Reborn']});if(isLuffy(t)){delete t.gearUsedTurn;t.gearDiscount=(t.gearDiscount??0)+2;}}break;
 case 'nakama':buff(s,t,1,0,{temporary:true});if(friends().filter(crew).length>=2)heal(s,pl.hero.uid,2,{source:ctx.self});break;
 }
}
