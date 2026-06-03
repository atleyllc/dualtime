import type { ConfigContext, ExpoConfig } from 'expo/config';
import type { WithAndroidWidgetsParams } from 'react-native-android-widget';

const widgetConfig: WithAndroidWidgetsParams = {
  widgets: [
    {
      name: 'DualTime',
      label: 'DualTime',
      description: '24-hour time · date · 12-hour time (2×2 clock dashboard)',
      minWidth: '110dp',
      minHeight: '110dp',
      targetCellWidth: 2,
      targetCellHeight: 2,
      previewImage: './assets/images/widget-preview.png',
      resizeMode: 'horizontal|vertical',
      // Native AlarmManager handles updates; 0 disables periodic AppWidgetManager polling.
      updatePeriodMillis: 0,
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'DualTime',
  slug: 'dualtime',
  version: '0.2.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'dualtime',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0B0F14',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.atleyllc.dualtime',
  },
  android: {
    package: 'com.atleyllc.dualtime',
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#0B0F14',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    ['react-native-android-widget', widgetConfig],
    './plugins/withDualTimeWidgetAlarm.cjs',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    company: 'Atley LLC',
    router: {},
  },
});
