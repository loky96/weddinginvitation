const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'puzzle.html'), 'utf8');
const source = html.slice(html.indexOf('  const puzzleImagePaths'), html.indexOf("  addEventListener('temple-entered'"));
const artwork = html.slice(html.indexOf('  function drawCover('), html.indexOf('  // Jigsaw edge'));
const manifest = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'puzzle-images.js'), 'utf8'), manifest);
const images = manifest.window.PUZZLE_IMAGES;

function mount(random) {
  let image;
  const math = Object.create(Math);
  math.random = () => random;
  const context = vm.createContext({
    window: { PUZZLE_IMAGES: images }, Math: math,
    Image: function () { image = this; },
  });
  vm.runInContext(source, context);
  return { image, context, ready: vm.runInContext('puzzleImageReady', context) };
}

test('every supplied image can be selected and is included in the deployment', async () => {
  assert.ok(images.length > 1);
  for (let i = 0; i < images.length; i++) {
    const page = mount((i + .5) / images.length);
    assert.equal(page.image.src, images[i]);
    assert.ok(fs.existsSync(path.join(root, decodeURIComponent(images[i]))));
    assert.ok(fs.existsSync(path.join(root, 'dist', decodeURIComponent(images[i]))));
    page.image.onload();
    await page.ready;
  }
});

test('an unavailable random image falls back to the original artwork', async () => {
  const page = mount(0);
  page.image.onerror();
  assert.equal(page.image.src, 'assets/puzzle-image.webp');
  page.image.onload();
  await page.ready;
});

test('portrait and landscape artwork retain their proportions', () => {
  for (const [naturalWidth, naturalHeight] of [[1000, 1000], [800, 1200], [1200, 800]]) {
    const image = { naturalWidth, naturalHeight }, calls = [];
    const context = { puzzleImage: image };
    vm.runInNewContext(artwork, context);
    context.drawCover({ fillRect() {}, drawImage: (...args) => calls.push(args) }, 400);
    const [, x, y, width, height] = calls[0];
    assert.ok(width <= 400 && height <= 400 && x >= 0 && y >= 0);
    assert.ok(Math.abs(width / height - naturalWidth / naturalHeight) < .0001);
  }
});
