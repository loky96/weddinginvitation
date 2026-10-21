const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '../invite.html'), 'utf8');
const update = html.slice(html.indexOf('  function update('), html.indexOf('  function place('));
const artwork = html.slice(html.indexOf('  const footstepsProgress ='), html.indexOf('  let pieces ='));

test('each placed piece adds a step, including restored progress, and both paths meet on completion', () => {
  const visible = Array(16).fill(false), attributes = new Map();
  let completed = 0, heartVisible = false;
  const context = {
    stage: { classList: { contains: () => false } }, drawBoard: () => {}, n: 4,
    pieces: Array.from({ length: 16 }, () => ({ placed: false })),
    footstepsProgress: {
      classList: { toggle: (_, visible) => heartVisible = visible },
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
    assert.equal(heartVisible, placed === 16, 'meeting heart only appears when the puzzle is complete');
  }
  assert.equal(completed, 1);
});

test('bride steps face inward from the left and groom steps from the right, including on phones', () => {
  const progress = {};
  vm.runInNewContext(artwork, { $: () => progress, n: 4 });
  const steps = [...progress.innerHTML.matchAll(/class="footstep (bride|groom)"[^>]*style="left:calc\(([\d.]+)% ([+-]) ([\d.]+)px\);top:(\d+)px"/g)]
    .map(([, person, percent, sign, inset, y]) => ({ person, percent: +percent, inset: +inset * (sign === '-' ? -1 : 1), y: +y }));
  assert.equal(steps.length, 16);
  const bride = steps.filter(p => p.person === 'bride'), groom = steps.filter(p => p.person === 'groom');
  assert.equal(bride.length, 8);
  assert.equal(groom.length, 8);
  assert.equal((progress.innerHTML.match(/rotate\(90\)/g) || []).length, 8);
  assert.equal((progress.innerHTML.match(/rotate\(-90\)/g) || []).length, 8);
  const glyphs = [...progress.innerHTML.matchAll(/<svg class="footstep (bride|groom)"[\s\S]*?<\/svg>/g)];
  glyphs.forEach(([markup, person], i) => {
    const stride = Math.floor(i / 2);
    const flipped = markup.includes('<g transform="translate(0 32) scale(1 -1)">');
    assert.equal(flipped, person === 'bride' ? stride % 2 === 1 : stride % 2 === 0,
      'groom footprints are vertically flipped while still pointing towards the heart');
  });
  for (const width of [280, 300, 360]) for (const step of steps) {
    const footprintWidth = width < 360 ? 18 : 23;
    const x = step.percent / 100 * width + step.inset;
    assert.ok(x - footprintWidth / 2 >= 0);
    assert.ok(x + footprintWidth / 2 <= width);
    assert.ok(step.person === 'bride' ? x + footprintWidth / 2 < width / 2 - 24 : x - footprintWidth / 2 > width / 2 + 24,
      'both rows leave space around the padded 48px heart');
    assert.ok(step.y + footprintWidth * 32 / 50 < 52);
  }
  for (const width of [280, 360]) bride.forEach((p, i) => {
    const x = p.percent / 100 * width + p.inset;
    const other = groom[i].percent / 100 * width + groom[i].inset;
    assert.ok(Math.abs(x + other - width) < .001, 'paths converge symmetrically');
    if (i) assert.ok(x > bride[i - 1].percent / 100 * width + bride[i - 1].inset);
    if (i === 7) assert.equal(width / 2 - x, 44, 'last footsteps frame the heart');
  });
});
