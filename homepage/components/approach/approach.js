/* Approach: words turn black one by one as the section scrolls up */
(()=>{
const box=document.querySelector('.flow'),ws=[...box.querySelectorAll('.w')];
const upd=()=>{const r=box.getBoundingClientRect(),H=innerHeight,n=(H*.6-r.top-70)/(H*.05);ws.forEach((w,i)=>w.classList.toggle('on',i<n))};
addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
})();
