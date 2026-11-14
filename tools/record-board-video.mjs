// Records the actual production scene renderer with real pointer interactions.
// Requires optional Playwright + ffmpeg; does not add either to game runtime.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'dist','board-video');fs.mkdirSync(out,{recursive:true});
const base=process.env.BOARD_TEST_URL??'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});
const clips=[];
try{
 for(const [theme,orientation] of [['gourmet','landscape'],['cochlea','landscape'],['gourmet','portrait'],['cochlea','portrait']]){
  const portrait=orientation==='portrait',size=portrait?{width:720,height:1280}:{width:1280,height:720};
  const context=await browser.newContext({viewport:size,deviceScaleFactor:1,recordVideo:{dir:out,size}}),page=await context.newPage();
  await page.route('**/board-recording.html',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/src/boards/boards.css"><style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#100914}.board-stage{position:absolute!important;inset:0;margin:0!important;max-width:none!important;border:0!important;border-radius:0!important}.caption{position:fixed;z-index:40;left:26%;right:26%;bottom:1%;text-align:center;color:#e9d7af;background:#130e19cc;border:1px solid #a88d5b66;border-radius:22px;padding:7px 12px;font:12px Georgia;pointer-events:none}.cursor{position:fixed;z-index:45;left:0;top:0;width:26px;height:26px;border:1px solid #fff4d0;border-radius:50%;pointer-events:none;opacity:0;box-shadow:0 0 8px #eabc5e;transform:translate(-50%,-50%)}.cursor.click{animation:tap 550ms ease-out}@keyframes tap{0%{opacity:1;scale:.6}100%{opacity:0;scale:1.8}}</style></head><body><div class="board-stage" data-orientation="${orientation}"><div class="board-art-mount"></div></div><div class="caption">${theme==='gourmet'?'The Gourmet Restaurant':'CCG Cochlea Containment Facility'} · ${portrait?'Portrait':'Landscape'}</div><div class="cursor"></div><script type="module">import {BoardScene} from '/src/boards/scene.js';window.scene=new BoardScene(document.querySelector('.board-art-mount'),{theme:'${theme}',orientation:'${orientation}',quality:'high',sound:false});await scene.ready;scene.rig.rareEnabled=false;window.recordingReady=true;</script></body></html>`}));
  await page.goto(base+'/board-recording.html');await page.waitForFunction(()=>window.recordingReady);await page.waitForTimeout(1700);
  const ids=await page.evaluate(()=>[...scene.props.keys()]);
  for(const id of ids){
   const pt=await page.evaluate(id=>{const p=scene.props.get(id),r=scene.el.getBoundingClientRect();const list=[p.anchor];const [l,t,w,h]=p.sprite.bounds;for(let y=t+h*.2;y<t+h*.9;y+=h/10)for(let x=l+w*.2;x<l+w*.9;x+=w/10)list.push([x,y]);for(const [x,y] of list){const px=r.left+x/1000*r.width,py=r.top+y/1000*r.height;if(scene.hitTest(px,py)===id&&document.elementFromPoint(px,py)?.getAttribute('data-hit')===id)return {x:px,y:py};}throw Error('Hit not found '+id);},id);
   await page.mouse.move(pt.x,pt.y,{steps:12});await page.waitForTimeout(180);await page.evaluate(({x,y})=>{const c=document.querySelector('.cursor');c.style.left=x+'px';c.style.top=y+'px';c.classList.remove('click');void c.offsetWidth;c.classList.add('click');},pt);await page.mouse.click(pt.x,pt.y);
   await page.waitForTimeout(await page.evaluate(id=>scene.props.get(id).duration+350,id));
  }
  await page.waitForTimeout(700);const video=page.video();await context.close();const src=await video.path(),dest=path.join(out,`${theme}-${orientation}.mp4`);
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',src,'-vf','scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1','-r','30','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-an',dest]);clips.push(dest);console.log(`Recorded ${theme} ${orientation}`);
 }
}finally{await browser.close();}
const listing=path.join(out,'clips.txt');fs.writeFileSync(listing,clips.map(p=>`file '${p.replaceAll("'","'\\''")}'`).join('\n'));
const movie=path.join(root,'dist','Anime-Clash-Tokyo-Ghoul-Animated-Boards.mp4');execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',listing,'-c','copy','-movflags','+faststart',movie]);console.log(movie);
