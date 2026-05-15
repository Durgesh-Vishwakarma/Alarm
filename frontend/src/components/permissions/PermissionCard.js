import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../theme';
import { PermissionStatusBadge } from './PermissionStatusBadge';

export function PermissionCard({ isLast = false, permission, busy = false, onPress }) {
  const granted = permission.status === 'granted';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={busy || granted}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && !granted && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: permission.backgroundColor ?? theme.colors.primarySoft },
        ]}
      >
        <Ionicons
          color={permission.iconColor ?? theme.colors.primary}
          name={permission.icon ?? 'shield-checkmark-outline'}
          size={22}
        />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{permission.title}</Text>
        {permission.description ? (
          <Text style={styles.description}>{permission.description}</Text>
        ) : null}
      </View>

      <View style={styles.trailing}>
        <PermissionStatusBadge status={permission.status} />
        {granted ? (
          <Ionicons name="checkmark-circle" size={21} color="#6BCB4B" />
        ) : (
          <View style={styles.actionHint}>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    gap: 13,
    minHeight: 78,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomColor: theme.colors.borderSoft,
    borderBottomWidth: 1,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
  },
  description: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },
  trailing: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'flex-end',
    minWidth: 98,
  },
  actionHint: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  pressed: {
    opacity: 0.86,
  },
});
