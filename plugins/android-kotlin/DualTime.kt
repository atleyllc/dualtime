package com.atleyllc.dualtime.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.os.Bundle
import android.util.Log

/**
 * Native DualTime widget — clocks use TextClock in XML (system-updated every second).
 * RemoteViews applies background preference and size-scaled typography on resize.
 */
class DualTime : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        try {
            Log.i(TAG, "onUpdate fired widgetIds=${appWidgetIds.contentToString()}")
            DualTimeWidgetRenderer.applyAppearance(context, appWidgetIds)
        } catch (e: Exception) {
            Log.e(TAG, "onUpdate exception", e)
        }
    }

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle
    ) {
        try {
            Log.i(TAG, "onAppWidgetOptionsChanged widgetId=$appWidgetId")
            DualTimeWidgetRenderer.applyAppearance(context, intArrayOf(appWidgetId))
        } catch (e: Exception) {
            Log.e(TAG, "onAppWidgetOptionsChanged exception", e)
        }
    }

    override fun onEnabled(context: Context) {
        try {
            Log.i(TAG, "onEnabled fired")
            DualTimeWidgetRenderer.applyAppearanceToAll(context)
        } catch (e: Exception) {
            Log.e(TAG, "onEnabled exception", e)
        }
    }

    override fun onDisabled(context: Context) {
        Log.i(TAG, "onDisabled fired")
    }

    companion object {
        const val TAG = "DualTimeWidget"
    }
}
