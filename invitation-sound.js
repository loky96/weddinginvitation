// Quiet, synthesized interaction sounds. Audio starts only after a user gesture.
(() => {
  let context, master;
  async function unlock() {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('Audio unavailable');
      if (!context) {
        context = new Audio();
        master = context.createGain();
        master.gain.value = .45;
        master.connect(context.destination);
      }
      if (context.state === 'suspended') await context.resume();
      master.gain.value = .45;
    } catch { /* Audio support is optional; the invitation still works silently. */ }
  }
  function tone(frequency, delay, duration, volume) {
    const oscillator = context.createOscillator(), gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + .02);
  }
  function rustle(duration, frequency, volume) {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.buffer = buffer;
    filter.type = 'lowpass'; filter.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + .08);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
    source.connect(filter).connect(gain).connect(master);
    source.start(); source.stop(context.currentTime + duration);
  }
  function play(kind, progress = 0) {
    if (!context || context.state !== 'running' || document.hidden) return false;
    if (kind === 'doors') {
      [[523, .12], [1046, .05], [1438, .025]].forEach(([f, v]) => tone(f, 0, 2.3, v));
      rustle(1.3, 420, .035);
    } else if (kind === 'piece') {
      tone(720 + progress * 18, 0, .16, .055);
      tone(1080 + progress * 18, .025, .12, .022);
    } else if (kind === 'complete') {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, i * .14, .8, .07));
    } else if (kind === 'scroll') {
      rustle(1.1, 1700, .045);
      tone(392, .08, .65, .035);
    }
    return true;
  }
  document.addEventListener('pointerdown', unlock, { passive: true });
  document.addEventListener('pointerup', unlock, { passive: true });
  document.addEventListener('keydown', unlock);
  window.InvitationSound = { play };
})();
