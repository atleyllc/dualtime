package com.atleyllc.dualtime.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.res.ColorStateList
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.util.TypedValue
import android.view.View
import android.widget.RemoteViews
import androidx.core.graphics.ColorUtils
import com.atleyllc.dualtime.R
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object DualTimeWidgetRenderer {

    private const val SURFACE_ALPHA = 0xBF

    fun activeWidgetIds(context: Context): IntArray {
        val manager = AppWidgetManager.getInstance(context)
        return manager.getAppWidgetIds(ComponentName(context, DualTime::class.java))
    }

    fun applyAppearanceToAll(context: Context) {
        applyAppearance(context, activeWidgetIds(context))
    }

    fun applyAppearance(context: Context, appWidgetIds: IntArray) {
        if (appWidgetIds.isEmpty()) return

        val manager = AppWidgetManager.getInstance(context)
        try {
            for (widgetId in appWidgetIds) {
                val options = manager.getAppWidgetOptions(widgetId)
                val views = buildRemoteViews(context, options, widgetId)
                manager.updateAppWidget(widgetId, views)
            }
        } catch (e: Exception) {
            LogHolder.logError("applyAppearance exception", e)
        }
    }

    private fun buildRemoteViews(context: Context, options: Bundle, appWidgetId: Int): RemoteViews {
        val layoutId = resolveLayoutId(context)
        val views = RemoteViews(context.packageName, layoutId)

        val widthDp = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 110)
        val heightDp = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 110)
        val showDate = WidgetPrefs.isShowDate(context)
        val (size24, sizeDate, size12) = computeTextSizes(widthDp, heightDp, showDate)

        val palette = resolveTextPalette(context)
        views.setTextColor(R.id.time_24, palette.primary)
        views.setTextColor(R.id.time_12, palette.body)
        views.setTextColor(R.id.date_line, palette.muted)

        if (showDate) {
            views.setViewVisibility(R.id.date_line, View.VISIBLE)
            views.setTextViewText(R.id.date_line, formatDate(context))
            views.setTextViewTextSize(R.id.date_line, TypedValue.COMPLEX_UNIT_SP, sizeDate)
        } else {
            views.setViewVisibility(R.id.date_line, View.GONE)
        }

        views.setTextViewTextSize(R.id.time_24, TypedValue.COMPLEX_UNIT_SP, size24)
        views.setTextViewTextSize(R.id.time_12, TypedValue.COMPLEX_UNIT_SP, size12)

        applyBackground(views, context)
        applyTapAction(views, context, appWidgetId, showDate)

        return views
    }

    private fun resolveLayoutId(context: Context): Int {
        val twelveOnTop = WidgetPrefs.getTimeOrder(context) == WidgetPrefs.ORDER_12_TOP
        val withSeconds = WidgetPrefs.isShowSeconds(context)
        return when {
            twelveOnTop && withSeconds -> R.layout.widget_dualtime_12_top_secs
            twelveOnTop -> R.layout.widget_dualtime_12_top
            withSeconds -> R.layout.widget_dualtime_secs
            else -> R.layout.widget_dualtime
        }
    }

    private fun applyTapAction(
        views: RemoteViews,
        context: Context,
        appWidgetId: Int,
        showDate: Boolean
    ) {
        val tapAction = WidgetPrefs.getTapAction(context)
        Log.d(DualTime.TAG, "applyTapAction tapAction=$tapAction appWidgetId=$appWidgetId")

        val pending = WidgetTapIntentBuilder.build(context)
        views.setOnClickPendingIntent(R.id.widget_root, pending)
        views.setOnClickPendingIntent(R.id.time_24, pending)
        views.setOnClickPendingIntent(R.id.time_12, pending)
        if (showDate) {
            views.setOnClickPendingIntent(R.id.date_line, pending)
        }
    }

    private fun applyBackground(views: RemoteViews, context: Context) {
        when (resolveEffectiveTheme(context)) {
            WidgetPrefs.THEME_TRANSPARENT ->
                views.setInt(R.id.widget_root, "setBackgroundResource", android.R.color.transparent)
            WidgetPrefs.THEME_LIGHT -> {
                views.setInt(
                    R.id.widget_root,
                    "setBackgroundResource",
                    R.drawable.widget_surface_background_light
                )
            }
            else -> applyDarkWeatherBackground(views, context)
        }
    }

    private fun applyDarkWeatherBackground(views: RemoteViews, context: Context) {
        val (surfaceColor, useDynamicTint) = resolveWeatherSurfaceColor(context)
        if (useDynamicTint) {
            views.setInt(
                R.id.widget_root,
                "setBackgroundResource",
                R.drawable.widget_surface_background_tintable
            )
            views.setColorStateList(
                R.id.widget_root,
                "setBackgroundTintList",
                ColorStateList.valueOf(surfaceColor)
            )
        } else {
            views.setInt(
                R.id.widget_root,
                "setBackgroundResource",
                R.drawable.widget_surface_background
            )
        }
    }

    private fun resolveEffectiveTheme(context: Context): String {
        val theme = WidgetPrefs.getTheme(context)
        if (theme == WidgetPrefs.THEME_SYSTEM) {
            val night =
                context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
            return if (night == Configuration.UI_MODE_NIGHT_YES) {
                WidgetPrefs.THEME_DARK
            } else {
                WidgetPrefs.THEME_LIGHT
            }
        }
        return theme
    }

    private data class TextPalette(val primary: Int, val body: Int, val muted: Int)

    private fun resolveTextPalette(context: Context): TextPalette {
        return if (resolveEffectiveTheme(context) == WidgetPrefs.THEME_LIGHT) {
            TextPalette(
                context.getColor(R.color.widget_text_primary_on_light),
                context.getColor(R.color.widget_text_body_on_light),
                context.getColor(R.color.widget_text_muted_on_light)
            )
        } else {
            TextPalette(
                context.getColor(R.color.widget_text_primary),
                context.getColor(R.color.widget_text_body),
                context.getColor(R.color.widget_text_muted)
            )
        }
    }

    private fun resolveWeatherSurfaceColor(context: Context): Pair<Int, Boolean> {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val dynamicId =
                context.resources.getIdentifier("system_neutral1_900", "color", "android")
            if (dynamicId != 0) {
                try {
                    val tinted =
                        ColorUtils.setAlphaComponent(context.getColor(dynamicId), SURFACE_ALPHA)
                    return tinted to true
                } catch (_: Exception) {
                }
            }
        }
        return context.getColor(R.color.widget_weather_surface) to false
    }

    private fun formatDate(context: Context): String {
        val pattern = when (WidgetPrefs.getDateFormat(context)) {
            WidgetPrefs.DATE_WEEKDAY_SHORT -> "EEE, MMM d"
            WidgetPrefs.DATE_WEEKDAY_SHORT_NO_COMMA -> "EEE MMM d"
            WidgetPrefs.DATE_MONTH_DAY -> "MMM d"
            WidgetPrefs.DATE_DAY_MONTH -> "d MMM"
            WidgetPrefs.DATE_WEEKDAY_LONG -> "EEEE, MMMM d"
            else -> "EEE, MMM d"
        }
        return SimpleDateFormat(pattern, Locale.getDefault()).format(Date())
    }

    private fun computeTextSizes(
        widthDp: Int,
        heightDp: Int,
        showDate: Boolean
    ): Triple<Float, Float, Float> {
        val width = widthDp.coerceAtLeast(110)
        val height = heightDp.coerceAtLeast(110)
        val scale = minOf(width.toFloat(), height * 1.15f)

        var size24 = (scale * 0.17f).coerceIn(18f, 52f)
        var size12 = (size24 * 0.78f).coerceIn(14f, 40f)
        var sizeDate = (size24 * 0.34f).coerceIn(7f, 12f)

        val dateWeight = if (showDate) 0.17f else 0f
        val heightBudget = height * 0.36f
        var total = size24 * 0.40f + sizeDate * dateWeight + size12 * 0.32f
        if (total > heightBudget && showDate) {
            val excess = total - heightBudget
            sizeDate = (sizeDate - excess * 1.6f).coerceAtLeast(7f)
        }

        total = size24 * 0.40f + sizeDate * dateWeight + size12 * 0.32f
        if (total > heightBudget) {
            val excess = total - heightBudget
            size12 = (size12 - excess * 0.7f).coerceAtLeast(13f)
            size24 = (size24 - excess * 0.4f).coerceAtLeast(16f)
        }

        if (!showDate) {
            size24 = (size24 * 1.06f).coerceAtMost(52f)
            size12 = (size12 * 1.04f).coerceAtMost(44f)
        }

        return Triple(size24, sizeDate, size12)
    }

    private object LogHolder {
        fun logError(msg: String, e: Exception) {
            android.util.Log.e(DualTime.TAG, msg, e)
        }
    }
}
