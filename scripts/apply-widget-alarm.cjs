#!/usr/bin/env node
/**
 * Copies widget alarm Java sources over generated android/ (after expo prebuild).
 * The widget config plugin regenerates DualTime.java — this must run last.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'plugins', 'android-src');
const destDir = path.join(root, 'android/app/src/main/java/com/atleyllc/dualtime/widget');

const files = [
  ['WidgetMinuteAlarmReceiver.java', 'WidgetMinuteAlarmReceiver.java'],
  ['WidgetMinuteAlarmScheduler.java', 'WidgetMinuteAlarmScheduler.java'],
  ['DualTimeWidgetProvider.java', 'DualTime.java'],
];

function main() {
  if (!fs.existsSync(destDir)) {
    console.error('android widget package missing — run: npx expo prebuild --platform android');
    process.exit(1);
  }

  for (const [fromName, toName] of files) {
    fs.copyFileSync(path.join(srcDir, fromName), path.join(destDir, toName));
    console.log(`Applied ${toName}`);
  }
}

main();
