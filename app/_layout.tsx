import { type Href, Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';

import { loadWidgetSettings } from '@/src/storage/widgetSettings';
import { colors } from '@/src/theme/colors';

function useWidgetSettingsDeepLink() {
  const router = useRouter();

  useEffect(() => {
    const openSettingsFromUrl = (url: string | null) => {
      if (!url) return;
      if (url.includes('settings')) {
        router.push('/settings' as Href);
      }
    };

    void Linking.getInitialURL().then(openSettingsFromUrl);
    const sub = Linking.addEventListener('url', (event) => {
      openSettingsFromUrl(event.url);
    });
    return () => sub.remove();
  }, [router]);
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useWidgetSettingsDeepLink();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      void loadWidgetSettings();
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  );
}
