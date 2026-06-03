# DualTime — Android widget (TextClock + date)

The home-screen widget uses **native `TextClock`** for both clocks and a **date line**
between them. Android updates the times automatically. The date, theme, and tap action
refresh when the widget is resized, settings are saved, every 30 minutes via
`updatePeriodMillis`, or on **boot / time / timezone / date** system broadcasts
(`WidgetSystemEventReceiver` — no exact alarms).

## Layout (2×2)

```
18:47
Tue Jun 2
6:47 PM
```

- 24-hour (top, largest, white)
- Date (center, smallest, muted)
- 12-hour (bottom, medium, dimmed white)

## After prebuild

```bash
npm run prebuild:android
```
