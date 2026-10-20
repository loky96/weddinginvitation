const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '../puzzle.html'), 'utf8');
const update = html.slice(html.indexOf('  function update('), html.indexOf('  function place('));
const artwork = html.slice(html.indexOf('  const footstepsProgress ='), html.indexOf('  let pieces ='));

test('each placed piece adds a step, including restored progress, and both paths meet on completion', () => {
  const visible = Array(16).fill(false), attributes = new Map();
  let completed = 0;
  const context = {
    stage: { classList: { contains: () => false } }, drawBoard: () => {}, n: 4,
    pieces: Array.from({ length: 16 }, () => ({ placed: false })),
    footstepsProgress: {
      querySelectorAll: () => visible.map((_, i) => ({ classList: { toggle: (_, on) => visible[i] = on } })),
      setAttribute: (name, value) => attributes.set(name, value),
    },
    complete: () => completed++,
  };
  vm.runInNewContext(update, context);
  for (const placed of [0, 1, 2, 5, 8, 15, 16, 5]) {
    context.pieces.forEach((piece, i) => piece.placed = i < placed);
    context.update(false);
    assert.deepEqual(visible, Array.from({ length: 16 }, (_, i) => i < placed));
    assert.equal(attributes.get('aria-valuenow'), String(placed));
    assert.equal(visible.filter((on, i) => on && i % 2 === 0).length, Math.ceil(placed / 2));
    assert.equal(visible.filter((on, i) => on && i % 2 === 1).length, Math.floor(placed / 2));
    assert.equal(attributes.get('aria-valuetext').includes('have met'), placed === 16);
  }
  assert.equal(completed, 1);
});

test('bride steps face inward from the left and groom steps from the right, including on phones', () => {
  const progress = {};
  vm.runInNewContext(artwork, { $: () => progress, n: 4 });
  const steps = [...progress.innerHTML.matchAll(/class="footstep (bride|groom)"[^>]*style="left:([\d.]+)%;top:(\d+)px"/g)]
    .map(([, person, x, y]) => ({ person, x: +x, y: +y }));
  assert.equal(steps.length, 16);
  const bride = steps.filter(p => p.person === 'bride'), groom = steps.filter(p => p.person === 'groom');
  assert.equal(bride.length, 8);
  assert.equal(groom.length, 8);
  bride.forEach((p, i) => {
    assert.ok(p.x < 50 && groom[i].x > 50);
    assert.equal(p.x + groom[i].x, 100, 'paths converge symmetrically');
    if (i) assert.ok(p.x > bride[i - 1].x && groom[i].x < groom[i - 1].x);
  });
  assert.ok(50 - bride.at(-1).x <= 4 && groom.at(-1).x - 50 <= 4);
  assert.equal((progress.innerHTML.match(/rotate\(90\)/g) || []).length, 8);
  assert.equal((progress.innerHTML.match(/rotate\(-90\)/g) || []).length, 8);
  for (const width of [280, 300, 360]) for (const step of steps) {
    const footprintWidth = width < 360 ? 18 : 23;
    assert.ok(step.x / 100 * width - footprintWidth / 2 >= 0);
    assert.ok(step.x / 100 * width + footprintWidth / 2 <= width);
    assert.ok(step.y + footprintWidth * 32 / 50 < 52);
  }
});
