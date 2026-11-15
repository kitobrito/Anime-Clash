// Collection building uses native desktop drag and a hold/drag gesture on touch.
// Battle input is the original Shattered Realms drag.js, kept separate from this.
export function bindDeckDrag(root,{add,name}){
 const target=root.querySelector('.deck-panel');if(!target)return;
 let id=null,timer=null,start=null,active=false,ghost=null,tray=null;
 const cleanup=()=>{clearTimeout(timer);id=null;active=false;ghost?.remove();tray?.remove();ghost=tray=null;target.classList.remove('deck-drop-over');document.body.classList.remove('building-drag');};
 const canDrop=(x,y)=>[target,tray].filter(Boolean).some(e=>{const r=e.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;});
 for(const card of root.querySelectorAll('[data-build-card]')){
  card.draggable=!matchMedia('(pointer:coarse)').matches;card.style.webkitTouchCallout='none';card.style.userSelect='none';card.oncontextmenu=e=>e.preventDefault();card.addEventListener('pointerdown',e=>{card.draggable=e.pointerType!=='touch';});
  card.ondragstart=e=>{if(e.target.closest('button')){e.preventDefault();return;}id=card.dataset.buildCard;e.dataTransfer.setData('text/anime-card',id);e.dataTransfer.effectAllowed='copy';target.classList.add('deck-drop-over');};
  card.ondragend=cleanup;
  card.addEventListener('touchstart',e=>{if(e.touches.length!==1||e.target.closest('button'))return;start={x:e.touches[0].clientX,y:e.touches[0].clientY};id=card.dataset.buildCard;timer=setTimeout(()=>{active=true;document.body.classList.add('building-drag');ghost=document.createElement('div');ghost.className='deck-drag-ghost';ghost.textContent=name(id);document.body.append(ghost);tray=document.createElement('div');tray.className='deck-touch-drop';tray.textContent='Drop here to add to your deck';document.body.append(tray);ghost.style.left=start.x+'px';ghost.style.top=start.y+'px';},350);},{passive:true});
  card.addEventListener('touchmove',e=>{if(!start||!id)return;const t=e.touches[0];if(!active){if(Math.hypot(t.clientX-start.x,t.clientY-start.y)>10)cleanup();return;}e.preventDefault();ghost.style.left=t.clientX+'px';ghost.style.top=t.clientY+'px';tray.classList.toggle('over',canDrop(t.clientX,t.clientY));},{passive:false});
  card.addEventListener('touchend',e=>{const t=e.changedTouches[0],chosen=active&&id&&canDrop(t.clientX,t.clientY)?id:null;if(active)e.preventDefault();cleanup();start=null;if(chosen)add(chosen);},{passive:false});
  card.addEventListener('touchcancel',cleanup,{passive:true});
 }
 target.ondragover=e=>{if(id||e.dataTransfer.types.includes('text/anime-card')){e.preventDefault();e.dataTransfer.dropEffect='copy';target.classList.add('deck-drop-over');}};
 target.ondrop=e=>{e.preventDefault();const chosen=e.dataTransfer.getData('text/anime-card');cleanup();if(chosen)add(chosen);};
}
