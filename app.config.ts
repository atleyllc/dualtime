import type { ConfigContext, ExpoConfig } from 'expo/config';
import type { WithAndroidWidgetsParams } from 'react-native-android-widget';

const widgetConfig: WithAndroidWidgetsParams = {
  widgets: [
    {
      name: 'DualTime',
      label: 'DualTime',
      description: '12-hour and 24-hour local time at a glance',
      minWidth: '250dp',
      minHeight: '110dp',
      targetCellWidth: 4,
      targetCellHeight: 2,
      previewImage: './assets/images/widget-preview.png',
      resizeMode: 'horizontal|vertical',
      updatePeriodMillis: 1_800_000,
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'DualTime',
  slug: 'dualtime',
  version: '0.1.1',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
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
      foregroundImage: './assets/images/adaptive-icon.png',
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
  plugins: ['expo-router', ['react-native-android-widget', widgetConfig]],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    company: 'Atley LLC',
    router: {},
  },
});
