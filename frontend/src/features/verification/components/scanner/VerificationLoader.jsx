import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../../shared/theme';

export function VerificationLoader() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={theme.colors.white} />
      <Text style={styles.text}>Verifying photo...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.56)',
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    gap: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
  },
  text: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
  },
});
