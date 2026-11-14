// Candidate screening only. Final acceptance uses the real source and fresh seeds.
import fs from 'node:fs';
import path from 'node:path';
import {Worker} from 'node:worker_threads';
import {ANIME_PRESETS} from '../src/cards/anime-presets.js';
import {singleDeckProblem} from '../src/cards/deck-check.js';
import {allCards} from '../src/engine/registry.js';

const args=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/,'').split('=')));
const file=path.resolve(args.candidates),input=JSON.parse(fs.readFileSync(file));
// Snapshot every baseline stat and lineup so replaying after adopting a candidate
// cannot silently turn "decks only" into "decks plus the newly shipped buffs".
const baseline=Object.fromEntries(allCards().filter(c=>c.faction==='Naruto').map(c=>[c.id,Object.fromEntries(['cost','attack','health'].filter(k=>c[k]!=null).map(k=>[k,c[k]]))]));
const candidates=input.map(c=>({...c,decks:structuredClone(c.decks??ANIME_PRESETS.Naruto),cards:Object.fromEntries(Object.entries(baseline).map(([id,stats])=>[id,{...stats,...c.cards?.[id]}]))}));
const out=path.resolve(args.out??'dist/naruto-tuning-screen');fs.mkdirSync(out,{recursive:true});
const seeds=Number(args.seeds??12),offset=Number(args.offset??0);
const seedOf=n=>{let x=(0xA11CE+n*0x9e3779b9)|0;x=Math.imul(x^(x>>>16),0x85ebca6b);return (x^(x>>>13))|0;};
const opponents=Object.entries(ANIME_PRESETS).filter(([f])=>f!=='Naruto').flatMap(([f,decks])=>Object.entries(decks).map(([name,deck],i)=>({id:`${f}:${i}`,faction:f,name,deck,hero:f==='Tokyo Ghoul'?(i===2?'arima':'kaneki'):null})));
const stream=fs.createWriteStream(path.join(out,'matches.jsonl'));let count=0;
fs.writeFileSync(path.join(out,'candidates.json'),JSON.stringify(candidates,null,2));
for(const candidate of candidates) {
 const decks=candidate.decks??ANIME_PRESETS.Naruto;
 const profiles=Object.entries(decks).map(([name,deck],i)=>({id:`Naruto:${i}`,faction:'Naruto',name,deck}));
 for(const p of profiles){const error=singleDeckProblem('Naruto',p.deck);if(error)throw Error(`${p.name}: ${error}`);}
 const tasks=[];
 for(const p of profiles)for(const q of opponents)for(let i=0;i<seeds;i++)for(let seat=0;seat<2;seat++)tasks.push({id:tasks.length,stage:'screen',variant:candidate.id,policy:'shipped',block:i,seed:seedOf(offset+i),players:seat?[q,p]:[p,q]});
 let cursor=0,done=0;const results=[];
 await Promise.all(Array.from({length:2},()=>new Promise((resolve,reject)=>{
  const worker=new Worker(new URL('./balance-worker.mjs',import.meta.url),{workerData:{cardOverrides:candidate.cards??{}}});
  const next=()=>{if(cursor===tasks.length){worker.terminate().then(resolve);return;}worker.postMessage(tasks[cursor++]);};
  worker.on('error',reject);worker.on('message',r=>{if(r.error||!r.completed){worker.terminate();reject(Error(r.error??'Capped match'));return;}stream.write(JSON.stringify(r)+'\n');results.push(r);done++;count++;if(done%100===0)console.log(candidate.id,done+'/'+tasks.length);next();});next();
 })));
 const groups={};
 for(const r of results){const seat=r.players.findIndex(p=>p.faction==='Naruto'),p=r.players[seat];for(const key of ['Naruto',p.name,'vs '+r.players[1-seat].faction]){const g=groups[key]??={wins:0,games:0};g.games++;if(r.winner===seat)g.wins++;}}
 const summary={candidate:candidate.id,groups:Object.fromEntries(Object.entries(groups).map(([k,g])=>[k,{...g,winPct:100*g.wins/g.games}]))};
 fs.writeFileSync(path.join(out,candidate.id+'.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
}
await new Promise(resolve=>stream.end(resolve));console.log('Completed',count,'screening games.');
