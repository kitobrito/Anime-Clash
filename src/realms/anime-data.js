// Data adapters for the unmodified Shattered Realms battle presentation.
export const ART={},CLICKER_ART={},FUSION_HERO_ART={},RAGE_RUNNER_ART={};
export const HERO_ART={Naruto:'art/identity/naruto-hero.jpg','One Piece':'art/identity/one-piece-hero.jpg','Tokyo Ghoul':'art/tokyo-ghoul/kaneki.webp'};
export const ANIME_BACKS={Naruto:'art/identity/naruto-back.jpg','One Piece':'art/identity/one-piece-back.jpg','Tokyo Ghoul':'art/tokyo-ghoul/masked.webp'};
export const BOARD_CUTS={},ALT_BOARDS={},CIRCLE_BOARDS={land:{},portrait:{}};
export const LANDSCAPE_SIZE=[1024,572],PORTRAIT_SIZE=[459,1024];
export const BOARD_ART={},LANDSCAPE_BOARDS={},PORTRAIT_BOARDS={};
export const boardKey=f=>f;
export const hasBoardFx=()=>false;
export const ownedBoards=()=>[];
export const boardProgress=()=>({have:1,total:1});
export const getSettings=()=>({basicBoard:false,orientation:'auto',classicCards:false,boards:{}});
export const weaponStatsForCard=c=>c.type==='weapon'?{attack:c.attack,durability:c.durability}:null;
export function configureBoard(faction,source,portrait){
 BOARD_ART[faction]='art/boards-anime/'+source;
 LANDSCAPE_BOARDS[faction]={src:BOARD_ART[faction],opp:[471,24,553,118],me:[468,446,556,548],field:[110,140,915,425],frame:'stone',props:[]};
 PORTRAIT_BOARDS[faction]={src:'art/boards-anime/'+portrait,opp:[201,30,259,98,'arch'],me:[198,806,261,876,'circle'],field:[120,790],frame:'stone',props:[]};
}
