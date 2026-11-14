// Paths traced against the supplied original images, in their native pixel space.
// Portrait is independently authored, never a crop or a stretched landscape map.
const normalize=(d,w,h)=>d.replace(/[MLCQZ][^MLCQZ]*/gi,s=>{let i=0;return s.replace(/-?\d*\.?\d+/g,n=>String(+(Number(n)/(i++%2?h:w)*1000).toFixed(3)));});
const part=(id,d,motion,origin='50% 50%')=>({id,d,motion,origin});
const obj=(id,label,corner,sequence,d,anchor,parts,sound,duration=3200)=>({id,label,corner,sequence,kind:sequence,pieces:[{d}],anchor,parts,sound,duration,cooldown:650,primary:true});
const gourmetL=[
 obj('platter','Gourmet banquet platter','top-left','cloche','M 26 220 L 35 172 Q 49 134 120 125 L 124 111 L 143 111 L 146 128 Q 207 143 222 205 L 225 226 Q 128 249 26 220 Z',[128,218],[part('lid','M 32 211 Q 39 145 120 128 L 124 112 L 143 112 L 146 129 Q 207 147 219 208 Q 139 236 32 211 Z','cloche')],'metal-clink'),
 obj('masks','Ghoul masquerade masks','top-right','mask','M 1045 142 Q 1064 126 1081 144 L 1092 160 L 1104 122 Q 1122 103 1147 111 L 1164 127 L 1158 158 L 1141 185 L 1135 230 L 1158 241 L 1190 239 L 1190 209 L 1162 181 Q 1154 157 1179 146 Q 1205 140 1224 162 L 1232 177 Q 1252 157 1268 178 L 1278 204 L 1256 237 L 1255 256 L 1221 265 L 1182 258 L 1147 253 L 1111 243 L 1065 239 L 1062 210 L 1047 193 Z',[1131,153],[part('mask','M 1104 127 Q 1119 109 1146 113 L 1162 129 L 1156 154 L 1141 182 L 1122 190 L 1105 169 L 1100 146 Z','mask')],'mask-whisper'),
 obj('mechanism','Chandelier mechanism','bottom-left','chains','M 12 367 L 41 357 Q 54 334 83 337 Q 113 338 124 375 L 158 377 L 158 397 L 129 404 L 153 535 L 139 565 L 108 575 L 98 603 L 62 599 L 51 576 L 19 568 L 13 541 L 29 411 L 12 407 Z',[80,509],[part('crystals','M 62 449 L 88 449 L 93 480 L 118 495 L 126 480 L 135 512 L 150 524 L 145 556 L 123 558 L 115 580 L 95 573 L 86 597 L 73 580 L 57 587 L 47 566 L 29 567 L 21 550 L 20 524 L 40 507 L 47 481 L 55 482 Z','chains','50% 0%')],'chains'),
 obj('door','Gourmet’s secret door','bottom-right','door','M 1148 423 Q 1196 357 1279 382 L 1279 680 L 1154 654 Z',[1238,527],[part('door','M 1246 383 L 1279 386 L 1279 681 L 1243 667 Z','door','100% 50%')],'door-creak',3800)
];
const gourmetP=[
 obj('platter','Gourmet banquet platter','top-left','cloche','M 44 239 Q 52 181 114 169 L 120 154 L 135 154 L 140 171 Q 198 186 210 239 L 208 251 Q 125 272 43 247 Z',[125,241],[part('lid','M 47 239 Q 53 182 116 172 L 120 155 L 135 155 L 140 173 Q 198 189 208 238 Q 126 260 47 239 Z','cloche')],'metal-clink'),
 obj('masks','Ghoul masquerade masks','top-right','mask','M 535 174 Q 556 162 573 180 L 580 198 L 586 165 Q 602 149 621 161 L 635 173 L 629 194 L 616 216 L 606 223 L 608 252 L 631 260 L 646 251 L 645 230 Q 621 213 636 194 Q 656 179 672 197 L 680 215 Q 692 198 705 209 L 715 229 L 703 253 L 696 272 L 667 283 L 629 271 L 603 266 L 574 259 L 547 260 L 543 224 L 535 209 Z',[605,185],[part('mask','M 586 166 Q 602 150 621 162 L 633 176 L 628 194 L 613 214 L 602 222 L 588 206 L 583 185 Z','mask')],'mask-whisper'),
 obj('mechanism','Chandelier mechanism','bottom-left','chains','M 1 983 L 35 980 Q 49 960 76 966 Q 98 971 107 995 L 148 1002 L 153 1019 L 122 1031 L 149 1137 L 146 1171 L 116 1188 L 97 1206 L 74 1202 L 54 1197 L 29 1193 L 11 1176 L 24 1041 L 0 1040 Z',[81,1131],[part('crystals','M 65 1064 L 84 1064 L 91 1093 L 105 1104 L 116 1098 L 123 1126 L 145 1139 L 150 1166 L 136 1177 L 122 1177 L 115 1192 L 100 1187 L 87 1207 L 73 1195 L 60 1201 L 51 1186 L 30 1188 L 18 1167 L 24 1134 L 46 1119 L 54 1095 L 62 1097 Z','chains','50% 0%')],'chains'),
 obj('door','Gourmet’s secret door','bottom-right','door','M 563 1047 Q 623 989 719 1003 L 719 1264 L 564 1246 Z',[670,1130],[part('door','M 648 1004 L 718 1009 L 718 1264 L 648 1255 Z','door','100% 50%')],'door-creak',3800)
];
const cochleaL=[
 obj('rack','Quinque weapons rack','top-left','quinque','M 0 58 L 190 91 L 218 263 L 31 292 L 7 184 Z',[106,131],[part('weapon','M 24 107 L 69 117 L 80 108 L 133 121 L 179 146 L 184 153 L 77 140 L 67 128 L 24 119 Z','weapon')],'electrical'),
 obj('cell','Ghoul containment cell','top-right','containment','M 1062 61 L 1216 71 L 1242 214 L 1066 204 Z',[1167,149],[part('ghoul','M 1121 150 L 1115 135 L 1122 116 L 1143 110 L 1149 117 L 1162 106 L 1175 95 L 1206 84 L 1212 93 L 1181 114 L 1166 137 L 1187 125 L 1220 102 L 1224 114 L 1190 149 L 1180 174 L 1202 191 L 1186 205 L 1167 181 L 1149 176 L 1134 197 L 1126 194 L 1133 169 Z','ghoul')],'glass-impact',3500),
 obj('console','CCG security console','bottom-left','lockdown','M 0 463 L 156 511 L 161 544 L 241 551 L 268 614 L 272 717 L 0 720 Z',[132,586],[part('lever','M 112 567 Q 113 557 126 563 L 154 566 L 161 578 L 152 586 L 151 603 L 168 624 L 159 636 L 142 617 L 136 587 L 114 582 Z','lever','60% 100%')],'alarm',3200),
 obj('tank','RC-cell experiment tank','bottom-right','specimen','M 1097 408 Q 1158 381 1246 409 L 1249 579 L 1227 615 L 1112 612 L 1096 581 Z',[1181,494],[part('specimen','M 1144 562 Q 1123 542 1146 507 Q 1160 486 1184 479 L 1217 445 L 1210 472 L 1180 508 L 1202 514 L 1218 544 L 1192 533 L 1170 548 L 1153 566 Z','specimen')],'bubbling',3300)
];
const cochleaP=[
 obj('rack','Quinque weapons rack','top-left','quinque','M 0 74 L 140 105 L 186 231 L 29 270 L 0 198 Z',[85,140],[part('weapon','M 22 121 L 60 130 L 71 122 L 107 134 L 146 156 L 150 163 L 64 146 L 56 139 L 22 132 Z','weapon')],'electrical'),
 obj('cell','Ghoul containment cell','top-right','containment','M 560 85 L 688 73 L 691 236 L 558 217 Z',[624,167],[part('ghoul','M 577 174 L 577 157 L 589 146 L 601 147 L 608 139 L 616 120 L 648 101 L 665 99 L 648 116 L 628 132 L 622 157 L 641 145 L 674 123 L 683 126 L 657 161 L 639 181 L 646 200 L 638 216 L 620 198 L 606 195 L 591 213 L 584 208 L 593 187 Z','ghoul')],'glass-impact',3500),
 obj('console','CCG security console','bottom-left','lockdown','M 0 1019 L 172 1067 L 180 1109 L 237 1118 L 277 1182 L 284 1268 L 0 1280 Z',[140,1157],[part('lever','M 119 1126 Q 117 1116 129 1117 L 161 1126 L 169 1137 L 159 1143 L 159 1157 L 181 1182 L 171 1194 L 150 1172 L 144 1143 L 123 1139 Z','lever','60% 100%')],'alarm',3200),
 obj('tank','RC-cell experiment tank','bottom-right','specimen','M 558 1027 Q 613 1010 685 1031 L 688 1185 L 667 1213 L 564 1212 Z',[624,1114],[part('specimen','M 587 1181 Q 574 1160 594 1134 Q 608 1115 625 1104 L 656 1074 L 649 1104 L 624 1133 L 645 1137 L 663 1166 L 639 1154 L 617 1169 L 601 1190 Z','specimen')],'bubbling',3300)
];
function variant(theme,orientation){
 const wide=orientation==='landscape',w=wide?1280:720,h=wide?720:1280,gourmet=theme==='gourmet';
 const props=(gourmet?wide?gourmetL:gourmetP:wide?cochleaL:cochleaP).map(p=>({...p,pieces:p.pieces.map(s=>({...s,d:normalize(s.d,w,h)})),anchor:[p.anchor[0]/w*1000,p.anchor[1]/h*1000],parts:p.parts.map(s=>({...s,d:normalize(s.d,w,h)}))}));
 const ambient=gourmet?[
  part('chandelier',wide?'M 506 0 L 790 0 L 778 48 L 758 67 L 735 71 L 720 97 L 678 104 L 651 129 L 632 107 L 588 96 L 568 75 L 543 67 L 520 45 Z':'M 245 0 L 479 0 L 469 39 L 454 66 L 426 80 L 397 89 L 374 112 L 355 101 L 336 90 L 300 82 L 281 64 L 261 45 Z','chandelier','50% 0%'),
  part('curtain',wide?'M 0 0 L 68 0 L 59 25 L 36 56 L 0 92 Z':'M 0 0 L 58 0 L 45 30 L 0 95 Z','curtain','0 0'),
 ]:[];
 return {source:`${theme}-${orientation}-source.jpg`,plate:`${theme}-${orientation}-underpaint.webp`,size:[w,h],environment:true,props,
  ambient:ambient.map(p=>({...p,d:normalize(p.d,w,h)})),
  platform:normalize(gourmet?(wide?'M 257 194 L 1014 194 L 1112 525 L 160 525 Z':'M 94 325 L 627 325 L 706 896 L 20 896 Z'):(wide?'M 275 203 L 1004 203 L 1111 527 L 172 527 Z':'M 104 279 L 617 279 L 704 922 L 8 922 Z'),w,h),
  play:gourmet?(wide?[.245,.32,.51,.35]:[.16,.31,.68,.34]):(wide?[.245,.32,.51,.34]:[.16,.29,.68,.37]),
  rare:{id:gourmet?'gathering':'breach',minDelay:65000,maxDelay:115000,duration:4600},
  lights:gourmet?(wide?[[350,26],[940,27],[81,510],[1153,553]]:[[188,36],[537,38],[80,1133],[552,1155]]):(wide?[[61,430],[1023,19],[1111,242],[1189,418]]:[[70,1005],[632,63],[573,246],[615,1035]]),
 };
}
export const TOKYO_BOARDS={
 gourmet:{faction:'Tokyo Ghoul',name:'The Gourmet Restaurant',accent:'#e9b76c',portrait:variant('gourmet','portrait'),landscape:variant('gourmet','landscape')},
 cochlea:{faction:'Tokyo Ghoul',name:'CCG Cochlea Containment Facility',accent:'#7bdfff',portrait:variant('cochlea','portrait'),landscape:variant('cochlea','landscape')},
};
