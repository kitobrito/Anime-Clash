// Rendering-independent interaction policy and bounded particle storage.
export const CORNERS=['top-left','top-right','bottom-left','bottom-right'];
export const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export function boardPoint(x,y,rect){return [(x-rect.left)/rect.width*1000,(y-rect.top)/rect.height*1000];}
export function validateEnvironment(def){
 const errors=[];
 for(const orientation of ['landscape','portrait']){
  const v=def[orientation];if(!v){errors.push(`Missing ${orientation}`);continue;}
  const props=v.props??[];
  if(props.filter(p=>p.primary!==false).length!==4)errors.push(`${orientation}: exactly four primary objects required`);
  for(const corner of CORNERS)if(props.filter(p=>p.corner===corner).length!==1)errors.push(`${orientation}: missing or duplicate ${corner}`);
  for(const p of props)if(!p.pieces?.length||!p.sequence||!p.cooldown||!p.duration)errors.push(`${orientation}: incomplete ${p.id}`);
 }
 return errors;
}
export class InteractionGate{
 constructor(){this.until=new Map();}
 take(id,now,duration,cooldown){if(now<(this.until.get(id)??0))return false;this.until.set(id,now+duration+cooldown);return true;}
 clear(){this.until.clear();}
}
export function qualityProfile(level='auto',device={}){
 const low=level==='low'||level==='auto'&&((device.memory??8)<=4||(device.cores??8)<=4);
 return {name:low?'low':'high',fps:low?30:60,particles:low?36:80,dpr:low?1:1.5};
}
export class ParticlePool{
 constructor(capacity=80){this.items=[];this.setCapacity(capacity);this.emitted=0;}
 setCapacity(capacity){this.capacity=capacity;this.items.length=Math.min(this.items.length,capacity);while(this.items.length<capacity)this.items.push({live:false});}
 emit(kind,x,y,count,now,color='#ffd8a0',random=Math.random){
  for(let i=0;i<count;i++){
   const p=this.items.find(p=>!p.live);if(!p)break;
   const angle=random()*Math.PI*2,speed=12+random()*32;
   Object.assign(p,{live:true,kind,x,y,vx:Math.cos(angle)*speed,vy:kind==='mist'||kind==='steam'||kind==='bubble'?-8-random()*24:Math.sin(angle)*speed,birth:now,life:kind==='mist'||kind==='steam'?1700:650+random()*700,r:kind==='mist'||kind==='steam'?8+random()*16:1+random()*2.5,color});this.emitted++;
  }
 }
 draw(c,now,w,h){
  for(const p of this.items){if(!p.live)continue;const t=(now-p.birth)/p.life;if(t>=1){p.live=false;continue;}const sec=(now-p.birth)/1000,x=(p.x+p.vx*sec)/1000*w,y=(p.y+p.vy*sec)/1000*h,r=p.r*w/1000;
   c.save();c.globalAlpha=(1-t)*(p.kind==='mist'||p.kind==='steam'?.13:.8);c.fillStyle=c.strokeStyle=p.color;c.lineWidth=Math.max(.5,w/1000);
   if(p.kind==='spark'||p.kind==='electric'){c.beginPath();c.moveTo(x,y);c.lineTo(x-p.vx*w/18000,y-p.vy*h/18000);c.stroke();}
   else {c.beginPath();c.arc(x,y,r*(p.kind==='mist'||p.kind==='steam'?1+t*2:1),0,Math.PI*2);p.kind==='bubble'?c.stroke():c.fill();}c.restore();
  }
 }
 clear(){for(const p of this.items)p.live=false;}
 get size(){return this.items.filter(p=>p.live).length;}
}
