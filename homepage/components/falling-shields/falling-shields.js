/* FALLING GOLD SHIELDS
   Only in the gold look (html[data-variant="gold"], e.g. ?intro=gold or the random gold look).
   Every 5 seconds a handful of copies of the gold shield fall from the top of the screen over "Hello, again.",
   tumbling in 3D, and disappear below the screen. Tune the numbers below. Off for visitors who prefer reduced motion. */
(function () {
  var html = document.documentElement;
  if (html.getAttribute('data-variant') !== 'gold') return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var src = document.querySelector('.shield2 svg');            // the gold shield artwork (W + star) - cloned for every drop
  if (!src || !document.body.animate) return;

  var EVERY = 5000;                 // ms between drops
  var COUNT_MIN = 3, COUNT_MAX = 6; // shields per drop
  var SIZE_MIN = 46, SIZE_MAX = 120;// px width
  var FALL_MIN = 3600, FALL_MAX = 5800; // ms to fall

  var rain = document.createElement('div'); rain.className = 'rain'; rain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(rain);
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  function drop() {
    if (document.hidden || window.scrollY > innerHeight * .6) return;     // only while the first screen is on show
    var n = Math.round(rnd(COUNT_MIN, COUNT_MAX)), H = innerHeight, W = innerWidth;
    for (var i = 0; i < n; i++) {
      var size = rnd(SIZE_MIN, SIZE_MAX), el = document.createElement('div'); el.className = 'fs';
      el.style.width = size + 'px'; el.style.height = size * 1.2 + 'px';
      el.style.left = (50 + (Math.random() + Math.random() - 1) * 46) + '%';   // spread over the screen, a bit more in the middle where the text is
      el.style.marginLeft = (-size / 2) + 'px';
      el.appendChild(src.cloneNode(true));
      rain.appendChild(el);
      var drift = rnd(-70, 70), z0 = rnd(-25, 25), z1 = z0 + rnd(-60, 60), spins = Math.round(rnd(1, 3)) * 360 * (Math.random() < .5 ? -1 : 1);
      var a = el.animate([
        { transform: 'translate3d(0,' + (-size * 1.6) + 'px,0) rotateZ(' + z0 + 'deg) rotateY(' + rnd(-40, 40) + 'deg)' },
        { transform: 'translate3d(' + drift + 'px,' + (H + size * 1.6) + 'px,0) rotateZ(' + z1 + 'deg) rotateY(' + spins + 'deg)' }
      ], { duration: rnd(FALL_MIN, FALL_MAX), delay: i * 220 + rnd(0, 500), easing: 'cubic-bezier(.4,.05,.85,.6)', fill: 'both' });
      a.onfinish = (function (e) { return function () { e.remove(); }; })(el);
    }
  }

  function start() { setTimeout(drop, 900); setInterval(drop, EVERY); }
  if (html.classList.contains('revealed')) start();                    // gold intro: already revealed
  else { var mo = new MutationObserver(function () { if (html.classList.contains('revealed')) { mo.disconnect(); start(); } }); mo.observe(html, { attributes: true, attributeFilter: ['class'] }); }
})();
