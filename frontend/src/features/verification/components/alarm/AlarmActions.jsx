import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../../../../shared/theme';

export function AlarmActions({ disabled = false, onStart }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onStart}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Ionicons name="camera-outline" size={22} color={theme.colors.primary} />
      <Text style={styles.text}>Start Verification</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    gap: theme.space.md,
    height: 58,
    justifyContent: 'center',
    shadowColor: '#8A2B00',
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 9,
  },
  disabled: {
    backgroundColor: theme.colors.textLight,
    shadowOpacity: 0,
  },
  text: {
    color: theme.colors.primaryDark,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.88,
  },
});
