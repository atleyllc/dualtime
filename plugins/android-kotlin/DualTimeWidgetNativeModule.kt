package com.atleyllc.dualtime.widget

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DualTimeWidgetNativeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "DualTimeWidgetNative"

    @ReactMethod
    fun syncWidgetSettings(json: String, promise: Promise) {
        try {
            val ctx = reactApplicationContext
            WidgetPrefs.applyFromJson(ctx, json)
            val tapAction = WidgetPrefs.getTapAction(ctx)
            Log.i(DualTime.TAG, "syncWidgetSettings saved tapAction=$tapAction — refreshing widgets")
            DualTimeWidgetRenderer.applyAppearanceToAll(ctx)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("WIDGET_SETTINGS_ERROR", e)
        }
    }

    @ReactMethod
    fun getWidgetTapStatus(promise: Promise) {
        try {
            val ctx = reactApplicationContext
            val ids = DualTimeWidgetRenderer.activeWidgetIds(ctx)
            val result = Arguments.createMap()
            result.putString("tapAction", WidgetPrefs.getTapAction(ctx))
            result.putInt("widgetCount", ids.size)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("WIDGET_STATUS_ERROR", e)
        }
    }

    @ReactMethod
    fun refreshAllWidgets(promise: Promise) {
        try {
            DualTimeWidgetRenderer.applyAppearanceToAll(reactApplicationContext)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("WIDGET_REFRESH_ERROR", e)
        }
    }

    @ReactMethod
    fun setTransparentBackground(transparent: Boolean, promise: Promise) {
        try {
            val ctx = reactApplicationContext
            val json =
                org.json.JSONObject()
                    .put("tapAction", WidgetPrefs.getTapAction(ctx))
                    .put("theme", if (transparent) WidgetPrefs.THEME_TRANSPARENT else WidgetPrefs.THEME_DARK)
                    .put("showDate", WidgetPrefs.isShowDate(ctx))
                    .put("dateFormat", WidgetPrefs.getDateFormat(ctx))
                    .put("showSeconds", WidgetPrefs.isShowSeconds(ctx))
                    .put("timeOrder", WidgetPrefs.getTimeOrder(ctx))
            WidgetPrefs.applyFromJson(ctx, json.toString())
            DualTimeWidgetRenderer.applyAppearanceToAll(ctx)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("WIDGET_PREFS_ERROR", e)
        }
    }
}
