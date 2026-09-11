import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTitle,
  formatDescription,
  DEFAULT_SITE_TITLE
} from '../lib/title-utils.js';

test('formatTitle appends the brand suffix when it fits within the limit', () => {
  assert.equal(
    formatTitle('Barbados Lily (Hippeastrum striatum)'),
    'Barbados Lily (Hippeastrum striatum) | The Botanical Bazaar'
  );
});

test('formatTitle returns the bare title when the suffix would exceed the limit', () => {
  assert.equal(
    formatTitle('Peanut Butter Fruit (Bunchosia glandulifera)'),
    'Peanut Butter Fruit (Bunchosia glandulifera)'
  );
});

test('formatTitle truncates over-limit titles with an ellipsis at the default 60-char cap', () => {
  const out = formatTitle("Bird's Nest Snake Plant (Dracaena trifasciata 'Hahnii Green')");
  assert.ok(out.length <= 60, `expected <= 60 chars, got ${out.length}`);
  assert.ok(out.endsWith('\u2026'));
});

test('formatTitle honors a custom limit so long PDP names render untruncated (T-017)', () => {
  const name = "Bird's Nest Snake Plant (Dracaena trifasciata 'Hahnii Green')";
  const out = formatTitle(name, undefined, 70);
  assert.equal(out, name);
});

test('formatTitle appends the suffix for mid-length titles under a raised limit', () => {
  const out = formatTitle('Bellyache Bush (Jatropha gossypiifolia)', undefined, 70);
  assert.equal(out, 'Bellyache Bush (Jatropha gossypiifolia) | The Botanical Bazaar');
  assert.ok(out.length <= 70);
});

test('formatTitle strips an already-present suffix before re-evaluating length', () => {
  const out = formatTitle('Coral Bush (Jatropha multifida) | The Botanical Bazaar');
  assert.equal(out, 'Coral Bush (Jatropha multifida) | The Botanical Bazaar');
});

test('formatTitle falls back to the default site title for empty input', () => {
  assert.equal(formatTitle(''), DEFAULT_SITE_TITLE);
  assert.equal(formatTitle(null), DEFAULT_SITE_TITLE);
});

test('formatDescription truncates to 150 chars with an ellipsis', () => {
  const out = formatDescription('x'.repeat(200));
  assert.ok(out.length <= 150, `expected <= 150 chars, got ${out.length}`);
  assert.ok(out.endsWith('\u2026'));
});
