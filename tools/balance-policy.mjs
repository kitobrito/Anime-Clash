// Analysis-only sensitivity bots. The shipped AI and all game rules stay unchanged.
import {evaluate,chooseAction} from '../src/ai/greedy.js';
import {actingPlayer,getLegalActions,applyAction} from '../src/engine/engine.js';
import {effectiveAttack} from '../src/engine/core.js';
import {getCard} from '../src/engine/registry.js';
const score=(s,p,policy)=>{
 let n=evaluate(s,p);if(s.gameOver)return n;
 const a=s.players[p],b=s.players[1-p];
 if(policy==='pressure')n+=a.hero.health*.1-b.hero.health*.8;
 if(policy==='control')n+=a.board.reduce((v,m)=>v+m.health*.45+effectiveAttack(m)*.4,0)-b.board.reduce((v,m)=>v+m.health*.5+effectiveAttack(m)*.5,0);
 return n;
};
export function chooseFor(s,policy='shipped'){
 if(policy==='shipped')return chooseAction(s);
 const p=actingPlayer(s),legal=getLegalActions(s);
 if(s.pending?.type==='mulligan')return chooseAction(s);
 if(s.pending?.type==='choice'&&s.pending.options.every(o=>o.cardId))return chooseAction(s);
 const fallback=legal.find(a=>a.type==='endTurn'||a.type==='pass');let best=fallback??legal[0],bestScore=fallback?score(s,p,policy)+.01:-Infinity;
 for(const a of legal){if(a===fallback)continue;const sim=structuredClone(s);applyAction(sim,a);let steps=0;
  while(sim.pending?.type==='reaction'&&sim.pending.player!==p&&steps++<8)applyAction(sim,{type:'pass',player:sim.pending.player});
  for(let i=0;i<4&&sim.pending?.type==='choice'&&sim.pending.player===p;i++)applyAction(sim,chooseFor(sim,policy));
  const n=score(sim,p,policy);if(n>bestScore){bestScore=n;best=a;}
 }
 return best;
}
