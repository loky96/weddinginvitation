const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '../puzzle.html'), 'utf8');
const geometry = html.slice(html.indexOf('    const mobile = innerWidth'), html.indexOf('    stage.style.width'));
const positioning = html.slice(html.indexOf('  function scatter('), html.indexOf('  function build('));

for (const width of [319, 375, 600, 900]) {
  test(`remaining pieces close gaps after placement at ${width}px`, () => {
    const stage = { parentElement: { clientWidth: Math.min(width, 600) }, style: {} };
    const geo = vm.runInNewContext(geometry + '\ngeo;', { n: 4, innerWidth: width, stage });
    const pieces = Array.from({ length: 16 }, (_, slot) => ({ slot, el: { classList: { add() {} } } }));
    const context = { stage, geo, pieces, setPos(p, x, y) { p.x = x; p.y = y; } };
    vm.runInNewContext(positioning, context);
    pieces.forEach(p => context.scatter(p, p.slot));
    // Leave holes throughout the tray, including its first row.
    const filled = [0, 2, 3, 4, 10];
    filled.forEach(i => { pieces[i].placed = true; pieces[i].x = -100; pieces[i].y = -100; });
    context.reflowLoosePieces();
    const loose = pieces.filter(p => !p.placed);
    assert.deepEqual(loose.map(p => p.slot), Array.from({ length: 11 }, (_, i) => i));
    filled.forEach(i => assert.equal(pieces[i].x, -100, 'placed pieces stay on the board'));
    if (geo.mobile) {
      assert.ok(parseFloat(stage.style.height) < geo.stageH, 'tray contracts when a row empties');
      assert.ok(loose.every(p => p.y > geo.boardY + geo.S));
      assert.ok(loose.slice(0, 4).every(p => p.y < geo.trayTop + 18));
    } else assert.equal(stage.style.height, undefined, 'desktop board keeps its height');
    pieces.forEach(p => { p.placed = true; });
    assert.doesNotThrow(() => context.reflowLoosePieces());
  });
}
