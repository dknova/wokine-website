/* Awards: draw the crown and the circle when the section scrolls into view */
(()=>{
const sec=document.querySelector('.awards-sec');sec.classList.add('anim');
const nums=[...sec.querySelectorAll('[data-to]')],calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
let counted=false;
if(!calm)nums.forEach(n=>n.textContent='x'+n.dataset.from);
const count=()=>{if(counted||calm)return;counted=true;const t0=performance.now(),D=1600;
  const step=t=>{const p=Math.min(1,(t-t0)/D),e=1-Math.pow(1-p,3);
    nums.forEach(n=>{const a=+n.dataset.from,b=+n.dataset.to;n.textContent='x'+Math.round(a+(b-a)*e)});
    if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)};
new IntersectionObserver(([e])=>{sec.classList.toggle('in',e.isIntersecting);if(e.isIntersecting)count()},{threshold:.35}).observe(sec);
})();
