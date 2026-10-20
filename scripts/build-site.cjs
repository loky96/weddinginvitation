const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const files = [
  'index.html', 'puzzle.html', 'base.css', 'tied-scroll.css',
  'invite.js', 'temple-scene.js',
  'assets/temple-entrance.png', 'assets/temple-doors.png',
  'assets/puzzle-image.png', 'assets/puzzle-border.svg',
];

for (const file of files) {
  const target = path.join(root, 'dist', file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, file), target);
}
console.log(`Prepared ${files.length} invitation files in dist/.`);
