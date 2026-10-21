const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../temple-scene.js'), 'utf8');

function mount(width, height, { reduced = false, fps = 60, ready = true } = {}) {
  const listeners = new Map(), imageListeners = new Map(), frames = [], timers = [], events = [];
  const classes = new Set();
  const element = () => ({ style: {}, classList: {
    add: (...names) => names.forEach(n => classes.add(n)),
    remove: (...names) => names.forEach(n => classes.delete(n)),
  } });
  const art = element(), left = element(), right = element();
  const viewport = { clientWidth: width, clientHeight: height };
  const image = { complete: ready, naturalWidth: ready ? 841 : 0,
    addEventListener: (name, callback) => imageListeners.set(name, callback) };
  art.querySelector = () => image;
  const sections = [{ inert: true }, { inert: true }];
  let removed = false, focused = false, clock = 0, exitAt;
  const scene = {
    ...element(), querySelector: selector => ({
      '.temple-sticky': viewport, '.temple-art': art, '.temple-leaf.left': left, '.temple-leaf.right': right,
    })[selector], remove: () => removed = true,
  };
  const window = { scrollY: 0, scrollTo: ({ top }) => window.scrollY = top };
  vm.runInNewContext(source, {
    window, history: { scrollRestoration: 'auto' }, performance: { now: () => clock },
    document: { querySelector: () => scene, body: element(), querySelectorAll: () => sections,
      getElementById: () => ({ focus: () => focused = true }) },
    matchMedia: query => ({ get matches() { return query.includes('max-width') ? width <= 768 && height >= width : reduced; } }),
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: name => listeners.delete(name),
    dispatchEvent: event => events.push(event.type), Event,
    requestAnimationFrame: callback => frames.push(callback),
    setTimeout: (callback, delay) => { exitAt = clock + delay; timers.push(callback); },
  });
  const advance = milliseconds => {
    const target = clock + milliseconds;
    while (clock < target - .000001) {
      clock = Math.min(target, clock + 1000 / fps);
      frames.splice(0).forEach(callback => callback(clock));
    }
  };
  return {
    art, left, right, classes, sections, events, window, listeners, advance,
    camera: () => {
      const result = art.style.transform.match(/translate\(([-\d.e+]+)px, ([-\d.e+]+)px\) scale\(([-\d.e+]+)\)/).slice(1).map(Number);
      result[0] += width / 2;
      return result;
    },
    load: () => imageListeners.get('load')?.(), fail: () => imageListeners.get('error')?.(),
    resize: (w, h) => { width = w; height = h; viewport.clientWidth = w; viewport.clientHeight = h; listeners.get('resize')?.(); },
    settle: () => { while (timers.length) timers.shift()(); },
    removed: () => removed, focused: () => focused, exitAt: () => exitAt,
  };
}

for (const [width, height] of [[320, 568], [319, 900], [390, 844], [500, 678], [568, 320], [632, 678], [768, 1024], [1440, 900]]) {
  test(`automatic top → descent → zoom → doors → puzzle at ${width}×${height}`, () => {
    const page = mount(width, height), initial = page.camera();
    const mobile = width <= 768 && height >= width;
    const imageWidth = mobile ? 841 : 1086, imageHeight = mobile ? 1870 : 1448;
    assert.ok(Math.abs(initial[1]) < .001, 'starts at the temple top');
    assert.ok(Math.abs(initial[0] + imageWidth * initial[2] / 2 - width / 2) < .001, 'image center matches screen center');
    if (mobile) {
      assert.ok(Math.abs(initial[0]) < .001);
      assert.ok(Math.abs(imageWidth * initial[2] - width) < .001, 'mobile image fills screen width');
    }
    page.advance(650);
    assert.equal(page.camera()[2], initial[2], 'pan happens before zoom');
    page.advance(475);
    const descended = page.camera();
    assert.equal(descended[2], initial[2]);
    if (mobile) assert.ok(Math.abs(descended[1] - Math.min(0, height - imageHeight * initial[2])) < .001, 'full downward pan');
    page.advance(875);
    const zoomed = page.camera();
    assert.ok((mobile ? 314 : 358) * zoomed[2] >= width && (mobile ? 610 : 546) * zoomed[2] >= height);
    assert.equal(page.left.style.transform, 'rotateY(0deg)');
    page.advance(200);
    assert.equal(page.left.style.transform, 'rotateY(-105deg)');
    assert.ok(page.classes.has('entered') && page.classes.has('faded'));
    assert.ok(page.sections.every(section => !section.inert));
    assert.deepEqual(page.events, ['temple-entered']);
    assert.equal(page.window.scrollY, 0);
    page.settle();
    assert.ok(page.removed() && page.focused());
    assert.ok(!page.classes.has('puzzle-entering'));
  });
}

test('reduced motion reaches the puzzle without waiting for autoplay', () => {
  const reduced = mount(390, 844, { reduced: true });
  reduced.advance(50); reduced.settle();
  assert.ok(reduced.removed() && reduced.classes.has('entered'));
});

test('autoplay waits for the temple image to load', () => {
  const page = mount(390, 844, { ready: false }), initial = page.camera();
  page.advance(6000);
  assert.deepEqual(page.camera(), initial);
  assert.ok(!page.classes.has('entered'));
  page.load(); page.advance(2600);
  assert.ok(page.classes.has('entered'));
});

test('scroll input cannot advance or reverse the automatic entrance', () => {
  const page = mount(390, 844), control = mount(390, 844);
  assert.ok(!page.listeners.has('scroll'));
  page.window.scrollY = 3000;
  page.advance(650); control.advance(650);
  assert.deepEqual(page.camera(), control.camera());
  page.window.scrollY = 0;
  page.advance(1950);
  assert.ok(page.classes.has('entered'));
});

test('entry resets once at the end, then normal puzzle scrolling remains untouched', () => {
  const page = mount(390, 844);
  assert.ok(page.classes.has('puzzle-entering'));
  page.advance(2100);
  page.window.scrollY = 480;
  page.settle();
  assert.equal(page.window.scrollY, 0);
  assert.ok(!page.classes.has('puzzle-entering'));
  page.window.scrollY = 600;
  page.advance(6000); page.settle();
  assert.equal(page.window.scrollY, 600);
  assert.deepEqual(page.events, ['temple-entered']);
});

test('automatic camera timing is consistent at 30, 60, and 120 fps', () => {
  const poses = [30, 60, 120].map(fps => {
    const page = mount(390, 844, { fps });
    page.advance(1750);
    return page.camera();
  });
  for (const pose of poses) pose.forEach((value, i) => assert.ok(Math.abs(value - poses[0][i]) < .001));
});

test('mobile artwork stays centered when viewport size or orientation changes', () => {
  const page = mount(390, 844);
  page.advance(1000);
  page.resize(360, 800); page.advance(20);
  assert.ok(Math.abs(page.camera()[0]) < .001);
  assert.ok(Math.abs(page.camera()[2] * 841 - 360) < .001);
  page.resize(844, 390); page.advance(20);
  assert.equal(page.art.style.width, '1086px');
  assert.ok(Math.abs(page.camera()[0] + 1086 * page.camera()[2] / 2 - 844 / 2) < .001);
});

test('a missing temple image skips safely into the puzzle', () => {
  const page = mount(390, 844, { ready: false });
  page.fail(); page.advance(50); page.settle();
  assert.ok(page.removed() && page.focused());
  assert.ok(!page.classes.has('puzzle-entering'));
});

test('the full automatic entrance including its exit finishes in about 2.5 seconds', () => {
  for (const fps of [30, 60, 120]) {
    const page = mount(390, 844, { fps });
    page.advance(2100);
    assert.ok(page.classes.has('entered'));
    assert.ok(Math.abs(page.exitAt() - 2500) <= 1000 / fps + 1);
  }
});
