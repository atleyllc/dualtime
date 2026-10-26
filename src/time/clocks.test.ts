import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CLOCK_LABEL_MAX,
  DEFAULT_DUAL_CLOCKS,
  clockDateKey,
  clockDayOffset,
  clocksForLegacyOrder,
  formatClockTime,
  isValidTimeZone,
  normalizeClockConfig,
  normalizeDualClocks,
  resolveTimeZone,
  searchTimeZones,
  type ClockConfig,
} from './clocks.ts';

const NY = 'America/New_York';
const en = { locale: 'en-US', deviceTimeZone: NY };

/** ICU puts a narrow no-break space before AM/PM; compare with plain spaces. */
function plain(text: string): string {
  return text.replace(/[\u202f\u00a0]/g, ' ');
}

function clock(zone: ClockConfig['zone'], hourFormat: ClockConfig['hourFormat'] = '24h'): ClockConfig {
  return { zone, hourFormat, label: '' };
}

const utc24 = clock({ kind: 'utc' });
const device24 = clock({ kind: 'device' });
const zone24 = (id: string) => clock({ kind: 'iana', id });
const zone12 = (id: string) => clock({ kind: 'iana', id }, '12h');

// Defaults and migration

test('defaults match the shipped widget: 24-hour on top, 12-hour below, both device-local, no labels', () => {
  assert.deepEqual(DEFAULT_DUAL_CLOCKS, {
    top: { zone: { kind: 'device' }, hourFormat: '24h', label: '' },
    bottom: { zone: { kind: 'device' }, hourFormat: '12h', label: '' },
  });
});

test('legacy timeOrder maps onto the two clocks', () => {
  assert.deepEqual(clocksForLegacyOrder('24_on_top'), DEFAULT_DUAL_CLOCKS);
  assert.deepEqual(clocksForLegacyOrder('12_on_top'), {
    top: { zone: { kind: 'device' }, hourFormat: '12h', label: '' },
    bottom: { zone: { kind: 'device' }, hourFormat: '24h', label: '' },
  });
  assert.deepEqual(clocksForLegacyOrder(undefined), DEFAULT_DUAL_CLOCKS);
  assert.deepEqual(clocksForLegacyOrder('sideways'), DEFAULT_DUAL_CLOCKS);
});

test('settings saved before this update (no clocks) keep their layout', () => {
  assert.deepEqual(normalizeDualClocks(undefined), DEFAULT_DUAL_CLOCKS);
  assert.deepEqual(normalizeDualClocks(undefined, '12_on_top'), clocksForLegacyOrder('12_on_top'));
  for (const junk of [null, 'top', 42, [], true]) {
    assert.deepEqual(normalizeDualClocks(junk), DEFAULT_DUAL_CLOCKS);
  }
});

test('each clock is independent and keeps valid stored values', () => {
  const stored = {
    top: { zone: { kind: 'utc' }, hourFormat: '24h', label: 'Zulu' },
    bottom: { zone: { kind: 'iana', id: 'Asia/Tokyo' }, hourFormat: '12h', label: 'Tokyo' },
  };
  assert.deepEqual(normalizeDualClocks(stored), stored);
});

test('invalid fields fall back per field, not per clock', () => {
  const out = normalizeDualClocks(
    {
      top: { zone: { kind: 'iana', id: 'Mars/Olympus_Mons' }, hourFormat: '24h', label: 'Ops' },
      bottom: { zone: { kind: 'utc' }, hourFormat: '13h', label: 7 },
    },
    '12_on_top'
  );
  assert.deepEqual(out, {
    top: { zone: { kind: 'device' }, hourFormat: '24h', label: 'Ops' },
    bottom: { zone: { kind: 'utc' }, hourFormat: '24h', label: '' },
  });
  assert.deepEqual(normalizeDualClocks({ top: { zone: { kind: 'iana' } } }).top, DEFAULT_DUAL_CLOCKS.top);
  assert.deepEqual(normalizeDualClocks({ top: { zone: { kind: 'moon' } } }).top, DEFAULT_DUAL_CLOCKS.top);
});

test('labels are optional, trimmed and capped', () => {
  const fallback = DEFAULT_DUAL_CLOCKS.top;
  assert.equal(normalizeClockConfig({ label: '  HQ  ' }, fallback).label, 'HQ');
  assert.equal(normalizeClockConfig({ label: '   ' }, fallback).label, '');
  assert.equal(normalizeClockConfig({}, fallback).label, '');
  const long = normalizeClockConfig({ label: 'x'.repeat(100) }, fallback).label;
  assert.equal(long.length, CLOCK_LABEL_MAX);
});

test('normalized results never share objects with the defaults', () => {
  const out = normalizeDualClocks(undefined);
  out.top.label = 'changed';
  out.top.zone = { kind: 'utc' };
  assert.equal(DEFAULT_DUAL_CLOCKS.top.label, '');
  assert.deepEqual(DEFAULT_DUAL_CLOCKS.top.zone, { kind: 'device' });
});

// Time zones

test('time zone ids are validated', () => {
  assert.equal(isValidTimeZone('UTC'), true);
  assert.equal(isValidTimeZone('Europe/London'), true);
  assert.equal(isValidTimeZone('Asia/Kolkata'), true);
  assert.equal(isValidTimeZone('Mars/Olympus_Mons'), false);
  assert.equal(isValidTimeZone(''), false);
});

test('zones resolve: device uses the device zone, UTC is UTC, an invalid id falls back to the device', () => {
  assert.equal(resolveTimeZone({ kind: 'device' }, NY), NY);
  assert.equal(resolveTimeZone({ kind: 'utc' }, NY), 'UTC');
  assert.equal(resolveTimeZone({ kind: 'iana', id: 'Asia/Tokyo' }, NY), 'Asia/Tokyo');
  assert.equal(resolveTimeZone({ kind: 'iana', id: 'Nowhere/Land' }, NY), NY);
  assert.equal(resolveTimeZone({ kind: 'device' }), Intl.DateTimeFormat().resolvedOptions().timeZone);
});

test('search finds zones by city, case-insensitive, with spaces for underscores', () => {
  assert.ok(searchTimeZones('new york').includes(NY));
  assert.ok(searchTimeZones('NEW_YORK').includes(NY));
  assert.ok(searchTimeZones('tokyo').includes('Asia/Tokyo'));
  assert.ok(searchTimeZones('utc').includes('UTC'));
  assert.ok(searchTimeZones('london').includes('Europe/London'));
  assert.deepEqual(searchTimeZones(''), []);
  assert.deepEqual(searchTimeZones('   '), []);
  assert.deepEqual(searchTimeZones('zzzz-not-a-zone'), []);
});

test('search results are valid zones, unique and limited', () => {
  const all = searchTimeZones('america');
  assert.ok(all.length > 0 && all.length <= 20);
  assert.equal(new Set(all).size, all.length);
  assert.ok(all.every((id) => isValidTimeZone(id)));
  assert.equal(searchTimeZones('america', 5).length, 5);
});

// Formatting

test('12/24-hour format per clock', () => {
  const at = new Date('2026-07-04T17:05:09Z');
  assert.equal(plain(formatClockTime(at, utc24, en)), '17:05');
  assert.equal(plain(formatClockTime(at, clock({ kind: 'utc' }, '12h'), en)), '5:05 PM');
  assert.equal(plain(formatClockTime(at, utc24, { ...en, showSeconds: true })), '17:05:09');
  assert.equal(plain(formatClockTime(at, device24, en)), '13:05');
});

test('midnight is 00 on a 24-hour clock and 12 AM on a 12-hour clock', () => {
  const at = new Date('2026-07-04T00:05:00Z');
  assert.equal(plain(formatClockTime(at, utc24, en)), '00:05');
  assert.equal(plain(formatClockTime(at, clock({ kind: 'utc' }, '12h'), en)), '12:05 AM');
});

test('UTC clock ignores DST', () => {
  assert.equal(plain(formatClockTime(new Date('2026-01-15T12:00:00Z'), utc24, en)), '12:00');
  assert.equal(plain(formatClockTime(new Date('2026-07-15T12:00:00Z'), utc24, en)), '12:00');
});

test('DST spring forward: New York skips 02:00-02:59 on 2026-03-08', () => {
  assert.equal(plain(formatClockTime(new Date('2026-03-08T06:59:00Z'), zone24(NY), en)), '01:59');
  assert.equal(plain(formatClockTime(new Date('2026-03-08T07:00:00Z'), zone24(NY), en)), '03:00');
  assert.equal(plain(formatClockTime(new Date('2026-03-08T07:00:00Z'), zone12(NY), en)), '3:00 AM');
});

test('DST fall back: New York shows 01:30 twice on 2026-11-01', () => {
  assert.equal(plain(formatClockTime(new Date('2026-11-01T05:30:00Z'), zone24(NY), en)), '01:30');
  assert.equal(plain(formatClockTime(new Date('2026-11-01T06:30:00Z'), zone24(NY), en)), '01:30');
});

test('DST in Europe/London on 2026-03-29 while a UTC clock does not move', () => {
  const before = new Date('2026-03-29T00:59:00Z');
  const after = new Date('2026-03-29T01:00:00Z');
  assert.equal(plain(formatClockTime(before, zone24('Europe/London'), en)), '00:59');
  assert.equal(plain(formatClockTime(after, zone24('Europe/London'), en)), '02:00');
  assert.equal(plain(formatClockTime(after, utc24, en)), '01:00');
});

test('half-hour and southern-hemisphere zones', () => {
  const at = new Date('2026-07-04T12:00:00Z');
  assert.equal(plain(formatClockTime(at, zone24('Asia/Kolkata'), en)), '17:30');
  assert.equal(plain(formatClockTime(at, zone24('Australia/Sydney'), en)), '22:00');
});

// Date rollover

test('date key is the calendar date in the clock zone', () => {
  const at = new Date('2026-10-26T03:30:00Z');
  assert.equal(clockDateKey(at, device24, NY), '2026-10-25');
  assert.equal(clockDateKey(at, utc24, NY), '2026-10-26');
  assert.equal(clockDateKey(at, zone24('Asia/Tokyo'), NY), '2026-10-26');
  assert.equal(clockDateKey(at, zone24('Pacific/Honolulu'), NY), '2026-10-25');
});

test('day offset against the device: next day, same day, previous day', () => {
  const lateEvening = new Date('2026-10-26T03:30:00Z');
  assert.equal(clockDayOffset(lateEvening, utc24, NY), 1);
  assert.equal(clockDayOffset(lateEvening, zone24('Asia/Tokyo'), NY), 1);
  assert.equal(clockDayOffset(lateEvening, zone24('Pacific/Honolulu'), NY), 0);
  assert.equal(clockDayOffset(lateEvening, device24, NY), 0);
  const tokyoMorning = new Date('2026-10-26T01:00:00Z');
  assert.equal(clockDayOffset(tokyoMorning, zone24('America/Los_Angeles'), 'Asia/Tokyo'), -1);
});

test('rollover across month and year ends', () => {
  const newYearUtc = new Date('2027-01-01T03:30:00Z');
  assert.equal(clockDateKey(newYearUtc, device24, NY), '2026-12-31');
  assert.equal(clockDateKey(newYearUtc, utc24, NY), '2027-01-01');
  assert.equal(clockDayOffset(newYearUtc, utc24, NY), 1);
  const monthEnd = new Date('2026-03-01T02:00:00Z');
  assert.equal(clockDateKey(monthEnd, device24, NY), '2026-02-28');
  assert.equal(clockDayOffset(monthEnd, utc24, NY), 1);
});

test('rollover on a DST day uses calendar dates, not 24-hour steps', () => {
  const at = new Date('2026-03-09T03:30:00Z');
  assert.equal(clockDateKey(at, device24, NY), '2026-03-08');
  assert.equal(clockDayOffset(at, utc24, NY), 1);
});
