#!/usr/bin/env node
/** Ensures Android SDK packages exist before Gradle (CI-friendly). */

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SDK_PACKAGES = [
  'platform-tools',
  'platforms;android-35',
  'build-tools;35.0.0',
];

function detectSdk() {
  const fromEnv = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  const mac = path.join(os.homedir(), 'Library', 'Android', 'sdk');
  if (fs.existsSync(mac)) return mac;
  return null;
}

function findSdkmanager(sdk) {
  const candidates = [
    path.join(sdk, 'cmdline-tools', 'latest', 'bin', 'sdkmanager'),
    path.join(sdk, 'cmdline-tools', 'bin', 'sdkmanager'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function main() {
  const sdk = detectSdk();
  if (!sdk) return;

  const sdkmanager = findSdkmanager(sdk);
  if (!sdkmanager) return;

  const r = spawnSync(
    sdkmanager,
    [...SDK_PACKAGES, '--install'],
    {
      env: { ...process.env, ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk },
      stdio: 'inherit',
    }
  );
  if (r.status !== 0) {
    console.warn('sdkmanager install returned non-zero (continuing)');
  }
}

main();
