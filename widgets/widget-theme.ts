import { colors } from '@/src/theme/colors';

export const WIDGET_REF_WIDTH = 250;
export const WIDGET_REF_HEIGHT = 110;

export const WIDGET_CARD_RADIUS = 18;

/** Legible on light and dark wallpapers when background is clear */
export const widgetTextShadow = {
  textShadowColor: '#E6000000',
  textShadowRadius: 5,
  textShadowOffset: { width: 0, height: 1 },
} as const;

export function scaleWidgetLayout(width: number, height: number) {
  const scale = Math.min(width / WIDGET_REF_WIDTH, height / WIDGET_REF_HEIGHT, 2.4);
  const compact = height < 100;

  return {
    scale,
    compact,
    outerPadding: Math.max(6, Math.round(8 * scale)),
    cardPadding: Math.max(10, Math.round(14 * scale)),
    cardRadius: Math.max(12, Math.round(WIDGET_CARD_RADIUS * scale)),
    labelSize: Math.max(9, Math.round(10 * scale)),
    time12Size: Math.max(20, Math.round(30 * scale)),
    time24Size: Math.max(16, Math.round(22 * scale)),
    labelGap: Math.max(3, Math.round(5 * scale)),
    rowGap: Math.max(8, Math.round(12 * scale)),
    rowWidth: Math.max(200, Math.round(width - 24)),
  };
}

export function widgetColors(transparent: boolean) {
  return {
    outerBackground: (transparent ? '#00000000' : colors.background) as `#${string}`,
    cardBackground: (transparent ? '#00000000' : colors.card) as `#${string}`,
    label: (transparent ? colors.textPrimary : colors.label) as `#${string}`,
    time12: colors.textPrimary as `#${string}`,
    time24: (transparent ? '#B8D4FF' : colors.textSecondaryClock) as `#${string}`,
  };
}
