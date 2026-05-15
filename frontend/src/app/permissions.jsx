import { AppState, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { PermissionCard } from '../components/permissions/PermissionCard';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { Screen } from '../components/ui/Screen';
import {
  areRequiredPermissionsGranted,
  refreshAndPersistPermissions,
  requestRequiredPermission,
} from '../services/permissionService';
import { theme } from '../theme';

export default function PermissionsScreen() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null);

  const allGranted = areRequiredPermissionsGranted(permissions);

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
      router.replace('/home');
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Enable alarm protection</Text>
        <Text style={styles.title}>Snapwake needs these permissions to ring reliably.</Text>
        <Text style={styles.subtitle}>
          Required access is checked every launch. If anything is disabled later, we will bring you
          back here before Home opens.
        </Text>
      </View>

      <View style={styles.list}>
        {permissions.map((permission) => (
          <PermissionCard
            busy={busyKey === permission.key || loading}
            key={permission.key}
            onPress={() => handlePermissionPress(permission)}
            permission={permission}
          />
        ))}
      </View>

      {!allGranted ? (
        <Text style={styles.helper}>
          Enable every required item to continue. If Android opens Settings, return to Snapwake after
          switching it on.
        </Text>
      ) : null}

      <PrimaryButton
        disabled={!allGranted || loading}
        loading={loading}
        onPress={continueToHome}
        style={styles.button}
        title="Continue to Snapwake"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.space.lg,
  },
  header: {
    paddingTop: theme.space.sm,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    marginBottom: theme.space.sm,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 17,
    lineHeight: 24,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: theme.space.sm,
  },
  list: {
    gap: theme.space.md,
  },
  helper: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    marginTop: theme.space.sm,
  },
});
