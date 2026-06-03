package com.atleyllc.dualtime.widget;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/** Sync widget prefs from JS and trigger a native redraw (optional). */
public class DualTimeWidgetNativeModule extends ReactContextBaseJavaModule {
    public DualTimeWidgetNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "DualTimeWidgetNative";
    }

    @ReactMethod
    public void setTransparentBackground(boolean transparent, Promise promise) {
        try {
            ReactApplicationContext ctx = getReactApplicationContext();
            WidgetPrefs.setTransparentBackground(ctx, transparent);
            DualTimeWidgetUpdater.updateAllWidgets(ctx);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("WIDGET_PREFS_ERROR", e);
        }
    }
}
