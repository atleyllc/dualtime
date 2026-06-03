import React from 'react';
import type { WidgetTaskHandler } from 'react-native-android-widget';

import { formatWidgetTime12, formatWidgetTime24 } from '@/src/time/format';
import { getWidgetTransparentBackground } from '@/src/storage/widgetPreferences';
import {
  buildWidgetRenderKey,
  clearWidgetRenderCache,
  rememberWidgetRender,
  shouldSkipWidgetRender,
} from '@/src/widget/widgetRenderCache';

import { DualTimeWidget } from './dual-time-widget';
import { logWidget } from './widget-logger';

export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetAction,
  renderWidget,
  widgetInfo,
}) => {
  logWidget('task-start', {
    widgetAction,
    widgetId: widgetInfo.widgetId,
    width: widgetInfo.width,
    height: widgetInfo.height,
  });

  if (widgetAction === 'WIDGET_DELETED') {
    await clearWidgetRenderCache(widgetInfo.widgetId);
    logWidget('task-deleted', { widgetId: widgetInfo.widgetId });
    return;
  }

  const transparent = await getWidgetTransparentBackground();
  const now = new Date();
  const time12 = formatWidgetTime12(now);
  const time24 = formatWidgetTime24(now);
  const renderKey = buildWidgetRenderKey(now, transparent);

  logWidget('remoteviews-payload', {
    widgetId: widgetInfo.widgetId,
    widgetAction,
    time12,
    time24,
    time12Length: time12.length,
    time24Length: time24.length,
    transparent,
    renderKey,
  });

  if (await shouldSkipWidgetRender(widgetInfo.widgetId, widgetAction, renderKey)) {
    logWidget('task-complete-skipped', { widgetAction, widgetId: widgetInfo.widgetId });
    return;
  }

  logWidget('remoteviews-update', {
    widgetId: widgetInfo.widgetId,
    widgetName: widgetInfo.widgetName,
    action: 'drawWidgetById',
  });

  renderWidget(
    <DualTimeWidget
      time12={time12}
      time24={time24}
      width={widgetInfo.width}
      height={widgetInfo.height}
      transparent={transparent}
    />
  );

  await rememberWidgetRender(widgetInfo.widgetId, renderKey);
  logWidget('remoteviews-complete', {
    widgetId: widgetInfo.widgetId,
    time12,
    time24,
  });
};
