# DualTime v0.1.1

First public Android test build — dual 12-hour and 24-hour local time for operators who switch between civilian and military time.

## What's included

- Dashboard with live 12-hour and 24-hour clocks and subtle date
- Android home screen widget (12 HR / 24 HR labels, solid or clear background)
- Dark minimalist UI — Atley LLC
- Web static export for GitHub Pages

## Install

### Android

Download **DualTime-v0.1.1.apk** from the release assets below.

- Package: `com.atleyllc.dualtime`
- **Unsigned / debug-signed test build** — built locally with Gradle (no EAS cloud credits)
- For testing only; not Play Store distribution

### Web

https://atleyllc.github.io/dualtime/

## Build notes

- APK produced locally via `expo prebuild` + `./gradlew assembleRelease`
- Widget requires this build (not Expo Go)
