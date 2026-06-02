# DualTime — Release workflow

**Product:** DualTime  
**Company:** Atley LLC  
**Repository:** [github.com/atleyllc/dualtime](https://github.com/atleyllc/dualtime)

## Identity

| Field | Value |
|-------|--------|
| App (display) | DualTime |
| Repo | `atleyllc/dualtime` |
| npm name | `dualtime` |
| Android / iOS package | `com.atleyllc.dualtime` |
| Web base (Pages) | `/dualtime/` |
| Public web URL | https://atleyllc.github.io/dualtime/ |

## GitHub Pages (one-time setup)

**Settings → Pages → Build and deployment:** GitHub Actions.

| Workflow | Trigger | Result |
|----------|---------|--------|
| `.github/workflows/pages.yml` | Push to `main`, manual | Deploy web |
| `.github/workflows/release.yml` | Tag `v*` | Release + APK (+ Pages on tag) |

## Release (tag-driven)

1. Bump `package.json` and `app.config.ts` version (e.g. `0.1.1`)
2. Write `RELEASE_NOTES_v0.1.1.md` from `RELEASE_TEMPLATE.md`
3. Optional: `release/v0.1.1-notes.md` (CI fallback)
4. Commit and push `main`
5. Tag and push:

```bash
git tag -a v0.1.1 -m "DualTime v0.1.1"
git push origin main
git push origin v0.1.1
```

6. Watch **Actions → Release DualTime**
7. Verify:
   - https://atleyllc.github.io/dualtime/
   - https://github.com/atleyllc/dualtime/releases/tag/v0.1.1
   - Asset: `DualTime-v0.1.1-beta.apk`

## Local builds

```bash
npm run build:web:pages
npm run prebuild:android
npm run build:android:beta
```

> **Android widget:** Requires a development build (`expo run:android` or release APK). Expo Go does not load native widgets.

## Artifacts

| Output | Path / name |
|--------|-------------|
| Web | `dist/` |
| Tester APK | `releases/vX.Y.Z/DualTime-vX.Y.Z-beta.apk` |
| CI release asset | `DualTime-vX.Y.Z-beta.apk` |
