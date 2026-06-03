package com.atleyllc.dualtime.widget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * Native DualTime home-screen widget — does not use React Native or WorkManager.
 */
public class DualTime extends AppWidgetProvider {
    public static final String TAG = DualTimeWidgetUpdater.TAG;

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Log.i(TAG, "AppWidgetProvider.onUpdate count=" + appWidgetIds.length);
        long nextAt = WidgetMinuteAlarmScheduler.scheduleNext(context);
        DualTimeWidgetUpdater.updateWidgets(context, appWidgetManager, appWidgetIds, nextAt);
    }

    @Override
    public void onEnabled(Context context) {
        Log.i(TAG, "AppWidgetProvider.onEnabled — start minute alarm");
        long nextAt = WidgetMinuteAlarmScheduler.scheduleNext(context);
        Log.i(TAG, "update fired (enabled) nextScheduledAt=" + nextAt);
        DualTimeWidgetUpdater.updateAllWidgets(context, nextAt);
    }

    @Override
    public void onDisabled(Context context) {
        Log.i(TAG, "AppWidgetProvider.onDisabled — cancel minute alarm");
        WidgetMinuteAlarmScheduler.cancel(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent != null ? intent.getAction() : "";
        if (DualTimeWidgetUpdater.ACTION_UPDATE_DUALTIME_WIDGET.equals(action)) {
            Log.i(TAG, "onReceive ACTION_UPDATE_DUALTIME_WIDGET");
            long nextAt = WidgetMinuteAlarmScheduler.scheduleNext(context);
            Log.i(TAG, "update fired (custom action) nextScheduledAt=" + nextAt);
            DualTimeWidgetUpdater.updateAllWidgets(context, nextAt);
            return;
        }
        super.onReceive(context, intent);
    }
}
