#!/usr/bin/env node
/**
 * Registers native DualTime AppWidgetProvider (TextClock layout, no alarms).
 */

const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

function withDualTimeNativeWidgetManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    const permissions = (manifest.manifest['uses-permission'] ?? []).filter(
      (p) =>
        p.$?.['android:name'] !== 'android.permission.SCHEDULE_EXACT_ALARM' &&
        p.$?.['android:name'] !== 'android.permission.USE_EXACT_ALARM'
    );
    const bootPermission = {
      $: { 'android:name': 'android.permission.RECEIVE_BOOT_COMPLETED' },
    };
    if (
      !permissions.some(
        (p) => p.$?.['android:name'] === 'android.permission.RECEIVE_BOOT_COMPLETED'
      )
    ) {
      permissions.push(bootPermission);
    }
    manifest.manifest['uses-permission'] = permissions;

    const receivers = (app.receiver ?? []).filter((r) => {
      const name = r.$?.['android:name'] ?? '';
      return (
        name !== '.widget.WidgetMinuteAlarmReceiver' &&
        name !== '.widget.DualTimeWidgetBootReceiver' &&
        name !== '.widget.DualTimeWidgetProvider' &&
        name !== '.widget.WidgetSystemEventReceiver'
      );
    });

    const hasDualTime = receivers.some((r) => r.$?.['android:name'] === '.widget.DualTime');
    if (!hasDualTime) {
      receivers.push({
        $: {
          'android:name': '.widget.DualTime',
          'android:exported': 'false',
          'android:label': 'DualTime',
          'android:theme': '@style/Theme.DualTime.Widget',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } }],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/widgetprovider_dualtime',
            },
          },
        ],
      });
    }

    for (const receiver of receivers) {
      if (receiver.$?.['android:name'] === '.widget.DualTime') {
        receiver.$['android:theme'] = '@style/Theme.DualTime.Widget';
      }
    }

    receivers.push({
      $: {
        'android:name': '.widget.WidgetSystemEventReceiver',
        'android:enabled': 'true',
        'android:exported': 'true',
      },
      'intent-filter': [
        {
          action: [
            { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
            { $: { 'android:name': 'android.intent.action.TIME_SET' } },
            { $: { 'android:name': 'android.intent.action.TIME_CHANGED' } },
            { $: { 'android:name': 'android.intent.action.TIMEZONE_CHANGED' } },
            { $: { 'android:name': 'android.intent.action.DATE_CHANGED' } },
          ],
        },
      ],
    });

    app.receiver = receivers;
    return config;
  });
}

function withWidgetPackageQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const queries = manifest.manifest.queries ?? [];
    const block = queries[0] ?? { intent: [], package: [] };
    const intents = block.intent ?? [];
    const packages = block.package ?? [];

    const hasAlarms = intents.some((i) =>
      i.action?.some((a) => a.$?.['android:name'] === 'android.intent.action.SHOW_ALARMS')
    );
    if (!hasAlarms) {
      intents.push(
        { action: [{ $: { 'android:name': 'android.intent.action.SHOW_ALARMS' } }] },
        { action: [{ $: { 'android:name': 'android.intent.action.SET_ALARM' } }] },
        {
          action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
          category: [{ $: { 'android:name': 'android.intent.category.APP_CLOCK' } }],
        }
      );
      for (const pkg of ['com.google.android.deskclock', 'com.android.deskclock']) {
        if (!packages.some((p) => p.$?.['android:name'] === pkg)) {
          packages.push({ $: { 'android:name': pkg } });
        }
      }
      block.intent = intents;
      block.package = packages;
      manifest.manifest.queries = [block];
    }
    return config;
  });
}

module.exports = function withDualTimeNativeWidget(config) {
  return withWidgetPackageQueries(withDualTimeNativeWidgetManifest(config));
};
