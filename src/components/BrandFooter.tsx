import * as Linking from 'expo-linking';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

const COMPANY_URL = 'https://atley.llc';

export function BrandFooter() {
  const openCompanySite = () => {
    void Linking.openURL(COMPANY_URL);
  };

  return (
    <View style={styles.footer}>
      <Text style={styles.product}>DualTime</Text>
      <Pressable
        onPress={openCompanySite}
        accessibilityRole="link"
        accessibilityLabel="Atley LLC"
        accessibilityHint="Opens atley.llc"
        style={({ pressed }) => [styles.companyButton, pressed && styles.companyButtonPressed]}
      >
        <Text style={styles.company}>Atley LLC</Text>
      </Pressable>
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
  companyButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.brand,
    backgroundColor: colors.surface,
  },
  companyButtonPressed: {
    opacity: 0.7,
  },
  company: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
});
