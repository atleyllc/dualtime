package com.atleyllc.dualtime.widget

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Refreshes all DualTime widgets when the device boots or clock/calendar changes.
 * Times keep updating via [android.widget.TextClock]; this receiver rebuilds
 * RemoteViews (date line, theme, tap action, sizing) from persisted [WidgetPrefs].
 */
class WidgetSystemEventReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action
        if (action == null || !isHandledAction(action)) {
            return
        }

        val appContext = context.applicationContext
        val widgetIds = activeWidgetIds(appContext)

        if (widgetIds.isEmpty()) {
            Log.d(TAG, "system event action=$action — no DualTime widgets, skip")
            return
        }

        Log.d(
            TAG,
            "system event action=$action — refreshing ${widgetIds.size} widget(s) ids=${widgetIds.contentToString()}"
        )

        try {
            DualTimeWidgetRenderer.applyAppearance(appContext, widgetIds)
            Log.d(TAG, "system event action=$action — widget refresh complete")
        } catch (e: Exception) {
            Log.e(TAG, "system event action=$action — widget refresh failed", e)
        }
    }

    private fun activeWidgetIds(context: Context): IntArray {
        val manager = AppWidgetManager.getInstance(context)
        return manager.getAppWidgetIds(ComponentName(context, DualTime::class.java))
    }

    companion object {
        private const val TAG = "DualTimeWidget"

        /** Legacy alias still emitted on some devices. */
        private const val ACTION_TIME_SET = "android.intent.action.TIME_SET"

        fun isHandledAction(action: String): Boolean {
            return action == Intent.ACTION_BOOT_COMPLETED ||
                action == ACTION_TIME_SET ||
                action == Intent.ACTION_TIME_CHANGED ||
                action == Intent.ACTION_TIMEZONE_CHANGED ||
                action == Intent.ACTION_DATE_CHANGED
        }
    }
}
