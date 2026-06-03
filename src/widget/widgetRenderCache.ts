import AsyncStorage from '@react-native-async-storage/async-storage';

import { formatWidgetTime12, formatWidgetTime24 } from '@/src/time/format';
import { logWidget } from '@/widgets/widget-logger';

function storageKey(widgetId: number): string {
  return `dualtime.widget.render.${widgetId}`;
}

export function buildWidgetRenderKey(date: Date, transparent: boolean): string {
  return `${formatWidgetTime12(date)}|${formatWidgetTime24(date)}|${transparent ? '1' : '0'}`;
}

/**
 * Skip redundant RemoteViews rebuilds when the displayed minute has not changed.
 */
export async function shouldSkipWidgetRender(
  widgetId: number,
  widgetAction: string,
  renderKey: string
): Promise<boolean> {
  if (widgetAction !== 'WIDGET_UPDATE') {
    return false;
  }

  const key = storageKey(widgetId);
  const previous = await AsyncStorage.getItem(key);

  if (previous === renderKey) {
    logWidget('render-skipped-duplicate', { widgetId, renderKey });
    return true;
  }

  return false;
}

export async function rememberWidgetRender(
  widgetId: number,
  renderKey: string
): Promise<void> {
  await AsyncStorage.setItem(storageKey(widgetId), renderKey);
}

export async function clearWidgetRenderCache(widgetId: number): Promise<void> {
  await AsyncStorage.removeItem(storageKey(widgetId));
  logWidget('render-cache-cleared', { widgetId });
}
