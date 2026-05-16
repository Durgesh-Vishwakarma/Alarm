import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { theme } from '../../../shared/theme';

export function FloatingAddButton({ onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Create alarm"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name="add" size={42} color={theme.colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    bottom: 18,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    width: 60,
    ...theme.shadows.glow,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.95 }],
  },
});
