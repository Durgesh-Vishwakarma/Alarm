import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';

export function NewAlarmHeader({ onBack, onSave, title = 'New Alarm' }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
      </Pressable>

      <Text style={styles.title}>{title}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save alarm"
        onPress={onSave}
        style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
      >
        <Ionicons name="checkmark" size={24} color={theme.colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 20,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
    ...theme.shadows.glow,
  },
  pressed: {
    opacity: 0.7,
  },
});
