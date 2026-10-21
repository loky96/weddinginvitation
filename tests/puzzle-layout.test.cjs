const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '../invite.html'), 'utf8');
const geometry = html.slice(html.indexOf('    const mobile = innerWidth'), html.indexOf('    stage.style.width'));
const scatter = html.slice(html.indexOf('  function scatter('), html.indexOf('  function build('));

test('the empty puzzle board leaves the page background visible', () => {
  let cleared = false, outline;
  const canvas = {
    setTransform() {}, clearRect() { cleared = true; }, setLineDash() {},
    strokeRect(...rect) { outline = rect; },
    fillRect() { throw Error('Board must not paint a separate background'); },
    createLinearGradient() { throw Error('Board must not use a gradient'); },
  };
  const context = { geo: { S: 300, t: 16, cell: 75 }, dpr: 1, pieces: [], board: { getContext: () => canvas },
    document: { documentElement: { classList: { contains: () => false } } } };
  vm.runInNewContext(html.slice(html.indexOf('  function drawBoard('), html.indexOf('  function update(')), context);
  context.drawBoard();
  assert.ok(cleared);
  assert.deepEqual(outline, [.6, .6, 298.8, 298.8], 'outer dotted border stays inside the canvas instead of being clipped');
  assert.equal(canvas.strokeStyle, 'rgba(123,7,18,.08)');
  assert.ok(!html.includes('board-frame'));
  assert.ok(!html.includes('temple-interior'));
});

for (const width of [319, 320, 375, 495, 600, 900]) {
  test(`all 16 scattered pieces remain outside the board and within the page at ${width}px`, () => {
    const geo = vm.runInNewContext(geometry + '\ngeo;', { n: 4, innerWidth: width, stage: { parentElement: { clientWidth: Math.min(width, 600) } } });
    if (width <= 600) assert.ok(geo.S >= width * .85, 'phone board uses at least 85% of the screen width');
    for (const random of [0, .5, .999]) {
      const math = Object.create(Math);
      math.random = () => random;
      const context = { geo, Math: math, setPos: (p, x, y) => { p.x = x; p.y = y; } };
      vm.runInNewContext(scatter, context);
      const bounds = [];
      for (let slot = 0; slot < 16; slot++) {
        const p = {};
        context.scatter(p, slot);
        const w = geo.W * p.s, angle = Math.abs(p.rot) * Math.PI / 180;
        const extent = w * (Math.cos(angle) + Math.sin(angle));
        const box = { x: p.x + (w - extent) / 2, y: p.y + (w - extent) / 2, w: extent };
        assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.w <= geo.SW && box.y + box.w <= geo.stageH, `piece ${slot} stays within stage`);
        if (width <= 600) assert.ok(box.y > geo.boardY + geo.S, `phone piece ${slot} is below the board`);
        const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.w && a.y + a.w > b.y;
        assert.ok(!intersects(box, { x: geo.boardX, y: geo.boardY, w: geo.S }), `piece ${slot} does not cover the board`);
        if (width > 600) assert.ok(bounds.every(other => !intersects(box, other)), `piece ${slot} does not overlap another piece`);
        else for (const other of bounds) {
          const overlapX = Math.max(0, Math.min(box.x + box.w, other.x + other.w) - Math.max(box.x, other.x));
          const overlapY = Math.max(0, Math.min(box.y + box.w, other.y + other.w) - Math.max(box.y, other.y));
          assert.ok(overlapX * overlapY < box.w * box.w * .3, 'scattered phone pieces remain individually accessible');
        }
        bounds.push(box);
      }
    }
  });
}
