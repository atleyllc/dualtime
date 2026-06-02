import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

type WidgetBackgroundOptionProps = {
  transparent: boolean;
  onChange: (transparent: boolean) => void;
};

export function WidgetBackgroundOption({
  transparent,
  onChange,
}: WidgetBackgroundOptionProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Widget background</Text>
      <View style={styles.segmented}>
        <Pressable
          style={[styles.option, !transparent && styles.optionActive]}
          onPress={() => onChange(false)}
          accessibilityRole="button"
          accessibilityState={{ selected: !transparent }}
        >
          <Text style={[styles.optionText, !transparent && styles.optionTextActive]}>
            Solid
          </Text>
        </Pressable>
        <Pressable
          style={[styles.option, transparent && styles.optionActive]}
          onPress={() => onChange(true)}
          accessibilityRole="button"
          accessibilityState={{ selected: transparent }}
        >
          <Text style={[styles.optionText, transparent && styles.optionTextActive]}>
            Clear
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    color: colors.label,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  optionActive: {
    backgroundColor: colors.accentMuted,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
