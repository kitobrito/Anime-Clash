// Anime host for Shattered Realms' actual board, hand, pointer and FX modules.
import {boardHTML,layoutHands,layoutPortraitBoard,setHandDocks,setHandOpen} from './board.js';
import * as drag from './drag.js';
import * as fx from './fx.js';
import * as sound from './sound.js';
import {bigCardHTML,fitAllText,esc} from './shared.js';
import {configureBoard} from './anime-data.js';
import {actingPlayer} from '../engine/engine.js';
import {findCharacter,allKeywords,effectiveAttack} from '../engine/core.js';
import {getCard} from '../engine/registry.js';
import {cardKeywords} from '../anime/card-glossary.js';
import {TG_HEROES} from '../cards/tokyo-ghoul.js';
let api=null,initialized=false,busy=false,logOpen=false,concedeAsk=false,abilitiesOpen=false,undo=[];
let previewTimer=null,arenaObserver=null,resizeTimer=null,measureFrame=null;
// WebKit can crash when a hovered card changes position as its dock opens.
// Realms already has touch-safe visuals: use those while keeping its input and fan layout.
const webkitHoverSafe=/AppleWebKit/i.test(navigator.userAgent)&&!/(Chrome|Chromium|CriOS|Edg|OPR|Android)/i.test(navigator.userAgent);
export const battleBusy=()=>busy;
const root=()=>document.getElementById('app');
const legal=()=>api?.legal()??[];
const canAct=()=>!!api?.active()&&!busy&&!api.state().pending&&!api.state().gameOver&&actingPlayer(api.state())===0;
export function closeBattlePreview(){clearTimeout(previewTimer);document.getElementById('preview')?.remove();}
function preview(target){
 if(!target){closeBattlePreview();return;}const card=getCard(target.dataset.preview),unit=target.dataset.char?findCharacter(api.state(),Number(target.dataset.char)):null,terms=cardKeywords(card,unit?allKeywords(unit):[]),el=document.getElementById('preview')??Object.assign(document.createElement('div'),{id:'preview'});if(!el.isConnected)document.body.append(el);
 el.innerHTML=`<div class="preview-row">${bigCardHTML(card)}<aside class="preview-terms">${terms.map(({term,text})=>`<div class="preview-term"><b>${esc(term)}</b><span>${esc(text)}</span></div>`).join('')}</aside></div><button class="realms-card-details">Full card & keyword details</button>`;el.querySelector('.realms-card-details').onclick=()=>{closeBattlePreview();api.inspect(card.id,unit?.uid);};el.className='show'+(target.closest('.my-hand')?' hand-read':' centered');el.style.left=Math.max(8,(innerWidth-Math.min(650,innerWidth-16))/2)+'px';el.style.right='';api.fit(el);fitAllText(el);
}
function abilities(){
 const s=api.state(),pl=s.players[0],actions=legal(),groups=new Map();
 for(const a of actions.filter(a=>['feed','kakuja','gearShift','lawSwap'].includes(a.type))){const key=a.type+':'+(a.minion??'');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(a);}
 const buttons=[...groups.values()].map((actions,i)=>{const a=actions[0],m=a.minion?findCharacter(s,a.minion):null;return `<button data-anime-ability="${i}">${a.type==='feed'?'Feed':a.type==='kakuja'?'Awaken Kakuja':a.type==='gearShift'?'Gear Shift':'Room: swap'}${m?' · '+esc(getCard(m.cardId).name):''}</button>`;}).join('');
 const label=pl.tokyo?`${TG_HEROES[pl.tokyo.hero].name}${pl.tokyo.path==='ghoul'?` · Hunger / ${pl.tokyo.stacks}/4 Cannibalism`:' · Quinques'}`:pl.factions[0];
 const status=pl.tokyo?.path==='ghoul'?`<p>Cannibalism ${pl.tokyo.stacks}/4${pl.tokyo.evolved?' · Kakuja awakened':''}</p>`:'';
 const jam=s.players.map((p,i)=>(p.mana.jammedNextTurn||p.mana.jammedThisTurn)?`<span>${i===0?'You':'Rival'}: ${p.mana.jammedNextTurn??0} Mana Jammed next turn${p.mana.jammedThisTurn?' · '+p.mana.jammedThisTurn+' blocked now':''}</span>`:'').join('');
 return{groups:[...groups.values()],html:`<div class="anime-battle-abilities"><button class="ghost" data-realms-anime-toggle>${esc(label)} · Abilities ${buttons?'●':''}</button>${jam}${abilitiesOpen?`<div class="anime-abilities-panel"><button class="ghost" data-realms-anime-toggle>Close ×</button>${status}${buttons||'<p>No additional abilities are ready.</p>'}${pl.tokyo?'<p>Quinques and Kagunes are shown beside your Hero. Attack by dragging your Hero to a target.</p>':''}${api.teams?.()??''}</div>`:''}</div>`};
}
function initialize(){
 if(initialized)return;initialized=true;if(webkitHoverSafe||matchMedia('(hover:none)').matches)document.body.classList.add('touch-ui');
 drag.init({root,legal,canAct,canPlan:()=>!!api?.active()&&busy,act:a=>api.act(a),inspect:preview,deny:(_,reason)=>api.toast(reason==='turn'?'It is the rival’s turn.':'That action is unavailable. Check Mana, targets and board space.'),notMyTurn:()=>!!api?.active()&&actingPlayer(api.state())!==0});
 document.addEventListener('pointerdown',e=>{if(api?.active())document.body.classList.toggle('touch-ui',e.pointerType==='touch'||webkitHoverSafe);},true);
 document.addEventListener('pointerover',e=>{if(!api?.active()||e.pointerType==='touch'||drag.busy())return;const target=e.target.closest('[data-preview]');if(target&&!target.closest('.my-hand,.overlay,.reaction')){clearTimeout(previewTimer);previewTimer=setTimeout(()=>preview(target),280);}});
 document.addEventListener('pointerout',e=>{if(!api?.active()||e.pointerType==='touch')return;const target=e.target.closest('[data-preview]');if(target&&!target.contains(e.relatedTarget)&&!e.relatedTarget?.closest?.('#preview')&&!drag.busy())closeBattlePreview();});
 // Shattered Realms' hold-to-read behavior for minions, powers and history.
 let hold=null,suppressClickUntil=0;
 document.addEventListener('pointerdown',e=>{if(!api?.active()||e.pointerType!=='touch')return;const t=e.target.closest('[data-preview]');if(!t||t.closest('[data-hand],.reaction')||t.closest('button:not(.hero-spell)'))return;clearTimeout(hold?.timer);hold={x:e.clientX,y:e.clientY,shown:false,timer:setTimeout(()=>{if(!t.isConnected)return;drag.cancel();hold.shown=true;preview(t);},420)};});
 document.addEventListener('pointermove',e=>{if(hold&&Math.hypot(e.clientX-hold.x,e.clientY-hold.y)>12){clearTimeout(hold.timer);hold=null;}});
 document.addEventListener('pointerup',e=>{if(!hold)return;clearTimeout(hold.timer);if(hold.shown){closeBattlePreview();suppressClickUntil=Date.now()+500;e.preventDefault();e.stopImmediatePropagation();}hold=null;},true);
 document.addEventListener('click',e=>{if(api?.active()&&Date.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('contextmenu',e=>{if(!api?.active())return;const target=e.target.closest('[data-preview]');if(target){e.preventDefault();drag.cancel();api.inspect(target.dataset.preview,Number(target.dataset.char)||null);}});
 window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(api?.active()){drag.cancel();closeBattlePreview();api.render();}},100);});
}
export function renderRealmsBattle(options){
 api=options;initialize();const s=api.state();if(s.pending)closeBattlePreview();configureBoard(s.players[0].factions[0],api.landscape,api.portrait);
 root().innerHTML=boardHTML({s,me:0,legal:legal(),mode:'ai',handoff:false,isAI:p=>p===1,history:s.uiHistory??[],logOpen,mullMarked:api.mulligan(),shattered:true,concedeAsk,stats:s.uiStats,canUndo:undo.length>0&&!s.pending&&s.activePlayer===0,thinking:actingPlayer(s)===1&&!s.gameOver?'Practice rival':null});
 const arena=root().querySelector('.arena'),host=document.createElement('div');host.className='sr-anime-scene';arena.prepend(host);api.mount?.(host);
 const extra=abilities();root().querySelector('.arena').insertAdjacentHTML('beforeend',extra.html);
 const refresh=()=>{if(!arena.isConnected||root().querySelector('.arena')!==arena)return;layoutPortraitBoard(root());setHandDocks(true);layoutHands(root());api.fit(root());fitAllText(root());drag.refresh();};
 // The menu and battle stylesheets are isolated. Re-measure when WebKit applies
 // the battle sheet after the first frame, and when its fonts finish loading.
 arenaObserver?.disconnect();arenaObserver=new ResizeObserver(()=>{cancelAnimationFrame(measureFrame);measureFrame=requestAnimationFrame(refresh);});arenaObserver.observe(arena);
 const sheet=document.getElementById('realms-battle-css');sheet.onload=()=>{refresh();document.fonts?.ready.then(refresh);};
 refresh();requestAnimationFrame(refresh);document.fonts?.ready.then(refresh);
 root().onclick=e=>{
  const target=e.target.closest('[data-act],[data-choice],[data-mull],[data-qp],[data-realms-anime-toggle],[data-anime-ability]');if(!target||busy)return;
  if(target.hasAttribute('data-realms-anime-toggle')){abilitiesOpen=!abilitiesOpen;api.render();return;}
  if(target.hasAttribute('data-anime-ability')){const choices=extra.groups[Number(target.dataset.animeAbility)];abilitiesOpen=false;if(choices.some(a=>a.target!=null)){drag.aimActions(target,choices);root().querySelector('.anime-abilities-panel')?.remove();}else api.act(choices[0]);return;}
  if(target.hasAttribute('data-choice')){api.act(legal().find(a=>a.type==='choose'&&a.index===Number(target.dataset.choice)));return;}
  if(target.hasAttribute('data-mull')){api.markMulligan(Number(target.dataset.mull));return;}
  if(target.hasAttribute('data-qp')){api.act(legal().filter(a=>a.type==='quickPlay')[Number(target.dataset.qp)]);return;}
  const action=target.dataset.act;
  if(action==='endTurn')api.act(legal().find(a=>a.type==='endTurn'));
  else if(action==='mullConfirm')api.act({type:'mulligan',player:0,replace:api.mulligan()});
  else if(action==='pass')api.act(legal().find(a=>a.type==='pass'));
  else if(action==='toggleLog'){logOpen=!logOpen;api.render();}
  else if(action==='mute'){sound.toggleMute();api.render();}
  else if(action==='save'){api.save();api.toast('Match saved in this browser.');}
  else if(action==='menu'||action==='rematch'){drag.cancel();closeBattlePreview();api.setup();}
  else if(action==='concede'){concedeAsk=true;api.render();}
  else if(action==='concedeNo'){concedeAsk=false;api.render();}
  else if(action==='concedeYes'){concedeAsk=false;api.concede();}
  else if(action==='undo'&&undo.length){api.restore(JSON.parse(undo.pop()));}
  else if(action==='settings'){const shade=document.createElement('div');shade.className='overlay realms-settings';shade.innerHTML='<div class="panel"><h2>Game settings</h2><p>Drag cards out of your hand to play. Tap or hold to read. Drag your Hero or a minion to attack.</p><button data-toggle-sound>Toggle sound</button><button data-choose-deck>Choose a saved deck</button><button class="ghost" data-close>Back to game</button></div>';root().append(shade);shade.querySelector('[data-close]').onclick=()=>shade.remove();shade.querySelector('[data-toggle-sound]').onclick=()=>{sound.toggleMute();api.toast(sound.isMuted()?'Sound muted.':'Sound on.');};shade.querySelector('[data-choose-deck]').onclick=api.setup;}
 };
 root().ondblclick=e=>{if(drag.recentlyAimed())return;const target=e.target.closest('[data-preview]');if(target)api.inspect(target.dataset.preview,Number(target.dataset.char)||null);};
}
export async function beforeBattleAction(s,a){
 if(a.type==='endTurn'||a.type==='mulligan')undo=[];else if(a.player===0&&!s.pending)undo.push(JSON.stringify(s));
 drag.cancel();setHandOpen(false,root(),{force:true});closeBattlePreview();if(a.type!=='attack')return;busy=true;
 try{const from=root().querySelector(`[data-char="${a.attacker}"]`),to=root().querySelector(`[data-char="${a.defender}"]`),power=effectiveAttack(findCharacter(s,a.attacker)),offset=await fx.lunge(from,to,{power,table:root().querySelector('.arena')});if(from&&offset)await fx.returnFromLunge(from,offset);}finally{busy=false;}
}
export function afterBattleAction(before,s,a){
 const stats=s.uiStats??={heroDamage:[0,0],kills:[0,0],cardsPlayed:[0,0],healing:[0,0]};
 for(let p=0;p<2;p++){const old=before.players[p],now=s.players[p],lost=old.hero.health+old.hero.armor-now.hero.health-now.hero.armor;stats.heroDamage[1-p]+=Math.max(0,lost);stats.healing[p]+=Math.max(0,now.hero.health-old.hero.health);stats.kills[1-p]+=old.board.filter(m=>!now.board.some(n=>n.uid===m.uid)).length;}
 if(a.type==='play'){stats.cardsPlayed[a.player]++;const inst=before.players[a.player].hand.find(c=>c.uid===a.card);if(inst)(s.uiHistory??=[]).push({mine:a.player===0,cardId:inst.cardId,text:getCard(inst.cardId).name});}

 const characters=pl=>[pl.hero,...pl.board],oldRects=new Map(),departed=[];
 for(const pl of before.players)for(const c of characters(pl)){
  const el=root().querySelector(`[data-char="${c.uid}"]`);if(!el)continue;
  const rect=el.getBoundingClientRect();oldRects.set(c.uid,rect);
  if(c.kind==='minion'&&!s.players.some(p=>p.board.some(m=>m.uid===c.uid))&&s.players[c.controller].graveyard.some(g=>g.uid===c.uid))departed.push({clone:el.cloneNode(true),rect});
 }
 return ()=>{
  if(!api?.active())return;
  for(const pl of s.players)for(const c of characters(pl)){
   const old=before.players.flatMap(characters).find(m=>m.uid===c.uid),el=root().querySelector(`[data-char="${c.uid}"]`);if(!el)continue;const rect=el.getBoundingClientRect();
   if(!old&&c.kind==='minion'){fx.burst(rect,'summon');continue;}
   if(!old)continue;
   const damage=old.health+(old.armor??0)-c.health-(c.armor??0);
   if(damage>0){fx.floater(rect,`−${damage}`,'damage');fx.hitFx(rect,pl.factions[0],damage,oldRects.get(a.attacker));}
   else if(c.health>old.health)fx.floater(rect,`+${c.health-old.health}`,'heal');
  }
  // A detached copy of the fallen minion shatters away (Shattered Realms does the same; an on-screen
  // copy was never removed and left the dead minion frozen on the board).
  for(const d of departed)fx.shatterCard(d.clone,d.rect,null,'away');
 };
}

export function stopRealmsBattle(){arenaObserver?.disconnect();cancelAnimationFrame(measureFrame);drag.cancel();closeBattlePreview();root().onclick=null;root().ondblclick=null;}
