const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../puzzle.html'), 'utf8');
const source = html.slice(html.indexOf('  function complete('), html.indexOf('  // Pull the cord 80'));

function mount() {
  const classes = new Set(), hangClasses = new Set(), flowers = [], listeners = new Map(), label = {};
  let opens = 0, autoScrolls = 0, rect = { top: 900, bottom: 1050 };
  const context = {
    board: { getContext: () => ({ drawImage() {} }) }, cover: {},
    stage: { classList: { contains: key => classes.has(key), add: key => classes.add(key) }, style: {} },
    geo: { mobile: true, boardY: 20, S: 300, stageH: 600 },
    knot: { setAttribute() {}, querySelector: () => label },
    hang: {
      classList: { contains: key => hangClasses.has(key) },
      getBoundingClientRect: () => rect, scrollIntoView: () => autoScrolls++,
    },
    window: { InvitationSound: { play() {} } },
    INVITE: { reduced: false, petals: (...args) => flowers.push(args), unroll: () => { opens++; hangClasses.add('untied'); } },
    scrollY: 100, innerHeight: 700, innerWidth: 390,
    setTimeout: callback => callback(), addEventListener: (event, callback) => listeners.set(event, callback),
  };
  vm.runInNewContext(source, context);
  return {
    context, flowers, label, opens: () => opens, autoScrolls: () => autoScrolls,
    showScroll: () => rect = { top: 400, bottom: 550 },
    scroll: y => { context.scrollY = y; listeners.get('scroll')(); },
  };
}

test('completion showers petals once and waits for the user to scroll down to the invitation', () => {
  const page = mount();
  page.context.complete(true);
  assert.equal(page.flowers.length, 3);
  assert.ok(page.flowers.every(([, y, count, fall]) => y === -20 && count === 22 && fall > 700));
  assert.equal(page.opens(), 0);
  assert.equal(page.autoScrolls(), 0);
  assert.equal(page.label.textContent, 'Scroll down to open');
  page.context.complete(true);
  assert.equal(page.flowers.length, 3, 'completion updates do not repeat the celebration');
  page.scroll(110);
  assert.equal(page.opens(), 0, 'scroll is still below the viewport');
  page.showScroll();
  page.scroll(100);
  assert.equal(page.opens(), 0, 'upward scrolling does not open it');
  page.scroll(120);
  assert.equal(page.opens(), 1);
  page.scroll(130);
  assert.equal(page.opens(), 1, 'unroll happens once');
  assert.ok(!html.includes('Beautifully done'));
});

test('incomplete puzzles stay locked, while restored completion can open on downward scroll', () => {
  const page = mount();
  page.showScroll();
  page.scroll(150);
  assert.equal(page.opens(), 0);
  page.context.complete(false);
  assert.equal(page.flowers.length, 0);
  assert.equal(page.opens(), 0);
  page.scroll(160);
  assert.equal(page.opens(), 1);
});

test('flower showers use the full viewport while regular petals and reduced motion keep their behavior', () => {
  const invite = fs.readFileSync(path.join(__dirname, '../invite.js'), 'utf8');
  const petals = invite.slice(invite.indexOf('  function petals('), invite.indexOf('  // Untie the cord'));
  const nodes = [], math = Object.create(Math);
  math.random = () => .5;
  const context = { reduced: false, Math: math, setTimeout() {},
    document: { createElement: () => ({ style: {} }), body: { append: node => nodes.push(node) } } };
  vm.runInNewContext(petals, context);
  context.petals(100, -20, 1, 800);
  assert.ok(nodes[0].style.cssText.includes('--dy:800px'));
  context.petals(100, 200, 1);
  assert.ok(nodes[1].style.cssText.includes('--dy:140px'));
  context.reduced = true;
  context.petals(100, -20, 20, 800);
  assert.equal(nodes.length, 2);
});
