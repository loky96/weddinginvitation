const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../invitation-sound.js'), 'utf8');

function mount(supported = true) {
  let voices = 0, music, musicConnections = 0;
  const gains = [];
  const handlers = new Map();
  const node = () => ({
    gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {},
      linearRampToValueAtTime(value) { this.target = value; } }, frequency: { value: 0 },
    connect() { return this; }, start() { voices++; }, stop() {},
  });
  class Audio {
    state = 'running'; sampleRate = 8000; currentTime = 0;
    createGain() { const gain = node(); gains.push(gain); return gain; } createOscillator() { return node(); }
    createMediaElementSource() { musicConnections++; return node(); }
    createBufferSource() { return node(); } createBiquadFilter() { return node(); }
    createBuffer(_, length) { return { getChannelData: () => new Float32Array(length) }; }
  }
  class Track {
    paused = true; plays = 0;
    constructor(url) { this.src = url; music = this; }
    play() { this.paused = false; this.plays++; return Promise.resolve(); }
    pause() { this.paused = true; }
  }
  const document = { addEventListener: (name, callback) => handlers.set(name, callback), hidden: false };
  const window = { AudioContext: supported ? Audio : undefined, Audio: Track,
    addEventListener: (name, callback) => handlers.set(name, callback) };
  vm.runInNewContext(source, {
    window, document,
  });
  return { window, document, handlers, gains, music: () => music, connections: () => musicConnections,
    gesture: () => handlers.get('pointerdown')(), voices: () => voices };
}

test('solo bansuri starts once after a gesture, loops quietly, and pauses while hidden', async () => {
  const page = mount();
  assert.equal(page.music(), undefined);
  await page.gesture();
  const track = page.music();
  assert.equal(track.src, 'assets/bansuri-solo.mp3');
  assert.equal(track.loop, true);
  assert.equal(page.gains[1].gain.target, .16);
  assert.equal(track.paused, false);
  await page.gesture();
  assert.equal(track.plays, 1);
  assert.equal(page.connections(), 1);
  page.document.hidden = true;
  page.handlers.get('visibilitychange')();
  assert.equal(track.paused, true);
  assert.equal(page.window.InvitationSound.play('piece'), false);
  await page.gesture();
  assert.equal(track.plays, 1);
  page.document.hidden = false;
  page.handlers.get('visibilitychange')();
  assert.equal(track.plays, 2);
  page.handlers.get('pagehide')();
  assert.equal(track.paused, true);
});

test('blocked music playback is retried on the next gesture', async () => {
  const page = mount();
  await page.gesture();
  const track = page.music();
  track.paused = true;
  track.play = () => Promise.reject(new Error('Blocked'));
  await page.gesture();
  await Promise.resolve();
  let retried = false;
  track.play = () => { retried = true; return Promise.resolve(); };
  await page.gesture();
  assert.ok(retried);
});

test('sounds start after a gesture without an opt-in button and cover all four interactions', async () => {
  const page = mount();
  assert.equal(page.window.InvitationSound.play('doors'), false);
  assert.equal(page.voices(), 0);
  await page.gesture();
  for (const kind of ['doors', 'piece', 'complete', 'scroll']) {
    const before = page.voices();
    assert.equal(page.window.InvitationSound.play(kind, 5), true);
    assert.ok(page.voices() > before);
  }
});

test('browsers without audio support remain usable and silent', async () => {
  const page = mount(false);
  await page.gesture();
  assert.equal(page.window.InvitationSound.play('doors'), false);
});
