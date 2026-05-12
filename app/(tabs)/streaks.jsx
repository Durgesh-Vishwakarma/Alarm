import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadWakeStats } from '../../src/services/streakService';
import { colors, spacing, typography } from '../../src/theme';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * SnapWake Analytics & Streaks
 * Replaces static placeholders with a real rolling 7-day window and a dynamic achievement engine.
 */
export default function StreaksTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadWakeStats().then(setStats);
  }, []);

  // ANALYTICS ENGINE: Calculate real rolling 7-day activity from history
  const rollingWeek = useMemo(() => {
    if (!stats?.events) return [0, 0, 0, 0, 0, 0, 0];
    const activity = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    
    stats.events.forEach(event => {
      const eventDate = new Date(event.createdAt);
      const diffDays = Math.floor((now - eventDate) / (1000 * 60 * 60 * 24));
      // If event happened in the last 7 days and was successful
      if (diffDays >= 0 && diffDays < 7 && event.success) {
        activity[6 - diffDays] = 1;
      }
    });
    return activity;
  }, [stats]);

  // ACHIEVEMENT ENGINE: Derives milestones from real user history
  const liveAchievements = useMemo(() => {
    if (!stats) return [];
    const wins = [];
    if (stats.completed > 0) wins.push({ id: '1', title: 'First Light', desc: 'Completed your first AI challenge', icon: 'sunny' });
    if (stats.wakeStreak >= 3) wins.push({ id: '2', title: 'Morning Rhythm', desc: 'Maintained a 3-day wake streak', icon: 'pulse' });
    if (stats.xp > 500) wins.push({ id: '3', title: 'Elite Riser', desc: 'Earned over 500 total XP', icon: 'trending-up' });
    
    // Scan for high-strictness wins
    const hasLockdownWin = stats.events.some(e => e.success && e.strictness === 'Lockdown');
    if (hasLockdownWin) wins.push({ id: '4', title: 'Lockdown Master', desc: 'Beat a maximum strictness alarm', icon: 'shield-checkmark' });
    
    return wins;
  }, [stats]);

  const completionRate = stats?.attempted ? Math.round((stats.completed / stats.attempted) * 100) : 0;

  if (!stats) return null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Wake Streak</Text>
              <Text style={styles.subtitle}>Your morning consistency and AI challenge history.</Text>
            </View>
          </View>

          {/* Hero Streak Card */}
          <View style={styles.heroCard}>
            <View style={styles.streakInfo}>
              <View style={styles.xpBadge}>
                <Ionicons name="flash" size={12} color={colors.white} />
                <Text style={styles.xpText}>{stats.xp} XP</Text>
              </View>
              <Text style={styles.streakNumber}>{stats.wakeStreak}</Text>
              <Text style={styles.streakLabel}>DAY STREAK</Text>
            </View>
            <View style={styles.heroGlow} />
          </View>

          {/* Real Rolling Week Activity */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Morning Activity</Text>
              <Text style={styles.chartSubtitle}>Last 7 verified days</Text>
            </View>
            <View style={styles.barContainer}>
              {rollingWeek.map((active, i) => (
                <View key={i} style={styles.barWrapper}>
                  <View style={[styles.bar, active && styles.barActive]} />
                  <Text style={styles.barLabel}>{DAYS[i]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <Text style={styles.statsVal}>{stats.completed}</Text>
              <Text style={styles.statsLabel}>AI CLEARS</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsVal}>{completionRate}%</Text>
              <Text style={styles.statsLabel}>WIN RATE</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Achievements</Text>
          {liveAchievements.map((ach) => (
            <View key={ach.id} style={styles.achievementRow}>
              <View style={styles.achievementIcon}>
                <Ionicons name={ach.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.achievementCopy}>
                <Text style={styles.achievementTitle}>{ach.title}</Text>
                <Text style={styles.achievementBody}>{ach.desc}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          ))}
          
          {liveAchievements.length === 0 && (
             <Text style={styles.emptyText}>Complete challenges to unlock achievements.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 120 },
  header: { marginBottom: spacing.lg },
  title: { 
    fontFamily: typography.family.extraBold, 
    fontSize: 32, 
    color: colors.text.primary,
    letterSpacing: -1
  },
  subtitle: { 
    fontFamily: typography.family.regular, 
    fontSize: 16, 
    color: colors.text.secondary, 
    marginTop: 4,
    lineHeight: 22
  },
  heroCard: {
    backgroundColor: colors.dark.background,
    borderRadius: 32,
    height: 180,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  streakInfo: { alignItems: 'center', zIndex: 2 },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  xpText: { fontFamily: typography.family.bold, fontSize: 13, color: colors.white },
  streakNumber: { 
    fontFamily: typography.family.extraBold, 
    fontSize: 72, 
    color: colors.white,
    lineHeight: 76,
    letterSpacing: -2
  },
  streakLabel: { 
    fontFamily: typography.family.bold, 
    fontSize: 12, 
    color: colors.white, 
    opacity: 0.6,
    letterSpacing: 2
  },
  heroGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    opacity: 0.15,
    filter: 'blur(60px)',
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartHeader: { marginBottom: 20 },
  chartTitle: { fontFamily: typography.family.bold, fontSize: 18, color: colors.text.primary },
  chartSubtitle: { fontFamily: typography.family.regular, fontSize: 13, color: colors.text.secondary },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    paddingHorizontal: 10,
  },
  barWrapper: { alignItems: 'center', gap: 10 },
  bar: {
    width: 28,
    height: 40,
    backgroundColor: colors.inactive,
    borderRadius: 8,
  },
  barActive: {
    height: 60,
    backgroundColor: colors.primary,
  },
  barLabel: { fontFamily: typography.family.bold, fontSize: 11, color: colors.text.muted },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: spacing.lg },
  statsCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsVal: { fontFamily: typography.family.extraBold, fontSize: 24, color: colors.text.primary },
  statsLabel: { fontFamily: typography.family.bold, fontSize: 11, color: colors.text.muted, marginTop: 4 },
  sectionTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 16,
    marginTop: 8
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: spacing.sm,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementCopy: { flex: 1 },
  achievementTitle: { fontFamily: typography.family.bold, fontSize: 16, color: colors.text.primary },
  achievementBody: { fontFamily: typography.family.regular, fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  emptyText: { fontFamily: typography.family.medium, fontSize: 14, color: colors.text.muted, textAlign: 'center', marginTop: 10 },
});
