import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

const getDynamicGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Rise & Verify';
  if (hour < 17) return 'Stay Focused';
  if (hour < 21) return 'Evening Energy';
  return 'Rest & Recharge';
};

const Header = ({ name, avatarUri, activeCount, streakDays = 0 }) => {
  const greeting = useMemo(() => getDynamicGreeting(), []);

  return (
    <View style={styles.topBar}>
      <View style={styles.profileSection}>
        <Image
          source={avatarUri ? { uri: avatarUri } : require('../../assets/images/icon.png')}
          style={styles.avatar}
        />
        <View style={styles.textStack}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
            {name}
          </Text>
        </View>
      </View>

      <View style={styles.topBarRight}>
        <View style={styles.dashboardBadge}>
          {/* Streak Status */}
          <View style={styles.statItem}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.statNumber}>{streakDays}</Text>
          </View>

          <View style={styles.separator} />

          {/* Active Alarms Status */}
          <View style={styles.statItem}>
            <Ionicons name="alarm" size={14} color={colors.primary} />
            <Text style={styles.statNumber}>{activeCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  profileSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  textStack: { flex: 1, marginRight: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: colors.dot,
    borderWidth: 2,
    borderColor: 'white',
  },
  greeting: {
    fontFamily: typography.family.bold,
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userName: {
    fontFamily: typography.family.extraBold,
    fontSize: 18,
    color: colors.primary,
    marginTop: -2,
  },
  topBarRight: { alignItems: 'flex-end' },
  dashboardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.04)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.12)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontFamily: typography.family.extraBold,
    fontSize: 15,
    color: colors.primary,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: 8,
  },
  streakEmoji: {
    fontSize: 13,
  },
});

export default Header;
