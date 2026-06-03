import { Platform } from 'react-native';

import { logWidget } from '@/widgets/widget-logger';

/**
 * Widget redraws are native-only. JS must not call requestWidgetUpdate (WorkManager freezes).
 */
export async function scheduleWidgetUpdate(
  reason: string,
  _options?: { force?: boolean }
): Promise<void> {
  if (Platform.OS === 'android') {
    logWidget('push-blocked-native-only', { reason });
  }
}
