const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../invite.js'), 'utf8');
const escape = source.slice(source.indexOf('  const esc ='), source.indexOf('  const LOCATION'));
const format = source.slice(source.indexOf('  const parentLine ='), source.indexOf('  const person ='));
const parentLine = vm.runInNewContext(escape + format + '\nparentLine;');
const data = vm.runInNewContext(source.slice(0, source.indexOf('\n(() =>')) + '\nINVITE;');

test('parents retain their original text while professions and titles get separate styling', () => {
  for (const person of Object.values(data.couple)) {
    const lines = person.parentage;
    lines.forEach((line, i) => {
      const html = parentLine(line, i, lines.length);
      const text = html.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&');
      assert.equal(text, line);
      if (i < 2) {
        const name = line.slice(0, line.indexOf(',') + 1).replaceAll('&', '&amp;');
        assert.ok(html.startsWith(name + '<span class="parent-detail">'), 'names retain their normal styling');
      } else if (i < lines.length - 1) assert.ok(html.startsWith('<span class="parent-detail">'));
      else assert.ok(!html.includes('parent-detail'), 'location remains normal text');
    });
  }
});

test('parent names and professional details remain escaped', () => {
  assert.equal(parentLine('Mr. <Name>, A&B', 0, 5), 'Mr. &lt;Name&gt;,<span class="parent-detail"> A&amp;B</span>');
  assert.equal(parentLine('<Professor>', 2, 5), '<span class="parent-detail">&lt;Professor&gt;</span>');
  assert.equal(parentLine('Mrs. Name', 1, 5), 'Mrs. Name');
});
