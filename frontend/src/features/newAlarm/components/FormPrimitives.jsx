import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { theme } from '../../../theme';

export function SectionTitle({ title, subtitle }) {
  return (
    <View style={styles.titleBlock}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SettingRow({ icon, label, value, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {icon ? (
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
        </View>
      ) : null}
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      <Ionicons name="chevron-forward" size={17} color={theme.colors.textLight} />
    </Pressable>
  );
}

export function ToggleRow({ label, value, onValueChange }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E3E8EF', true: theme.colors.primary }}
        thumbColor={theme.colors.white}
        ios_backgroundColor="#E3E8EF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    gap: theme.space.xs,
    marginBottom: theme.space.md,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 17,
    lineHeight: 23,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.xs,
    lineHeight: 18,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: theme.colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: theme.space.lg,
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.full,
    height: 30,
    justifyContent: 'center',
    marginRight: theme.space.md,
    width: 30,
  },
  rowLabel: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.sm,
  },
  rowValue: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.sm,
    marginRight: theme.space.sm,
  },
  pressed: {
    opacity: 0.65,
  },
});
