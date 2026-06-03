/** Toggle seconds on the in-app dashboard clocks only. */
export const DISPLAY_SECONDS = true;

const time12Base: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

const time24Base: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  hourCycle: 'h23',
};

const dateOptions: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
};

function withSeconds(
  base: Intl.DateTimeFormatOptions,
  showSeconds: boolean
): Intl.DateTimeFormatOptions {
  if (!showSeconds) return base;
  return { ...base, second: '2-digit' };
}

export function formatTime12(date: Date, showSeconds = DISPLAY_SECONDS): string {
  return date.toLocaleTimeString(undefined, withSeconds(time12Base, showSeconds));
}

export function formatTime24(date: Date, showSeconds = DISPLAY_SECONDS): string {
  return date.toLocaleTimeString(undefined, withSeconds(time24Base, showSeconds));
}

/** Widget display via native TextClock in layout XML (kept for previews/tests). */
export function formatWidgetTime12(date: Date): string {
  const value = date.toLocaleTimeString(undefined, time12Base);
  return value && value.trim().length > 0 ? value : '--:-- --';
}

export function formatWidgetTime24(date: Date): string {
  const value = date.toLocaleTimeString(undefined, time24Base);
  return value && value.trim().length > 0 ? value : '--:--';
}

/** Short date for subtle dashboard footer area */
export function formatDateSubtle(date: Date): string {
  return date.toLocaleDateString(undefined, dateOptions);
}
