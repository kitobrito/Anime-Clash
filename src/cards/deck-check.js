import { hasCard, getCard } from '../engine/registry.js';
import { FACTION_POOLS, PLAYABLE_FACTIONS, copyLimit } from './index.js';
export function singleDeckProblem(faction, deck) {
 if (!PLAYABLE_FACTIONS.includes(faction)) return 'Choose an available faction.';
 if (!Array.isArray(deck)) return 'Deck must be a list of cards.';
 const counts = {};
 for (const id of deck) {
  if (!hasCard(id) || !FACTION_POOLS[faction].includes(id)) return `Only collectible ${faction} cards are allowed.`;
  counts[id] = (counts[id] ?? 0) + 1;
  if (counts[id] > copyLimit(id)) return `Maximum ${copyLimit(id)} ${getCard(id).name}${getCard(id).legendary ? ' (Legendary)' : ''}.`;
 }
 return deck.length === 30 ? null : `Choose exactly 30 cards (${deck.length}/30).`;
}
export const pairDeckProblem = () => 'Fusion decks are not available. Choose exactly one faction.';
export const deckProblem = (factions, deck) => Array.isArray(factions) && factions.length === 1 ? singleDeckProblem(factions[0], deck) : pairDeckProblem();
export function checkDeck({format, factions, deck} = {}) {
 if (format && format !== 'single') return {error: pairDeckProblem()};
 const error = deckProblem(factions, deck);
 return error ? {error} : {format:'single', factions:[...factions], deck:[...deck]};
}
