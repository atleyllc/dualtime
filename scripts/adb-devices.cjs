#!/usr/bin/env node
const { spawnSync } = require('child_process');
const { adbPath, detectSdk } = require('./android-sdk-env.cjs');

const sdk = detectSdk();
if (!sdk) {
  console.error('Android SDK not found. Install Android Studio.');
  process.exit(1);
}

const adb = adbPath(sdk);
const r = spawnSync(adb, ['devices', '-l'], { stdio: 'inherit' });
process.exit(r.status ?? 1);
