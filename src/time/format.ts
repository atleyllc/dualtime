/** Toggle seconds on clock displays (app + widget). */
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

/** Short date for subtle dashboard footer area */
export function formatDateSubtle(date: Date): string {
  return date.toLocaleDateString(undefined, dateOptions);
}
