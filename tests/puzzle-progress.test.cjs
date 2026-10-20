const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '../puzzle.html'), 'utf8');
const update = html.slice(html.indexOf('  function update('), html.indexOf('  function place('));

test('one clay diya lights per placed piece, including restored progress', () => {
  const lit = Array(16).fill(false);
  let value, completed = 0;
  const context = {
    stage: { classList: { contains: () => false } }, drawBoard: () => {}, n: 4,
    pieces: Array.from({ length: 16 }, () => ({ placed: false })),
    diyaProgress: {
      querySelectorAll: () => lit.map((_, i) => ({ classList: { toggle: (_, on) => lit[i] = on } })),
      setAttribute: (_, next) => value = next,
    },
    complete: () => completed++,
  };
  vm.runInNewContext(update, context);
  for (const placed of [0, 1, 8, 16, 5]) {
    context.pieces.forEach((piece, i) => piece.placed = i < placed);
    context.update(false);
    assert.deepEqual(lit, Array.from({ length: 16 }, (_, i) => i < placed));
    assert.equal(value, String(placed));
  }
  assert.equal(completed, 1);
});
