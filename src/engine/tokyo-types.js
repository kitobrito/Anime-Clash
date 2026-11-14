import {getCard} from './registry.js';
import {TG_HEROES} from '../cards/tokyo-ghoul.js';
export function tgSpecies(m){if(m?.kind==='hero'&&m.tgHero){const h=TG_HEROES[m.tgHero];return h.path==='ghoul'?(m.tgHero==='kaneki'?'Half-Ghoul':'Ghoul'):m.tgHero==='arima'?'Half-Human':'Human';}const c=m?.kind?(m.cardId?getCard(m.cardId):null):m;if(c?.species)return c.species;const tribes=m?.tribes??c?.tribes??[];if(tribes.includes('Shinobi')&&!/wood|ink_beast|clone/.test(c?.id??''))return 'Human';if(tribes.includes('Pirate')&&!/merry|sunny|jinbe|bepo|carrot/.test(c?.id??''))return 'Human';return null;}
export const tgHungry=m=>['Ghoul','Half-Ghoul'].includes(tgSpecies(m));
export const tgHuman=m=>['Human','Half-Human'].includes(tgSpecies(m));
