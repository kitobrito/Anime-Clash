export function minionTypeLines(card){
 if(card.type!=='minion')return[];
 const types=[...new Set([card.species,...(card.tribes??[]),...(card.devilFruitUser?['Devil Fruit User']:[])].filter(Boolean))];
 if(!types.length)return['Minion'];
 // Keep every official type while respecting the plaque's maximum of three rows.
 return types.length<=3?types:[types.slice(0,-2).join(' · '),...types.slice(-2)];
}
