import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

type ClockBlockProps = {
  label: string;
  time: string;
  variant?: 'primary' | 'secondary';
};

export function ClockBlock({ label, time, variant = 'primary' }: ClockBlockProps) {
  const isPrimary = variant === 'primary';

  return (
    <View style={styles.block} accessibilityRole="text">
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.time,
          isPrimary ? styles.timePrimary : styles.timeSecondary,
        ]}
      >
        {time}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    width: '100%',
  },
  label: {
    color: colors.label,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  time: {
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  timePrimary: {
    color: colors.textPrimary,
    fontSize: 58,
    fontWeight: '200',
  },
  timeSecondary: {
    color: colors.textSecondaryClock,
    fontSize: 44,
    fontWeight: '300',
  },
});
