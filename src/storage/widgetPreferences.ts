import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

const KEY_TRANSPARENT = 'dualtime.widget.transparentBackground';

type DualTimeWidgetNativeModule = {
  setTransparentBackground: (transparent: boolean) => Promise<void>;
};

const Native: DualTimeWidgetNativeModule | undefined =
  NativeModules.DualTimeWidgetNative as DualTimeWidgetNativeModule | undefined;

export async function getWidgetTransparentBackground(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEY_TRANSPARENT);
  return value === 'true';
}

export async function setWidgetTransparentBackground(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY_TRANSPARENT, enabled ? 'true' : 'false');

  if (Platform.OS === 'android' && Native?.setTransparentBackground) {
    await Native.setTransparentBackground(enabled);
  }
}
