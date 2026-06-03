package com.atleyllc.dualtime.widget;

import android.content.Context;
import android.content.SharedPreferences;

/** Native widget appearance prefs (synced from the React Native app). */
public final class WidgetPrefs {
    private static final String PREFS = "dualtime_widget_native";
    private static final String KEY_TRANSPARENT = "transparent_background";

    private WidgetPrefs() {}

    public static boolean isTransparentBackground(Context context) {
        return prefs(context).getBoolean(KEY_TRANSPARENT, false);
    }

    public static void setTransparentBackground(Context context, boolean transparent) {
        prefs(context).edit().putBoolean(KEY_TRANSPARENT, transparent).apply();
    }

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
