/* HERO INTRO: the complete shield is there from the start, but only its TOP part is visible (sitting where the
   old prismatic bar was), bent toward the viewer. It slides up into place while the clip window opens downward,
   and - like the 3D logo in the reference video - it is a thick object that swings left/right in 3D and settles.
     0.5s-2.1s  starting frame = the straight silver slab beside "again." / below "Hello," (.slab in hero.css, shield seen edge-on)
     2s       the words part;  2.1s-2.9s the slab travels to the slot centre;  2.8s-3.1s the 3D shield (top part, bent toward the viewer) takes over
     2.6s-3.9s  slides up into position + reveals W, star and the rest   (words slide apart at 2s - see .slot in hero.css)
     2.6s-5.4s  3D swing (yaw) that dies out; the shield has real thickness (stacked copies, see .depth in hero.css)
     3.9s       prismatic rim hands over to the metal rim (CSS: .prism / .metal)                                     */
(function () {
  var svg = document.querySelector('.hero .shield svg');
  if (!svg || (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches)) return;
  var g = svg.querySelector('#sg'), rect = svg.querySelector('#rvr'), holder = svg.parentNode;   // holder = .shield (gets the 3D transform)
  if (!g || !rect) return;
  if (document.documentElement.getAttribute('data-intro') === 'gold') { goldSwing(svg, g, holder); return; }

  var T_IN = 2800, T_IN_END = 3100, T_SLIDE = 2600, T_SLIDE_END = 3900, T_END = 5400;
  var DY0 = 222;          // start offset: the shield's top edge sits where the old bar was (64% down the slot, in 300x360 units)
  var VIS0 = 62;          // visible window at the start = the top 62 units of the shield (the dome + a little)
  var VIS1 = 430;         // fully open
  var TILT = 80;          // degrees the top is bent toward the viewer at the start (unwinds to 0 while it slides into place)
  var YAW0 = 70;          // swing amplitude in degrees (pendulum that settles at 0)
  var SWING_HZ = .5, SWING_DECAY = .5;
  var DEPTH = .11;       // thickness of the shield = 8.5% of its width
  var LAYERS = 14;        // stacked copies that make the thickness
  var W0 = 30, W1 = 15;   // rim thickness: bar-like at first -> normal
  var barPx = Math.max(10, Math.min(22, innerWidth * .015));
  var width = svg.getBoundingClientRect().width;
  W0 = Math.max(W1, 1.6 * barPx / (width / 300 || 1));   // thicker while tilted: foreshortening makes the line look bar-thin
  var PERSP = width * 2.6;                               // perspective distance in px (smaller = stronger)
  holder.style.transformOrigin = '50% 64%';              // hinge for the bend = the line where the top part sits

  /* thickness: dark copies of the logo stacked behind it along Z (they get darker via CSS) */
  var depth = [];
  for (var i = 1; i <= LAYERS; i++) {
    var w = document.createElement('div'), c = svg.cloneNode(true);
    w.className = 'depth'; w.setAttribute('aria-hidden', 'true');
    w.style.transform = 'translateZ(' + (-width * DEPTH * i / LAYERS).toFixed(2) + 'px)';
    w.appendChild(c); holder.insertBefore(w, svg); depth.push(w);
  }
  /* every copy needs its OWN clip (duplicate ids would all resolve to the first one) */
  var rects = [rect];
  depth.forEach(function (w, i) {
    var cp = w.querySelector('clipPath'); cp.id = 'rv' + (i + 1);
    w.querySelector('#sg').setAttribute('clip-path', 'url(#rv' + (i + 1) + ')');
    rects.push(cp.querySelector('rect'));
  });
  var groups = [g].concat(depth.map(function (w) { return w.querySelector('#sg'); }));
  var rings = [].slice.call(holder.querySelectorAll('.prism .rim'));

  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var clamp = function (t) { return Math.max(0, Math.min(1, t)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  function yaw(t) {                                       // starts dead straight (so the top reads as a plain line), then swings and settles; exactly 0 at T_END
    var u = (t - T_SLIDE) / 1000;
    if (u <= 0) return 0;
    var fade = clamp((T_END - t) / 900); fade = fade * fade * (3 - 2 * fade);
    return -YAW0 * Math.exp(-SWING_DECAY * u) * Math.sin(2 * Math.PI * SWING_HZ * u) * fade;
  }
  function set(slide, appear, t) {
    var tr = 'translate(0 ' + lerp(DY0, 0, slide) + ')';
    groups.forEach(function (gg) { gg.setAttribute('transform', tr); gg.style.opacity = appear; });
    rects.forEach(function (r) { r.setAttribute('height', lerp(VIS0, VIS1, slide) + 60); });   // rect starts at y=-60
    holder.style.transform = 'translateX(-50%) perspective(' + PERSP + 'px) rotateY(' + yaw(t).toFixed(2) + 'deg) rotateX(' + lerp(-TILT, 0, slide) + 'deg)';
    rings.forEach(function (r) { r.style.strokeWidth = (r.classList.contains('glowp') ? 12 : 0) + lerp(W0, W1, slide) + 'px'; });
  }
  set(0, 0, 0);                                                         // before first paint: only the top peeks, invisible

  var START = null;
  function frame(now) {
    if (START === null) START = now;
    var t = now - START;
    set(ease(clamp((t - T_SLIDE) / (T_SLIDE_END - T_SLIDE))), ease(clamp((t - T_IN) / (T_IN_END - T_IN))), t);
    if (t < T_END) { requestAnimationFrame(frame); return; }
    /* settled: back to the plain, flat, unclipped logo */
    depth.forEach(function (w) { w.remove(); });
    g.removeAttribute('transform'); g.removeAttribute('clip-path'); g.style.opacity = '';
    holder.style.transform = ''; holder.style.transformOrigin = '';
    idleSway(svg, holder);
  }
  requestAnimationFrame(frame);

  /* ---------- IDLE SWAY (dark intro) ----------
     When the intro has settled the shield doesn't freeze: it keeps swinging gently left/right in 3D (starts from 0, so no jump)
     and gets a little darker as it turns away - like the logo in the reference video. */
  function idleSway(svg, holder) {
    var A = 14, PERIOD = 1.7, RAMP = 1.4;           // degrees / seconds per swing / seconds to reach full swing
    var width = svg.getBoundingClientRect().width || 300, PERSP = width * 2.6;
    var t0 = performance.now(), raf = 0, visible = true;
    function f(now) {
      var u = (now - t0) / 1000, r = clamp(u / RAMP); r = r * r * (3 - 2 * r);
      var yaw = A * r * Math.sin(2 * Math.PI * u / PERIOD), s = Math.sin(yaw * Math.PI / 180);
      holder.style.transform = 'translateX(-50%) perspective(' + PERSP + 'px) rotateY(' + yaw.toFixed(2) + 'deg)';
      holder.style.filter = 'brightness(' + (1 - 3 * s * s).toFixed(3) + ')';
      raf = visible ? requestAnimationFrame(f) : 0;
    }
    raf = requestAnimationFrame(f);
    if ('IntersectionObserver' in window) {   // stop while the hero is scrolled out of view
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        if (visible && !raf) { t0 = performance.now() - RAMP * 1000; raf = requestAnimationFrame(f); }
      }).observe(holder);
    }
  }
  /* ---------- GOLD SWING INTRO (default) ----------
     White page, the gold shield is already in place on the first frame and swings left/right in 3D like a thick
     metal plate on a hinge: big swings that slowly calm down into a gentle sway that never fully stops.
     While it turns away it gets darker (light catching the edge), like in the reference video.            */
  function goldSwing(svg, g, holder) {
    var LAYERS = 12, DEPTH = .085;           // thickness = 8.5% of the shield width, built from stacked copies
    var A0 = 58, A_IDLE = 9;                 // swing amplitude in degrees: start -> idle sway
    var PERIOD = 1.55, TAU = 2.4;            // seconds per swing / how fast the big swing dies down
    var PHASE = .5;                          // start slightly turned, not dead flat
    var width = svg.getBoundingClientRect().width || 300, PERSP = width * 2.6;

    g.removeAttribute('clip-path');          // no reveal needed: the shield is complete from the first frame
    for (var i = 1; i <= LAYERS; i++) {
      var w = document.createElement('div'), c = svg.cloneNode(true);
      w.className = 'depth'; w.setAttribute('aria-hidden', 'true');
      w.style.transform = 'translateZ(' + (-width * DEPTH * i / LAYERS).toFixed(2) + 'px)';
      w.appendChild(c); holder.insertBefore(w, svg);
    }

    function pose(t) {
      var a = A_IDLE + (A0 - A_IDLE) * Math.exp(-t / TAU);
      var yaw = a * Math.sin(2 * Math.PI * t / PERIOD + PHASE);
      holder.style.transform = 'translateX(-50%) perspective(' + PERSP + 'px) rotateY(' + yaw.toFixed(2) + 'deg)';
      var s = Math.sin(yaw * Math.PI / 180);
      svg.style.filter = 'brightness(' + (1 - .5 * s * s * 2.2).toFixed(3) + ')';   // darker the further it turns away
    }
    pose(0);

    var START = null, raf = 0, visible = true;
    function frame(now) {
      if (START === null) START = now;
      pose((now - START) / 1000);
      raf = visible ? requestAnimationFrame(frame) : 0;
    }
    raf = requestAnimationFrame(frame);
    if ('IntersectionObserver' in window) {   // stop animating while the hero is scrolled out of view
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        if (visible && !raf) { START = null; raf = requestAnimationFrame(frame); }
      }).observe(holder);
    }
  }
})();
