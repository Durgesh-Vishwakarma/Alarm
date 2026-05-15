import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { Screen } from '../components/ui/Screen';
import { getLaunchDestination } from '../services/permissionService';
import { theme } from '../theme';

export default function BootScreen() {
  useEffect(() => {
    let mounted = true;

    getLaunchDestination()
      .then((destination) => {
        if (mounted) {
          router.replace(destination);
        }
      })
      .catch(() => {
        if (mounted) {
          router.replace('/permissions');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.card}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={styles.title}>Preparing Snapwake</Text>
        <Text style={styles.subtitle}>Checking alarm protection.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    gap: theme.space.sm,
    padding: theme.space.xl,
    width: '100%',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 17,
    marginTop: theme.space.sm,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
  },
});
