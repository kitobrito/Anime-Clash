import {boardVariant} from './catalog.js';
const NS='http://www.w3.org/2000/svg';
const images=new Map(),spriteCache=new Map();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function imageAsset(path){if(!images.has(path))images.set(path,new Promise((resolve,reject)=>{const im=new Image();im.decoding='async';im.onload=()=>resolve(im);im.onerror=()=>{images.delete(path);reject(new Error(`Could not load ${path}`));};im.src=new URL(path,document.baseURI).href;}));return images.get(path);}
function make(tag,cls){const e=document.createElement(tag);if(cls)e.className=cls;return e;}
export function maskSprite(image,pieces){
 const full=make('canvas'),w=image.naturalWidth,h=image.naturalHeight;full.width=w;full.height=h;
 const ctx=full.getContext('2d',{willReadFrequently:true});ctx.save();ctx.scale(w/1000,h/1000);ctx.fillStyle='#fff';ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.lineJoin='round';
 for(const piece of pieces){const path=new Path2D(piece.d);if(piece.stroke){ctx.lineWidth=piece.stroke;ctx.stroke(path);}else ctx.fill(path,'evenodd');}ctx.restore();
 ctx.globalCompositeOperation='source-in';ctx.drawImage(image,0,0);ctx.globalCompositeOperation='source-over';
 const data=ctx.getImageData(0,0,w,h).data;let l=w,t=h,r=-1,b=-1;
 // The actual raster alpha defines the bounding box, not a convenient rectangle.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>0){if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;}
 if(r<l)throw new Error('Empty board mask');
 const canvas=make('canvas');canvas.width=r-l+1;canvas.height=b-t+1;const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(full,l,t,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
 const rgba=c.getImageData(0,0,canvas.width,canvas.height).data,alpha=new Uint8Array(canvas.width*canvas.height);for(let i=0;i<alpha.length;i++)alpha[i]=rgba[i*4+3];
 return {canvas,alpha,width:canvas.width,height:canvas.height,bounds:[l/w*1000,t/h*1000,canvas.width/w*1000,canvas.height/h*1000],scale:[w/1000,h/1000]};
}
export function alphaAt(sprite,x,y){const px=Math.floor((x-sprite.bounds[0])*sprite.scale[0]),py=Math.floor((y-sprite.bounds[1])*sprite.scale[1]);if(px<0||py<0||px>=sprite.width||py>=sprite.height)return 0;return sprite.alpha[py*sprite.width+px];}
class BoardSound{
 constructor(){this.enabled=false;this.ctx=null;}
 set(enabled){this.enabled=enabled;if(!enabled)this.ctx?.suspend().catch(()=>{});}
 play(kind){if(!this.enabled)return;try{const Audio=window.AudioContext??window.webkitAudioContext;if(!Audio)return;this.ctx??=new Audio();this.ctx.resume().catch(()=>{});const c=this.ctx,t=c.currentTime,g=c.createGain();g.connect(c.destination);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.7);
  if(['serpent','scroll','cannon','harpoon','monster','spider','training','ramen','galley'].includes(kind)){const buffer=c.createBuffer(1,c.sampleRate*.5,c.sampleRate),d=buffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);const n=c.createBufferSource(),f=c.createBiquadFilter();n.buffer=buffer;f.type=kind==='serpent'?'highpass':'lowpass';f.frequency.value=kind==='serpent'?1900:kind==='cannon'?190:700;n.connect(f);f.connect(g);n.start(t);n.stop(t+.6);}
  const osc=c.createOscillator();osc.type=['scoreboard','seal','navigator'].includes(kind)?'sine':'triangle';osc.frequency.setValueAtTime(kind==='scoreboard'?1046:kind==='navigator'?880:kind==='treasure'?1568:160,t);osc.frequency.exponentialRampToValueAtTime(kind==='scoreboard'?1568:70,t+.35);osc.connect(g);osc.start(t);osc.stop(t+.65);
 }catch{/* Audio is optional; a device policy must never block the board. */}}
 destroy(){this.ctx?.close().catch(()=>{});this.ctx=null;}
}
export class BoardScene{
 constructor(host,{theme='forest',orientation='portrait',sound=false,debug=false,onInteraction}={}){
  this.host=host;this.def=boardVariant(theme,orientation);this.dead=false;this.active=new Map();this.props=new Map();this.particles=[];this.frame=0;this.lastFrame=0;this.visible=true;this.fpsSamples=[];this.onInteraction=onInteraction;this.sound=new BoardSound();this.sound.set(sound);this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.motionChanged=()=>this.applyMotionPreference();this.motion.addEventListener('change',this.motionChanged);
  this.el=make('div','board-art');this.el.dataset.key=this.def.key;this.el.dataset.orientation=orientation;this.el.dataset.ready='false';this.el.dataset.debug=String(debug);this.el.style.setProperty('--scene-accent',this.def.accent);this.el.setAttribute('aria-label',`${this.def.faction}: ${this.def.name}, ${orientation} interactive battlefield`);this.el.boardController=this;host.append(this.el);
  const background=make('img','scene-background');background.alt='';background.draggable=false;background.src=new URL(`art/boards-anime/${this.def.key}-clean.webp`,document.baseURI).href;this.el.append(background);
  this.fx=make('canvas','scene-fx');this.fx.setAttribute('aria-hidden','true');this.ctx=this.fx.getContext('2d',{alpha:true});this.el.append(this.fx);this.status=make('div','scene-status');this.status.setAttribute('role','status');this.status.setAttribute('aria-live','polite');this.el.append(this.status);
  this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(this.el);this.io=new IntersectionObserver(entries=>{this.visible=entries[0]?.isIntersecting??false;this.schedule();});this.io.observe(this.el);this.visibility=()=>this.schedule();document.addEventListener('visibilitychange',this.visibility);
  this.ready=this.load().then(()=>{if(this.dead)return;this.resize();this.el.dataset.ready='true';this.el.dispatchEvent(new CustomEvent('scene-ready'));this.schedule();return this;}).catch(error=>{if(this.dead)return;this.el.dataset.error=error.message;this.status.textContent='Board artwork could not load. Reload to try again.';throw error;});
 }
 async load(){
  const source=await imageAsset(`art/boards-anime/${this.def.source}`);if(this.dead)return;
  const platform=maskSprite(source,[{d:this.def.platform}]);this.platform=make('canvas','scene-platform');this.platform.width=platform.width;this.platform.height=platform.height;this.platform.getContext('2d').drawImage(platform.canvas,0,0);this.position(this.platform,platform.bounds);this.platform.setAttribute('aria-hidden','true');this.el.append(this.platform);
  for(const prop of this.def.props){let sprite=spriteCache.get(`${this.def.key}:${prop.id}`);if(!sprite){sprite=maskSprite(source,prop.pieces);spriteCache.set(`${this.def.key}:${prop.id}`,sprite);if(spriteCache.size>12)spriteCache.delete(spriteCache.keys().next().value);}this.addProp(prop,sprite);}
  this.addAmbient(source);this.applyMotionPreference();
 }
 position(node,b){Object.assign(node.style,{left:`${b[0]/10}%`,top:`${b[1]/10}%`,width:`${b[2]/10}%`,height:`${b[3]/10}%`});}
 addProp(prop,sprite){
  const root=make('div',`scene-prop kind-${prop.kind}`);root.dataset.prop=prop.id;root.dataset.count='0';this.position(root,sprite.bounds);const motion=make('div','prop-motion'),breathe=make('div','prop-breathe');root.append(motion);motion.append(breathe);
  const canvas=make('canvas','prop-pixels');canvas.width=sprite.width;canvas.height=sprite.height;canvas.getContext('2d').drawImage(sprite.canvas,0,0);canvas.setAttribute('aria-hidden','true');breathe.append(canvas);
  const svg=document.createElementNS(NS,'svg');svg.classList.add('prop-hit');svg.setAttribute('viewBox',sprite.bounds.join(' '));svg.setAttribute('preserveAspectRatio','none');
  const state={...prop,sprite,root,motion,breathe,svg,animation:null,generation:0};
  for(const piece of prop.pieces){const path=document.createElementNS(NS,'path');path.setAttribute('d',piece.d);path.setAttribute('fill-rule','evenodd');path.setAttribute('fill',piece.stroke?'none':'transparent');path.setAttribute('stroke',piece.stroke?'transparent':'none');if(piece.stroke){path.setAttribute('stroke-width',piece.stroke);path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');}path.style.pointerEvents=piece.stroke?'stroke':'fill';path.setAttribute('role','button');path.setAttribute('tabindex','0');path.setAttribute('aria-label',prop.label);path.setAttribute('data-hit',prop.id);
   path.addEventListener('pointerdown',e=>{if(!this.hitClient(state,e.clientX,e.clientY))return;e.stopPropagation();state.down={x:e.clientX,y:e.clientY,time:performance.now()};});
   path.addEventListener('click',e=>{e.stopPropagation();e.stopImmediatePropagation();if(e.detail!==0&&!this.hitClient(state,e.clientX,e.clientY))return;if(state.down&&Math.hypot(e.clientX-state.down.x,e.clientY-state.down.y)>8)return;if(e.detail!==0&&state.down&&performance.now()-state.down.time>700)return;this.trigger(prop.id);});
   path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();this.trigger(prop.id);}});
   path.addEventListener('pointerenter',e=>{if(this.hitClient(state,e.clientX,e.clientY))root.dataset.hover='true';});path.addEventListener('pointermove',e=>{root.dataset.hover=String(this.hitClient(state,e.clientX,e.clientY));});path.addEventListener('pointerleave',()=>{root.dataset.hover='false';});svg.append(path);
  }
  breathe.append(svg);this.el.append(root);this.props.set(prop.id,state);
 }
 hitClient(state,x,y){const matrix=state.svg.getScreenCTM();if(!matrix)return false;const p=new DOMPoint(x,y).matrixTransform(matrix.inverse());return alphaAt(state.sprite,p.x,p.y)>=96;}
 hitTest(x,y){for(const p of [...this.props.values()].reverse())if(this.hitClient(p,x,y))return p.id;return null;}
 addAmbient(source){
  // Visual-only cutout strips share the same independent compositing model.
  const strips=this.def.theme==='forest'?[{d:'M 261 0 L 310 0 L 315 103 L 297 130 L 285 127 L 287 49 Z'},{d:'M 676 0 L 706 0 L 730 69 L 720 103 L 704 96 L 694 50 Z'}]:this.def.theme==='sunny'?[{d:'M 876 0 L 998 0 L 997 160 L 922 127 Z'}]:[];
  for(let i=0;i<strips.length;i++){const s=maskSprite(source,[strips[i]]),c=make('canvas','scene-ambient-sway');c.width=s.width;c.height=s.height;c.getContext('2d').drawImage(s.canvas,0,0);this.position(c,s.bounds);c.style.animationDelay=`${i*-3}s`;c.setAttribute('aria-hidden','true');this.el.append(c);}
  this.motes=Array.from({length:this.def.theme==='forest'?24:16},(_,i)=>({x:(i*197+37)%1000,y:(i*331+11)%1000,phase:i*2.399,speed:4+i%6,size:1+i%3}));
 }
 applyMotionPreference(){this.el.dataset.reducedMotion=String(this.motion.matches);this.schedule();}
 resize(){if(this.dead)return;const b=this.el.getBoundingClientRect();this.width=b.width;this.height=b.height;this.dpr=Math.min(devicePixelRatio||1,1.5);if(b.width>0&&b.height>0){this.fx.width=Math.round(b.width*this.dpr);this.fx.height=Math.round(b.height*this.dpr);}this.schedule();}
 setSound(enabled){this.sound.set(enabled);}
 setDebug(debug){this.el.dataset.debug=String(debug);}
 reparent(host){if(host===this.host&&this.el.parentNode===host)return;this.host=host;host.append(this.el);this.resize();}
 trigger(id){
  if(this.dead)return false;const p=this.props.get(id);if(!p)return false;
  p.generation++;const generation=p.generation;p.animation?.cancel();clearTimeout(p.timer);p.root.dataset.count=String(Number(p.root.dataset.count)+1);p.root.dataset.active='true';this.active.set(id,{started:performance.now(),duration:p.kind==='spider'?3200:1900,generation});this.particles=this.particles.filter(x=>x.owner!==id);
  const reduced=this.motion.matches,types={serpent:[[0,0,0,1],[.12,-.025,-4,1.035],[.03,-.01,2,1.02],[0,0,0,1]],scoreboard:[[0,0,0,1],[.003,0,0,1],[-.003,.002,0,1],[0,0,0,1]],scroll:[[0,0,0,1],[.05,-.025,-5,1.18],[.01,-.01,2,1.11],[0,0,0,1]],spider:[[0,0,0,1],[.018,.005,1,1.025],[-.012,-.005,-1,1.01],[0,0,0,1]],cannon:[[0,0,0,1],[.025,.04,5,.98],[-.008,-.01,-1,1.02],[0,0,0,1]],harpoon:[[0,0,0,1],[.035,.025,5,.99],[-.006,0,-1,1.01],[0,0,0,1]],monster:[[0,0,0,1],[.05,-.02,-3,1.04],[.01,.01,2,1.02],[0,0,0,1]],treasure:[[0,0,0,1],[0,-.04,-5,1.08],[0,-.01,2,1.025],[0,0,0,1]],training:[[0,0,0,1],[.025,0,6,1],[-.015,0,-4,1],[0,0,0,1]],cabinet:[[0,0,0,1],[.01,-.012,-2,1.04],[0,0,1,1.02],[0,0,0,1]],seal:[[0,0,0,1],[0,-.02,0,1.035],[0,-.007,0,1.01],[0,0,0,1]],ramen:[[0,0,0,1],[0,-.015,1,1.025],[0,-.005,-1,1.01],[0,0,0,1]],galley:[[0,0,0,1],[0,-.015,-1,1.03],[0,-.005,1,1.01],[0,0,0,1]],navigator:[[0,0,0,1],[0,-.015,5,1.035],[0,0,-3,1.01],[0,0,0,1]]};
  const frames=(types[p.kind]??types.treasure).map(([x,y,r,scale],i)=>({transform:reduced?'none':`translate(${x*100}%,${y*100}%) rotate(${r}deg) scale(${scale})`,filter:p.kind==='scoreboard'?`brightness(${[1,3.1,.5,1][i]}) saturate(${[1,2.5,.7,1][i]})`:`brightness(${[1,1.35,1.12,1][i]})`,offset:[0,.23,.57,1][i]}));
  p.animation=p.motion.animate(frames,{duration:reduced?450:1550,easing:'cubic-bezier(.2,.75,.2,1)',fill:'none'});p.animation.finished.catch(()=>{}).then(()=>{if(this.dead||p.generation!==generation)return;p.root.dataset.active='false';});
  this.burst(p,reduced?6:36);this.sound.play(p.kind);this.status.textContent=p.label;this.status.dataset.show='true';clearTimeout(this.statusTimer);this.statusTimer=setTimeout(()=>{if(!this.dead)this.status.dataset.show='false';},1600);
  this.el.dispatchEvent(new CustomEvent('board-interaction',{bubbles:false,detail:{board:this.def.key,id,kind:p.kind,count:Number(p.root.dataset.count)}}));this.onInteraction?.({board:this.def.key,id});this.schedule();return true;
 }
 burst(p,count){const [x,y]=p.anchor;for(let i=0;i<count;i++){const a=i*2.399;const smoke=['scroll','cannon','harpoon','ramen','galley'].includes(p.kind);this.particles.push({owner:p.id,x,y,vx:Math.cos(a)*(15+i%5*8),vy:smoke?-20-i%11*5:Math.sin(a)*(18+i%7*6),birth:performance.now(),life:smoke?1500:1000+i%5*100,r:smoke?4+i%7:1+i%4,color:smoke?'#ced2cb':p.kind==='treasure'?'#ffd76c':this.def.accent,smoke});}if(this.particles.length>112)this.particles.splice(0,this.particles.length-112);}
 schedule(){if(this.dead||this.frame)return;if(document.hidden||!this.visible||!this.el.isConnected)return;this.frame=requestAnimationFrame(t=>this.draw(t));}
 draw(now){this.frame=0;if(this.dead||document.hidden||!this.visible)return;
  const delta=this.lastFrame?now-this.lastFrame:16;this.lastFrame=now;if(delta<150){this.fpsSamples.push(delta);if(this.fpsSamples.length>120)this.fpsSamples.shift();}
  const c=this.ctx,w=this.width,h=this.height;if(!w||!h)return;const d=this.dpr;c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);c.save();
  // Effects can never cover the rectangular card-placement surface.
  const [px,py,pw,ph]=this.def.play;c.beginPath();c.rect(0,0,w,h);c.rect(px*w,py*h,pw*w,ph*h);c.clip('evenodd');
  if(!this.motion.matches){for(const mote of this.motes??[]){let x=(mote.x+Math.sin(now/6200+mote.phase)*13)/1000*w,y=((mote.y-now/1000*mote.speed)%1000+1000)%1000/1000*h;if(this.def.theme==='forest'){c.globalAlpha=.3+.4*(.5+.5*Math.sin(now/1200+mote.phase));c.fillStyle='#d4f881';c.shadowColor='#caff78';c.shadowBlur=5;c.beginPath();c.arc(x,y,mote.size*.55,0,Math.PI*2);c.fill();}else if(this.def.theme==='village'){c.globalAlpha=.4;c.fillStyle='#cfb764';c.beginPath();c.ellipse(x,y,2.3,1.1,now/4000+mote.phase,0,Math.PI*2);c.fill();}else{c.globalAlpha=.19;c.strokeStyle='#b7f6f9';c.lineWidth=.6;c.beginPath();c.arc(x,y,1.5+mote.size,0,Math.PI*2);c.stroke();}}}
  if(!this.motion.matches){for(const p of this.props.values()){const x=p.anchor[0]/1000*w,y=p.anchor[1]/1000*h,u=w/1000;
   if(p.kind==='scroll'||p.kind==='seal'){for(let i=0;i<6;i++){const phase=(now/3400+i/6)%1;c.globalAlpha=(1-phase)*.42;c.fillStyle=i%2?'#d6599b':'#a584ed';c.beginPath();c.arc(x+Math.sin(i*2.4+now/2400)*13*u,y-phase*48*u,(1+i%2)*u,0,Math.PI*2);c.fill();}}
   if(p.kind==='serpent'&&now%8500<450&&!this.active.has(p.id)){c.globalAlpha=Math.sin(now%8500/450*Math.PI)*.7;c.strokeStyle='#ce8791';c.lineWidth=Math.max(.7,u);c.beginPath();c.moveTo(x,y);c.lineTo(x+17*u,y+7*u);c.lineTo(x+22*u,y+4*u);c.moveTo(x+17*u,y+7*u);c.lineTo(x+21*u,y+11*u);c.stroke();}
  }}
  c.shadowBlur=0;c.globalAlpha=1;
  for(const [id,record] of this.active){const age=now-record.started,p=this.props.get(id),k=age/record.duration;if(k>=1){this.active.delete(id);continue;}this.special(c,p,k,w,h);}
  this.particles=this.particles.filter(p=>now-p.birth<p.life);for(const p of this.particles){const t=(now-p.birth)/p.life,seconds=(now-p.birth)/1000;c.globalAlpha=(1-t)*(p.smoke?.26:.85);c.fillStyle=p.color;const x=(p.x+p.vx*seconds)/1000*w,y=(p.y+p.vy*seconds)/1000*h;c.beginPath();c.arc(x,y,(p.r*(p.smoke?1+t*2:1))*w/1000,0,Math.PI*2);c.fill();}c.restore();c.globalAlpha=1;
  if(!this.motion.matches||this.active.size||this.particles.length)this.schedule();
 }
 special(c,p,t,w,h){const x=p.anchor[0]/1000*w,y=p.anchor[1]/1000*h,pulse=Math.sin(Math.PI*t),unit=w/1000;c.save();c.globalAlpha=pulse;
  if(p.kind==='scoreboard'){for(let i=0;i<5;i++){c.fillStyle=Math.sin(t*35-i*1.4)>.2?'#d9ff9c':'#6bba53';c.shadowColor='#b1ff83';c.shadowBlur=8;c.beginPath();c.arc(x+(i-2)*w*.011,y,2.5*unit+1,0,Math.PI*2);c.fill();}}
  else if(p.kind==='scroll'||p.kind==='seal'||p.kind==='cabinet'){c.strokeStyle='#eb547f';c.lineWidth=1.2;c.shadowColor='#ff235d';c.shadowBlur=12;c.beginPath();c.arc(x,y,28*unit*(1+t*.8),0,Math.PI*2);c.stroke();c.translate(x,y);c.rotate(t*2);for(let i=0;i<7;i++){c.rotate(Math.PI*2/7);c.strokeRect(22*unit,-3*unit,5*unit,7*unit);}}
  else if(p.kind==='spider'){c.strokeStyle='#c4dcc3';c.lineWidth=.7;for(let i=0;i<3;i++){c.beginPath();c.ellipse(x,y,(15+t*95+i*13)*unit,(12+t*73+i*10)*unit,-.4,0,Math.PI*2);c.stroke();}const sx=t<.5?w*(.93+.025*Math.sin(t*8)):w*(.955-.04*(t-.5)),sy=h*(.93-.63*Math.sin(Math.PI*t));this.spider(c,sx,sy,unit*12,t);for(let i=0;i<3;i++)this.spider(c,x+(i-1)*30*unit,y-Math.sin(t*Math.PI)*i*35*unit,unit*4,t+i);}
  else if(p.kind==='serpent'||p.kind==='monster'){c.translate(x,y);const open=Math.sin(clamp(t*2,0,1)*Math.PI)*unit*15;c.fillStyle='#15110c';c.strokeStyle='#aca872';c.lineWidth=unit*2;c.beginPath();c.moveTo(0,0);c.lineTo(24*unit,open);c.lineTo(7*unit,open+4*unit);c.closePath();c.fill();c.stroke();c.strokeStyle='#d48786';c.lineWidth=1;c.beginPath();c.moveTo(17*unit,open*.5);c.lineTo(35*unit,open*.7+5*unit);c.lineTo(41*unit,open*.7+2*unit);c.moveTo(35*unit,open*.7+5*unit);c.lineTo(40*unit,open*.7+10*unit);c.stroke();}
  else if(p.kind==='cannon'||p.kind==='harpoon'){c.fillStyle='#ffe5ad';c.shadowColor='#ffa74a';c.shadowBlur=20;c.beginPath();c.arc(x-18*unit,y-12*unit,18*unit*Math.pow(1-t,4),0,Math.PI*2);c.fill();}
  else if(p.kind==='navigator'){c.strokeStyle='#f4d993';c.lineWidth=1.4;c.beginPath();c.arc(x,y,(17+Math.sin(t*20)*3)*unit,0,Math.PI*2);c.stroke();c.translate(x,y);c.rotate(t*8);c.beginPath();c.moveTo(0,-13*unit);c.lineTo(5*unit,8*unit);c.lineTo(-4*unit,8*unit);c.closePath();c.stroke();}
  c.restore();
 }
 spider(c,x,y,size,t){c.save();c.translate(x,y);c.strokeStyle='#242429';c.fillStyle='#25242a';c.lineWidth=Math.max(1,size*.12);for(let i=0;i<4;i++)for(const side of [-1,1]){const wobble=Math.sin(t*35+i)*size*.15;c.beginPath();c.moveTo(0,(i-1.5)*size*.28);c.lineTo(side*size*(.8+i%2*.3),size*(i-1.7)*.8+wobble);c.lineTo(side*size*(1.1+i%2*.4),size*(i-1.5)*1.35);c.stroke();}c.beginPath();c.ellipse(0,size*.3,size*.47,size*.65,0,0,Math.PI*2);c.fill();c.fillStyle='#5b3d70';c.beginPath();c.arc(0,-size*.25,size*.28,0,Math.PI*2);c.fill();c.restore();}
 metrics(){const samples=this.fpsSamples;return {key:this.def.key,rafActive:!!this.frame,particles:this.particles.length,active:[...this.active.keys()],averageFrameMs:samples.length?samples.reduce((a,b)=>a+b,0)/samples.length:0,props:[...this.props.values()].map(p=>({id:p.id,count:Number(p.root.dataset.count),bounds:p.sprite.bounds,alphaPixels:p.sprite.alpha.length}))};}
 destroy(){if(this.dead)return;this.dead=true;cancelAnimationFrame(this.frame);this.frame=0;clearTimeout(this.statusTimer);this.ro.disconnect();this.io.disconnect();this.motion.removeEventListener('change',this.motionChanged);document.removeEventListener('visibilitychange',this.visibility);for(const p of this.props.values()){p.animation?.cancel();clearTimeout(p.timer);}this.sound.destroy();this.el.remove();this.props.clear();this.active.clear();this.particles=[];}
}
let activeScene=null;
export function mountScene(host,options){if(!host){activeScene?.destroy();activeScene=null;return null;}const key=`${options.theme}-${options.orientation}`;if(activeScene?.def.key===key&&!activeScene.dead){activeScene.reparent(host);activeScene.setSound(!!options.sound);activeScene.setDebug(!!options.debug);return activeScene;}activeScene?.destroy();activeScene=new BoardScene(host,options);activeScene.ready.catch(()=>{});return activeScene;}
export function currentScene(){return activeScene;}
