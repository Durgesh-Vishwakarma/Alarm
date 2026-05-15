import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../theme';
import { PermissionStatusBadge } from './PermissionStatusBadge';

export function PermissionCard({ permission, busy = false, onPress }) {
  const granted = permission.status === 'granted';

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, granted && styles.iconWrapGranted]}>
        <Ionicons
          color={granted ? theme.colors.success : theme.colors.primary}
          name={granted ? 'checkmark' : 'alert-circle-outline'}
          size={18}
        />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{permission.title}</Text>
          <PermissionStatusBadge status={permission.status} />
        </View>
        <Text style={styles.description}>{permission.description}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={busy || granted}
        onPress={onPress}
        style={({ pressed }) => [
          styles.action,
          granted && styles.actionGranted,
          pressed && !granted && styles.pressed,
        ]}
      >
        <Text style={[styles.actionText, granted && styles.actionTextGranted]}>
          {granted ? 'Done' : permission.actionLabel ?? 'Enable'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.space.md,
    padding: theme.space.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.lg,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  iconWrapGranted: {
    backgroundColor: 'rgba(21, 176, 113, 0.1)',
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.space.sm,
    justifyContent: 'space-between',
  },
  title: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
  },
  description: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
  },
  action: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    minWidth: 62,
    paddingHorizontal: theme.space.sm,
    paddingVertical: 9,
  },
  actionGranted: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  actionText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 11,
  },
  actionTextGranted: {
    color: theme.colors.textMuted,
  },
  pressed: {
    opacity: 0.88,
  },
});
