const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const imageDirectory = path.join(root, 'puzzle-images');
const images = fs.existsSync(imageDirectory)
  ? fs.readdirSync(imageDirectory).filter(name => /\.(png|jpe?g|webp|avif)$/i.test(name)).sort().map(name => `puzzle-images/${name}`)
  : [];
const imageUrls = images.map(file => file.split('/').map(encodeURIComponent).join('/'));
fs.writeFileSync(path.join(root, 'puzzle-images.js'), `window.PUZZLE_IMAGES = ${JSON.stringify(imageUrls, null, 2)};\n`);
const files = [
  'index.html', 'puzzle.html', 'base.css', 'tied-scroll.css',
  'invite.js', 'temple-scene.js', 'invitation-sound.js',
  'assets/temple-entrance.png', 'assets/temple-doors.png',
  'assets/puzzle-image.png', 'assets/puzzle-border.svg',
  'assets/kolam-pattern.svg', 'assets/paper-texture.svg',
  'assets/reception-illustration.png', 'assets/wedding-illustration.png',
  'assets/kolam-diamond.svg', 'assets/kolam-flower.svg', 'assets/kolam-cross.svg', 'assets/kolam-border.svg',
  'assets/temple-entrance-mobile.png',
  'assets/kolam-horizontal.svg', 'assets/scroll-silk.png', 'assets/temple-melam.mp3', 'assets/MUSIC-CREDIT.txt',
  'puzzle-images.js', ...images,
];

for (const file of files) {
  const target = path.join(root, 'dist', file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, file), target);
}
console.log(`Prepared ${files.length} invitation files in dist/.`);
