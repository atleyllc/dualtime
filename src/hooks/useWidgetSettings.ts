import { useCallback, useEffect, useState } from 'react';

import {
  fetchWidgetTapStatus,
  refreshAllWidgetsNative,
  type WidgetTapStatus,
} from '@/src/widget/nativeWidgetBridge';
import { loadWidgetSettings, saveWidgetSettings } from '@/src/storage/widgetSettings';
import {
  DEFAULT_WIDGET_SETTINGS,
  WIDGET_TAP_ACTION_LABELS,
  type WidgetSettings,
} from '@/src/types/widgetSettings';

export function useWidgetSettings() {
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_WIDGET_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState<WidgetTapStatus | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const refreshDeviceStatus = useCallback(async () => {
    const status = await fetchWidgetTapStatus();
    setDeviceStatus(status);
    return status;
  }, []);

  useEffect(() => {
    loadWidgetSettings().then(async (value) => {
      setSettings(value);
      setLoaded(true);
      await refreshDeviceStatus();
    });
  }, [refreshDeviceStatus]);

  const updateSettings = useCallback(
    async (patch: Partial<WidgetSettings>) => {
      setSyncing(true);
      setSyncMessage(null);
      try {
        const next = { ...settings, ...patch };
        setSettings(next);
        const sync = await saveWidgetSettings(next);
        const status = await refreshDeviceStatus();

        if (sync && !sync.ok) {
          setSyncMessage(sync.error ?? 'Could not update the home-screen widget.');
        } else if (
          status.nativeLinked &&
          status.tapAction &&
          status.tapAction !== next.tapAction
        ) {
          setSyncMessage(
            `App saved “${WIDGET_TAP_ACTION_LABELS[next.tapAction]}” but the widget still has “${WIDGET_TAP_ACTION_LABELS[status.tapAction]}”. Tap Refresh widget below.`
          );
        } else if (patch.tapAction) {
          setSyncMessage(
            `Widget tap set to “${WIDGET_TAP_ACTION_LABELS[next.tapAction]}”. Go home and tap the widget to test.`
          );
        }
      } finally {
        setSyncing(false);
      }
    },
    [settings, refreshDeviceStatus]
  );

  const refreshWidget = useCallback(async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const sync = await refreshAllWidgetsNative();
      if (!sync.ok) {
        setSyncMessage(sync.error ?? 'Could not refresh widgets.');
        return;
      }
      await saveWidgetSettings(settings);
      const status = await refreshDeviceStatus();
      if (status.widgetCount === 0) {
        setSyncMessage('No DualTime widgets on the home screen. Add the widget, then tap Refresh again.');
      } else {
        setSyncMessage(
          `Refreshed ${status.widgetCount} widget(s). Tap action on device: ${status.tapAction ? WIDGET_TAP_ACTION_LABELS[status.tapAction] : 'unknown'}.`
        );
      }
    } finally {
      setSyncing(false);
    }
  }, [settings, refreshDeviceStatus]);

  return {
    settings,
    loaded,
    deviceStatus,
    syncMessage,
    syncing,
    updateSettings,
    refreshWidget,
    refreshDeviceStatus,
  };
}
