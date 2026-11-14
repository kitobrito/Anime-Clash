// Tokyo Ghoul collectible roster. Hero equipment, powers and summoned bodies are outside decks.
const F='Tokyo Ghoul',art=id=>`art/tokyo-ghoul/${id}.webp`,op=action=>({op:'tokyoGhoul',action});
const minion=(id,name,cost,attack,health,species,text,keywords=[],legendary=false,arrival=false,target)=>({id:'tg_'+id,name,faction:F,type:'minion',cost,attack,health,species,tribes:[species],text,keywords,legendary,image:art(id),triggers:arrival?[{on:'battlecry',effects:[op(id)]}]:[],...(target?{target}: {})});
const friendly={type:'minion',side:'friendly'},enemy={type:'minion',side:'enemy'};
const M=[
 minion('kaneki','Ken Kaneki — The One-Eyed Ghoul',6,5,6,'Half-Ghoul','Lifesteal. Arrival: Consume a damaged enemy minion with 3 or less Health. Whenever Kaneki consumes a character, gain +1 Attack permanently.',['Lifesteal'],true,true,{...enemy,damaged:true,maxHealth:3}),
 minion('touka','Touka Kirishima — Rabbit',4,4,3,'Ghoul','Stealth, Rush. After Touka attacks, gain Stealth until your next turn if she survives.',['Stealth','Rush'],true),
 minion('rize','Rize Kamishiro — Binge Eater',5,4,6,'Ghoul','Lifesteal. Whenever an enemy minion dies during your turn, restore 2 Health to Rize. Once per turn, if Rize is at full Health, give her +1/+1 permanently instead.',['Lifesteal'],true),
 minion('yoshimura','Yoshimura — The Non-Killing Owl',8,7,9,'Ghoul','Taunt, Lifesteal. Arrival: Restore 5 Health to all friendly Ghouls and Half-Ghouls. Your Ghouls do not gain Hunger while Yoshimura is on the battlefield.',['Taunt','Lifesteal'],true,true),
 minion('eto','Eto Yoshimura — One-Eyed Owl',9,8,8,'Half-Ghoul','Rush, Lifesteal. Arrival: Deal 3 damage to all other minions. Whenever a Ghoul dies, gain +1/+1 permanently.',['Rush','Lifesteal'],true,true),
 minion('noro','Noro — The Regenerator',7,4,9,'Ghoul','Taunt. At the end of your turn, restore Noro to full Health. When Noro survives damage, gain +1 Attack permanently.',['Taunt'],true),
 minion('nishiki','Nishiki Nishio',3,3,3,'Ghoul','Rush. After attacking a minion, restore 2 Health to himself.',['Rush']),
 minion('tsukiyama','Shuu Tsukiyama',4,3,5,'Ghoul','Lifesteal. When a friendly character consumes a Human, gain +1/+1 permanently.',['Lifesteal']),
 minion('hinami','Hinami Fueguchi',3,2,4,'Ghoul','Taunt. Arrival: Give another friendly Ghoul +0/+2.',['Taunt'],false,true,{...friendly,tgSpecies:'Ghoul'}),
 minion('ayato','Ayato Kirishima',4,5,3,'Ghoul','Stealth. First attack each turn deals 2 damage to another random enemy minion.',['Stealth']),
 minion('uta','Uta',3,2,5,'Ghoul','Elusive. Arrival: Give a friendly Ghoul Stealth until your next turn.',['Elusive'],false,true,{...friendly,tgSpecies:'Ghoul'}),
 minion('yomo','Renji Yomo',5,5,5,'Ghoul','Rush. Whenever Yomo kills a minion, gain +1/+1 permanently.',['Rush']),
 minion('amon_ghoul','Koutarou Amon — One-Eyed',5,4,6,'Half-Ghoul','Lifesteal. Arrival: Gain +1/+1 if your Hero is a Ghoul.',['Lifesteal'],false,true),
 minion('takizawa','Seidou Takizawa — Owl',6,6,4,'Half-Ghoul','Rush, Lifesteal. After attacking, deal 2 damage to a random enemy minion.',['Rush','Lifesteal']),
 minion('aogiri','Aogiri Ghoul',2,2,3,'Ghoul','Lifesteal. Starvation damage is reduced by 1.',['Lifesteal']),
 {...minion('starving','Starving Ghoul',1,3,2,'Ghoul','Starts with Hunger 2. Whenever this minion consumes a character, gain +1 Attack.'),initialHunger:2},
 minion('waitress','Anteiku Waitress',2,1,4,'Ghoul','At the end of your turn, restore 1 Health to another friendly Ghoul.'),
 minion('assassin','Masked Ghoul Assassin',3,3,2,'Ghoul','Stealth. After attacking a damaged enemy minion, gain Lifesteal this turn.',['Stealth']),
 minion('juuzou','Juuzou Suzuya',4,4,3,'Human','Evade, Rush. When your Hero equips a Quinque, gain +2 Attack this turn.',['Evade','Rush']),
 minion('hirako','Take Hirako',3,3,4,'Half-Human','Elusive. Arrival: Give another friendly Human Evade until your next turn.',['Elusive'],false,true,{...friendly,tgHuman:true}),
 minion('ui','Koori Ui',4,3,5,'Half-Human','Whenever your Hero attacks with a Quinque, deal 1 damage to a random enemy minion.'),
];
export const TG_HEROES={
 kaneki:{name:'Ken Kaneki',path:'ghoul',kagune:'rinkaku',armor:0,spell:'tg_predatory_instinct',image:art('kaneki')},
 touka:{name:'Touka Kirishima',path:'ghoul',kagune:'ukaku',armor:0,spell:'tg_predatory_instinct',image:art('touka')},
 tsukiyama:{name:'Shuu Tsukiyama',path:'ghoul',kagune:'koukaku',armor:0,spell:'tg_predatory_instinct',image:art('tsukiyama')},
 nishiki:{name:'Nishiki Nishio',path:'ghoul',kagune:'bikaku',armor:0,spell:'tg_predatory_instinct',image:art('nishiki')},
 investigator:{name:'CCG Investigator',path:'investigator',armor:5,spell:'tg_quinque_arsenal',image:art('arima')},
 arima:{name:'Kishou Arima — The CCG Reaper',path:'investigator',armor:8,spell:'tg_perfect_quinque',image:art('arima'),card:'tg_arima'},
 amon:{name:'Koutarou Amon — Ghoul Hunter',path:'investigator',armor:6,spell:'tg_ccg_armory',image:art('amon'),card:'tg_amon'},
 akira:{name:'Akira Mado — Quinque Specialist',path:'investigator',armor:5,spell:'tg_quinque_analysis',image:art('akira'),card:'tg_akira'},
};
const H=[['arima','Your first Hero attack each turn has Evade.'],['amon','Your Hero deals +1 damage when attacking Ghouls or Half-Ghouls.'],['akira','The first Quinque you equip each match costs 2 less Mana.']].map(([id,text])=>({id:'tg_'+id,name:TG_HEROES[id].name,faction:F,type:'hero',frameType:'minion',cost:0,legendary:true,investigatorHero:id,text:`Investigator Hero. Starts with ${TG_HEROES[id].armor} Armor. ${text} Selected during deck building; counts toward 30 cards and begins outside your draw pile.`,image:art(id)}));
const spell=(id,name,cost,text,extra={})=>({id:'tg_'+id,name,faction:F,type:'spell',cost,text,image:art(id),effects:[op(id)],...extra});
const S=[
 spell('feeding_frenzy','Feeding Frenzy',2,'A friendly Ghoul or Half-Ghoul consumes a damaged enemy minion with 2 or less Health.',{target:{...friendly,tgHungry:true},target2:{...enemy,damaged:true,maxHealth:2,tgConsume:true}}),
 spell('cannibalistic_feast','Cannibalistic Feast',4,'A friendly Ghoul consumes another friendly Ghoul or Half-Ghoul. Gain 1 additional Cannibalism stack.',{target:{...friendly,tgSpecies:'Ghoul'},target2:{...friendly,tgHungry:true}}),
 spell('human_prey','Human Prey',2,'Summon two 0/2 Human Civilians. Cannot attack. Your own Ghouls can consume them; enemies cannot consume them on their summon turn.'),
 spell('uncontrollable_hunger','Uncontrollable Hunger',3,'Give a friendly Ghoul +3 Attack and Rush this turn. Set its Hunger to 2 at the end of the turn.',{target:{...friendly,tgSpecies:'Ghoul'}}),
 spell('rc_regeneration','RC Cell Regeneration',3,'Restore 5 Health to a friendly Ghoul or Half-Ghoul and reduce its Hunger to 0.',{target:{...friendly,tgHungry:true}}),
 spell('kagune_manifestation','Kagune Manifestation',2,'Ghoul Hero only. Restore 2 Durability to your Kagune and give it +1 Attack this turn.',{heroPath:'ghoul'}),
 spell('kakuja_awakening','Kakuja Awakening',6,'Ghoul Hero only. If you have 4 Cannibalism stacks, evolve into a Kakuja and gain +2 Attack this turn. Otherwise summon a 3/3 Ghoul with Lifesteal and draw a card.',{heroPath:'ghoul',legendary:true}),
 spell('ccg_reinforcements','CCG Reinforcements',4,'Investigator Hero only. Summon two 2/3 CCG Agents with Rush.',{heroPath:'investigator'}),
 spell('quinque_maintenance','Quinque Maintenance',2,'Restore 3 Durability to your equipped Quinque, up to its maximum. Gain 2 Armor.'),
 spell('extermination','Ghoul Extermination Order',6,'Deal 4 damage to all enemy minions. Deal 6 instead to Ghouls and Half-Ghouls.'),
];
const traps=[['predators_ambush',"Predator’s Ambush",2,'When an enemy minion attacks your Hero, summon a 3/2 Masked Ghoul with Stealth and redirect the attack to it.'],['desperate_regeneration','Desperate Regeneration',2,'When a friendly Ghoul would die from damage, prevent its death, leave it at 1 Health, and give it Lifesteal until your next turn.'],['hidden_plain_sight','Hidden in Plain Sight',2,'When an enemy targets a friendly minion with a spell, give it Elusive until your next turn and draw a card. The spell fails if its target becomes invalid.'],['surprise_raid','CCG Surprise Raid',3,'Investigator Hero only. When an enemy Ghoul or Half-Ghoul attacks, deal 4 damage to it before combat.'],['counterattack','Quinque Counterattack',3,'Investigator Hero only. When your Hero is attacked, gain 3 Armor and deal damage equal to your equipped Quinque’s Attack to the attacker.']].map(([id,name,cost,text],i)=>({id:'tg_'+id,name,faction:F,type:'trap',cost,text,image:art(id),tgTrap:id,...(i>=3?{heroPath:'investigator'}:{}),trap:{on:i===2?'cardPlayed':i===1?'damageDealt':'attackDeclared',effects:[op(id)]}}));
const weapons=[['narukami','Narukami',6,4,3,true,'Whenever your Hero attacks, deal 2 damage to another random enemy. Deal 3 if that target is a Ghoul.'],['ixa','IXA',5,3,5,true,'Arrival: Gain 4 Armor. The first time your Hero takes damage each turn, reduce that damage by 2.'],['jason','Jason',6,6,2,true,'Your Hero’s attacks ignore Taunt. After your Hero kills a minion, restore 1 Durability, up to its maximum.'],['doujima','Doujima 1/2',3,3,3,false,'After your Hero attacks a Ghoul, gain 2 Armor.'],['fueguchi','Fueguchi One',4,2,4,false,'After your Hero attacks, deal 1 damage to two random enemy minions.'],['yukimura','Yukimura 1/3',2,2,3,false,'Your Hero’s first attack each turn gains +2 Attack if its target has Stealth or Evade.']].map(([id,name,cost,attack,durability,legendary,text])=>({id:'tg_'+id,name,faction:F,type:'weapon',cost,attack,durability,legendary,quinque:true,heroPath:'investigator',text,image:art(id)}));
const tokens=[minion('civilian','Human Civilian',0,0,2,'Human','Cannot attack. Protected from enemy Consume on its summon turn.'),minion('masked','Masked Ghoul',0,3,2,'Ghoul','Stealth.',['Stealth']),minion('agent','CCG Agent',0,2,3,'Human','Rush.',['Rush']),minion('ravenous','Ravenous Ghoul',0,3,3,'Ghoul','Lifesteal.',['Lifesteal'])].map(c=>({...c,token:true,...(c.id==='tg_civilian'?{cantAttack:true}: {})}));
export const TG_KAGUNES={rinkaku:{name:'Rinkaku',attack:3,durability:3},ukaku:{name:'Ukaku',attack:2,durability:4},koukaku:{name:'Koukaku',attack:2,durability:5},bikaku:{name:'Bikaku',attack:3,durability:4}};
const equipment=Object.entries(TG_KAGUNES).map(([id,c])=>({id:'tg_'+id,...c,faction:F,type:'weapon',cost:0,token:true,kagune:true,text:{rinkaku:'Lifesteal.',ukaku:'Evade on equip.',koukaku:'Gain 2 Armor on equip.',bikaku:'First attack each turn gains +1 Attack.'}[id],image:art(id)}));
const powers=[['predatory_instinct','Predatory Instinct','Restore 2 Health to your Hero, or 3 if your Kagune damaged an enemy this turn.'],['quinque_arsenal','Quinque Arsenal','Discover a Quinque from your deck. If equipped, give it +1 Durability instead.'],['perfect_quinque','Perfect Quinque','Discover a Quinque from your deck. If equipped, give it +1 Attack this turn and +1 Durability.'],['ccg_armory','CCG Armory','Discover a Quinque from your deck. If equipped, gain 2 Armor instead.'],['quinque_analysis','Quinque Analysis','Discover a Quinque from your deck. If equipped, draw a card instead.']].map(([id,name,text])=>spell(id,name,2,text,{heroSpell:true,altHeroSpell:true,image:art(id==='predatory_instinct'?'predatory_instinct':'quinque_arsenal')}));
export const TOKYO_GHOUL_CARDS=[...M,...H,...S,...traps,...weapons,...tokens,...equipment,...powers];
