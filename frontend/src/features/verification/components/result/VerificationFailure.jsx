import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../../shared/theme';

export function VerificationFailure({ message, onRetry }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="close" size={42} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>Verification failed</Text>
      <Text style={styles.body}>{message || 'Try again with a clearer photo.'}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Retry Verification</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.full,
    height: 86,
    justifyContent: 'center',
    marginBottom: theme.space.lg,
    width: 86,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 17,
  },
  body: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: theme.space.sm,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    height: 54,
    justifyContent: 'center',
    marginTop: theme.space.xl,
    paddingHorizontal: theme.space.xl,
    ...theme.shadows.glow,
  },
  buttonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.86,
  },
});
