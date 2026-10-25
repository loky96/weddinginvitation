const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const client = readFileSync(path.join(__dirname, '../rsvp.js'), 'utf8');
const server = readFileSync(path.join(__dirname, '../scripts/rsvp-google-apps-script.gs'), 'utf8');

function mount(fetchResult) {
  const handlers = {}, details = {}, status = { focus() {} }, button = {};
  const name = { value: '  Test Guest  ' };
  let attending, submitted;
  const form = { dataset: { endpoint: 'https://example.test/rsvp' }, style: {},
    elements: { namedItem: () => name }, reportValidity: () => true,
    querySelector: selector => selector.startsWith('button') ? button : attending && { value: attending },
    addEventListener: (event, callback) => handlers[event] = callback,
  };
  vm.runInNewContext(client, {
    location: { search: '' },
    document: { getElementById: id => ({ 'rsvp-form': form, 'rsvp-details': details, 'rsvp-status': status })[id] },
    URLSearchParams, AbortController, setTimeout: () => 1, clearTimeout() {},
    FormData: class { *[Symbol.iterator]() {
      yield ['name', name.value]; yield ['attending', attending];
      if (!details.disabled) { yield ['count', '2']; yield ['stay', 'Yes']; }
    } },
    fetch: async (_, options) => { submitted = options; return fetchResult(); },
  });
  return { form, details, status, button, name, submitted: () => submitted,
    choose(value) { attending = value; handlers.change(); },
    submit: () => handlers.submit({ preventDefault() {} }),
  };
}

test('the no-RSVP link removes the entire section without initializing submissions', () => {
  let removed = false;
  vm.runInNewContext(client, {
    location: { search: '?rsvp=off' }, URLSearchParams,
    document: { querySelector: selector => {
      assert.equal(selector, '.rsvp-section');
      return { remove() { removed = true; } };
    }, getElementById() { throw Error('RSVP must not initialize'); } },
  });
  assert.ok(removed);
});

test('declining hides and omits guest count and stay details', async () => {
  const page = mount(() => ({ ok: true, json: async () => ({ ok: true }) }));
  assert.ok(page.details.hidden && page.details.disabled);
  page.choose('Yes'); assert.ok(!page.details.hidden && !page.details.disabled);
  page.choose('No'); await page.submit();
  assert.equal(page.name.value, 'Test Guest');
  assert.equal(page.submitted().body.get('attending'), 'No');
  assert.ok(!page.submitted().body.has('count') && !page.submitted().body.has('stay'));
  assert.ok(page.form.hidden && page.status.textContent.includes('saved'));
});

test('a network failure never claims a saved RSVP', async () => {
  const page = mount(() => { throw new Error('Network unavailable'); });
  page.choose('Yes'); await page.submit();
  assert.ok(!page.form.hidden && !page.button.disabled);
  assert.match(page.status.textContent, /couldn’t confirm/);
});

function submitToServer(parameter, fail = false) {
  const responses = [];
  let saved = false;
  const context = {
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: value => ({ setMimeType: () => JSON.parse(value) }) },
    FormApp: { openById: () => ({
      getItemById: id => {
        const item = { createResponse: value => ({ id, value }) };
        return { asTextItem: () => item, asListItem: () => item, asMultipleChoiceItem: () => item };
      },
      createResponse: () => ({ withItemResponse(answer) { responses.push(answer); return this; },
        submit() { if (fail) throw new Error('Storage failed'); saved = true; } }),
    }) },
  };
  vm.runInNewContext(server, context);
  return { result: context.doPost({ parameter }), saved: () => saved, responses };
}

test('the connector saves matching Google Form answers and skips details for declines', () => {
  const yes = submitToServer({ name: 'Test', attending: 'Yes', count: '2', stay: 'Yes' });
  assert.ok(yes.saved() && yes.result.ok);
  assert.deepEqual(yes.responses.map(answer => answer.value), ['Test', 'Joyfully Accepts', '2', 'Yes']);
  const no = submitToServer({ name: 'Test', attending: 'No', count: '2', stay: 'Yes' });
  assert.equal(no.responses.length, 2);
  assert.ok(no.saved() && no.result.ok);
});

test('invalid data and storage failures return errors instead of confirmation', () => {
  for (const parameter of [
    { name: ' ', attending: 'Yes', count: '2', stay: 'Yes' },
    { name: 'Test', attending: 'Maybe' },
    { name: 'Test', attending: 'Yes', count: '2.5', stay: 'Yes' },
    { name: 'Test', attending: 'Yes', count: '6', stay: 'Yes' },
    { name: 'Test', attending: 'Yes', count: '2', stay: 'Maybe' },
  ]) {
    const testCase = submitToServer(parameter);
    assert.ok(!testCase.result.ok && !testCase.saved());
  }
  assert.ok(!submitToServer({ name: 'Test', attending: 'No' }, true).result.ok);
});
