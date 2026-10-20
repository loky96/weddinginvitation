// One scroll track: descend the tower, approach the doorway, then open the doors.
(() => {
  const scene = document.querySelector('.temple-approach');
  const viewport = scene.querySelector('.temple-sticky');
  const art = scene.querySelector('.temple-art');
  const left = scene.querySelector('.temple-leaf.left');
  const right = scene.querySelector('.temple-leaf.right');
  const interior = scene.querySelector('.temple-interior');
  const cue = scene.querySelector('.scroll-cue');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = v => { const t = clamp(v); return t * t * (3 - 2 * t); };
  let entered = false, pending = false;

  function finish() {
    if (entered) return;
    entered = true;
    removeEventListener('scroll', schedule);
    removeEventListener('resize', schedule);
    scene.classList.add('departing');
    document.body.classList.add('entered');
    document.querySelectorAll('.game, .scroll-wrap').forEach(section => section.inert = false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    dispatchEvent(new Event('temple-entered'));
    requestAnimationFrame(() => requestAnimationFrame(() => scene.classList.add('faded')));
    setTimeout(() => {
      scene.remove();
      document.getElementById('g-title').focus({ preventScroll: true });
    }, reduced ? 0 : 950);
  }

  function draw() {
    pending = false;
    if (entered) return;
    const w = viewport.clientWidth, h = viewport.clientHeight;
    const p = clamp(window.scrollY / Math.max(1, scene.offsetHeight - h));
    // Full-width tower detail at the top. The camera descends before zooming.
    const start = Math.max(w / 1086, h / 1040);
    const target = Math.max(w / 340, h / 520);
    const pan = ease(p / .42);
    const zoom = ease((p - .42) / .32);
    const s = start + (target - start) * zoom;
    const initialY = h / (2 * start);
    const lowY = Math.min(960, 1448 - h / (2 * start));
    const cy = (initialY + (lowY - initialY) * pan) * (1 - zoom) + 960 * zoom;
    const cx = 543 + (559 - 543) * zoom;
    art.style.transform = `translate(${w / 2 - cx * s}px, ${h / 2 - cy * s}px) scale(${s})`;
    const angle = 105 * ease((p - .76) / .21);
    left.style.transform = `rotateY(${-angle}deg)`;
    right.style.transform = `rotateY(${angle}deg)`;
    interior.style.opacity = String(ease((p - .76) / .08));
    cue.style.opacity = String(1 - ease(p / .15));
    if (p >= .995 || (reduced && p > .06)) finish();
  }
  function schedule() {
    if (!pending && !entered) { pending = true; requestAnimationFrame(draw); }
  }
  scene.querySelector('.skip-entrance').addEventListener('click', finish);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  // Avoid restoring the previous visit halfway through the entrance.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo({ top: 0, behavior: 'instant' });
  draw();
})();
