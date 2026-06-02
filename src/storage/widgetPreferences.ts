import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_TRANSPARENT = 'dualtime.widget.transparentBackground';

export async function getWidgetTransparentBackground(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEY_TRANSPARENT);
  return value === 'true';
}

export async function setWidgetTransparentBackground(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY_TRANSPARENT, enabled ? 'true' : 'false');
}
