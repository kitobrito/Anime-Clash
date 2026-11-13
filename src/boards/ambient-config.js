// Idle-animation recipes for every board (see ambient.js for what each layer type does).
// Coordinates are in the 0..1000 board space; amplitudes are in board units, so a value of 1
// is a tenth of a percent of the board's width (x) or height (y). Everything here is subtle on purpose.
const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const hang = (poly, hinge, o = {}) => ({type: 'warp', poly, hinge, dir: 1, ax: .8, flutter: .3, period: 5.5, wave: 25, curve: 1.3, feather: 4, ...o});
const stand = (poly, hinge, o = {}) => ({type: 'warp', poly, hinge, dir: -1, ax: 1, flutter: .35, period: 4.8, wave: 30, curve: 1.5, feather: 4, ...o});
const VL_LEAVES=[{"src":"village-landscape-leaf0.webp","rect":[374.032,53.362,8.934,13.874],"motion":{"kind":"drift","ax":5,"ay":4,"rot":0.6}},{"src":"village-landscape-leaf1.webp","rect":[314.473,112.06,35.736,29.883],"motion":{"kind":"drift","ax":5,"ay":4,"rot":0.6}},{"src":"village-landscape-leaf3.webp","rect":[646.814,144.077,10.721,18.143],"motion":{"kind":"drift","ax":5,"ay":4,"rot":0.6}},{"src":"village-landscape-leaf4.webp","rect":[676.593,159.018,13.699,21.345],"motion":{"kind":"drift","ax":5,"ay":4,"rot":0.6}},{"src":"village-landscape-leaf5.webp","rect":[192.376,409.819,13.103,22.412],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[195.0,428.87]}},{"src":"village-landscape-leaf6.webp","rect":[14.89,557.097,17.272,17.076],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[18.34,571.61]}},{"src":"village-landscape-leaf7.webp","rect":[801.668,382.07,10.125,26.681],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[803.69,404.75]}},{"src":"village-landscape-leaf8.webp","rect":[807.028,455.71,12.507,11.74],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[809.53,465.69]}},{"src":"village-landscape-leaf9.webp","rect":[868.97,538.954,16.677,28.815],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[872.31,563.45]}},{"src":"village-landscape-leaf10.webp","rect":[887.433,596.585,12.507,13.874],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[889.93,608.38]}},{"src":"village-landscape-leaf11.webp","rect":[251.936,824.973,19.059,21.345],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[255.75,843.12]}},{"src":"village-landscape-leaf12.webp","rect":[333.532,832.444,9.529,18.143],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[335.44,847.87]}},{"src":"village-landscape-leaf13.webp","rect":[630.733,856.99,16.081,17.076],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[633.95,871.5]}},{"src":"village-landscape-leaf14.webp","rect":[708.16,829.242,14.89,20.277],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[711.14,846.48]}}];
const VP_LEAVES=[{"src":"village-portrait-leaf0.webp","rect":[274.28,31.566,16.009,8.338],"motion":{"kind":"drift","ax":5,"ay":4,"rot":0.6}},{"src":"village-portrait-leaf1.webp","rect":[116.329,265.634,21.345,10.125],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[120.6,274.24]}},{"src":"village-portrait-leaf2.webp","rect":[81.11,350.804,25.614,14.89],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[86.23,363.46]}},{"src":"village-portrait-leaf3.webp","rect":[901.814,333.532,18.143,16.081],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[905.44,347.2]}},{"src":"village-portrait-leaf4.webp","rect":[911.419,372.245,18.143,19.655],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[915.05,388.95]}},{"src":"village-portrait-leaf5.webp","rect":[946.638,464.562,32.017,12.507],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[953.04,475.19]}},{"src":"village-portrait-leaf6.webp","rect":[49.093,393.091,13.874,8.934],"motion":{"kind":"flutter","rot":0.35,"lift":1.6,"slide":1.6,"pivot":[51.87,400.68]}}];
const fireflies = (rects, count = 22) => ({type: 'fireflies', layer: 'front', rects, count, size: 1.4, color: 'rgba(205,255,120,1)', core: '#f8ffd8'});
const forestLeaves = {type: 'leaves', layer: 'front', rect: [0, -20, 1000, 1040], count: 4, colors: ['#5f8f3a', '#7fae49', '#a7b552', '#6d7f34'], fall: 10, size: 5, wind: .12, gap: 1.6};

export const AMBIENT = {
 'sunny-landscape': {layers: [
  {type: 'rockingSea', sea: 'sunny-landscape-sea.webp', ship: 'sunny-landscape-ship.webp', horizon: 127, roll: .16, heave: 2, margin: .014,
   ripple: {amp: 1.25, k: .085, w: 1.15}, bands: [[0, 127, 1000, 215], [0, 215, 300, 600], [820, 215, 1000, 520]], glints: 80, glintArea: [0, 132, 1000, 560],
   parts: [
    {src: 'sunny-landscape-garland.webp', rect: [0, 0, 121.501, 352.188], motion: {kind: 'pivot', pivot: [135, -6], rot: .55, period: 5.6, flutter: .5}},
    {src: 'sunny-landscape-sail.webp', rect: [770.101, 0, 229.899, 114.194], motion: {hinge: 0, dir: 1, ax: 1.1, flutter: .3, period: 4.4, wave: 22, curve: 1.2}}],
   gulls: [{src: 'sunny-landscape-gull0.webp', rect: [356.164, 17.076, 32.162, 25.614]}, {src: 'sunny-landscape-gull1.webp', rect: [431.209, 59.765, 25.61, 25.614]}, {src: 'sunny-landscape-gull2.webp', rect: [556.284, 71.505, 23.824, 23.479]}, {src: 'sunny-landscape-gull3.webp', rect: [800.476, 113.127, 15.485, 19.21]}]},
  {type: 'glow', at: [960, 150], r: 90, color: 'rgba(255,250,225,1)', alpha: [.05, .14], period: 6.5, core: .05, squash: .55, blend: 'screen'},
 ]},
 'sunny-portrait': {layers: [
  {type: 'rockingSea', sea: 'sunny-portrait-sea.webp', ship: 'sunny-portrait-ship.webp', horizon: 93, roll: .16, heave: 1.4, margin: .016,
   ripple: {amp: 1.6, k: .12, w: 1.15}, bands: [[0, 93, 1000, 260], [0, 260, 150, 580], [880, 150, 1000, 580]], glints: 60, glintArea: [0, 96, 1000, 400],
   parts: [
    {src: 'sunny-portrait-garland.webp', rect: [0, 0, 188.901, 243.597], motion: {kind: 'pivot', pivot: [190, -6], rot: .6, period: 5.6, flutter: .6}},
    {src: 'sunny-portrait-sail.webp', rect: [728.922, 0, 240.128, 213.818], motion: {hinge: 0, dir: 1, ax: 1.6, flutter: .4, period: 4.4, wave: 30, curve: 1.2}}],
   gulls: [{src: 'sunny-portrait-gull0.webp', rect: [363.927, 32.162, 37.353, 14.294]}, {src: 'sunny-portrait-gull1.webp', rect: [439.701, 55.986, 29.883, 13.103]}, {src: 'sunny-portrait-gull2.webp', rect: [563.501, 63.728, 29.883, 11.912]}]},
 ]},
 'sea-landscape': {layers: [
  {type: 'lightning', sky: [0, 0, 1000, 92], bolts: [[740, 32, 45], [872, 55, 28]], every: 9, skyAlpha: .35, color: 'rgba(170,200,255,.9)'},
  {type: 'water', src: 'sea-landscape-water.webp', rect: [0, 86.446, 1000, 913.554], horizon: 88, amp: 1.9, k: .075, w: 1.6, swell: 1},
  {type: 'rays', origin: [560, 690], angle: 0, spread: .7, count: 6, length: 320, width: 16, jitter: 160, color: 'rgba(150,255,235,.55)', alpha: .3, period: 7},
  {type: 'bubbles', rect: [360, 760, 420, 240], count: 14, size: 1.4, rise: 7, alpha: .7, mask: 'water'},
  {type: 'glints', rect: [0, 90, 1000, 200], count: 50, mask: 'water', color: '#eaffff', alpha: .6},
  {type: 'warp', poly: [[518,0],[610,0],[622,20],[636,50],[644,80],[646,120],[646,170],[647,200],[574,200],[580,188],[586,165],[593,140],[598,110],[600,82],[595,62],[585,52],[571,56],[560,80],[550,100],[540,130],[530,152],[518,152],[507,130],[500,105],[494,82],[496,60],[504,35],[510,18]],
   hinge: 188, dir: -1, ax: 1.3, ay: 2.6, period: 7.5, breath: .8, curve: 1.1, feather: 2.5, patch: {src: 'sea-landscape-patch-serpent.webp', rect: [487.195, 0, 166.766, 212.38]}},
  {type: 'pivot', poly: [[795,398],[822,396],[845,424],[884,437],[906,433],[943,460],[1000,484],[1000,610],[936,604],[884,572],[822,531],[788,508],[783,478],[784,440],[790,410]],
   pivot: [965, 600], rot: .55, rise: 1.4, period: 8.5, phase: 2, feather: 2.5, patch: {src: 'sea-landscape-patch-croc.webp', rect: [776.057, 384.205, 223.943, 236.926]}},
  ...[[68, 476, 13], [70, 612, 21], [957, 384, 19], [775, 826, 16], [287, 886, 11], [711, 919, 6]].map(([x, y, r], i) => ({type: 'pulse', at: [x, y], r: r + 3, amp: .035, period: 3.2 + i * .4, phase: i * 1.3, drift: 1.5, bob: 2.5, feather: 2})),
  {type: 'mist', rect: [0, 55, 1000, 90], color: 'rgba(215,230,240,1)', alpha: .09, count: 6, size: 170, speed: 5},
  {type: 'spray', layer: 'front', points: [[330, 115, 60, 4.2, 1], [168, 330, 95, 5.1, 1.2], [890, 560, 100, 4.7, 1], [205, 640, 70, 6.3, .9], [640, 700, 90, 5.6, .8], [600, 160, 80, 6.8, .9]]},
 ]},
 'sea-portrait': {layers: [
  {type: 'glow', at: [520, 98], r: 120, color: 'rgba(255,215,150,1)', alpha: [.08, .2], period: 7, core: .05, squash: .4, blend: 'screen'},
  {type: 'lightning', sky: [0, 0, 1000, 102], bolts: [[120, 85, 40], [205, 95, 28]], every: 10, skyAlpha: .35, color: 'rgba(170,200,255,.9)'},
  {type: 'water', src: 'sea-portrait-water.webp', rect: [0, 98.927, 1000, 901.073], horizon: 100, amp: 2.4, k: .06, w: 1.6, swell: 1.2},
  {type: 'rays', origin: [420, 770], angle: 0, spread: .8, count: 6, length: 230, width: 22, jitter: 300, color: 'rgba(150,255,235,.55)', alpha: .28, period: 7},
  {type: 'bubbles', rect: [150, 800, 700, 200], count: 14, size: 2, rise: 7, alpha: .7, mask: 'water'},
  {type: 'glints', rect: [0, 100, 1000, 120], count: 45, mask: 'water', color: '#fff4dc', alpha: .65},
  {type: 'warp', poly: [[446,0],[749,0],[783,15],[797,77],[778,124],[745,160],[712,178],[602,178],[631,140],[664,110],[683,88],[677,59],[657,41],[617,41],[598,59],[560,95],[538,108],[499,131],[468,110],[446,88],[406,35],[420,15]],
   hinge: 170, dir: -1, ax: 2.2, ay: 1.8, period: 7.5, breath: .8, curve: 1.1, feather: 2.5, patch: {src: 'sea-portrait-patch-serpent.webp', rect: [393.81, 0, 415.155, 184.744]}},
  {type: 'pivot', poly: [[0,432],[20,423],[61,405],[127,395],[168,381],[202,364],[240,365],[256,400],[246,423],[214,437],[170,460],[143,477],[102,492],[51,489],[0,480]],
   pivot: [10, 485], rot: -.9, rise: .9, period: 8, phase: 1, feather: 2.5, patch: {src: 'sea-portrait-patch-crocL.webp', rect: [0, 356.973, 267.876, 141.836]}},
  {type: 'pivot', poly: [[775,368],[800,360],[896,363],[908,361],[963,371],[1000,375],[1000,430],[960,432],[900,458],[880,448],[860,420],[800,400],[778,388]],
   pivot: [975, 440], rot: .9, rise: .8, period: 9, phase: 4, feather: 2.5, patch: {src: 'sea-portrait-patch-crocR.webp', rect: [763.074, 353.397, 236.926, 111.442]}},
  {type: 'pivot', poly: [[818,550],[862,545],[950,556],[1000,548],[1000,645],[950,640],[896,615],[841,606],[812,590],[808,568]],
   pivot: [930, 595], rot: 1.4, rise: 1.3, period: 5.5, phase: 3, feather: 2.5, patch: {src: 'sea-portrait-patch-fish.webp', rect: [796.158, 538.141, 203.842, 113.23]}},
  {type: 'mist', rect: [0, 70, 1000, 70], color: 'rgba(225,225,235,1)', alpha: .08, count: 5, size: 220, speed: 5},
  {type: 'spray', layer: 'front', points: [[860, 140, 70, 4.6, 1], [80, 250, 100, 5.3, 1.1], [130, 520, 60, 6.1, .9], [820, 440, 80, 5.2, 1], [600, 175, 90, 7, .9], [40, 360, 85, 4.9, 1]]},
 ]},
 'forest-landscape': {layers: [
  {type: 'rays', origin: [175, -10], angle: -.16, spread: .5, count: 5, length: 430, width: 16, jitter: 70, color: 'rgba(215,255,195,.6)', alpha: .2, period: 9},
  {type: 'mist', rect: [80, 120, 230, 330], color: 'rgba(200,235,200,1)', alpha: .12, count: 7, size: 110, speed: 3},
  hang(box(146, 46, 174, 132), 48, {ax: .9, flutter: .45}),
  hang(box(210, 46, 226, 132), 48, {ax: .8, phase: 1.2}),
  hang(box(346, 199, 434, 284), 201, {ax: .7, phase: .6}),
  hang(box(537, 199, 575, 272), 201, {ax: .6, phase: 2.1}),
  hang(box(621, 199, 656, 242), 201, {ax: .5, phase: 2.9}),
  stand(box(321, 279, 388, 368), 368, {ax: .9, phase: .3}),
  stand(box(164, 300, 218, 368), 368, {ax: .8, phase: 1.9}),
  stand(box(0, 557, 122, 724), 724, {ax: 1.3, phase: 1}),
  stand(box(146, 632, 184, 694), 694, {ax: .9, phase: 2.6}),
  stand(box(806, 583, 874, 704), 704, {ax: 1, phase: 3.3}),
  stand(box(298, 876, 464, 1000), 1000, {ax: 1.5, phase: .2}),
  stand(box(516, 893, 644, 1000), 1000, {ax: 1.4, phase: 1.4}),
  stand(box(796, 893, 884, 1000), 1000, {ax: 1.3, phase: 2.4}),
  ...[[382, 45], [500, 45], [619, 45]].map(([x, y], i) => ({type: 'glow', at: [x, y], r: 18, color: 'rgba(255,240,205,1)', alpha: [.18, .34], period: 4 + i, phase: i * 2, flicker: .25, squash: .6})),
  ...[[843, 105], [918, 90], [952, 243], [946, 446]].map(([x, y], i) => ({type: 'glow', at: [x, y], r: 14, color: 'rgba(110,255,140,1)', alpha: [.12, .5], period: 2.6 + i * .5, phase: i * 1.7})),
  fireflies([[100, 180, 200, 250], [0, 550, 250, 250], [780, 420, 220, 280], [300, 240, 400, 90]]),
  forestLeaves,
 ]},
 'forest-portrait': {layers: [
  {type: 'rays', origin: [480, -10], angle: 0, spread: .6, count: 6, length: 300, width: 20, jitter: 160, color: 'rgba(215,255,195,.6)', alpha: .2, period: 9},
  {type: 'mist', rect: [150, 0, 700, 160], color: 'rgba(200,235,200,1)', alpha: .08, count: 6, size: 160, speed: 3},
  hang(box(253, 13, 332, 124), 15, {ax: .8, phase: .4}),
  hang(box(666, 43, 718, 132), 45, {ax: .8, phase: 1.6}),
  hang(box(553, 178, 604, 227), 180, {ax: .5, phase: 2.5}),
  stand(box(0, 318, 145, 432), 432, {ax: .8, flutter: .4, phase: .7, wave: 14}),
  stand(box(15, 505, 165, 632), 632, {ax: .9, flutter: .4, phase: 2.3, wave: 14}),
  stand(box(0, 598, 105, 722), 722, {ax: .8, flutter: .35, phase: 3.1, wave: 14}),
  stand(box(808, 328, 995, 482), 482, {ax: .9, flutter: .4, phase: 1.4, wave: 14}),
  stand(box(868, 556, 1000, 672), 672, {ax: .9, flutter: .4, phase: 4, wave: 14}),
  stand(box(371, 843, 1000, 1000), 1000, {ax: .9, phase: 2.2}),
  fireflies([[0, 280, 180, 450], [820, 300, 180, 450], [200, 820, 500, 180], [300, 180, 400, 90]]),
  forestLeaves,
 ]},
 'village-landscape': {layers: [
  {type: 'glow', at: [236, 38], r: 130, color: 'rgba(255,235,180,1)', alpha: [.08, .18], period: 8, core: .05, blend: 'screen'},
  {type: 'clouds', rect: [0, 0, 1000, 120], color: 'rgba(255,245,230,1)', alpha: .1, count: 6, size: 160, speed: 4, flat: .25},
  {type: 'birds', band: [40, 120], count: 3, size: 4, cross: 40, color: '#3a3330', alpha: .75},
  stand([[70, 175], [110, 150], [170, 158], [232, 172], [242, 230], [228, 285], [70, 285]], 285, {ax: 1.3, flutter: .35, period: 6, wave: 18}),
  stand([[905, 190], [950, 150], [1000, 155], [1000, 290], [905, 290]], 290, {ax: 1.3, flutter: .35, period: 6, wave: 18, phase: 2}),
  {type: 'smoke', points: [[776, 96, 1]], rise: 6, drift: 14, height: 70, color: 'rgba(230,225,220,1)', alpha: .28},
  ...[[400, 311, 'rgba(255,150,80,1)'], [455, 294, 'rgba(255,150,80,1)'], [723, 186, 'rgba(255,200,110,1)'], [791, 205, 'rgba(255,200,110,1)']].map(([x, y, color], i) => ({type: 'glow', at: [x, y], r: 14, color, alpha: [.2, .42], period: 3.5 + i * .6, phase: i * 1.9, flicker: .2, sway: [.6, 3.7 + i * .3]})),
  {type: 'sprites', items: VL_LEAVES},
  {type: 'leaves', layer: 'front', rect: [-100, -20, 1000, 1040], count: 4, colors: ['#6e9a3c', '#89ad4a', '#b4b85a'], fall: 11, size: 5, wind: .25, gap: 1.4},
 ]},
 'village-portrait': {layers: [
  {type: 'glow', at: [329, 32], r: 160, color: 'rgba(255,235,180,1)', alpha: [.08, .18], period: 8, core: .05, blend: 'screen'},
  {type: 'clouds', rect: [0, 0, 1000, 70], color: 'rgba(255,245,230,1)', alpha: .1, count: 5, size: 220, speed: 4, flat: .25},
  {type: 'birds', band: [20, 70], count: 3, size: 6, cross: 40, color: '#3a3330', alpha: .75},
  stand([[0, 100], [60, 95], [150, 110], [155, 190], [0, 195]], 195, {ax: .8, flutter: .35, period: 6, wave: 18}),
  stand([[860, 170], [1000, 150], [1000, 205], [860, 205]], 205, {ax: .7, flutter: .3, period: 6, wave: 18, phase: 2}),
  ...[[264, 209], [424, 165], [907, 179]].map(([x, y], i) => ({type: 'glow', at: [x, y], r: 16, color: 'rgba(255,175,95,1)', alpha: [.2, .4], period: 3.5 + i * .6, phase: i * 1.9, flicker: .2})),
  {type: 'sprites', items: VP_LEAVES},
  {type: 'leaves', layer: 'front', rect: [-150, -20, 1000, 1040], count: 4, colors: ['#6e9a3c', '#89ad4a', '#b4b85a'], fall: 12, size: 8, wind: .25, gap: 1.4},
 ]},
};
