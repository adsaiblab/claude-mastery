import { test } from 'node:test';
import assert from 'node:assert/strict';
import { greet } from './index.js';

test('greet retourne une salutation en français', () => {
  assert.equal(greet('Ada'), 'Bonjour Ada');
});
