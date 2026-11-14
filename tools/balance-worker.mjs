import {parentPort} from 'node:worker_threads';
import {createGame,applyAction,actingPlayer} from '../src/engine/engine.js';
import {getCard} from '../src/engine/registry.js';
import {chooseFor} from './balance-policy.mjs';

export function simulate(task){
 const s=createGame({players:task.players.map(p=>({name:p.id,factions:[p.faction],deck:p.deck,...(p.hero?{hero:p.hero}:{})})),seed:task.seed});
 const stats=s.players.map(()=>({actions:{},played:{},drawn:[],heroAttacks:0,unusedMana:0,turns:0,kakuja:0,gears:0,feed:0})),seen=[new Set(),new Set()];let steps=0,lastAction=null;
 try{
  while(!s.gameOver&&steps<2000&&s.turn<=160){
   for(let p=0;p<2;p++)for(const c of s.players[p].hand)seen[p].add(c.cardId);
   const p=actingPlayer(s),a=chooseFor(s,task.policy);if(!a)throw Error('AI returned no action');lastAction=a;const st=stats[p];st.actions[a.type]=(st.actions[a.type]??0)+1;
   if(a.type==='play'||a.type==='quickPlay'){const c=s.players[p].hand.find(c=>c.uid===a.card);if(c)st.played[c.cardId]=(st.played[c.cardId]??0)+1;}
   if(a.type==='attack'&&a.attacker===s.players[p].hero.uid)st.heroAttacks++;
   if(a.type==='endTurn'){st.unusedMana+=s.players[p].mana.current;st.turns++;}
   if(a.type==='feed')st.feed++;if(a.type==='gearShift')st.gears++;if(a.type==='kakuja')st.kakuja++;
   applyAction(s,a);steps++;
  }
  for(let p=0;p<2;p++)stats[p].drawn=[...seen[p]];
  return {...task,players:task.players.map(({deck,...p})=>p),winner:s.winner,completed:s.gameOver,turn:s.turn,steps,stats,final:s.players.map(p=>({health:p.hero.health,armor:p.hero.armor,fatigue:p.fatigue,evolved:!!p.tokyo?.evolved,stacks:p.tokyo?.stacks??null})),lastAction,error:null};
 }catch(error){return {...task,players:task.players.map(({deck,...p})=>p),completed:false,error:error.stack,state:s,lastAction,steps};}
}
parentPort?.on('message',task=>{if(task===null)return;parentPort.postMessage(simulate(task));});
