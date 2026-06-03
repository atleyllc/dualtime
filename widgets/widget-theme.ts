import { colors } from '@/src/theme/colors';

export const WIDGET_REF_WIDTH = 250;
export const WIDGET_REF_HEIGHT = 110;

export const WIDGET_CARD_RADIUS = 16;

/**
 * Temporary layout diagnosis on device — bright 24h, border, smaller 24h font.
 * Set false before store release.
 */
export const WIDGET_DEBUG_LAYOUT = true;

export const DEBUG_TIME_24_COLOR = '#00AAFF' as const;
export const DEBUG_WIDGET_BORDER_COLOR = '#FF6B35' as const;

/** Legible on light and dark wallpapers when background is clear */
export const widgetTextShadow = {
  textShadowColor: '#E6000000',
  textShadowRadius: 6,
  textShadowOffset: { width: 0, height: 1 },
} as const;

/**
 * Fit four text lines (label + time × 2) inside the widget cell.
 * Avoids clipping the 24-hour row on short launcher sizes.
 */
export function scaleWidgetLayout(width: number, height: number) {
  const scale = Math.min(width / WIDGET_REF_WIDTH, height / WIDGET_REF_HEIGHT, 2.2);
  const availableH = Math.max(72, height);

  let labelSize = Math.max(8, Math.round(9 * scale));
  let time12Size = Math.max(16, Math.round(26 * scale));
  let time24Size = Math.max(14, Math.round(20 * scale));
  let blockGap = Math.max(4, Math.round(6 * scale));
  let sectionGap = Math.max(6, Math.round(8 * scale));
  let padding = Math.max(8, Math.round(10 * scale));

  if (WIDGET_DEBUG_LAYOUT) {
    time24Size = Math.max(12, time24Size - 2);
  }

  const estimatedContent =
    padding * 2 +
    labelSize * 2 +
    time12Size +
    time24Size +
    blockGap * 2 +
    sectionGap;

  if (estimatedContent > availableH) {
    const shrink = availableH / estimatedContent;
    labelSize = Math.max(7, Math.floor(labelSize * shrink));
    time12Size = Math.max(14, Math.floor(time12Size * shrink));
    time24Size = Math.max(12, Math.floor(time24Size * shrink));
    blockGap = Math.max(2, Math.floor(blockGap * shrink));
    sectionGap = Math.max(4, Math.floor(sectionGap * shrink));
    padding = Math.max(6, Math.floor(padding * shrink));
  }

  return {
    scale,
    padding,
    cardRadius: Math.max(10, Math.round(WIDGET_CARD_RADIUS * scale)),
    labelSize,
    time12Size,
    time24Size,
    blockGap,
    sectionGap,
    width,
    height: availableH,
  };
}

export function widgetColors(transparent: boolean) {
  const time24 = WIDGET_DEBUG_LAYOUT
    ? DEBUG_TIME_24_COLOR
    : transparent
      ? '#B8D4FF'
      : colors.accent;

  return {
    background: (transparent ? '#00000000' : colors.card) as `#${string}`,
    label: (transparent ? colors.textPrimary : colors.label) as `#${string}`,
    time12: colors.textPrimary as `#${string}`,
    time24: time24 as `#${string}`,
    debugBorder: DEBUG_WIDGET_BORDER_COLOR as `#${string}`,
  };
}
