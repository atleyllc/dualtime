package com.atleyllc.dualtime.widget

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

object WidgetTapIntentBuilder {

    private const val REQUEST_WIDGET_TAP = 1001

    fun build(context: Context): PendingIntent {
        val intent = Intent(context, WidgetTapReceiver::class.java).apply {
            action = WidgetTapReceiver.ACTION_WIDGET_TAP
        }
        Log.d(
            DualTime.TAG,
            "Widget click PendingIntent created -> WidgetTapReceiver requestCode=$REQUEST_WIDGET_TAP"
        )
        return PendingIntent.getBroadcast(
            context,
            REQUEST_WIDGET_TAP,
            intent,
            pendingFlags()
        )
    }

    private fun pendingFlags(): Int {
        var flags = PendingIntent.FLAG_UPDATE_CURRENT
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags = flags or PendingIntent.FLAG_IMMUTABLE
        }
        return flags
    }
}
