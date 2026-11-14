// Anime game catalog. Legacy Shattered Realms factions are intentionally unregistered.
import { allCards, getCard, registerCards } from '../engine/registry.js';
import { TOKYO_GHOUL_CARDS } from './tokyo-ghoul.js';
import { ONE_PIECE_CARDS } from './one-piece.js';
import { NARUTO_CARDS } from './naruto.js';
import { NEUTRAL_CARDS } from './neutral.js';
registerCards([...NEUTRAL_CARDS, ...NARUTO_CARDS, ...ONE_PIECE_CARDS, ...TOKYO_GHOUL_CARDS]);
export const LEAF = 'Naruto';
export const STRAW_HATS = 'One Piece';
export const TOKYO_GHOUL = 'Tokyo Ghoul';
export const LEGENDARY = new Set(allCards().filter(c => c.legendary).map(c => c.id));
export const copyLimit = id => getCard(id).legendary ? 1 : 2;
const collectible = c => !c.token && !c.heroSpell;
export const FACTION_POOLS = { [LEAF]: NARUTO_CARDS.filter(collectible).map(c => c.id), [STRAW_HATS]: ONE_PIECE_CARDS.filter(collectible).map(c => c.id) };
export const FACTION_LISTS = { [LEAF]: NARUTO_CARDS.filter(c => collectible(c) && !c.extra).map(c => c.id), [STRAW_HATS]: ONE_PIECE_CARDS.filter(collectible).slice(0,30).map(c => c.id) };
FACTION_POOLS[TOKYO_GHOUL]=TOKYO_GHOUL_CARDS.filter(collectible).map(c=>c.id);
FACTION_LISTS[TOKYO_GHOUL]=['kaneki','touka','rize','yoshimura','eto','noro','nishiki','nishiki','tsukiyama','hinami','hinami','ayato','uta','yomo','amon_ghoul','aogiri','aogiri','starving','starving','waitress','waitress','assassin','feeding_frenzy','feeding_frenzy','cannibalistic_feast','human_prey','human_prey','rc_regeneration','kagune_manifestation','kakuja_awakening'].map(id=>'tg_'+id);
// Keep the starter at 30 cards while including its new defensive Quick Play.
FACTION_LISTS[LEAF][FACTION_LISTS[LEAF].indexOf('thousand_years_of_death')]='eight_trigrams_palm_rotation';
export const FACTION_DECKS = FACTION_LISTS;
export const PLAYABLE_FACTIONS = [LEAF, STRAW_HATS, TOKYO_GHOUL];
export const hasExtras = f => (FACTION_POOLS[f]?.length ?? 0) > 30;
export function lineupOf(f, lineups = {}) {
 const deck = lineups[f]; const counts = {};
 return Array.isArray(deck) && deck.length === 30 && deck.every(id => FACTION_POOLS[f]?.includes(id) && (counts[id] = (counts[id] ?? 0) + 1) <= copyLimit(id)) ? [...deck] : [...(FACTION_LISTS[f] ?? [])];
}
export const buildSingleDeck = (f, lineups = {}) => lineupOf(f, lineups);
export function buildDeck(factions, _cuts, lineups = {}) {
 if (factions.length !== 1 || !PLAYABLE_FACTIONS.includes(factions[0])) throw new Error('Choose exactly one anime faction.');
 return buildSingleDeck(factions[0], lineups);
}
export const standardCuts = () => [];
export const standardDuplicates = () => [];
