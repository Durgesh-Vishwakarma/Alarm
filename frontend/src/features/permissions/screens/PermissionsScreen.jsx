import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { PermissionCard } from '../components/PermissionCard';
import { Screen } from '../../../shared/components/Screen';
import {
  areRequiredPermissionsGranted,
  refreshAndPersistPermissions,
  requestRequiredPermission,
} from '../services/permissionService';
import { theme } from '../../../shared/theme';

export default function PermissionsScreen() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null);

  const allGranted = areRequiredPermissionsGranted(permissions);
  const enabledCount = permissions.filter((permission) => permission.status === 'granted').length;
  const totalCount = permissions.length || 5;
  const progress = totalCount > 0 ? enabledCount / totalCount : 0;

  const refresh = useCallback(async () => {
    const result = await refreshAndPersistPermissions();
    setPermissions(result.permissions);
    setLoading(false);
    return result;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  const handlePermissionPress = async (permission) => {
    setBusyKey(permission.key);

    try {
      await requestRequiredPermission(permission.key, permission.status);
    } finally {
      setBusyKey(null);
      refresh();
    }
  };

  const continueToHome = async () => {
    const result = await refresh();

    if (result.allGranted) {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Alarm protection</Text>
        <Text style={styles.title}>Set up required permissions</Text>
        <Text style={styles.subtitle}>
          Snapwake checks only the access needed for alarms, full-screen ringing, and photo
          challenges.
        </Text>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressIcon}>
          <Ionicons name="shield-outline" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.progressCopy}>
          <Text style={styles.progressTitle}>
            {enabledCount} of {totalCount} enabled
          </Text>
          <Text style={styles.progressSubtitle}>Required before Home opens</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.list}>
        {permissions.map((permission, index) => (
          <PermissionCard
            busy={busyKey === permission.key || loading}
            isLast={index === permissions.length - 1}
            key={permission.key}
            onPress={() => handlePermissionPress(permission)}
            permission={permission}
          />
        ))}
      </View>

      <View style={styles.noteRow}>
        <Ionicons name="information-circle-outline" size={15} color={theme.colors.textMuted} />
        <Text style={styles.noteText}>
          You can change these anytime in device Settings. Snapwake checks access every launch.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!allGranted || loading}
        onPress={continueToHome}
        style={({ pressed }) => [
          styles.button,
          (!allGranted || loading) && styles.buttonDisabled,
          pressed && allGranted && styles.pressed,
        ]}
      >
        <Text style={styles.buttonText}>Continue to Snapwake</Text>
        <Ionicons name="arrow-forward" size={18} color={theme.colors.white} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingTop: theme.space.sm,
  },
  header: {
    paddingTop: theme.space.sm,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    marginBottom: theme.space.xs,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
    marginTop: theme.space.xs,
  },
  progressCard: {
    alignItems: 'center',
    backgroundColor: '#FFF7F1',
    borderColor: '#FFE1CC',
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  progressIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  progressCopy: {
    flex: 1,
  },
  progressTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
  },
  progressSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 10,
    marginTop: 2,
  },
  progressTrack: {
    backgroundColor: '#FFDCC5',
    borderRadius: theme.radii.full,
    height: 5,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    height: '100%',
  },
  list: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  noteRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 4,
  },
  noteText: {
    color: theme.colors.textMuted,
    flex: 1,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 10,
    lineHeight: 15,
  },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
    ...theme.shadows.glow,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textLight,
    shadowOpacity: 0,
  },
  buttonText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.9,
  },
});
