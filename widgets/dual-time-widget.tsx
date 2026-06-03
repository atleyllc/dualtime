'use no memo';

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { ColorProp } from 'react-native-android-widget/lib/typescript/widgets/utils/style.props';

import {
  scaleWidgetLayout,
  WIDGET_DEBUG_LAYOUT,
  widgetColors,
  widgetTextShadow,
  WIDGET_REF_HEIGHT,
  WIDGET_REF_WIDTH,
} from './widget-theme';

export type DualTimeWidgetProps = {
  /** Pre-formatted strings (logged in task handler before render). */
  time12: string;
  time24: string;
  width?: number;
  height?: number;
  transparent?: boolean;
};

const labelStyle = (size: number, color: ColorProp, shadow: boolean) => ({
  fontSize: size,
  fontWeight: '600' as const,
  color,
  textAlign: 'center' as const,
  letterSpacing: 1,
  ...(shadow ? widgetTextShadow : {}),
});

const timeStyle = (
  size: number,
  color: ColorProp,
  marginTop: number,
  shadow: boolean
) => ({
  fontSize: size,
  fontWeight: '600' as const,
  color,
  textAlign: 'center' as const,
  marginTop,
  ...(shadow ? widgetTextShadow : {}),
});

/**
 * Minimal flat RemoteViews tree — four TextWidgets in one column.
 * No flexGap dividers, no overflow:hidden clip, no nested row wrappers.
 */
export function DualTimeWidget({
  time12,
  time24,
  width = WIDGET_REF_WIDTH,
  height = WIDGET_REF_HEIGHT,
  transparent = false,
}: DualTimeWidgetProps) {
  const layout = scaleWidgetLayout(width, height);
  const palette = widgetColors(transparent);
  const shadow = transparent;

  const safe12 = time12?.trim() ? time12 : '--:-- --';
  const safe24 = time24?.trim() ? time24 : '--:--';

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: palette.background,
        borderRadius: layout.cardRadius,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: layout.padding,
        ...(WIDGET_DEBUG_LAYOUT
          ? {
              borderWidth: 2,
              borderColor: palette.debugBorder,
            }
          : {}),
      }}
      accessibilityLabel={`DualTime ${safe12} ${safe24}`}
    >
      <TextWidget text="12 HR" style={labelStyle(layout.labelSize, palette.label, shadow)} />
      <TextWidget
        text={safe12}
        maxLines={1}
        style={timeStyle(layout.time12Size, palette.time12, layout.blockGap, shadow)}
      />
      <TextWidget
        text="24 HR"
        style={timeStyle(layout.labelSize, palette.label, layout.sectionGap, shadow)}
      />
      <TextWidget
        text={safe24}
        maxLines={1}
        style={timeStyle(layout.time24Size, palette.time24, layout.blockGap, shadow)}
      />
    </FlexWidget>
  );
}
