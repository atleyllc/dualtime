package com.atleyllc.dualtime.widget;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.util.Log;
import android.widget.RemoteViews;

import com.atleyllc.dualtime.R;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.Locale;

/**
 * Builds and pushes RemoteViews for every DualTime widget instance.
 */
public final class DualTimeWidgetUpdater {
    public static final String TAG = "DualTimeWidget";
    public static final String ACTION_UPDATE_DUALTIME_WIDGET =
        "com.atleyllc.dualtime.ACTION_UPDATE_DUALTIME_WIDGET";

    private DualTimeWidgetUpdater() {}

    public static void updateAllWidgets(Context context) {
        updateAllWidgets(context, WidgetMinuteAlarmScheduler.computeNextMinuteBoundaryMs());
    }

    public static void updateAllWidgets(Context context, long nextScheduledAt) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, DualTime.class);
        int[] ids = manager.getAppWidgetIds(component);
        updateWidgets(context, manager, ids, nextScheduledAt);
    }

    public static void updateWidgets(
        Context context,
        AppWidgetManager manager,
        int[] appWidgetIds
    ) {
        updateWidgets(
            context,
            manager,
            appWidgetIds,
            WidgetMinuteAlarmScheduler.computeNextMinuteBoundaryMs()
        );
    }

    public static void updateWidgets(
        Context context,
        AppWidgetManager manager,
        int[] appWidgetIds,
        long nextScheduledAt
    ) {
        if (appWidgetIds == null || appWidgetIds.length == 0) {
            Log.i(TAG, "update fired — skipped, no widget IDs");
            return;
        }

        String time12 = formatTime12();
        String time24 = formatTime24();
        boolean transparent = WidgetPrefs.isTransparentBackground(context);

        Log.i(
            TAG,
            "update fired widgetIds="
                + Arrays.toString(appWidgetIds)
                + " time12="
                + time12
                + " time24="
                + time24
                + " nextScheduledAt="
                + nextScheduledAt
        );

        RemoteViews views = buildRemoteViews(context, time12, time24, transparent);

        for (int widgetId : appWidgetIds) {
            manager.updateAppWidget(widgetId, views);
        }
    }

    private static RemoteViews buildRemoteViews(
        Context context,
        String time12,
        String time24,
        boolean transparent
    ) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_dualtime);

        views.setTextViewText(R.id.label_12, "12 HR");
        views.setTextViewText(R.id.time_12, time12);
        views.setTextViewText(R.id.label_24, "24 HR");
        views.setTextViewText(R.id.time_24, time24);

        if (transparent) {
            views.setInt(R.id.widget_root, "setBackgroundResource", android.R.color.transparent);
        } else {
            views.setInt(R.id.widget_root, "setBackgroundResource", R.drawable.widget_card_background);
        }

        return views;
    }

    static String formatTime12() {
        SimpleDateFormat fmt = new SimpleDateFormat("h:mm a", Locale.getDefault());
        return fmt.format(new Date());
    }

    static String formatTime24() {
        SimpleDateFormat fmt = new SimpleDateFormat("HH:mm", Locale.getDefault());
        return fmt.format(new Date());
    }
}
