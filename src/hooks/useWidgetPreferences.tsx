import { useCallback, useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';

import {
  getWidgetTransparentBackground,
  setWidgetTransparentBackground,
} from '@/src/storage/widgetPreferences';

const Native = NativeModules.DualTimeWidgetNative as
  | { setTransparentBackground: (v: boolean) => Promise<void> }
  | undefined;

/**
 * Widget time updates are handled entirely in native code (AlarmManager + RemoteViews).
 * This hook only loads and persists the solid/clear background preference.
 */
export function useWidgetPreferences() {
  const [transparentBackground, setTransparent] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      setLoaded(true);
      return;
    }
    getWidgetTransparentBackground().then(async (value) => {
      setTransparent(value);
      if (Platform.OS === 'android' && Native?.setTransparentBackground) {
        await Native.setTransparentBackground(value);
      }
      setLoaded(true);
    });
  }, []);

  const setTransparentBackground = useCallback(async (enabled: boolean) => {
    setTransparent(enabled);
    await setWidgetTransparentBackground(enabled);
    if (Platform.OS === 'android' && Native?.setTransparentBackground) {
      await Native.setTransparentBackground(enabled);
    }
  }, []);

  return {
    transparentBackground,
    setTransparentBackground,
    loaded,
    showWidgetOptions: Platform.OS === 'android',
  };
}
