#!/usr/bin/env node
/**
 * Standalone beta APK — bundles JS via Gradle assembleRelease.
 * Usage: npm run build:android:beta
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const androidDir = path.join(root, 'android');
const gradlew = path.join(androidDir, 'gradlew');

function run(cmd, args, opts = {}) {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    cwd: opts.cwd || root,
    env: opts.env || process.env,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function main() {
  if (!fs.existsSync(gradlew)) {
    console.error('android/ not found. Run: npm run prebuild:android');
    process.exit(1);
  }

  require('./setup-android-local.cjs');

  try {
    fs.chmodSync(gradlew, 0o755);
  } catch {
    /* ignore */
  }

  run('./gradlew', ['--stop'], { cwd: androidDir });
  run('./gradlew', ['assembleRelease', '--no-daemon', '--stacktrace'], {
    cwd: androidDir,
  });

  const apk = path.join(androidDir, 'app/build/outputs/apk/release/app-release.apk');
  if (!fs.existsSync(apk)) {
    console.error('app-release.apk not found after build.');
    process.exit(1);
  }

  const version = require(path.join(root, 'package.json')).version;
  const releaseDir = path.join(root, 'releases', `v${version}`);
  const releaseName = `DualTime-v${version}.apk`;

  fs.mkdirSync(releaseDir, { recursive: true });
  fs.copyFileSync(apk, path.join(releaseDir, releaseName));
  fs.copyFileSync(apk, path.join(root, 'releases', releaseName));

  console.log(`\n✓ ${releaseName}`);
  console.log(`  ${path.join('releases', releaseName)}`);
}

main();
