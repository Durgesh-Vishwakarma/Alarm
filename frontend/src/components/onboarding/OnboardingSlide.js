import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../theme';

export function OnboardingSlide({ slide }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons color={theme.colors.primary} name={slide.icon} size={26} />
      </View>
      <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.body}>{slide.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    padding: theme.space.xl,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.lg,
    height: 54,
    justifyContent: 'center',
    marginBottom: theme.space.lg,
    width: 54,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    marginBottom: theme.space.sm,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 17,
    lineHeight: 24,
    marginBottom: theme.space.sm,
  },
  body: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 19,
  },
});
