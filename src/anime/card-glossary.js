import {KEYWORD_TEXT} from '../engine/rules.js';
export const ANIME_TERMS={...KEYWORD_TEXT,
 Weapon:'A Hero weapon adds Attack and uses 1 Durability for each attack. Quinques break at zero Durability; a Kagune stays equipped but becomes exhausted. Kureo Mado can hold two Quinques and alternate attacks between them.',
 Fruit:'A Devil Fruit gives a non-user permanent powers and a drawback. A character can have only one Devil Fruit. These powers survive transformations and cannot be stripped by ordinary Silence.',
 Discover:'Choose one of the offered cards. The effect tells you where the options come from. Investigator Hero Spells offer Quinques still in your deck and move the chosen card into your hand.',
 Weather:'A spell that changes battlefield conditions. Its card text describes which characters are affected and how long the effect lasts.',
 Jutsu:'A Naruto spell. Abilities that trigger when you cast a Jutsu respond to these spells. A Quick Play Jutsu can also be cast during its listed reaction window.',
 Silence:'Removes a character’s removable abilities and keywords. Permanent Devil Fruit powers and drawbacks remain. It does not remove permanent Attack or Health bonuses.',
 Silenced:'This character has lost its removable abilities and keywords. Permanent Devil Fruit powers and drawbacks remain.',
 Feed:'Pay 1 Mana and use this ready Ghoul’s attack to consume an eligible friendly Human token or a damaged enemy minion with 2 or less Health. Feeding resets Hunger. A Ghoul cannot Feed and also make its normal attack that turn.',

 Stealth:'Enemies cannot select this character as an attack or spell target. Attacking removes Stealth. Random effects and effects that hit all minions can still affect it. An explicit ability, such as a Hero attacking with Yukimura, can allow attacks through Stealth.',
 Taunt:'Enemy attacks must target a visible minion with Taunt before attacking your other characters. Taunt does not redirect spells. A Stealthed minion does not block attacks until it becomes visible.',
 Evade:'Prevents the next damage this character would take, then is removed. It blocks the whole hit, including a boosted attack. It does not prevent effects that destroy without dealing damage.',
 'Hero Spell':'A reusable ability outside your deck. Pay its displayed Mana cost to use it once during each of your own turns. It is never drawn from your deck.',
 Jammed:'Blocks the stated number of Mana crystals on the affected player’s next refill, then clears. It does not permanently remove crystals. Only successful direct Hero hits from Gentle Fist abilities apply Jammed.',
 Hunger:'Ghouls gain 1 Hunger at the end of their turn unless fed or protected by an ability. At Hunger 3 or more, they take 1 starvation damage at the end of their turns. Feeding resets Hunger.',
 Consume:'Destroys an eligible character without normal combat. The consuming Ghoul resets Hunger and gains bonuses based on the consumed character’s species. Consume follows the target restrictions printed on the card.',
 Cannibalism:'Your Ghoul Hero builds up to 4 Cannibalism stacks by consuming eligible Ghouls or Half-Ghouls. Spend 4 stacks and 4 Mana to evolve your Hero’s Kagune once per match.',
 Kakuja:'A once-per-match Ghoul Hero evolution. Spend 4 Cannibalism stacks and 4 Mana, choose a second Kagune type, gain 6 Armor, improve the Kagune by +2 Attack and +3 maximum Durability, refill it, and give it Lifesteal.',
 Kagune:'A Ghoul Hero’s starting weapon. Each Hero attack uses 1 Durability. At zero Durability it remains equipped but is exhausted; repair it to attack again. Ghouls cannot replace a Kagune with a Quinque.',
 Quinque:'An Investigator Hero weapon. Each attack uses 1 Durability; it breaks at zero. Kureo Mado can hold two and attack once with each per turn. Other Investigators hold one.',
 Durability:'The number of attacks a weapon can make before breaking or becoming exhausted. Only the weapon used for an attack loses 1 Durability. Repair and other effects can change this value.',
 Armor:'Absorbs damage before your Hero loses Health. Armor stays until damage or another effect removes it.',
 'Devil Fruit User':'A character with a permanent Devil Fruit power and drawback. Each character can have only one Devil Fruit; transformations preserve that identity.',
 'Gear Shift':'Luffy can pay the shown Mana cost once per turn to advance along his transformation path. Existing damage, permanent bonuses and Devil Fruit identity carry over. Gear 4 offers two branches before Gear 5.',
 Drawback:'A permanent disadvantage that comes with a Devil Fruit power. Its exact restriction is printed on that Fruit and applies while the character has it.',
 'Team 7':'Control Naruto, Sasuke and Sakura together to give their current copies permanent +3/+3 and summon Kakashi from hand or deck. Once per player per game; it never generates a missing mentor.',
 'Team Guy':'Control Neji, Rock Lee and Tenten together to give their current copies permanent +3/+3 and summon Might Guy from hand or deck. Once per player per game.',
 'Team 8':'Control Shino, Hinata, Kiba and Akamaru together to give their current copies permanent +3/+3 and summon Kurenai from hand or deck. Once per player per game.',
 'Ino–Shika–Cho':'Control Ino, Shikamaru and Choji together to give their current copies permanent +3/+3 and summon Asuma from hand or deck. Once per player per game.',
};
export function cardKeywords(card,liveKeywords=[]){
 const terms=new Set([...(card.keywords??[]),...liveKeywords]);
 if(card.quickPlay)terms.add('Quick Play');if(card.heroSpell)terms.add('Hero Spell');if(card.type==='trap')terms.add('Trap');
 if(['Ghoul','Half-Ghoul'].includes(card.species)){terms.add('Hunger');terms.add('Feed');}if(card.jutsu)terms.add('Jutsu');if(card.weather)terms.add('Weather');if(card.quinque)terms.add('Quinque');if(card.kagune)terms.add('Kagune');if(card.type==='weapon')terms.add('Durability');
 for(const term of Object.keys(ANIME_TERMS)){
  const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const label=['Arrival','Exit','Summon'].includes(term);
  if(new RegExp(label?`\\b${escaped}:`:`(?<![\\p{L}])${escaped}s?(?![\\p{L}])`,'iu').test(card.text??''))terms.add(term);
 }
 if(/\bJam\b/.test(card.text??''))terms.add('Jammed');
 return [...terms].filter(t=>ANIME_TERMS[t]).map(term=>({term,text:ANIME_TERMS[term]}));
}
