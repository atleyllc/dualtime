#!/usr/bin/env node
/** Resolves Android SDK path for local scripts. */
const fs = require('fs');
const os = require('os');
const path = require('path');

function detectSdk() {
  const fromEnv = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  const mac = path.join(os.homedir(), 'Library', 'Android', 'sdk');
  if (fs.existsSync(mac)) return mac;

  return null;
}

function adbPath(sdk) {
  return path.join(sdk, 'platform-tools', 'adb');
}

function emulatorPath(sdk) {
  return path.join(sdk, 'emulator', 'emulator');
}

module.exports = { detectSdk, adbPath, emulatorPath };
