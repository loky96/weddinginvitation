const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../temple-scene.js'), 'utf8');

function mount(width, height, reduced = false) {
  const listeners = new Map(), frames = [], timers = [], events = [];
  const classes = new Set();
  const element = () => ({ style: {}, classList: { add: (...names) => names.forEach(n => classes.add(n)) } });
  const art = element(), left = element(), right = element(), cue = element();
  const sections = [{ inert: true }, { inert: true }];
  let skip, removed = false, focused = false, clock = 0;
  const scene = {
    ...element(), offsetHeight: height * 7.6,
    querySelector: selector => ({
      '.temple-sticky': { clientWidth: width, clientHeight: height },
      '.temple-art': art, '.temple-leaf.left': left, '.temple-leaf.right': right,
      '.scroll-cue': cue, '.skip-entrance': { addEventListener: (_, callback) => skip = callback },
    })[selector],
    remove: () => removed = true,
  };
  const window = { scrollY: 0, scrollTo: ({ top }) => window.scrollY = top };
  const context = {
    window, history: { scrollRestoration: 'auto' }, performance: { now: () => clock },
    document: {
      querySelector: () => scene, body: element(), querySelectorAll: () => sections,
      getElementById: () => ({ focus: () => focused = true }),
    },
    matchMedia: query => ({ matches: query.includes('max-width') ? width <= 768 : reduced }),
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: name => listeners.delete(name),
    dispatchEvent: event => events.push(event.type), Event,
    requestAnimationFrame: callback => frames.push(callback),
    setTimeout: callback => timers.push(callback),
  };
  vm.runInNewContext(source, context);
  const tick = () => { clock += 1000 / 60; frames.shift()?.(clock); };
  const flush = () => { let guard = 0; while (frames.length) { if (++guard > 4000) throw Error('Animation did not settle'); tick(); } };
  return {
    art, left, right, classes, sections, events, window,
    scroll: p => { window.scrollY = p * (scene.offsetHeight - height); listeners.get('scroll')?.(); flush(); },
    swipe: p => { window.scrollY = p * (scene.offsetHeight - height); listeners.get('scroll')?.(); tick(); },
    settleCamera: flush,
    skip: () => { skip(); flush(); },
    settle: () => { while (timers.length) timers.shift()(); },
    removed: () => removed, focused: () => focused,
  };
}

for (const [width, height] of [[320, 568], [390, 844], [568, 320], [632, 678], [768, 1024], [1440, 900]]) {
  test(`tower → descent → zoom → doors → puzzle at ${width}×${height}`, () => {
    const page = mount(width, height);
    const camera = () => page.art.style.transform.match(/translate\(([-\d.e+]+)px, ([-\d.e+]+)px\) scale\(([-\d.e+]+)\)/).slice(1).map(Number);
    const initial = camera();
    const imageWidth = width <= 768 ? 841 : 1086, imageHeight = width <= 768 ? 1870 : 1448;
    assert.ok(Math.abs(initial[1]) < .001, 'camera begins at the temple top');
    assert.ok(initial[0] <= .001 && initial[0] + imageWidth * initial[2] >= width - .001, 'image fills the viewport width');
    assert.ok(initial[1] + imageHeight * initial[2] >= height - .001, 'no blank band below the mobile image');
    page.scroll(.42);
    const descended = camera();
    assert.equal(descended[2], initial[2], 'descent happens before zoom');
    assert.ok(descended[1] < initial[1], 'camera moves down the facade');
    assert.equal(page.left.style.transform, 'rotateY(0deg)');
    page.scroll(.75);
    const zoomed = camera();
    assert.ok(zoomed[2] > initial[2], 'doorway grows to fill the viewport');
    assert.ok((width <= 768 ? 314 : 358) * zoomed[2] >= width && (width <= 768 ? 610 : 546) * zoomed[2] >= height);
    assert.equal(page.left.style.transform, 'rotateY(0deg)', 'doors remain closed until zoom finishes');
    page.scroll(.77);
    assert.equal(page.left.style.transform, 'rotateY(-105deg)', 'doors swing open during the crossfade');
    assert.ok(page.classes.has('entered'));
    assert.ok(page.classes.has('faded'), 'entrance fades straight into the puzzle at the start of opening');
    assert.ok(page.sections.every(section => !section.inert));
    assert.equal(page.window.scrollY, 0, 'puzzle starts at its header');
    assert.deepEqual(page.events, ['temple-entered']);
    page.settle();
    assert.ok(page.removed() && page.focused());
  });
}

test('skip entrance and reduced motion both reach the puzzle', () => {
  const skipped = mount(390, 844);
  skipped.skip(); skipped.settle();
  assert.ok(skipped.removed() && skipped.classes.has('entered'));
  const reduced = mount(390, 844, true);
  reduced.scroll(.07); reduced.settle();
  assert.ok(reduced.removed() && reduced.classes.has('entered'));
});

test('a fast swipe cannot jump straight through the door-opening sequence', () => {
  const page = mount(390, 844);
  page.swipe(1);
  assert.equal(page.left.style.transform, 'rotateY(0deg)');
  assert.ok(!page.classes.has('entered'));
  page.settleCamera();
  assert.ok(page.classes.has('entered'));
});
