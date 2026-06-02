#!/usr/bin/env node
/** Patches android/gradle.properties for reliable local release builds. */

const fs = require('fs');
const path = require('path');

const gradlePropsPath = path.join(__dirname, '..', 'android', 'gradle.properties');

const PATCH = {
  reactNativeArchitectures: 'arm64-v8a',
  'org.gradle.jvmargs':
    '-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8',
  'org.gradle.parallel': 'true',
  'org.gradle.caching': 'true',
  hermesEnabled: 'true',
};

function main() {
  if (!fs.existsSync(gradlePropsPath)) return;

  const original = fs.readFileSync(gradlePropsPath, 'utf8');
  const map = new Map();
  for (const line of original.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) continue;
    const i = t.indexOf('=');
    map.set(t.slice(0, i).trim(), t.slice(i + 1).trim());
  }

  for (const [key, value] of Object.entries(PATCH)) {
    map.set(key, value);
  }

  const lines = original.split('\n');
  const seen = new Set();
  const out = [];

  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) {
      out.push(line);
      continue;
    }
    const key = t.slice(0, t.indexOf('=')).trim();
    if (PATCH[key] !== undefined) {
      out.push(`${key}=${PATCH[key]}`);
      seen.add(key);
    } else {
      out.push(line);
    }
  }

  for (const [key, value] of Object.entries(PATCH)) {
    if (!seen.has(key)) out.push(`${key}=${value}`);
  }

  fs.writeFileSync(gradlePropsPath, out.join('\n'), 'utf8');
  console.log('Patched android/gradle.properties');
}

main();
