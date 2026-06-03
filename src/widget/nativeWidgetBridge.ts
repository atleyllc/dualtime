import { NativeModules, Platform } from 'react-native';

import type { WidgetSettings, WidgetTapAction } from '@/src/types/widgetSettings';

type NativeModule = {
  syncWidgetSettings: (json: string) => Promise<void>;
  getWidgetTapStatus?: () => Promise<{ tapAction: string; widgetCount: number }>;
  refreshAllWidgets?: () => Promise<void>;
};

const Native = NativeModules.DualTimeWidgetNative as NativeModule | undefined;

export type WidgetNativeSyncResult = {
  ok: boolean;
  nativeLinked: boolean;
  error?: string;
};

export async function syncWidgetSettingsToNative(
  settings: WidgetSettings
): Promise<WidgetNativeSyncResult> {
  if (Platform.OS !== 'android') {
    return { ok: true, nativeLinked: false };
  }
  if (!Native?.syncWidgetSettings) {
    return {
      ok: false,
      nativeLinked: false,
      error: 'Native widget module not linked — reinstall the latest APK.',
    };
  }
  try {
    await Native.syncWidgetSettings(JSON.stringify(settings));
    return { ok: true, nativeLinked: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Sync failed';
    return { ok: false, nativeLinked: true, error: message };
  }
}

export type WidgetTapStatus = {
  tapAction: WidgetTapAction | null;
  widgetCount: number;
  nativeLinked: boolean;
};

export async function fetchWidgetTapStatus(): Promise<WidgetTapStatus> {
  if (Platform.OS !== 'android' || !Native?.getWidgetTapStatus) {
    return { tapAction: null, widgetCount: 0, nativeLinked: false };
  }
  try {
    const status = await Native.getWidgetTapStatus();
    return {
      tapAction: status.tapAction as WidgetTapAction,
      widgetCount: status.widgetCount,
      nativeLinked: true,
    };
  } catch {
    return { tapAction: null, widgetCount: 0, nativeLinked: true };
  }
}

export async function refreshAllWidgetsNative(): Promise<WidgetNativeSyncResult> {
  if (Platform.OS !== 'android') {
    return { ok: true, nativeLinked: false };
  }
  if (!Native?.refreshAllWidgets) {
    return {
      ok: false,
      nativeLinked: false,
      error: 'Native widget module not linked — reinstall the latest APK.',
    };
  }
  try {
    await Native.refreshAllWidgets();
    return { ok: true, nativeLinked: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Refresh failed';
    return { ok: false, nativeLinked: true, error: message };
  }
}

export function isNativeWidgetBridgeAvailable(): boolean {
  return Platform.OS === 'android' && Boolean(Native?.syncWidgetSettings);
}
