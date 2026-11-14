import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BOARD_THEMES,boardVariant,boardOptions} from '../src/boards/catalog.js';
import {validateEnvironment,boardPoint,InteractionGate,ParticlePool,qualityProfile} from '../src/boards/environment.js';
import {ENVIRONMENT_SOUND_IDS} from '../src/boards/audio-assets.js';

test('all six boards have four independently defined primary corners in both layouts',()=>{
 assert.equal(Object.keys(BOARD_THEMES).length,6);
 for(const def of Object.values(BOARD_THEMES))assert.deepEqual(validateEnvironment(def),[],def.name);
 assert.deepEqual(boardOptions('Tokyo Ghoul'),['gourmet','cochlea']);
});
test('Tokyo Ghoul layouts have distinct traced masks, anchors, play surfaces and complete sequences',()=>{
 for(const key of ['gourmet','cochlea']){
  const a=boardVariant(key,'portrait'),b=boardVariant(key,'landscape');
  assert.notDeepEqual(a.play,b.play);assert.notEqual(a.platform,b.platform);
  assert.equal(new Set(a.props.map(p=>p.sequence)).size,4);
  for(const p of a.props){assert.notEqual(p.pieces[0].d,b.props.find(o=>o.id===p.id).pieces[0].d);assert.ok(p.parts.length);assert.ok(ENVIRONMENT_SOUND_IDS.includes(p.sound));assert.ok(p.duration>=2600&&p.duration<=4000);assert.ok(p.anchor.every(n=>n>=0&&n<=1000));}
 }
});
test('source artwork and optional underpaint assets exist for every orientation',()=>{
 for(const key of ['gourmet','cochlea'])for(const view of ['portrait','landscape']){
  const d=boardVariant(key,view);for(const path of [d.source,d.plate])assert.ok(fs.statSync(new URL('../art/boards-anime/'+path,import.meta.url)).size>1000,path);
 }
});
test('board coordinates map consistently at different sizes and device offsets',()=>{
 for(const width of [320,390,720,1280]){
  const r={left:17,top:53,width,height:width*16/9};
  assert.deepEqual(boardPoint(17+width*.2,53+r.height*.8,r),[200,800]);
 }
});
test('cooldowns block spam, allow independent objects and unlock exactly after completion plus cooldown',()=>{
 const g=new InteractionGate();assert.equal(g.take('door',100,3800,650),true);assert.equal(g.take('door',101,3800,650),false);assert.equal(g.take('mask',101,3200,650),true);assert.equal(g.take('door',4549,3800,650),false);assert.equal(g.take('door',4550,3800,650),true);g.clear();assert.equal(g.until.size,0);
});
test('particle pool remains bounded, reuses expired entries and clears cleanly',()=>{
 const p=new ParticlePool(12);p.emit('spark',20,30,100,0,'red',()=>.5);assert.equal(p.size,12);
 const ctx=new Proxy({},{get:()=>()=>{}});p.draw(ctx,2000,1280,720);assert.equal(p.size,0);const first=p.items[0];p.emit('steam',2,3,5,3000);assert.equal(p.items[0],first);assert.equal(p.size,5);p.clear();assert.equal(p.size,0);
});
test('adaptive quality limits mobile pixels, particle budgets and frame rates',()=>{
 assert.equal(qualityProfile('auto',{memory:4,cores:8}).fps,30);assert.equal(qualityProfile('auto',{memory:8,cores:8}).fps,60);assert.equal(qualityProfile('low').dpr,1);assert.ok(qualityProfile('low').particles<qualityProfile('high').particles);
 const p=new ParticlePool(80);p.setCapacity(36);p.emit('spark',0,0,100,0);assert.equal(p.size,36);p.setCapacity(80);p.emit('spark',0,0,100,0);assert.equal(p.size,80);
});
test('bad configurations and unknown layouts fail explicitly',()=>{
 assert.ok(validateEnvironment({portrait:{props:[]}}).length);assert.throws(()=>boardVariant('missing','portrait'));assert.throws(()=>boardVariant('gourmet','missing'));
});
