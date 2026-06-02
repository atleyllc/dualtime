# DualTime

**DualTime** by [Atley LLC](https://github.com/atleyllc) — see local time in **12-hour** and **24-hour** formats at once.

Built for ham radio operators, pilots, military personnel, event production crews, and anyone who regularly switches between civilian and military time.

| | |
|---|---|
| **Version** | 0.1.0 |
| **Web** | https://atleyllc.github.io/dualtime/ |
| **Releases** | https://github.com/atleyllc/dualtime/releases |

## Features (v0.1.0)

- Large 12-hour and 24-hour clocks on one dashboard
- Live updates every second
- Current date below the clocks
- Dark minimalist UI
- **Android home screen widget** with both formats (requires dev build or release APK)

## Quick start

```bash
npm install
npm start
```

| Command | Purpose |
|---------|---------|
| `npm run android` | Native Android (widget support) |
| `npm run ios` | Native iOS |
| `npm run web` | Web preview |
| `npm run verify` | TypeScript check |

> Widgets do not run in **Expo Go**. Use `npm run android` after `npm run prebuild:android`, or install a release APK.

## Android widget

1. Build or install a release/dev APK (`npm run prebuild:android` then `npm run build:android:beta`)
2. Long-press home screen → **Widgets** → **DualTime**
3. The widget shows 12-hour and 24-hour time; Android refreshes it on a system schedule (≥30 min) and the app pushes updates every second while open

## Release workflow

Tag-driven releases publish GitHub Pages, a standalone Android APK, and a GitHub Release — same pattern as StrikeNote and VoiceLog.

See [docs/RELEASE_WORKFLOW.md](./docs/RELEASE_WORKFLOW.md).

```bash
git tag -a v0.1.0 -m "DualTime v0.1.0"
git push origin v0.1.0
```

## Project structure

```
app/                 Expo Router screens
src/
  components/        UI building blocks
  hooks/             Live clock + widget sync
  screens/           Dashboard
  theme/             Colors
  time/              12h / 24h / date formatting
widgets/             Android widget UI + task handler
scripts/             Android build helpers
.github/workflows/   Pages + tag release CI
```

## License

Proprietary — Atley LLC. All rights reserved.
