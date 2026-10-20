const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const imageDirectory = path.join(root, 'puzzle-images');
const candidates = fs.existsSync(imageDirectory)
  ? fs.readdirSync(imageDirectory).filter(name => /\.(png|jpe?g|webp|avif)$/i.test(name)).sort()
  : [];
const webpNames = new Set(candidates.filter(name => /\.webp$/i.test(name)).map(name => path.parse(name).name.toLowerCase()));
const images = candidates.filter(name => /\.webp$/i.test(name) || !webpNames.has(path.parse(name).name.toLowerCase()))
  .map(name => `puzzle-images/${name}`);
const imageUrls = images.map(file => file.split('/').map(encodeURIComponent).join('/'));
fs.writeFileSync(path.join(root, 'puzzle-images.js'), `window.PUZZLE_IMAGES = ${JSON.stringify(imageUrls, null, 2)};\n`);
const files = [
  'index.html', 'puzzle.html', 'base.css', 'tied-scroll.css',
  'invite.js', 'temple-scene.js', 'invitation-sound.js',
  'assets/temple-entrance.webp', 'assets/temple-doors.webp',
  'assets/puzzle-image.webp', 'assets/puzzle-border.svg',
  'assets/kolam-pattern.svg', 'assets/paper-texture.svg',
  'assets/reception-symbol.webp', 'assets/wedding-symbol.webp',
  'assets/kolam-diamond.svg', 'assets/kolam-flower.svg', 'assets/kolam-cross.svg', 'assets/kolam-border.svg',
  'assets/temple-entrance-mobile.webp',
  'assets/kolam-horizontal.svg', 'assets/scroll-silk.webp', 'assets/bansuri-solo.mp3', 'assets/MUSIC-CREDIT.txt',
  'puzzle-images.js', ...images,
];

const outputDirectory = path.resolve(root, 'dist');
if (path.dirname(outputDirectory) !== path.resolve(root)) throw new Error('Build output must stay inside the project');
fs.rmSync(outputDirectory, { recursive: true, force: true });
for (const file of files) {
  const target = path.join(outputDirectory, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, file), target);
}
console.log(`Prepared ${files.length} invitation files in dist/.`);
