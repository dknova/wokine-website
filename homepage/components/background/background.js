/* BACKGROUND SHIELDS + MOUSE TILT
   - builds the wall of shields (same stagger as the old pattern: rows 150px apart, every other row shifted by half a step)
   - when the mouse moves, every shield turns a little toward it (3D tilt), and so does the shield in the hero.
   Tune the feel with the numbers below. Does nothing when the visitor prefers reduced motion. */
(function () {
  var host = document.querySelector('.bg .shields');
  if (!host) return;
  var STEP_X = 240, STEP_Y = 150;     // spacing of the wall (px)
  var MAX_X = 30, MAX_Y = 36;         // max tilt of a background shield (degrees)
  var HERO_X = 12, HERO_Y = 16;       // max tilt of the hero shield (degrees)
  var PERSP = 700;                    // perspective in px (smaller = stronger 3D)
  var EASE = .08;                     // how quickly shields follow the mouse (0..1)
  var HERO_DELAY = 5800;              // ms: the hero shield only starts tilting after its intro animation

  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  var items = [], W = 0, H = 0;

  function build() {
    host.textContent = ''; items = [];
    W = innerWidth; H = innerHeight;
    var rows = Math.ceil(H / STEP_Y) + 2, cols = Math.ceil(W / STEP_X) + 2;
    for (var r = -1; r < rows; r++) {
      for (var c = -1; c < cols; c++) {
        var x = 60 + c * STEP_X + (r % 2 ? STEP_X / 2 : 0), y = 75 + r * STEP_Y;
        var el = document.createElement('div'); el.className = 'bs';
        el.style.left = x + 'px'; el.style.top = y + 'px';
        el.innerHTML = '<svg class="back" viewBox="0 0 300 360"><use href="#bgShieldBack"/></svg><svg viewBox="0 0 300 360"><use href="#bgShieldSym"/></svg>';
        host.appendChild(el); items.push({ el: el, x: x, y: y });
      }
    }
  }
  build();
  if (calm) return;

  var mx = W / 2, my = H / 2, tx = mx, ty = my, running = false, born = performance.now();
  var slot = document.querySelector('.hero .slot');
  var clamp = function (v) { return Math.max(-1, Math.min(1, v)); };

  function draw() {
    mx += (tx - mx) * EASE; my += (ty - my) * EASE;
    var gx = clamp((mx - W / 2) / (W / 2)), gy = clamp((my - H / 2) / (H / 2));      // mouse relative to the screen centre
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var rx = clamp((mx - it.x) / (W * .5)), ry = clamp((my - it.y) / (H * .5));      // mouse relative to this shield
      var yaw = (gx * .5 + rx * .5) * MAX_Y, pitch = -(gy * .5 + ry * .5) * MAX_X;
      it.el.style.transform = 'perspective(' + PERSP + 'px) rotateX(' + pitch.toFixed(2) + 'deg) rotateY(' + yaw.toFixed(2) + 'deg)';
    }
    if (slot && performance.now() - born > HERO_DELAY) {
      slot.style.transform = 'perspective(1100px) rotateX(' + (-gy * HERO_X).toFixed(2) + 'deg) rotateY(' + (gx * HERO_Y).toFixed(2) + 'deg)';
    }
    if (Math.abs(tx - mx) > .3 || Math.abs(ty - my) > .3) requestAnimationFrame(draw); else running = false;
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(draw); } }

  addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; kick(); }, { passive: true });
  document.addEventListener('mouseleave', function () { tx = W / 2; ty = H / 2; kick(); });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { build(); kick(); }, 150); });
})();
