#!/usr/bin/env node
/**
 * Applies native Kotlin DualTime widget (TextClock layout, no AlarmManager).
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const kotlinSrc = path.join(root, 'plugins', 'android-kotlin');
const resSrc = path.join(root, 'plugins', 'android-res');
const widgetDest = path.join(root, 'android/app/src/main/java/com/atleyllc/dualtime/widget');
const resDest = path.join(root, 'android/app/src/main/res');

const REMOVE_FROM_WIDGET_DIR = [
  'WidgetTapNoOpReceiver.kt',
  'DualTime.java',
  'DualTimeWidgetProvider.kt',
  'DualTimeWidgetUpdater.java',
  'WidgetMinuteAlarmReceiver.java',
  'WidgetMinuteAlarmScheduler.java',
  'DualTimeWidgetScheduler.kt',
  'DualTimeWidgetBootReceiver.kt',
  'DualTimeWidgetEngine.kt',
  'WidgetPrefs.java',
  'DualTimeWidgetNativeModule.java',
  'DualTimeWidgetNativePackage.java',
];

const REMOVE_KOTLIN_SOURCES = [
  'DualTimeWidgetScheduler.kt',
  'DualTimeWidgetBootReceiver.kt',
  'DualTimeWidgetEngine.kt',
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
  }
}

function removeLegacyWidgetSources() {
  for (const file of REMOVE_FROM_WIDGET_DIR) {
    const target = path.join(widgetDest, file);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
      console.log(`Removed legacy ${file}`);
    }
  }
}

function applyKotlinSources() {
  fs.mkdirSync(widgetDest, { recursive: true });
  for (const file of fs.readdirSync(kotlinSrc)) {
    if (!file.endsWith('.kt')) continue;
    if (REMOVE_KOTLIN_SOURCES.includes(file)) continue;
    fs.copyFileSync(path.join(kotlinSrc, file), path.join(widgetDest, file));
    console.log(`Applied kotlin/${file}`);
  }
  for (const file of REMOVE_KOTLIN_SOURCES) {
    const dest = path.join(widgetDest, file);
    if (fs.existsSync(dest)) {
      fs.unlinkSync(dest);
      console.log(`Removed ${file}`);
    }
  }
}

function patchMainApplication() {
  const mainApp = path.join(
    root,
    'android/app/src/main/java/com/atleyllc/dualtime/MainApplication.kt'
  );
  if (!fs.existsSync(mainApp)) return;

  let content = fs.readFileSync(mainApp, 'utf8');
  if (!content.includes('import com.atleyllc.dualtime.widget.DualTimeWidgetNativePackage')) {
    content = content.replace(
      'import expo.modules.ReactNativeHostWrapper',
      'import com.atleyllc.dualtime.widget.DualTimeWidgetNativePackage\nimport expo.modules.ReactNativeHostWrapper'
    );
  }
  if (!content.includes('add(DualTimeWidgetNativePackage())')) {
    content = content.replace(
      '// add(MyReactNativePackage())',
      'add(DualTimeWidgetNativePackage())'
    );
  }
  fs.writeFileSync(mainApp, content, 'utf8');
  console.log('Patched MainApplication.kt');
}

function patchManifest() {
  const manifestPath = path.join(root, 'android/app/src/main/AndroidManifest.xml');
  if (!fs.existsSync(manifestPath)) return;

  let xml = fs.readFileSync(manifestPath, 'utf8');

  xml = xml.replace(
    /\s*<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"\/>/g,
    ''
  );
  xml = xml.replace(
    /\s*<uses-permission android:name="android.permission.USE_EXACT_ALARM"\/>/g,
    ''
  );

  xml = xml.replace(
    /<receiver[^>]*android:name="\.widget\.DualTimeWidgetProvider"[^>]*>[\s\S]*?<\/receiver>\s*/g,
    ''
  );
  xml = xml.replace(
    /<receiver[^>]*android:name="\.widget\.WidgetMinuteAlarmReceiver"[^>]*>[\s\S]*?<\/receiver>\s*/g,
    ''
  );
  xml = xml.replace(
    /<receiver[^>]*android:name="\.widget\.DualTimeWidgetBootReceiver"[^>]*>[\s\S]*?<\/receiver>\s*/g,
    ''
  );
  xml = xml.replace(
    /<receiver[^>]*android:name="\.widget\.DualTime"[^>]*>[\s\S]*?<\/receiver>\s*/g,
    ''
  );

  const providerBlock = `    <receiver android:name=".widget.DualTime" android:exported="false" android:label="DualTime" android:theme="@style/Theme.DualTime.Widget">
      <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE"/>
      </intent-filter>
      <meta-data android:name="android.appwidget.provider" android:resource="@xml/widgetprovider_dualtime"/>
    </receiver>
`;

  if (!xml.includes('android:name=".widget.DualTime"')) {
    xml = xml.replace('</application>', `${providerBlock}  </application>`);
  } else if (!xml.includes('Theme.DualTime.Widget')) {
    xml = xml.replace(
      /(<receiver android:name="\.widget\.DualTime")/,
      '$1 android:theme="@style/Theme.DualTime.Widget"'
    );
  }

  xml = xml.replace(
    '<action android:name="com.atleyllc.dualtime.ACTION_UPDATE_WIDGET"/>',
    ''
  );
  xml = xml.replace(
    '<action android:name="com.atleyllc.dualtime.WIDGET_CLICK"/>',
    ''
  );

  xml = xml.replace(
    /<receiver[^>]*android:name="\.widget\.WidgetTapNoOpReceiver"[^>]*>[\s\S]*?<\/receiver>\s*/g,
    ''
  );
  xml = xml.replace(
    /<receiver[^>]*android:name="\.widget\.WidgetTapReceiver"[^>]*>[\s\S]*?<\/receiver>\s*/g,
    ''
  );
  xml = xml.replace(
    /<receiver[^>]*android:name="\.widget\.WidgetSystemEventReceiver"[^>]*>[\s\S]*?<\/receiver>\s*/g,
    ''
  );

  if (!xml.includes('RECEIVE_BOOT_COMPLETED')) {
    xml = xml.replace(
      '<manifest xmlns:android="http://schemas.android.com/apk/res/android">',
      '<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n  <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>'
    );
  }

  if (!xml.includes('WidgetSystemEventReceiver')) {
    xml = xml.replace(
      '</application>',
      `    <receiver android:name=".widget.WidgetSystemEventReceiver" android:enabled="true" android:exported="true">
      <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED"/>
        <action android:name="android.intent.action.TIME_SET"/>
        <action android:name="android.intent.action.TIME_CHANGED"/>
        <action android:name="android.intent.action.TIMEZONE_CHANGED"/>
        <action android:name="android.intent.action.DATE_CHANGED"/>
      </intent-filter>
    </receiver>
  </application>`
    );
  }

  if (!xml.includes('WidgetTapReceiver')) {
    xml = xml.replace(
      '</application>',
      `    <receiver android:name=".widget.WidgetTapReceiver" android:exported="false">
      <intent-filter>
        <action android:name="com.atleyllc.dualtime.widget.ACTION_WIDGET_TAP"/>
      </intent-filter>
    </receiver>
  </application>`
    );
  }

  if (!xml.includes('android.intent.action.SHOW_ALARMS')) {
    xml = xml.replace(
      '</queries>',
      `    <intent>
      <action android:name="android.intent.action.SHOW_ALARMS"/>
    </intent>
    <intent>
      <action android:name="android.intent.action.SET_ALARM"/>
    </intent>
    <intent>
      <action android:name="android.intent.action.MAIN"/>
      <category android:name="android.intent.category.APP_CLOCK"/>
    </intent>
    <package android:name="com.google.android.deskclock"/>
    <package android:name="com.android.deskclock"/>
  </queries>`
    );
  }

  fs.writeFileSync(manifestPath, xml, 'utf8');
  console.log('Patched AndroidManifest.xml (TextClock widget, system event receiver)');
}

function main() {
  if (!fs.existsSync(widgetDest)) {
    console.error('android widget package missing — run: npx expo prebuild --platform android');
    process.exit(1);
  }

  removeLegacyWidgetSources();
  applyKotlinSources();

  copyDir(path.join(resSrc, 'layout'), path.join(resDest, 'layout'));
  copyDir(path.join(resSrc, 'drawable'), path.join(resDest, 'drawable'));
  copyDir(path.join(resSrc, 'values'), path.join(resDest, 'values'));

  const staleDrawables = ['widget_card_background.xml'];
  for (const file of staleDrawables) {
    const stale = path.join(resDest, 'drawable', file);
    if (fs.existsSync(stale)) {
      fs.unlinkSync(stale);
      console.log(`Removed stale drawable/${file}`);
    }
  }

  const widgetProviderDest = path.join(resDest, 'xml/widgetprovider_dualtime.xml');
  const widgetProviderSrc = path.join(resSrc, 'xml/widgetprovider_dualtime.xml');
  if (fs.existsSync(widgetProviderSrc)) {
    fs.mkdirSync(path.dirname(widgetProviderDest), { recursive: true });
    fs.copyFileSync(widgetProviderSrc, widgetProviderDest);
    console.log('Applied res/xml/widgetprovider_dualtime.xml');
  }

  patchMainApplication();
  patchWidgetDescription();
  patchManifest();
}

function patchWidgetDescription() {
  const stringsPath = path.join(root, 'android/app/src/main/res/values/strings.xml');
  if (!fs.existsSync(stringsPath)) return;

  let xml = fs.readFileSync(stringsPath, 'utf8');
  const description =
    '24-hour time, date, and 12-hour time — 2×2 clock dashboard';

  if (xml.includes('widget_dualtime_description')) {
    xml = xml.replace(
      /<string name="widget_dualtime_description">[^<]*<\/string>/,
      `<string name="widget_dualtime_description">${description}</string>`
    );
  } else {
    xml = xml.replace(
      '</resources>',
      `  <string name="widget_dualtime_description">${description}</string>\n</resources>`
    );
  }

  fs.writeFileSync(stringsPath, xml, 'utf8');
  console.log('Patched strings.xml widget description');
}

main();
