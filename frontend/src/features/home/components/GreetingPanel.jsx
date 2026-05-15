import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';

const avatarUri = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80';

export function GreetingPanel({ onProfilePress }) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.caption}>Good morning,</Text>
        <Text style={styles.name}>Durgesh</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        onPress={onProfilePress}
        style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
      >
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View style={styles.avatarFallback}>
          <Ionicons name="person" size={24} color={theme.colors.primary} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.space.sm,
  },
  caption: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.sm,
    marginBottom: 1,
  },
  name: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 26,
    lineHeight: 32,
  },
  avatarButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.full,
    height: 64,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 64,
    ...theme.shadows.soft,
  },
  avatar: {
    height: '100%',
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  avatarFallback: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  pressed: {
    opacity: 0.72,
  },
});
