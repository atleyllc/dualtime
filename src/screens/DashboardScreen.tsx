import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandFooter } from '@/src/components/BrandFooter';
import { ClockBlock } from '@/src/components/ClockBlock';
import { WidgetBackgroundOption } from '@/src/components/WidgetBackgroundOption';
import { useLiveClock } from '@/src/hooks/useLiveClock';
import { useWidgetPreferences } from '@/src/hooks/useWidgetPreferences';
import { formatDateSubtle, formatTime12, formatTime24 } from '@/src/time/format';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const now = useLiveClock();
  const { transparentBackground, setTransparentBackground, showWidgetOptions, loaded } =
    useWidgetPreferences(now);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.md,
        },
      ]}
    >
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>DualTime</Text>
        <Text style={styles.subtitle}>Local time · dual format</Text>
      </View>

      <View style={styles.centerStage}>
        <View style={styles.clocks}>
          <ClockBlock label="12-Hour" time={formatTime12(now)} variant="primary" />
          <ClockBlock label="24-Hour" time={formatTime24(now)} variant="secondary" />
        </View>
        <Text style={styles.date}>{formatDateSubtle(now)}</Text>
      </View>

      <View style={styles.footer}>
        {showWidgetOptions && loaded ? (
          <WidgetBackgroundOption
            transparent={transparentBackground}
            onChange={setTransparentBackground}
          />
        ) : null}
        <BrandFooter />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  centerStage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.lg,
  },
  clocks: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  date: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontWeight: '400',
    letterSpacing: 0.2,
    opacity: 0.9,
  },
  footer: {
    paddingTop: spacing.sm,
  },
});
