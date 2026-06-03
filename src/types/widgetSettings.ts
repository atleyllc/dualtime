export type WidgetTapAction =
  | 'open_dualtime'
  | 'open_settings'
  | 'open_clock'
  | 'open_alarm'
  | 'do_nothing';

export type WidgetTheme = 'system' | 'dark' | 'light' | 'transparent';

export type WidgetDateFormat =
  | 'weekday_short'
  | 'weekday_short_no_comma'
  | 'month_day'
  | 'day_month'
  | 'weekday_long';

export type WidgetTimeOrder = '24_on_top' | '12_on_top';

export type WidgetSettings = {
  tapAction: WidgetTapAction;
  theme: WidgetTheme;
  showDate: boolean;
  dateFormat: WidgetDateFormat;
  showSeconds: boolean;
  timeOrder: WidgetTimeOrder;
};

/** Preserves current shipped widget look and tap behavior. */
export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  tapAction: 'open_dualtime',
  theme: 'dark',
  showDate: true,
  dateFormat: 'weekday_short',
  showSeconds: false,
  timeOrder: '24_on_top',
};

export const WIDGET_TAP_ACTION_LABELS: Record<WidgetTapAction, string> = {
  open_dualtime: 'Open DualTime',
  open_settings: 'Open DualTime settings',
  open_clock: 'Open Clock app',
  open_alarm: 'Open Alarm app',
  do_nothing: 'Do nothing',
};

export const WIDGET_THEME_LABELS: Record<WidgetTheme, string> = {
  system: 'Match system',
  dark: 'Dark',
  light: 'Light',
  transparent: 'Transparent',
};

export const WIDGET_DATE_FORMAT_LABELS: Record<WidgetDateFormat, string> = {
  weekday_short: 'Tue, Jun 2',
  weekday_short_no_comma: 'Tue Jun 2',
  month_day: 'Jun 2',
  day_month: '2 Jun',
  weekday_long: 'Tuesday, June 2',
};

export const WIDGET_TIME_ORDER_LABELS: Record<WidgetTimeOrder, string> = {
  '24_on_top': '24-hour on top',
  '12_on_top': '12-hour on top',
};
