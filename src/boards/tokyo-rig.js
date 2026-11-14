import {clamp,ParticlePool} from './environment.js';
const TAU=Math.PI*2;
const bell=(t,a,b)=>Math.sin(clamp((t-a)/(b-a))*Math.PI);
const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
const glow=(c,x,y,r,color,alpha=1)=>{c.save();c.globalAlpha*=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();};
const RECIPES={
 cloche:[['none',0],['translateX(-1%) rotate(-1deg)',.045],['translateX(1%) rotate(1deg)',.09],['translateY(-48%) rotate(-4deg)',.28],['translateY(-48%) rotate(2deg)',.62],['translateY(0)',.94],['none',1]],
 mask:[['none',0],['rotateY(-8deg) rotate(-2deg)',.13],['rotateY(26deg) rotate(4deg)',.37],['rotateY(22deg) rotate(-3deg)',.55],['rotateY(26deg) rotate(2deg)',.64],['none',1]],
 chains:[['none',0],['rotate(-1deg)',.06],['rotate(2deg)',.13],['rotate(-7deg)',.28],['rotate(5deg)',.46],['rotate(-3deg)',.65],['rotate(1deg)',.84],['none',1]],
 door:[['none',0],['translateX(-1%)',.045],['translateX(1%)',.09],['perspective(400px) rotateY(-65deg)',.35],['perspective(400px) rotateY(-65deg)',.72],['perspective(400px) rotateY(2deg)',.94],['none',1]],
 weapon:[['none',0],['translateY(-1%)',.12],['translateX(-1%)',.26],['translateX(1%)',.3],['translateX(-1%)',.34],['translateX(1%)',.38],['translateY(-2%)',.6],['none',1]],
 ghoul:[['none',0],['translateX(-2%) scale(.98)',.15],['translateX(-6%) scale(1.09)',.32],['translateX(-7%) scale(1.12)',.35],['translateX(-3%) scale(1.06)',.46],['translateX(-6%) scale(1.1)',.58],['translateX(1%) scale(.97)',.85],['none',1]],
 lever:[['none',0],['rotate(-5deg)',.08],['rotate(26deg)',.23],['rotate(26deg)',.73],['rotate(-2deg)',.94],['none',1]],
 specimen:[['none',0],['scale(.97)',.1],['scale(1.08,1.03)',.26],['scale(1.15,1.04) rotate(-4deg)',.47],['scale(1.07,1.08) rotate(3deg)',.64],['scale(.99)',.9],['none',1]],
};
// Only independently extracted object pixels move. Background patches are clipped
// to the exact removed pieces; the user's central battlefield is never repainted.
export class TokyoRig{
 constructor(scene,cut){this.scene=scene;this.cut=cut;this.nodes=[];this.records=new Map();this.pool=new ParticlePool(scene.quality.particles);this.elapsed=0;this.last=null;this.nextRare=this.rareDelay();this.rareEnabled=true;this.rare=null;this.busy=false;}
 rareDelay(){const r=this.scene.def.rare;return r.minDelay+Math.random()*(r.maxDelay-r.minDelay);}
 mount(source,plate){
  const s=this.scene,defs=[...s.def.props.flatMap(p=>p.parts.map(d=>({...d,owner:p.id}))),...s.def.ambient];
  const bg=document.createElement('canvas');bg.className='scene-background';bg.width=source.naturalWidth;bg.height=source.naturalHeight;const c=bg.getContext('2d');c.drawImage(source,0,0);c.save();c.scale(bg.width/1000,bg.height/1000);const holes=new Path2D();for(const d of defs)holes.addPath(new Path2D(d.d));c.clip(holes);c.drawImage(plate,0,0,1000,1000);c.restore();s.el.querySelector('.scene-background').replaceWith(bg);
  for(const p of s.props.values()){
   const canvas=p.breathe.querySelector('.prop-pixels'),ctx=canvas.getContext('2d');ctx.save();ctx.globalCompositeOperation='destination-out';ctx.setTransform(p.sprite.scale[0],0,0,p.sprite.scale[1],-p.sprite.bounds[0]*p.sprite.scale[0],-p.sprite.bounds[1]*p.sprite.scale[1]);for(const d of defs)ctx.fill(new Path2D(d.d));ctx.restore();
  }
  for(const def of defs){const sprite=this.cut(source,[{d:def.d}]),node=document.createElement('canvas');node.className='environment-piece';node.dataset.piece=def.id;node.width=sprite.width;node.height=sprite.height;node.getContext('2d').drawImage(sprite.canvas,0,0);node.style.transformOrigin=def.origin;s.position(node,sprite.bounds);s.el.append(node);this.nodes.push({def,node,sprite,animation:null});}
  this.prepared=true;
 }
 trigger(p,now,rare=false){
  const s=this.scene,reduced=s.motion.matches,duration=reduced?450:p.duration;
  const record={p,start:now,duration,stages:new Set(),rare};this.records.set(p.id,record);
  for(const n of this.nodes.filter(n=>n.def.owner===p.id)){
   n.animation?.cancel();const frames=reduced?[{opacity:1},{opacity:.82},{opacity:1}]:(RECIPES[n.def.motion]??RECIPES.mask).map(([transform,offset])=>({transform,offset}));
   n.animation=n.node.animate(frames,{duration,easing:'cubic-bezier(.35,0,.25,1)',fill:'none'});n.animation.finished.catch(()=>{});
  }
  return duration;
 }
 setActivity(busy){this.busy=busy;}
 pause(paused){this.last=null;if(paused&&this.pausedAt==null)this.pausedAt=performance.now();if(!paused&&this.pausedAt!=null){const delay=performance.now()-this.pausedAt;for(const r of this.records.values())r.start+=delay;this.pausedAt=null;}for(const n of this.nodes)if(n.animation?.playState==='running'||n.animation?.playState==='paused')paused?n.animation.pause():n.animation.play();}
 clear(){for(const n of this.nodes){n.animation?.cancel();n.animation=null;n.node.style.transform='';n.node.style.opacity='';}this.records.clear();this.pool.clear();this.rare=null;this.last=null;}
 draw(c,now,w,h){
  const s=this.scene,reduced=s.motion.matches,gourmet=s.def.theme==='gourmet';
  const dt=this.last?Math.min(50,now-this.last):0;this.last=now;if(!reduced&&!this.busy)this.elapsed+=dt;
  if(this.rareEnabled&&!reduced&&!this.busy&&this.elapsed>=this.nextRare&&!this.records.size){this.nextRare=this.elapsed+this.rareDelay();this.rare={start:now};this.trigger(s.props.get(gourmet?'masks':'cell'),now,true);s.el.dispatchEvent(new CustomEvent('board-rare-event',{detail:{id:s.def.rare.id}}));}
  const t=this.elapsed/1000,scale=.001*w;
  if(!reduced&&!this.busy){
   for(const n of this.nodes){if(n.def.owner&&this.records.has(n.def.owner))continue;
    if(n.def.motion==='chandelier')n.node.style.transform=`rotate(${Math.sin(t*.63)*.65}deg)`;
    if(n.def.motion==='curtain')n.node.style.transform=`skewX(${Math.sin(t*.42+.7)*.38}deg)`;
    if(n.def.motion==='specimen')n.node.style.transform=`scale(${1+.009*Math.sin(t*1.8)})`;
    if(n.def.motion==='ghoul')n.node.style.transform=`translateX(${Math.sin(t*.6)*.6}%)`;
   }
   this.ambient(c,t,w,h,gourmet);
  }
  for(const [id,r] of this.records){const v=(now-r.start)/r.duration;if(v>=1){this.records.delete(id);const prop=s.props.get(id);if(prop)prop.root.dataset.active='false';continue;}
   const p=r.p,x=p.anchor[0]/1000*w,y=p.anchor[1]/1000*h;
   if(reduced){glow(c,x,y,27*scale,s.def.accent,bell(v,0,1)*.3);continue;}
   for(const [stage,type,color] of [[.17,p.sequence==='cloche'?'mist':p.sequence==='specimen'?'bubble':'spark',gourmet?'#ffce86':'#bcefff'],[.38,p.sequence==='cloche'?'mist':p.sequence==='specimen'?'bubble':'electric',gourmet?'#e43a69':'#c0f4ff']])if(v>=stage&&!r.stages.has(stage)){r.stages.add(stage);this.pool.emit(type,p.anchor[0],p.anchor[1],s.quality.name==='low'?8:16,now,color);}
   this.special(c,p,v,w,h,r.rare);
  }
  this.pool.draw(c,now,w,h);
 }
 ambient(c,t,w,h,gourmet){
  const s=this.scene,[W,H]=s.def.size,u=w/W,v=h/H;
  for(let i=0;i<s.def.lights.length;i++){const [x,y]=s.def.lights[i],pulse=.15+.07*Math.sin(t*(1.1+i*.19)+i*2.7)+.025*Math.sin(t*19+i);glow(c,x*u,y*v,(gourmet?27:20)*u,gourmet?'#ffc67e':'#ff245d',pulse);}
  // Light dust, steam and mist are deterministic and bounded, with no allocations per mote.
  const n=s.quality.name==='low'?8:18;
  for(let i=0;i<n;i++){const f=(t*(gourmet?.017:.026)+i*.618)%1,x=(i*137.5+Math.sin(t*.17+i)*26)%1000,y=gourmet?1000-f*160:1000-f*230;
   c.save();c.globalAlpha=Math.sin(f*Math.PI)*(gourmet?.045:.055);c.fillStyle=gourmet?'#dc1b4e':'#c6e9fa';c.beginPath();c.ellipse(x/1000*w,y/1000*h,(gourmet?64:34)*w/1000,16*h/1000,0,0,TAU);c.fill();c.restore();
   if(gourmet){c.save();c.globalAlpha=.12+.12*Math.sin(t+i);c.fillStyle='#ffe1a1';c.beginPath();c.arc(((i*71+Math.sin(t*.13+i)*9)%1000)/1000*w,((i*21+t*2)%245)/1000*h,Math.max(.35,u*.8),0,TAU);c.fill();c.restore();}
  }
  if(gourmet){
   // Distant spectators' eye glints stay on the actual balcony faces.
   const eyes=s.def.orientation==='landscape'?[[80,32],[1114,23],[263,57]]:[[72,28],[644,28],[160,58]];
   const phase=t%31;for(let i=0;i<eyes.length;i++)if(phase>19+i*1.2&&phase<19.7+i*1.2){const a=Math.sin((phase-19-i*1.2)/.7*Math.PI);for(const d of [-3,3])glow(c,(eyes[i][0]+d)*u,eyes[i][1]*v,3.5*u,'#ff0b37',a*.8);}
  }else{
   // Moving traces are clipped to monitor screens; no invented readable text.
   const portrait=s.def.orientation==='portrait',rects=portrait?[[6,1054,48,46],[73,1065,46,38],[180,1134,28,22]]:[[6,483,42,45],[75,506,38,47],[178,557,24,20]];
   for(let j=0;j<rects.length;j++){const [x,y,rw,rh]=rects[j];c.save();c.beginPath();c.rect(x*u,y*v,rw*u,rh*v);c.clip();c.globalAlpha=.24;c.strokeStyle='#64dfff';c.lineWidth=.7;for(let i=0;i<3;i++){c.beginPath();for(let k=0;k<20;k++){const px=(x+k/19*rw)*u,py=(y+rh*(.23+i*.25)+Math.sin(k*.7+t*(2+j)+i)*rh*.05)*v;k?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}c.restore();}
   if(Math.sin(t*.23+1)> .998){const x=s.def.orientation==='portrait'?350:640;glow(c,x*u,18*v,100*u,'#d9faff',.15);}
  }
 }
 special(c,p,t,w,h,rare){
  const s=this.scene,x=p.anchor[0]/1000*w,y=p.anchor[1]/1000*h,u=w/s.def.size[0],v=h/s.def.size[1],a=bell(t,.1,.94);
  c.save();c.globalAlpha=a;
  if(p.sequence==='cloche'){glow(c,x,y+6*v,45*u,'#ed164d',.65);c.fillStyle='#2a0718';c.beginPath();c.ellipse(x,y+2*v,17*u,5*v,0,0,TAU);c.fill();glow(c,x,y,19*u,'#ff6b99',.4);}
  if(p.sequence==='mask'){glow(c,x,y,40*u,'#bb174a',.28);for(const dx of [-10,10])glow(c,x+dx*u,y,6*u,'#ff123f',.95);if(rare)for(const other of [-61,59,104])glow(c,x+other*u,y+9*v,7*u,'#ff2145',.8);c.fillStyle='#170515';c.globalAlpha=a*.18;c.beginPath();c.ellipse(x+Math.sin(t*5)*35*u,y-19*v,38*u,58*v,-.2,0,TAU);c.fill();}
  if(p.sequence==='chains'){glow(c,x,y,75*u,'#ffd483',.45*Math.sin(t*27)**2);c.fillStyle='#0d0214';c.globalAlpha=a*.08;c.fillRect(0,0,w,h);}
  if(p.sequence==='door'){
   const b=s.def.orientation==='landscape'?{x:1251,y:401,w:28,h:265}:{x:657,y:1027,w:62,h:227};
   c.save();c.beginPath();c.rect(b.x*u,b.y*v,b.w*u,b.h*v);c.clip();glow(c,(b.x+6)*u,(b.y+b.h*.6)*v,b.h*.5*v,'#fc1741',.65);
   const visible=bell(t,.27,.82);c.globalAlpha=visible;for(let i=0;i<3;i++)for(const dx of [-3,3])glow(c,(b.x+b.w*.55+dx+Math.sin(t*4+i)*2)*u,(b.y+58+i*44)*v,3*u,'#ff1a3e');c.restore();
  }
  if(p.sequence==='quinque'){this.arc(c,x-52*u,y-13*v,x+61*u,y+18*v,t,u);glow(c,x,y,70*u,'#64bcff',.24);}
  if(p.sequence==='containment'){
   const pulse=bell(t,.22,.53);glow(c,x,y,72*u,'#ff1649',pulse*.45);this.arc(c,x-46*u,y-43*v,x+52*u,y+47*v,t,u);
   c.strokeStyle='#9ceaff';c.lineWidth=2*u;c.globalAlpha=pulse*.7;c.beginPath();c.ellipse(x,y,(8+t*65)*u,(8+t*63)*v,0,0,TAU);c.stroke();if(rare)this.arc(c,x+58*u,y-50*v,x-44*u,y+55*v,t+.4,u);
  }
  if(p.sequence==='lockdown'){const flash=.2+.25*Math.sin(t*39)**2;glow(c,x,y-12*v,75*u,'#ff2247',flash);c.fillStyle='#ff183e';c.globalAlpha=flash*.4;const portrait=s.def.orientation==='portrait';for(const [px,py,rw,rh] of portrait?[[5,1055,48,43],[73,1065,46,38]]:[[6,483,42,45],[75,506,38,47]])c.fillRect(px*u,py*v,rw*u,rh*v);
   const shut=portrait?{x:306,y:164,w:79,h:80}:{x:604,y:111,w:89,h:76},close=ease((t-.14)/.19)*(1-ease((t-.72)/.2));c.save();c.beginPath();c.rect(shut.x*u,shut.y*v,shut.w*u,shut.h*v);c.clip();c.globalAlpha=.65;for(let i=0;i<8;i++){const yy=(shut.y-shut.h+close*shut.h+i*shut.h/8)*v;c.fillStyle=i%2?'#253947':'#405666';c.fillRect(shut.x*u,yy,shut.w*u,shut.h/8*v-1);}c.restore();}
  if(p.sequence==='specimen'){glow(c,x,y,65*u,'#ff134f',.42+.2*Math.sin(t*31));this.arc(c,x-36*u,y+70*v,x-74*u,y+55*v,t,u);c.strokeStyle='#ff719d';c.lineWidth=1.5*u;c.beginPath();c.moveTo(x-52*u,y+88*v);c.bezierCurveTo(x-99*u,y+83*v,x-87*u,y+8*v,x-47*u,y+10*v);c.stroke();}
  c.restore();
 }
 arc(c,x,y,x2,y2,t,u){c.save();c.strokeStyle='#c6f8ff';c.shadowColor='#38adff';c.shadowBlur=8*u;c.lineWidth=1.4*u;c.beginPath();c.moveTo(x,y);for(let i=1;i<9;i++){const k=i/8;c.lineTo(x+(x2-x)*k+Math.sin(i*9+t*180)*5*u,y+(y2-y)*k+Math.cos(i*5+t*120)*4*u);}c.stroke();c.restore();}
 destroy(){this.clear();for(const n of this.nodes)n.node.remove();this.nodes=[];}
}
