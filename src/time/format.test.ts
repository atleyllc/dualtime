import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatTime24, formatWidgetTime12, formatWidgetTime24 } from './format.ts';

test('24-hour time has two-digit hours and minutes', () => {
  assert.match(formatTime24(new Date(2026, 0, 2, 7, 5, 9), false), /^07:05$/);
  assert.match(formatTime24(new Date(2026, 0, 2, 7, 5, 9), true), /^07:05:09$/);
});

test('midnight is 00 in 24-hour time', () => {
  assert.match(formatWidgetTime24(new Date(2026, 0, 2, 0, 30)), /^00:30$/);
});

test('12-hour widget time has a day period', () => {
  assert.match(formatWidgetTime12(new Date(2026, 0, 2, 13, 5)), /1:05/);
});
