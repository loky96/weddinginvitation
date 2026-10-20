const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '../puzzle.html'), 'utf8');
const source = html.slice(html.indexOf('  // Pull the cord 80'), html.indexOf('  // Use the jigsaw path'));

function mount() {
  const handlers = new Map(), styles = new Map(), classes = new Set();
  let capture = null, opens = 0, toasts = 0;
  const knot = {
    addEventListener: (name, callback) => handlers.set(name, callback),
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    style: { setProperty: (key, value) => styles.set(key, value), removeProperty: key => styles.delete(key) },
    setPointerCapture: id => capture = id, hasPointerCapture: id => capture === id,
    releasePointerCapture: () => capture = null,
  };
  vm.runInNewContext(source, {
    knot, hang: { classList: { contains: () => false } },
    stage: { classList: { contains: () => false } },
    openScroll: () => opens++, INVITE: { toast: () => toasts++ },
  });
  return {
    fire: (name, data = {}) => handlers.get(name)({ button: 0, pointerId: 1, clientY: 100, preventDefault() {}, ...data }),
    styles, classes, opens: () => opens, toasts: () => toasts,
  };
}

test('short cord pulls spring back without opening', () => {
  const page = mount();
  page.fire('pointerdown'); page.fire('pointermove', { clientY: 179 });
  assert.equal(page.styles.get('--pull'), '79px');
  page.fire('pointerup', { clientY: 179 }); page.fire('click');
  assert.equal(page.opens(), 0);
  assert.ok(!page.styles.has('--pull') && !page.classes.has('pulling'));
  assert.equal(page.toasts(), 0, 'drag-generated click is suppressed');
});

test('crossing the downward threshold opens exactly once before release', () => {
  const page = mount();
  page.fire('pointerdown'); page.fire('pointermove', { clientY: 180 });
  assert.equal(page.opens(), 1);
  page.fire('pointermove', { clientY: 230 }); page.fire('pointerup', { clientY: 230 }); page.fire('click');
  assert.equal(page.opens(), 1);
  assert.equal(page.toasts(), 0);
});

test('upward pulls, other pointers, and cancellation do not open', () => {
  const page = mount();
  page.fire('pointerdown'); page.fire('pointermove', { pointerId: 2, clientY: 250 });
  page.fire('pointermove', { clientY: 0 });
  assert.equal(page.styles.get('--pull'), '0px');
  page.fire('pointercancel'); page.fire('pointermove', { clientY: 250 });
  assert.equal(page.opens(), 0);
  assert.ok(!page.classes.has('pulling'));
});

test('keyboard Arrow Down offers the same early-open action', () => {
  const page = mount();
  page.fire('keydown', { key: 'ArrowDown' });
  assert.equal(page.opens(), 1);
});
