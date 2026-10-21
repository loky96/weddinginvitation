const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

test('old puzzle links retain query parameters and anchors when redirected to invite.html', () => {
  const redirect = fs.readFileSync(path.join(root, 'puzzle.html'), 'utf8');
  let destination;
  vm.runInNewContext(redirect.match(/<script>([\s\S]*?)<\/script>/)[1], {
    location: { search: '?solved', hash: '#rsvp-title', replace: value => destination = value },
  });
  assert.equal(destination, 'invite.html?solved#rsvp-title');
  assert.ok(fs.existsSync(path.join(root, 'dist/invite.html')));
});

test('published raster images are WebP and every image reference resolves', () => {
  const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
  const files = walk(path.join(root, 'dist'));
  assert.ok(files.some(file => file.endsWith('.webp')));
  assert.ok(!files.some(file => /\.(png|jpe?g)$/i.test(file)), 'source PNGs are not included in deployment');
  for (const file of files.filter(file => file.endsWith('.webp'))) {
    const buffer = fs.readFileSync(file);
    assert.equal(buffer.toString('ascii', 0, 4), 'RIFF');
    assert.equal(buffer.toString('ascii', 8, 12), 'WEBP');
  }
  const html = fs.readFileSync(path.join(root, 'dist/invite.html'), 'utf8');
  assert.doesNotMatch(html, /assets\/[^'"\s)]+\.(?:png|jpe?g)\b/i);
  for (const [file] of html.matchAll(/assets\/[a-z0-9-]+\.webp/gi)) assert.ok(fs.existsSync(path.join(root, 'dist', file)), file);
});

test('random selection prefers each WebP rendition once and original artwork remains saved', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'puzzle-images.js'), 'utf8'), context);
  const images = context.window.PUZZLE_IMAGES;
  const originals = fs.readdirSync(path.join(root, 'puzzle-images')).filter(file => file.endsWith('.png'));
  assert.equal(images.length, originals.length);
  assert.ok(images.every(file => file.endsWith('.webp')));
  assert.equal(new Set(images.map(file => path.parse(file).name)).size, originals.length);
  for (const name of ['reception-illustration', 'wedding-illustration']) {
    assert.ok(fs.existsSync(path.join(root, `assets/${name}.png`)));
    assert.ok(fs.existsSync(path.join(root, `assets/${name}.webp`)));
  }
});
