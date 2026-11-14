// Reproducible, seat-balanced tournament of the actual game engine and starter decks.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Worker} from 'node:worker_threads';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {ANIME_PRESETS} from '../src/cards/anime-presets.js';
const flags=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/,'').split('=')));
const seeds=Number(flags.seeds??50),heroSeeds=Number(flags['hero-seeds']??16),sensitivitySeeds=Number(flags['sensitivity-seeds']??12),workers=Number(flags.workers??Math.min(2,os.availableParallelism()));
const seedOffset=Number(flags['seed-offset']??0);
const out=path.resolve(flags.out??'dist/balance-2026-11-14');fs.mkdirSync(out,{recursive:true});
const profiles=Object.entries(ANIME_PRESETS).flatMap(([faction,decks])=>Object.entries(decks).map(([name,deck],i)=>({id:`${faction}:${i}`,name,faction,deck:[...deck],hero:faction==='Tokyo Ghoul'?(i===2?'arima':'kaneki'):null})));
const extra=[];for(const p of profiles.filter(p=>p.faction==='Tokyo Ghoul'))for(const hero of p.hero==='arima'?['amon','akira','investigator']:['touka','tsukiyama','nishiki']){
 const deck=p.deck.map(c=>c==='tg_arima'&&hero!=='investigator'?'tg_'+hero:c);
 if(hero==='investigator')deck[deck.indexOf('tg_arima')]='tg_fueguchi';
 extra.push({...p,id:p.id+':'+hero,name:p.name+' / '+hero,hero,deck});
}
function seedOf(n){let x=(0xA11CE+n*0x9e3779b9)|0;x=Math.imul(x^(x>>>16),0x85ebca6b);return (x^(x>>>13))|0;}
const tasks=[];
const includePair=(a,b)=>flags.only!=='naruto-cross'||(a.faction!==b.faction&&[a.faction,b.faction].includes('Naruto'));
function matches(a,b,count,stage,policy='shipped',mirror=false){for(let i=0;i<count;i++)for(let seat=0;seat<(mirror?1:2);seat++)tasks.push({id:tasks.length,stage,policy,block:i,seed:seedOf(seedOffset+i),players:seat?[b,a]:[a,b]});}
if(flags.only!=='heroes')for(let i=0;i<profiles.length;i++)for(let j=i;j<profiles.length;j++)if(includePair(profiles[i],profiles[j]))matches(profiles[i],profiles[j],seeds,'baseline','shipped',i===j);
for(const p of extra)for(const q of profiles.filter(p=>flags.opponents==='tg'?p.faction==='Tokyo Ghoul':flags.opponents==='all'?true:p.faction!=='Tokyo Ghoul'))matches(p,q,heroSeeds,'hero-sweep');
if(flags.only!=='heroes')for(const policy of ['pressure','control'])for(let i=0;i<profiles.length;i++)for(let j=i+1;j<profiles.length;j++)if(profiles[i].faction!==profiles[j].faction&&includePair(profiles[i],profiles[j]))matches(profiles[i],profiles[j],sensitivitySeeds,'sensitivity',policy);
const files=[];for(const dir of ['src/engine','src/cards','src/ai'])for(const f of fs.readdirSync(dir))if(f.endsWith('.js'))files.push(dir+'/'+f);
const digest=createHash('sha256');for(const f of files.sort())digest.update(f).update(fs.readFileSync(f));
const metadata={started:new Date().toISOString(),commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),gameSourceSha256:digest.digest('hex'),config:{only:flags.only??'all',heroOpponents:flags.opponents??'non-tg',seeds,seedOffset,heroSeeds,sensitivitySeeds,workers,maxActions:2000,maxHalfTurns:160},profiles:[...profiles,...extra],total:tasks.length,method:'Same seed bank for every pairing, both seat orders for distinct profiles, one game per seed for exact mirrors. Source revision rules, mulligans and second-player potion choice enabled. Equal preset weighting. No test-only card or rule overrides.'};
fs.writeFileSync(path.join(out,'metadata.json'),JSON.stringify(metadata,null,2));
const results=fs.createWriteStream(path.join(out,'matches.jsonl'));let cursor=0,done=0,errors=0;const start=Date.now();
await Promise.all(Array.from({length:workers},()=>new Promise((resolve,reject)=>{
 const worker=new Worker(new URL('./balance-worker.mjs',import.meta.url));
 const next=()=>{if(cursor>=tasks.length){worker.terminate().then(resolve);return;}worker.postMessage(tasks[cursor++]);};
 worker.on('error',reject);worker.on('message',r=>{done++;if(r.error){errors++;fs.writeFileSync(path.join(out,`error-${r.id}.json`),JSON.stringify(r,null,2));delete r.state;}
  results.write(JSON.stringify(r)+'\n');if(done%100===0||done===tasks.length){const progress={done,total:tasks.length,errors,elapsedSeconds:Math.round((Date.now()-start)/1000)};fs.writeFileSync(path.join(out,'progress.json'),JSON.stringify(progress));console.log(JSON.stringify(progress));}next();});next();
})));
await new Promise(resolve=>results.end(resolve));metadata.finished=new Date().toISOString();metadata.errors=errors;metadata.elapsedSeconds=Math.round((Date.now()-start)/1000);fs.writeFileSync(path.join(out,'metadata.json'),JSON.stringify(metadata,null,2));console.log(`Completed ${done} games. Results: ${out}`);
