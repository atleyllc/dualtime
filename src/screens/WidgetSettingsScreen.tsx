import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsOptionRow } from '@/src/components/settings/SettingsOptionRow';
import { SettingsSection } from '@/src/components/settings/SettingsSection';
import { SettingsToggleRow } from '@/src/components/settings/SettingsToggleRow';
import { useWidgetSettings } from '@/src/hooks/useWidgetSettings';
import {
  WIDGET_DATE_FORMAT_LABELS,
  WIDGET_TAP_ACTION_LABELS,
  WIDGET_THEME_LABELS,
  WIDGET_TIME_ORDER_LABELS,
  type WidgetDateFormat,
  type WidgetTapAction,
  type WidgetTheme,
  type WidgetTimeOrder,
} from '@/src/types/widgetSettings';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

const TAP_OPTIONS = (Object.keys(WIDGET_TAP_ACTION_LABELS) as WidgetTapAction[]).map(
  (id) => ({ id, label: WIDGET_TAP_ACTION_LABELS[id] })
);

const THEME_OPTIONS = (Object.keys(WIDGET_THEME_LABELS) as WidgetTheme[]).map((id) => ({
  id,
  label: WIDGET_THEME_LABELS[id],
}));

const DATE_FORMAT_OPTIONS = (Object.keys(WIDGET_DATE_FORMAT_LABELS) as WidgetDateFormat[]).map(
  (id) => ({ id, label: WIDGET_DATE_FORMAT_LABELS[id] })
);

const TIME_ORDER_OPTIONS = (Object.keys(WIDGET_TIME_ORDER_LABELS) as WidgetTimeOrder[]).map(
  (id) => ({ id, label: WIDGET_TIME_ORDER_LABELS[id] })
);

export function WidgetSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    settings,
    loaded,
    deviceStatus,
    syncMessage,
    syncing,
    updateSettings,
    refreshWidget,
  } = useWidgetSettings();

  if (Platform.OS !== 'android') {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Widget settings</Text>
        <Text style={styles.note}>Android home-screen widget only.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Widget settings</Text>
        <Text style={styles.subtitle}>Optional — defaults match the current widget</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loaded ? (
          <>
            <SettingsSection title="When you tap the widget">
              <SettingsOptionRow
                label="Tap action"
                value={settings.tapAction}
                options={TAP_OPTIONS}
                onChange={(tapAction) => updateSettings({ tapAction })}
              />
              {deviceStatus ? (
                <View style={styles.statusBox}>
                  <Text style={styles.statusTitle}>On your home screen</Text>
                  <Text style={styles.statusLine}>
                    Widgets found: {deviceStatus.widgetCount}
                  </Text>
                  <Text style={styles.statusLine}>
                    Tap action stored on device:{' '}
                    {deviceStatus.tapAction
                      ? WIDGET_TAP_ACTION_LABELS[deviceStatus.tapAction]
                      : deviceStatus.nativeLinked
                        ? 'unknown'
                        : 'not available (reinstall APK)'}
                  </Text>
                  {!deviceStatus.nativeLinked ? (
                    <Text style={styles.statusWarn}>
                      Native widget bridge missing. Install the latest DualTime APK, then try
                      again.
                    </Text>
                  ) : null}
                  <Pressable
                    style={[styles.refreshButton, syncing && styles.refreshButtonDisabled]}
                    onPress={() => refreshWidget()}
                    disabled={syncing}
                    accessibilityRole="button"
                  >
                    <Text style={styles.refreshButtonText}>
                      {syncing ? 'Updating…' : 'Refresh widget tap action'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
              {syncMessage ? <Text style={styles.syncMessage}>{syncMessage}</Text> : null}
            </SettingsSection>

            <SettingsSection title="Appearance">
              <SettingsOptionRow
                label="Theme"
                value={settings.theme}
                options={THEME_OPTIONS}
                onChange={(theme) => updateSettings({ theme })}
              />
              <SettingsOptionRow
                label="Time order"
                value={settings.timeOrder}
                options={TIME_ORDER_OPTIONS}
                onChange={(timeOrder) => updateSettings({ timeOrder })}
              />
              <SettingsToggleRow
                label="Show date"
                value={settings.showDate}
                onChange={(showDate) => updateSettings({ showDate })}
              />
              {settings.showDate ? (
                <SettingsOptionRow
                  label="Date format"
                  value={settings.dateFormat}
                  options={DATE_FORMAT_OPTIONS}
                  onChange={(dateFormat) => updateSettings({ dateFormat })}
                />
              ) : null}
              <SettingsToggleRow
                label="Show seconds"
                description="Off by default"
                value={settings.showSeconds}
                onChange={(showSeconds) => updateSettings({ showSeconds })}
              />
            </SettingsSection>

            <Text style={styles.footerNote}>
              After changing tap action, tap “Refresh widget tap action”, then test on the home
              screen. Remove and re-add the widget only if tap still opens the wrong app.
            </Text>
          </>
        ) : null}
      </ScrollView>
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
    marginBottom: spacing.md,
  },
  back: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
  },
  statusBox: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: 6,
  },
  statusTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  statusLine: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  statusWarn: {
    color: '#E8B86D',
    fontSize: 12,
    lineHeight: 17,
  },
  syncMessage: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  refreshButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.accentMuted,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  footerNote: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.md,
  },
});
