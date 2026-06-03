const TAG = 'DualTimeWidget';

type LogPayload = Record<string, unknown>;

/**
 * Widget logs appear in logcat:
 *   adb logcat -s DualTimeWidget ReactNativeJS
 */
export function logWidget(event: string, payload?: LogPayload): void {
  const line = payload ? `${event} ${JSON.stringify(payload)}` : event;
  console.log(`[${TAG}] ${line}`);
}
