import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import {
  DEFAULT_WIDGET_SETTINGS,
  type WidgetSettings,
  type WidgetTapAction,
  type WidgetTheme,
  type WidgetDateFormat,
  type WidgetTimeOrder,
} from '@/src/types/widgetSettings';
import {
  syncWidgetSettingsToNative,
  type WidgetNativeSyncResult,
} from '@/src/widget/nativeWidgetBridge';

const STORAGE_KEY = 'dualtime.widget.settings.v1';
const LEGACY_TRANSPARENT_KEY = 'dualtime.widget.transparentBackground';

const TAP_ACTIONS: WidgetTapAction[] = [
  'open_dualtime',
  'open_settings',
  'open_clock',
  'open_alarm',
  'do_nothing',
];
const THEMES: WidgetTheme[] = ['system', 'dark', 'light', 'transparent'];
const DATE_FORMATS: WidgetDateFormat[] = [
  'weekday_short',
  'weekday_short_no_comma',
  'month_day',
  'day_month',
  'weekday_long',
];
const TIME_ORDERS: WidgetTimeOrder[] = ['24_on_top', '12_on_top'];

function isTapAction(value: string): value is WidgetTapAction {
  return TAP_ACTIONS.includes(value as WidgetTapAction);
}
function isTheme(value: string): value is WidgetTheme {
  return THEMES.includes(value as WidgetTheme);
}
function isDateFormat(value: string): value is WidgetDateFormat {
  return DATE_FORMATS.includes(value as WidgetDateFormat);
}
function isTimeOrder(value: string): value is WidgetTimeOrder {
  return TIME_ORDERS.includes(value as WidgetTimeOrder);
}

function normalizeTapAction(value: string): WidgetTapAction {
  if (value === 'open_app') return 'open_dualtime';
  if (isTapAction(value)) return value;
  return DEFAULT_WIDGET_SETTINGS.tapAction;
}

function parseStored(raw: string | null): WidgetSettings {
  if (!raw) return { ...DEFAULT_WIDGET_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Partial<WidgetSettings> & { tapAction?: string };
    return {
      tapAction: normalizeTapAction(parsed.tapAction ?? DEFAULT_WIDGET_SETTINGS.tapAction),
      theme:
        parsed.theme && isTheme(parsed.theme) ? parsed.theme : DEFAULT_WIDGET_SETTINGS.theme,
      showDate: parsed.showDate ?? DEFAULT_WIDGET_SETTINGS.showDate,
      dateFormat:
        parsed.dateFormat && isDateFormat(parsed.dateFormat)
          ? parsed.dateFormat
          : DEFAULT_WIDGET_SETTINGS.dateFormat,
      showSeconds: parsed.showSeconds ?? DEFAULT_WIDGET_SETTINGS.showSeconds,
      timeOrder:
        parsed.timeOrder && isTimeOrder(parsed.timeOrder)
          ? parsed.timeOrder
          : DEFAULT_WIDGET_SETTINGS.timeOrder,
    };
  } catch {
    return { ...DEFAULT_WIDGET_SETTINGS };
  }
}

async function migrateLegacyTransparent(settings: WidgetSettings): Promise<WidgetSettings> {
  const legacy = await AsyncStorage.getItem(LEGACY_TRANSPARENT_KEY);
  if (legacy === 'true' && settings.theme === 'dark') {
    return { ...settings, theme: 'transparent' };
  }
  return settings;
}

export async function loadWidgetSettings(): Promise<WidgetSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const settings = await migrateLegacyTransparent(parseStored(raw));
  if (Platform.OS === 'android') {
    await syncWidgetSettingsToNative(settings);
  }
  return settings;
}

export async function saveWidgetSettings(
  settings: WidgetSettings
): Promise<WidgetNativeSyncResult | null> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  if (Platform.OS === 'android') {
    return syncWidgetSettingsToNative(settings);
  }
  return null;
}
