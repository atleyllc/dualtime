package com.atleyllc.dualtime.widget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.AlarmClock
import android.util.Log
import com.atleyllc.dualtime.MainActivity

/**
 * Handles every home-screen widget tap. Reads the latest tap action from [WidgetPrefs]
 * and launches the appropriate screen or external app.
 */
class WidgetTapReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val appContext = context.applicationContext
        val tapAction = WidgetPrefs.getTapAction(appContext)
        Log.d(TAG, "WidgetTapReceiver fired saved tapAction=$tapAction")

        when (tapAction) {
            WidgetPrefs.TAP_DO_NOTHING -> {
                Log.d(TAG, "do_nothing — no launch")
                return
            }
            WidgetPrefs.TAP_OPEN_SETTINGS -> launchSettings(appContext)
            WidgetPrefs.TAP_OPEN_CLOCK -> launchClock(appContext)
            WidgetPrefs.TAP_OPEN_ALARM -> launchAlarm(appContext)
            WidgetPrefs.TAP_OPEN_DUALTIME -> launchDualTime(appContext)
            else -> {
                Log.d(TAG, "invalid tapAction=$tapAction fallback=open_dualtime")
                launchDualTime(appContext)
            }
        }
    }

    private fun launchDualTime(context: Context) {
        val intent = Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_MAIN
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        Log.d(TAG, "launching intent=${intent.component} action=${intent.action}")
        context.startActivity(intent)
    }

    private fun launchSettings(context: Context) {
        val intent = Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = Uri.parse("dualtime:///settings")
            putExtra(EXTRA_OPEN_SCREEN, OPEN_SCREEN_WIDGET_SETTINGS)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        Log.d(TAG, "launching intent=${intent.component} openScreen=$OPEN_SCREEN_WIDGET_SETTINGS")
        context.startActivity(intent)
    }

    private fun launchClock(context: Context) {
        val clock = Intent(Intent.ACTION_MAIN).apply {
            addCategory(CATEGORY_APP_CLOCK)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        if (resolveAndStart(context, clock, "open_clock")) return
        Log.d(TAG, "open_clock fallback=open_dualtime")
        launchDualTime(context)
    }

    private fun launchAlarm(context: Context) {
        val alarms = Intent(AlarmClock.ACTION_SHOW_ALARMS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        if (resolveAndStart(context, alarms, "open_alarm SHOW_ALARMS")) return

        val clock = Intent(Intent.ACTION_MAIN).apply {
            addCategory(CATEGORY_APP_CLOCK)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        if (resolveAndStart(context, clock, "open_alarm fallback APP_CLOCK")) return

        Log.d(TAG, "open_alarm fallback=open_dualtime")
        launchDualTime(context)
    }

    private fun resolveAndStart(context: Context, intent: Intent, label: String): Boolean {
        val pm = context.packageManager
        @Suppress("DEPRECATION")
        val resolved = pm.resolveActivity(intent, 0) != null
        if (!resolved) {
            Log.d(TAG, "resolveActivity null for $label intent=$intent")
            return false
        }
        Log.d(TAG, "launching $label intent action=${intent.action} categories=${intent.categories}")
        context.startActivity(intent)
        return true
    }

    companion object {
        private const val TAG = "DualTimeWidget"

        const val ACTION_WIDGET_TAP = "com.atleyllc.dualtime.widget.ACTION_WIDGET_TAP"

        /** @see android.content.Intent.CATEGORY_APP_CLOCK */
        private const val CATEGORY_APP_CLOCK = "android.intent.category.APP_CLOCK"

        const val EXTRA_OPEN_SCREEN = "openScreen"
        const val OPEN_SCREEN_WIDGET_SETTINGS = "widget_settings"
    }
}
