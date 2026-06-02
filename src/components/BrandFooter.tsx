import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

export function BrandFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.product}>DualTime</Text>
      <Text style={styles.company}>Atley LLC</Text>
      <Text style={styles.tagline}>Civilian & military time, side by side</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  product: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  company: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
});
