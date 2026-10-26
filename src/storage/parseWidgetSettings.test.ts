import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DEFAULT_DUAL_CLOCKS, clocksForLegacyOrder } from '../time/clocks.ts';
import { DEFAULT_WIDGET_SETTINGS } from '../types/widgetSettings.ts';
import { parseWidgetSettings } from './parseWidgetSettings.ts';

/** What v1.1.0 saved under dualtime.widget.settings.v1. */
const V110 = {
  tapAction: 'open_settings',
  theme: 'light',
  showDate: false,
  dateFormat: 'day_month',
  showSeconds: true,
  timeOrder: '12_on_top',
};

test('defaults include the two clocks', () => {
  assert.deepEqual(DEFAULT_WIDGET_SETTINGS.clocks, DEFAULT_DUAL_CLOCKS);
});

test('nothing stored gives the defaults', () => {
  assert.deepEqual(parseWidgetSettings(null), DEFAULT_WIDGET_SETTINGS);
  assert.deepEqual(parseWidgetSettings(''), DEFAULT_WIDGET_SETTINGS);
});

test('broken JSON gives the defaults', () => {
  assert.deepEqual(parseWidgetSettings('{not json'), DEFAULT_WIDGET_SETTINGS);
  assert.deepEqual(parseWidgetSettings('null'), DEFAULT_WIDGET_SETTINGS);
  assert.deepEqual(parseWidgetSettings('[1,2]'), DEFAULT_WIDGET_SETTINGS);
});

test('v1.1.0 settings keep every field and get clocks from timeOrder', () => {
  const out = parseWidgetSettings(JSON.stringify(V110));
  assert.deepEqual(out, { ...V110, clocks: clocksForLegacyOrder('12_on_top') });
});

test('the old open_app tap action still maps to open_dualtime', () => {
  assert.equal(parseWidgetSettings(JSON.stringify({ tapAction: 'open_app' })).tapAction, 'open_dualtime');
});

test('stored clocks are kept', () => {
  const clocks = {
    top: { zone: { kind: 'utc' }, hourFormat: '24h', label: 'UTC' },
    bottom: { zone: { kind: 'iana', id: 'Europe/London' }, hourFormat: '12h', label: '' },
  };
  assert.deepEqual(parseWidgetSettings(JSON.stringify({ ...V110, clocks })).clocks, clocks);
});

test('invalid stored clocks are repaired from timeOrder', () => {
  const out = parseWidgetSettings(JSON.stringify({ timeOrder: '12_on_top', clocks: 'bad' }));
  assert.deepEqual(out.clocks, clocksForLegacyOrder('12_on_top'));
});

test('parsed settings never share objects with the defaults', () => {
  const out = parseWidgetSettings(null);
  out.clocks.top.label = 'changed';
  assert.equal(DEFAULT_WIDGET_SETTINGS.clocks.top.label, '');
});
