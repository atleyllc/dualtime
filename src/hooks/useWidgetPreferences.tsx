import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';

import {
  getWidgetTransparentBackground,
  setWidgetTransparentBackground,
} from '@/src/storage/widgetPreferences';
import { DualTimeWidget } from '@/widgets/dual-time-widget';

export const DUAL_TIME_WIDGET_NAME = 'DualTime';

export function useWidgetPreferences(now: Date) {
  const [transparentBackground, setTransparent] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      setLoaded(true);
      return;
    }
    getWidgetTransparentBackground().then((value) => {
      setTransparent(value);
      setLoaded(true);
    });
  }, []);

  const pushWidgetUpdate = useCallback((transparent: boolean, at: Date) => {
    if (Platform.OS !== 'android') return;
    requestWidgetUpdate({
      widgetName: DUAL_TIME_WIDGET_NAME,
      renderWidget: (info) => (
        <DualTimeWidget
          now={at}
          width={info.width}
          height={info.height}
          transparent={transparent}
        />
      ),
    }).catch(() => {});
  }, []);

  const setTransparentBackground = useCallback(
    async (enabled: boolean) => {
      setTransparent(enabled);
      await setWidgetTransparentBackground(enabled);
      pushWidgetUpdate(enabled, now);
    },
    [now, pushWidgetUpdate]
  );

  useEffect(() => {
    if (Platform.OS !== 'android' || !loaded) return;

    pushWidgetUpdate(transparentBackground, now);
    const id = setInterval(() => {
      pushWidgetUpdate(transparentBackground, new Date());
    }, 1000);
    return () => clearInterval(id);
  }, [now, transparentBackground, loaded, pushWidgetUpdate]);

  return {
    transparentBackground,
    setTransparentBackground,
    loaded,
    showWidgetOptions: Platform.OS === 'android',
  };
}
