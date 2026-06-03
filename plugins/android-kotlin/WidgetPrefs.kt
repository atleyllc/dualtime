package com.atleyllc.dualtime.widget

import android.content.Context
import android.util.Log

object WidgetPrefs {
    private const val PREFS = "dualtime_widget_native"
    private const val TAG = "DualTimeWidget"

    const val TAP_OPEN_DUALTIME = "open_dualtime"
    const val TAP_OPEN_SETTINGS = "open_settings"
    const val TAP_OPEN_CLOCK = "open_clock"
    const val TAP_OPEN_ALARM = "open_alarm"
    const val TAP_DO_NOTHING = "do_nothing"

    /** @deprecated Renamed to [TAP_OPEN_DUALTIME] */
    private const val TAP_OPEN_APP_LEGACY = "open_app"

    const val THEME_SYSTEM = "system"
    const val THEME_DARK = "dark"
    const val THEME_LIGHT = "light"
    const val THEME_TRANSPARENT = "transparent"

    const val DATE_WEEKDAY_SHORT = "weekday_short"
    const val DATE_WEEKDAY_SHORT_NO_COMMA = "weekday_short_no_comma"
    const val DATE_MONTH_DAY = "month_day"
    const val DATE_DAY_MONTH = "day_month"
    const val DATE_WEEKDAY_LONG = "weekday_long"

    const val ORDER_24_TOP = "24_on_top"
    const val ORDER_12_TOP = "12_on_top"

    const val EXTRA_WIDGET_TAP = "dualtime_widget_tap"

    private const val KEY_TRANSPARENT_LEGACY = "transparent_background"
    private const val KEY_TAP_ACTION = "tap_action"
    private const val KEY_THEME = "theme"
    private const val KEY_SHOW_DATE = "show_date"
    private const val KEY_DATE_FORMAT = "date_format"
    private const val KEY_SHOW_SECONDS = "show_seconds"
    private const val KEY_TIME_ORDER = "time_order"

    private fun prefs(context: Context) =
        context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun normalizeTapAction(raw: String?): String {
        return when (raw) {
            TAP_OPEN_DUALTIME, TAP_OPEN_SETTINGS, TAP_OPEN_CLOCK, TAP_OPEN_ALARM, TAP_DO_NOTHING -> raw
            TAP_OPEN_APP_LEGACY -> TAP_OPEN_DUALTIME
            else -> TAP_OPEN_DUALTIME
        }
    }

    fun getTapAction(context: Context): String {
        val stored = prefs(context).getString(KEY_TAP_ACTION, TAP_OPEN_DUALTIME) ?: TAP_OPEN_DUALTIME
        return normalizeTapAction(stored)
    }

    fun getTheme(context: Context): String {
        val stored = prefs(context).getString(KEY_THEME, null)
        if (stored != null) return stored
        return if (prefs(context).getBoolean(KEY_TRANSPARENT_LEGACY, false)) {
            THEME_TRANSPARENT
        } else {
            THEME_DARK
        }
    }

    fun isShowDate(context: Context): Boolean =
        prefs(context).getBoolean(KEY_SHOW_DATE, true)

    fun getDateFormat(context: Context): String =
        prefs(context).getString(KEY_DATE_FORMAT, DATE_WEEKDAY_SHORT) ?: DATE_WEEKDAY_SHORT

    fun isShowSeconds(context: Context): Boolean =
        prefs(context).getBoolean(KEY_SHOW_SECONDS, false)

    fun getTimeOrder(context: Context): String =
        prefs(context).getString(KEY_TIME_ORDER, ORDER_24_TOP) ?: ORDER_24_TOP

    fun isTransparentBackground(context: Context): Boolean =
        getTheme(context) == THEME_TRANSPARENT

    fun applyFromJson(context: Context, json: String) {
        val obj = org.json.JSONObject(json)
        val tapAction = normalizeTapAction(obj.optString("tapAction", TAP_OPEN_DUALTIME))

        Log.i(TAG, "save tapAction=$tapAction")

        prefs(context).edit()
            .putString(KEY_TAP_ACTION, tapAction)
            .putString(KEY_THEME, obj.optString("theme", THEME_DARK))
            .putBoolean(KEY_SHOW_DATE, obj.optBoolean("showDate", true))
            .putString(KEY_DATE_FORMAT, obj.optString("dateFormat", DATE_WEEKDAY_SHORT))
            .putBoolean(KEY_SHOW_SECONDS, obj.optBoolean("showSeconds", false))
            .putString(KEY_TIME_ORDER, obj.optString("timeOrder", ORDER_24_TOP))
            .putBoolean(KEY_TRANSPARENT_LEGACY, obj.optString("theme") == THEME_TRANSPARENT)
            .commit()
    }
}
