/* Scroll-driven showreel transition.
   p = scroll progress (0..1) through the tall .story section; each step uses sm(start,end,p).
   Tweak pacing: change H in p=... (longer = slower) or the sm() ranges below. */
const $=q=>document.querySelector(q),panel=$('.panel'),say=$('.say'),btn=$('.play'),wash=$('.wash'),dim=$('.dim'),vid=$('#v');
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),sm=(a,b,x)=>{x=cl((x-a)/(b-a));return x*x*(3-2*x)};
const star=$('.mini .star'),STAR_DEG_PER_PX=.5; /* logo star: degrees turned per px scrolled (clockwise) */
function tick(){
  const W=innerWidth,H=innerHeight,y=scrollY,p=cl((y-(H-105))/(1.4*H)),m=W<760;
  if(star)star.style.transform='rotate('+(y*STAR_DEG_PER_PX)+'deg)';
  const S={l:W*.023,t:35,w:W*.954,h:H-82,r:24};
  const E=m?{l:W*.36,t:H*.6,w:W*.56,h:W*.32,r:12}:{l:W*.757,t:H*.485,w:W*.199,h:W*.112,r:14};
  const k=sm(0,.7,p),L=(a,b)=>a+(b-a)*k;
  Object.assign(panel.style,{left:L(S.l,E.l)+'px',top:L(S.t,E.t)+'px',width:L(S.w,E.w)+'px',height:L(S.h,E.h)+'px',borderRadius:L(S.r,E.r)+'px'});
  dim.style.opacity=.08*(1-sm(0,.3,p));
  wash.style.opacity=sm(.08,.3,p);
  document.body.classList.toggle('light',p>.2);
  document.body.classList.toggle('sc',y>H*.45);
  const t=sm(.4,.9,p);say.style.opacity=t;say.style.transform='translateY('+(H*.5*(1-t))+'px)';
  const b=sm(.8,.97,p);btn.style.opacity=b;btn.style.pointerEvents=b>.8?'auto':'none';btn.style.top=(E.t+E.h+18)+'px';
  let on=false;
  for(const [id,label] of [['#our-expertise','Our expertise'],['#approach','Our approach'],['#awards','Awards'],['#trust','Awards']]){const r=$(id).getBoundingClientRect();if(r.top<H*.5&&r.bottom>H*.4){on=true;$('.dock-exp b').textContent=label;break}}
  const wk=$('#work').getBoundingClientRect();const ins=$('#inside').getBoundingClientRect();document.body.classList.toggle('foot',ins.bottom<70);document.body.classList.toggle('dark',(wk.top<70&&wk.bottom>70)||ins.bottom<70);
  document.body.classList.toggle('exp',on);
  /* dock: full bar in hero + showreel, in offers + work, and from the end of Awards to the bottom of the page;
     "Our expertise" / "Our approach" / "Awards" label while in those sections */
  const full=['#offers','#work'].some(id=>{const q=$(id).getBoundingClientRect();return q.top<H*.6&&q.bottom>H*.4})||$('#awards').getBoundingClientRect().bottom<=H*.4;
  document.body.classList.toggle('nodock',!on&&!full&&$('.story').getBoundingClientRect().bottom<=H*.6);
}
$('.dock-x').addEventListener('click',()=>document.body.classList.add('exp-closed'));
addEventListener('scroll',()=>requestAnimationFrame(tick),{passive:true});addEventListener('resize',tick);tick();
btn.addEventListener('click',()=>{vid.muted=false;vid.currentTime=0;vid.play();(vid.requestFullscreen||vid.webkitRequestFullscreen||(()=>{})).call(vid)});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)vid.muted=true});
if(matchMedia('(prefers-reduced-motion:reduce)').matches)vid.pause();

/* Dock sizing: the dock has two layers (.dock-links / .dock-exp). We measure the active one and set the dock's
   width/height, so CSS transitions can animate the morph between the full dock and the "Learn more" pill. */
(()=>{
const dock=$('.dock'),links=$('.dock-links'),exp=$('.dock-exp');
let last='';
const size=()=>{const isExp=document.body.classList.contains('exp')&&!document.body.classList.contains('exp-closed');
  const l=isExp?exp:links,v=(l.offsetWidth+2)+'px '+(l.offsetHeight+2)+'px';
  if(v===last)return;last=v;const [w,h]=v.split(' ');dock.style.width=w;dock.style.height=h};
new MutationObserver(size).observe(document.body,{attributes:true,attributeFilter:['class']});
if(window.ResizeObserver){const ro=new ResizeObserver(size);ro.observe(links);ro.observe(exp)}
addEventListener('resize',size);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(size);
size();
})();
