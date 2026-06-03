package com.atleyllc.dualtime.widget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import java.util.Arrays;

/**
 * Minute-aligned widget refresh. Uses {@link AlarmManager#setAlarmClock} so ticks keep
 * firing in Doze and are not subject to the API 31+ exact-alarm background quota
 * that limits {@link AlarmManager#setExactAndAllowWhileIdle}.
 */
public class WidgetMinuteAlarmScheduler {
    public static final String TAG = DualTimeWidgetUpdater.TAG;
    private static final int REQUEST_CODE_ALARM = 41001;
    private static final int REQUEST_CODE_SHOW = 41002;

    public static long computeNextMinuteBoundaryMs() {
        long now = System.currentTimeMillis();
        return ((now / 60000) + 1) * 60000;
    }

    public static boolean hasDualTimeWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, DualTime.class));
        return ids != null && ids.length > 0;
    }

    public static void ensureScheduled(Context context) {
        if (!hasDualTimeWidgets(context)) {
            Log.i(TAG, "ensureScheduled skipped — no widgets");
            cancel(context);
            return;
        }
        scheduleNext(context);
    }

    /** Schedules the next minute tick; returns trigger time in epoch ms. */
    public static long scheduleNext(Context context) {
        Context appContext = context.getApplicationContext();
        AlarmManager alarmManager = (AlarmManager) appContext.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            Log.w(TAG, "scheduleNext failed — AlarmManager unavailable");
            return computeNextMinuteBoundaryMs();
        }

        long now = System.currentTimeMillis();
        long triggerAt = computeNextMinuteBoundaryMs();
        int[] widgetIds = AppWidgetManager.getInstance(appContext)
            .getAppWidgetIds(new ComponentName(appContext, DualTime.class));

        PendingIntent alarmIntent = buildAlarmPendingIntent(appContext);
        String method = "setAlarmClock";

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                PendingIntent showIntent = buildShowPendingIntent(appContext);
                AlarmManager.AlarmClockInfo info = new AlarmManager.AlarmClockInfo(triggerAt, showIntent);
                alarmManager.setAlarmClock(info, alarmIntent);
            } else {
                method = "setExact";
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, alarmIntent);
            }
        } catch (SecurityException securityException) {
            Log.w(TAG, "scheduleNext primary alarm failed, using setExactAndAllowWhileIdle", securityException);
            method = "setExactAndAllowWhileIdle";
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, alarmIntent);
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, alarmIntent);
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Log.i(
                TAG,
                "scheduleNext method="
                    + method
                    + " canScheduleExactAlarms="
                    + alarmManager.canScheduleExactAlarms()
                    + " triggerAt="
                    + triggerAt
                    + " delayMs="
                    + (triggerAt - now)
                    + " widgetIds="
                    + Arrays.toString(widgetIds)
            );
        } else {
            Log.i(
                TAG,
                "scheduleNext method="
                    + method
                    + " triggerAt="
                    + triggerAt
                    + " delayMs="
                    + (triggerAt - now)
                    + " widgetIds="
                    + Arrays.toString(widgetIds)
            );
        }

        return triggerAt;
    }

    public static void cancel(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;
        alarmManager.cancel(buildAlarmPendingIntent(context));
        Log.i(TAG, "alarm cancelled");
    }

    private static PendingIntent buildAlarmPendingIntent(Context context) {
        Intent intent = new Intent(context, WidgetMinuteAlarmReceiver.class);
        intent.setAction(WidgetMinuteAlarmReceiver.ACTION_MINUTE_TICK);
        return PendingIntent.getBroadcast(
            context,
            REQUEST_CODE_ALARM,
            intent,
            pendingIntentFlags()
        );
    }

    private static PendingIntent buildShowPendingIntent(Context context) {
        Intent showIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (showIntent == null) {
            showIntent = new Intent(Intent.ACTION_MAIN);
            showIntent.addCategory(Intent.CATEGORY_LAUNCHER);
            showIntent.setPackage(context.getPackageName());
        }
        showIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return PendingIntent.getActivity(
            context,
            REQUEST_CODE_SHOW,
            showIntent,
            pendingIntentFlags()
        );
    }

    private static int pendingIntentFlags() {
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return flags;
    }
}
