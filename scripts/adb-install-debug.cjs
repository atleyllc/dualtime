#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { adbPath, detectSdk } = require('./android-sdk-env.cjs');

const root = path.resolve(__dirname, '..');
const apk = path.join(root, 'android/app/build/outputs/apk/debug/app-debug.apk');

const sdk = detectSdk();
if (!sdk) {
  console.error('Android SDK not found. Install Android Studio.');
  process.exit(1);
}

if (!fs.existsSync(apk)) {
  console.error(`Debug APK missing. Build first:\n  cd android && ./gradlew assembleDebug`);
  process.exit(1);
}

const adb = adbPath(sdk);
const devices = spawnSync(adb, ['devices'], { encoding: 'utf8' });
const lines = (devices.stdout || '')
  .split('\n')
  .filter((l) => l.includes('\tdevice'));

if (lines.length === 0) {
  console.error(`
No Android device or emulator connected.

1. Android Studio → Device Manager → Create Device → start emulator
   OR plug in a phone with USB debugging enabled

2. Check: npm run android:devices

3. Install: npm run android:install:debug
`);
  process.exit(1);
}

console.log(`Installing on ${lines[0].split('\t')[0]} …`);
const r = spawnSync(adb, ['install', '-r', apk], { stdio: 'inherit' });
process.exit(r.status ?? 1);
