/* Inside: cards start tilted and straighten as the section scrolls up; footer video reuses the showreel file */
(()=>{
const sec=document.querySelector('#inside'),duo=sec.querySelector('.duo');
let target=0,cur=null,raf=0;
/* giant "Inside us" rows: no endless animation any more - they slide sideways only while you scroll (SPEED px per px scrolled).
   Row 1 slides left, row 2 slides right; the 2nd half of each row repeats the 1st, so wrapping at half the width is seamless. */
const rows=[...sec.querySelectorAll('.bgrow')],SPEED=.6;
let tx=0,tcur=null;
const calc=()=>{const r=sec.getBoundingClientRect(),H=innerHeight,top=r.top+parseFloat(getComputedStyle(sec).paddingTop),x=Math.min(1,Math.max(0,(top-H*.1)/(H*.85)));return x*x*(3-2*x)};
/* one "Inside us" unit = the row's first child; add copies until the row is wider than the screen + one unit, so no gap ever shows */
const fill=()=>rows.forEach(row=>{const u=row.firstElementChild;if(!u)return;let n=0;while(row.offsetWidth<innerWidth*1.3+u.offsetWidth&&n++<40)row.appendChild(u.cloneNode(true))});
const place=()=>{rows.forEach((row,i)=>{const u=row.firstElementChild.offsetWidth||1,o=(((tcur*SPEED)%u)+u)%u;row.style.transform='translate3d('+(i%2?-u+o:-o).toFixed(2)+'px,0,0)'})};
fill();addEventListener('resize',fill);
/* smoothing: time-based easing (same feel on 60 / 120 / 144 Hz screens). EASE = how fast it catches up to the scroll (bigger = snappier, smaller = floatier) */
const EASE=5;let last=0;
const loop=now=>{const dt=Math.min(.05,(now-(last||now))/1000)||.016;last=now;const k=1-Math.exp(-EASE*dt);
  cur+=(target-cur)*k;if(Math.abs(target-cur)<.0005)cur=target;duo.style.setProperty('--t',cur.toFixed(4));
  tcur+=(tx-tcur)*k;if(Math.abs(tx-tcur)<.05)tcur=tx;place();
  if(cur===target&&tcur===tx){raf=0;last=0}else raf=requestAnimationFrame(loop)};
const upd=()=>{target=calc();tx=-sec.getBoundingClientRect().top;if(cur===null){cur=target;tcur=tx}if(!raf)raf=requestAnimationFrame(loop)};
addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
const fv=document.getElementById('fv'),src=document.getElementById('v').currentSrc||document.getElementById('v').src;if(src){fv.src=src}
if(matchMedia('(prefers-reduced-motion:reduce)').matches)fv.pause();
document.querySelector('.f-btn').addEventListener('click',()=>{const v=document.getElementById('v');v.muted=false;v.currentTime=0;v.play();(v.requestFullscreen||v.webkitRequestFullscreen||(()=>{})).call(v)});
})();
