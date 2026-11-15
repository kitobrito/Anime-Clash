import {PLAYABLE_FACTIONS,TOKYO_GHOUL} from '../cards/index.js';
import {TG_HEROES} from '../cards/tokyo-ghoul.js';
import {separateLegacyHero} from './hero-picker.js';

export function normalizeDecks(items){
 if(!Array.isArray(items))return [];
 return items.filter(d=>d&&typeof d.id==='string'&&typeof d.name==='string'&&PLAYABLE_FACTIONS.includes(d.faction)&&Array.isArray(d.cards)).map(d=>{
  const migrated=d.faction===TOKYO_GHOUL?separateLegacyHero(d.cards,d.hero):{deck:[...d.cards]};
  return {...d,name:d.name.trim().slice(0,60)||'Untitled deck',cards:migrated.deck,hero:d.faction===TOKYO_GHOUL&&TG_HEROES[migrated.hero]?migrated.hero:null};
 });
}
export function saveDeck(items,{id,name,faction,cards,hero},newId){
 const entry={id:id??newId,name:name.trim().slice(0,60)||'Untitled deck',faction,cards:[...cards],hero:faction===TOKYO_GHOUL?hero:null,updatedAt:Date.now()};
 return [...items.filter(d=>d.id!==entry.id),entry];
}
export function sameDeck(saved,{faction,cards,hero}){return !!saved&&saved.faction===faction&&JSON.stringify(saved.cards)===JSON.stringify(cards)&&(faction!==TOKYO_GHOUL||saved.hero===hero);}
