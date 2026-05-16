import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';

export function StreakBanner() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="View weekly goal"
      onPress={() => Alert.alert('Weekly Goal', 'You are 72% of the way there.')}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryLight, '#FFB13B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.flameBubble}>
          <Ionicons name="flame" size={27} color={theme.colors.primary} />
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>{"You're on fire! 🔥"}</Text>
          <Text style={styles.subtitle}>3 day streak</Text>
        </View>

        <View style={styles.goal}>
          <View style={styles.goalRing}>
            <Text style={styles.goalValue}>72%</Text>
          </View>
          <Text style={styles.goalLabel}>Weekly Goal</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: theme.radii.xl,
    ...theme.shadows.glow,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  banner: {
    alignItems: 'center',
    borderRadius: theme.radii.xl,
    flexDirection: 'row',
    minHeight: 98,
    paddingHorizontal: theme.space.lg,
  },
  flameBubble: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.full,
    height: 58,
    justifyContent: 'center',
    marginRight: theme.space.lg,
    width: 58,
  },
  copy: {
    flex: 1,
    gap: theme.space.xs,
  },
  title: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.md,
  },
  subtitle: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.sm,
    opacity: 0.9,
  },
  goal: {
    alignItems: 'center',
    gap: theme.space.xs,
  },
  goalRing: {
    alignItems: 'center',
    borderColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: theme.radii.full,
    borderWidth: 3,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  goalValue: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.sm,
  },
  goalLabel: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 10,
  },
});
