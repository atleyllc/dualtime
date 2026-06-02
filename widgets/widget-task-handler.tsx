import React from 'react';
import type { WidgetTaskHandler } from 'react-native-android-widget';

import { getWidgetTransparentBackground } from '@/src/storage/widgetPreferences';

import { DualTimeWidget } from './dual-time-widget';

export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetAction,
  renderWidget,
  widgetInfo,
}) => {
  if (widgetAction === 'WIDGET_DELETED') {
    return;
  }

  const transparent = await getWidgetTransparentBackground();

  renderWidget(
    <DualTimeWidget
      width={widgetInfo.width}
      height={widgetInfo.height}
      transparent={transparent}
    />
  );
};
