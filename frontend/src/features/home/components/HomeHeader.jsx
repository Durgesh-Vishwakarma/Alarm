import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';

export function HomeHeader() {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        onPress={() => Alert.alert('Menu', 'Menu action is ready.')}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <Ionicons name="menu" size={26} color={theme.colors.text} />
      </Pressable>

      <Text style={styles.logo}>Snapwake</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open notifications"
        onPress={() => Alert.alert('Notifications', 'No new notifications yet.')}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <Ionicons name="notifications-outline" size={23} color={theme.colors.text} />
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: theme.space.lg,
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  pressed: {
    opacity: 0.55,
  },
  logo: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.lg,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.white,
    borderRadius: theme.radii.full,
    borderWidth: 2,
    height: 11,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    top: 7,
    width: 11,
  },
  badgeDot: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.full,
    height: 3,
    width: 3,
  },
});
