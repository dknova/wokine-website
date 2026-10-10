/* HERO VARIANTS: a different hero look on every refresh, applied AFTER the (identical) entry animation.
   1. This runs in <head>: it picks a look and stores it as  <html data-variant="...">.
      Nothing changes visually yet, so every refresh plays the exact same dark intro animation.
   2. When the intro has finished, it adds the class "revealed" to <html>; the CSS in hero-variants.css
      then fades the page into the chosen look (background, text colour, shield).
   - never repeats the previous look (remembered in localStorage when available)
   - force one while testing:  index.html?variant=gold   (silver | gold | lime)
   Add a look: add its name to V below + a block in hero-variants.css. */
(function () {
  var V = ['silver', 'gold', 'lime'], KEY = 'homepage-variant', INTRO_MS = 5600, last = -1, i;
  var html = document.documentElement;
  /* ?intro=gold  ->  white page + gold shield swinging in 3D from the first frame (no dark intro, no random look). Default = dark intro. */
  if (/[?&]intro=gold/.test(location.search)) {
    html.setAttribute('data-intro', 'gold');
    html.setAttribute('data-variant', 'gold');
    html.classList.add('revealed');
    /* the showreel video panel stays hidden on the first screen (the coloured strips take its place) until the first scroll */
    var moved = function () { html.classList.add('moved'); removeEventListener('scroll', moved); };
    addEventListener('scroll', moved, { passive: true });
    addEventListener('DOMContentLoaded', function () { if (window.scrollY > 2) moved(); });
    return;
  }
  var m = location.search.match(/[?&]variant=(\w+)/);
  try { last = parseInt(localStorage.getItem(KEY), 10); } catch (e) {}
  if (m && V.indexOf(m[1]) > -1) {
    i = V.indexOf(m[1]);
  } else {
    do { i = Math.floor(Math.random() * V.length); } while (V.length > 1 && i === last);
  }
  try { localStorage.setItem(KEY, i); } catch (e) {}
  html.setAttribute('data-variant', V[i]);

  /* reveal after the intro (immediately if motion is reduced or the page was opened already scrolled) */
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  function reveal() {
    html.classList.add('revealing', 'revealed');
    setTimeout(function () { html.classList.remove('revealing'); }, 1600);
  }
  function start() { if (calm || window.scrollY > 40) reveal(); else setTimeout(reveal, INTRO_MS); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
