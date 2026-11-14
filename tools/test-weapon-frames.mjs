import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '../src/cards/index.js';
import {allCards} from '../src/engine/registry.js';
import {CARD_FRAMES,WEAPON_FRAME,frameFor,frameVars} from '../src/anime/frame-assets.js';
test('all real weapon cards, including generated equipment, use the supplied frame',()=>{
 const weapons=allCards().filter(c=>c.type==='weapon');assert.ok(weapons.length>=6);
 for(const c of weapons)assert.equal(frameFor(c),WEAPON_FRAME,c.name);
 assert.ok(fs.existsSync(new URL('../'+WEAPON_FRAME.src,import.meta.url)));
});
test('faction, rarity, legacy frame hints and equipment-spell forms do not override the weapon frame',()=>{
 for(const faction of ['Naruto','One Piece','Tokyo Ghoul'])for(const legendary of [true,false]){
  assert.equal(frameFor({type:'weapon',frameType:'minion',faction,legendary}),WEAPON_FRAME);
  for(const flag of ['weapon','wand'])assert.equal(frameFor({type:'spell',faction,legendary,[flag]:true}),WEAPON_FRAME);
 }
 for(const key of ['basic-weapon','naruto-weapon','one-piece-weapon'])assert.equal(CARD_FRAMES[key],WEAPON_FRAME);
});
test('nonweapon frame selection is preserved and overlay boxes stay within the supplied frame',()=>{
 assert.equal(frameFor({type:'minion',faction:'Naruto',legendary:true}),CARD_FRAMES['naruto-minion']);
 assert.equal(frameFor({type:'spell',faction:'One Piece',legendary:true}),CARD_FRAMES['one-piece-spell']);
 assert.equal(frameFor({type:'hero',frameType:'minion',faction:'Tokyo Ghoul'}),CARD_FRAMES['basic-minion']);
 for(const key of ['art','name','rules','mana','attack','health']){const [l,t,w,h]=WEAPON_FRAME[key];assert.ok(l>=0&&t>=0&&w>0&&h>0&&l+w<=100&&t+h<=100);}
 assert.match(frameVars(WEAPON_FRAME),/--mana-l:5.26%/);
});
