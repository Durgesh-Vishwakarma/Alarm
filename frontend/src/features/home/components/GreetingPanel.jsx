import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';

export function GreetingPanel() {
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <Text style={styles.eyebrow}>Morning routine ready</Text>
        <Text style={styles.title}>Your next wake-up is set</Text>
        <Text style={styles.subtitle}>Complete a photo challenge to stop the next alarm.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.space.sm,
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.xl,
    marginBottom: theme.space.xs,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.lg,
    lineHeight: 23,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
    marginTop: theme.space.xs,
  },
});
