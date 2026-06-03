package com.atleyllc.dualtime.widget;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * Minute tick and lifecycle hooks — native RemoteViews only (no React Native / WorkManager).
 */
public class WidgetMinuteAlarmReceiver extends BroadcastReceiver {
    public static final String TAG = DualTimeWidgetUpdater.TAG;
    public static final String ACTION_MINUTE_TICK = "com.atleyllc.dualtime.WIDGET_MINUTE_TICK";

    @Override
    public void onReceive(Context context, Intent intent) {
        Context appContext = context.getApplicationContext();
        String action = intent != null ? intent.getAction() : "";
        Log.i(TAG, "alarm onReceive action=" + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action)) {
            Log.i(TAG, "BOOT_COMPLETED — reschedule + native update");
            if (WidgetMinuteAlarmScheduler.hasDualTimeWidgets(appContext)) {
                long nextAt = WidgetMinuteAlarmScheduler.scheduleNext(appContext);
                Log.i(TAG, "update fired (boot) nextScheduledAt=" + nextAt);
                DualTimeWidgetUpdater.updateAllWidgets(appContext, nextAt);
            }
            return;
        }

        if (isTimeOrPackageEvent(action)) {
            Log.i(TAG, "system event — reschedule + native update action=" + action);
            if (WidgetMinuteAlarmScheduler.hasDualTimeWidgets(appContext)) {
                long nextAt = WidgetMinuteAlarmScheduler.scheduleNext(appContext);
                Log.i(TAG, "update fired (system) nextScheduledAt=" + nextAt);
                DualTimeWidgetUpdater.updateAllWidgets(appContext, nextAt);
            }
            return;
        }

        if (!WidgetMinuteAlarmScheduler.hasDualTimeWidgets(appContext)) {
            Log.i(TAG, "minute tick skipped — no widgets on home screen");
            WidgetMinuteAlarmScheduler.cancel(appContext);
            return;
        }

        // Schedule next tick first so a slow RemoteViews push cannot skip a minute.
        long nextAt = WidgetMinuteAlarmScheduler.scheduleNext(appContext);
        Log.i(TAG, "update fired (minute tick) nextScheduledAt=" + nextAt);
        DualTimeWidgetUpdater.updateAllWidgets(appContext, nextAt);
    }

    private static boolean isTimeOrPackageEvent(String action) {
        return Intent.ACTION_TIME_CHANGED.equals(action)
            || Intent.ACTION_TIMEZONE_CHANGED.equals(action)
            || Intent.ACTION_DATE_CHANGED.equals(action)
            || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)
            || "android.intent.action.TIME_SET".equals(action);
    }
}
