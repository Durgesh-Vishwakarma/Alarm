import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';

export function ShortcutGrid({ items, onShortcutPress }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={item.label}
          key={item.id}
          onPress={() => onShortcutPress(item)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={[styles.iconWrap, { backgroundColor: item.backgroundColor }]}>
            <Ionicons name={item.icon} size={22} color={item.iconColor} />
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.label}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    columnGap: theme.space.md,
    flexDirection: 'row',
    marginTop: theme.space.sm,
  },
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    flex: 1,
    gap: theme.space.sm,
    height: 88,
    justifyContent: 'center',
    paddingHorizontal: theme.space.xs,
    ...theme.shadows.soft,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: theme.radii.full,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  label: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    maxWidth: '100%',
  },
  pressed: {
    opacity: 0.68,
    transform: [{ scale: 0.98 }],
  },
});
