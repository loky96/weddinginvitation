const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../theme-contrast.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../theme-contrast.css'), 'utf8');

function mount(initialCanvas, { osDark = false, forcedColors = false, supported = true } = {}) {
  let canvas = initialCanvas, probes = 0;
  const classes = new Set(), listeners = new Map(), events = [];
  const forced = { matches: forcedColors, addEventListener: (name, fn) => listeners.set('forced-' + name, fn) };
  const root = { classList: { contains: name => classes.has(name), toggle: (name, active) => active ? classes.add(name) : classes.delete(name) } };
  vm.runInNewContext(source, {
    window: { CSS: { supports: () => supported } },
    document: { documentElement: root, hidden: false,
      body: { appendChild() { probes++; } },
      createElement: () => ({ style: {}, remove() { probes--; } }),
      addEventListener: (name, fn) => listeners.set(name, fn),
    },
    matchMedia: query => query.includes('forced-colors') ? forced : {
      matches: osDark, addEventListener: (name, fn) => listeners.set('preference-' + name, fn),
    },
    getComputedStyle: () => ({ backgroundColor: canvas }),
    addEventListener: (name, fn) => listeners.set(name, fn),
    requestAnimationFrame: fn => fn(), dispatchEvent: event => events.push(event.type), Event,
  });
  return { classes, events, probes: () => probes,
    change(value) { canvas = value; listeners.get('preference-change')?.(); },
  };
}

test('a dark Chrome interface still keeps the invitation light when its light-only opt-out works', () => {
  const page = mount('rgb(255, 255, 255)', { osDark: true });
  assert.ok(!page.classes.has('auto-dark-theme'));
  assert.equal(page.probes(), 0);
  assert.equal(page.events.length, 0);
  page.change('rgb(255, 255, 255)');
  assert.deepEqual(page.events, ['invitation-themechange'], 'changing browser preference repaints puzzle guides without switching the light page to dark');
});

test('actual browser darkening enables the fallback and theme changes restore light colours', () => {
  const page = mount('rgb(18, 18, 18)', { osDark: true });
  assert.ok(page.classes.has('auto-dark-theme'));
  assert.deepEqual(page.events, ['invitation-themechange']);
  page.change('rgb(255, 255, 255)');
  assert.ok(!page.classes.has('auto-dark-theme'));
  assert.equal(page.events.length, 2);
  assert.equal(page.probes(), 0);
});

test('high-contrast accessibility settings and unsupported probes are not replaced by the fallback', () => {
  for (const page of [
    mount('rgb(0, 0, 0)', { forcedColors: true }),
    mount('rgb(0, 0, 0)', { supported: false }),
    mount('Canvas'), mount('color(srgb 1 1 1)'),
  ]) assert.ok(!page.classes.has('auto-dark-theme'));
});

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(value => {
    const channel = parseInt(value, 16) / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
}

test('fallback text and selected attendee numbers meet readable contrast levels', () => {
  const token = name => css.match(new RegExp('--' + name + ':\\s*(#[0-9a-f]{6})', 'i'))[1];
  for (const background of ['#211a16', '#30251f', '#2b221d', '#3b2c23']) {
    for (const foreground of [token('brown'), token('maroon'), token('verm'), '#dcc9ac']) {
      assert.ok(contrast(foreground, background) >= 4.5, `${foreground} on ${background}`);
    }
  }
  assert.ok(contrast(token('cream'), token('gold')) >= 4.5, 'selected count');
  assert.ok(contrast('#9b805f', '#2b221d') >= 3, 'field boundaries');
  assert.ok(contrast('#b99b70', '#211a16') >= 3, 'dark puzzle guides');
  assert.ok(contrast('#9b805f', '#faf0dc') >= 3, 'guides remain visible when Chrome uses a light page with a dark interface');
});
