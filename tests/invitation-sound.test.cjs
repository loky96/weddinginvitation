const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../invitation-sound.js'), 'utf8');

function mount(supported = true) {
  let voices = 0;
  const handlers = new Map();
  const node = () => ({
    gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, frequency: { value: 0 },
    connect() { return this; }, start() { voices++; }, stop() {},
  });
  class Audio {
    state = 'running'; sampleRate = 8000; currentTime = 0;
    createGain() { return node(); } createOscillator() { return node(); }
    createBufferSource() { return node(); } createBiquadFilter() { return node(); }
    createBuffer(_, length) { return { getChannelData: () => new Float32Array(length) }; }
  }
  const window = { AudioContext: supported ? Audio : undefined };
  vm.runInNewContext(source, {
    window, document: { addEventListener: (name, callback) => handlers.set(name, callback), hidden: false },
  });
  return { window, gesture: () => handlers.get('pointerdown')(), voices: () => voices };
}

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
