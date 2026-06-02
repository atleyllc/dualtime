'use no memo';

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { ColorProp } from 'react-native-android-widget/lib/typescript/widgets/utils/style.props';

import { formatTime12, formatTime24 } from '@/src/time/format';

import {
  scaleWidgetLayout,
  widgetColors,
  widgetTextShadow,
  WIDGET_REF_HEIGHT,
  WIDGET_REF_WIDTH,
} from './widget-theme';

type DualTimeWidgetProps = {
  now?: Date;
  width?: number;
  height?: number;
  transparent?: boolean;
};

function TimeRow({
  label,
  time,
  labelSize,
  timeSize,
  labelGap,
  rowWidth,
  labelColor,
  timeColor,
  useShadow,
}: {
  label: string;
  time: string;
  labelSize: number;
  timeSize: number;
  labelGap: number;
  rowWidth: number;
  labelColor: ColorProp;
  timeColor: ColorProp;
  useShadow: boolean;
}) {
  const shadow = useShadow ? widgetTextShadow : {};

  return (
    <FlexWidget
      style={{
        width: rowWidth,
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <TextWidget
        text={label}
        style={{
          fontSize: labelSize,
          fontWeight: '700',
          color: labelColor,
          textAlign: 'center',
          letterSpacing: 1.2,
          ...shadow,
        }}
      />
      <TextWidget
        text={time}
        maxLines={1}
        style={{
          fontSize: timeSize,
          fontWeight: '600',
          color: timeColor,
          textAlign: 'center',
          marginTop: labelGap,
          fontFamily: 'monospace',
          adjustsFontSizeToFit: true,
          ...shadow,
        }}
      />
    </FlexWidget>
  );
}

export function DualTimeWidget({
  now = new Date(),
  width = WIDGET_REF_WIDTH,
  height = WIDGET_REF_HEIGHT,
  transparent = false,
}: DualTimeWidgetProps) {
  const layout = scaleWidgetLayout(width, height);
  const palette = widgetColors(transparent);
  const useShadow = transparent;
  const showCard = !transparent;

  const cardContent = (
    <FlexWidget
      style={{
        width: 'match_parent',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: showCard ? layout.cardPadding : layout.outerPadding,
        flexGap: layout.rowGap,
      }}
    >
      <TimeRow
        label="12 HR"
        time={formatTime12(now)}
        labelSize={layout.labelSize}
        timeSize={layout.time12Size}
        labelGap={layout.labelGap}
        rowWidth={layout.rowWidth}
        labelColor={palette.label}
        timeColor={palette.time12}
        useShadow={useShadow}
      />
      <TimeRow
        label="24 HR"
        time={formatTime24(now)}
        labelSize={layout.labelSize}
        timeSize={layout.time24Size}
        labelGap={layout.labelGap}
        rowWidth={layout.rowWidth}
        labelColor={palette.label}
        timeColor={palette.time24}
        useShadow={useShadow}
      />
    </FlexWidget>
  );

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: palette.outerBackground,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: showCard ? layout.outerPadding : 0,
      }}
      accessibilityLabel="DualTime — 12-hour and 24-hour clock"
    >
      {showCard ? (
        <FlexWidget
          style={{
            height: 'match_parent',
            width: 'match_parent',
            backgroundColor: palette.cardBackground,
            borderRadius: layout.cardRadius,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {cardContent}
        </FlexWidget>
      ) : (
        cardContent
      )}
    </FlexWidget>
  );
}
