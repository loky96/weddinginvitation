// One scroll track: descend the tower, approach the doorway, then open the doors.
(() => {
  const scene = document.querySelector('.temple-approach');
  const viewport = scene.querySelector('.temple-sticky');
  const art = scene.querySelector('.temple-art');
  const left = scene.querySelector('.temple-leaf.left');
  const right = scene.querySelector('.temple-leaf.right');
  const cue = scene.querySelector('.scroll-cue');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 768px) and (orientation: portrait)');
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = v => { const t = clamp(v); return t * t * (3 - 2 * t); };
  let entered = false, pending = false, shownProgress = 0, lastFrame = 0;

  function finish() {
    if (entered) return;
    entered = true;
    removeEventListener('scroll', schedule);
    removeEventListener('resize', schedule);
    scene.classList.add('departing');
    document.body.classList.add('entered', 'puzzle-entering');
    document.querySelectorAll('.game, .scroll-wrap').forEach(section => section.inert = false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    dispatchEvent(new Event('temple-entered'));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      left.style.transform = 'rotateY(-105deg)';
      right.style.transform = 'rotateY(105deg)';
      scene.classList.add('faded');
    }));
    window.InvitationSound?.play('doors');
    setTimeout(() => {
      scene.remove();
      document.body.classList.remove('puzzle-entering');
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.getElementById('g-title').focus({ preventScroll: true });
    }, reduced ? 0 : 1150);
  }

  function draw(timestamp = performance.now()) {
    pending = false;
    if (entered) return;
    const w = viewport.clientWidth, h = viewport.clientHeight;
    const requested = clamp(window.scrollY / Math.max(1, scene.offsetHeight - h));
    const elapsed = Math.min(Math.max((timestamp - lastFrame) / 1000, 0), .05);
    lastFrame = timestamp;
    const difference = requested - shownProgress;
    // Time-based easing stays consistent across refresh rates; the cap keeps every scene visible.
    if (reduced || Math.abs(difference) < .0001) shownProgress = requested;
    else shownProgress += Math.sign(difference) * Math.min(Math.abs(difference) * (1 - Math.exp(-12 * elapsed)), elapsed * .24);
    const p = shownProgress;
    const mobile = narrow.matches;
    const imageW = mobile ? 841 : 1086, imageH = mobile ? 1870 : 1448;
    const doorW = mobile ? 314 : 358, doorH = mobile ? 610 : 546;
    const doorX = mobile ? 421 : 559, doorY = mobile ? 1422 : 960;
    if (art.style.width !== imageW + 'px') {
      art.style.width = imageW + 'px';
      art.style.height = imageH + 'px';
    }
    const start = mobile ? w / imageW : Math.max(w / imageW, h / 1040);
    const target = Math.max(w / (doorW * .94), h / (doorH * .94));
    const pan = ease(p / .42);
    const zoom = ease((p - .42) / .32);
    const s = start + (target - start) * zoom;
    const initialY = h / (2 * start);
    const lowY = mobile ? Math.max(initialY, imageH - h / (2 * start)) : Math.min(doorY, imageH - h / (2 * start));
    const cy = (initialY + (lowY - initialY) * pan) * (1 - zoom) + doorY * zoom;
    const cx = imageW / 2 + (doorX - imageW / 2) * zoom;
    art.style.transform = `translate(${w / 2 - cx * s}px, ${h / 2 - cy * s}px) scale(${s})`;
    left.style.transform = 'rotateY(0deg)';
    right.style.transform = 'rotateY(0deg)';
    cue.style.opacity = String(1 - ease(p / .15));
    // The opening doors and entrance crossfade together, with no intermediate reveal card.
    if (p >= .76 || (reduced && p > .06)) finish();
    else if (Math.abs(requested - shownProgress) >= .0001) schedule();
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
