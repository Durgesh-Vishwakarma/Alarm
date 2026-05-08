import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadWakeStats } from '../../src/services/streakService';
import { colors, spacing, typography } from '../../src/theme';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function StreaksTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadWakeStats().then(setStats);
  }, []);

  const completionRate = stats?.attempted ? Math.round((stats.completed / stats.attempted) * 100) : 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Wake Streak</Text>
              <Text style={styles.subtitle}>Your verified mornings and consistency rhythm.</Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons name="flame" size={22} color={colors.primary} />
            </View>
          </View>

          <View style={styles.heroCard}>
            <View>
              <Text style={styles.heroValue}>{stats?.wakeStreak ?? 0}</Text>
              <Text style={styles.heroLabel}>day verified streak</Text>
            </View>
            <View style={styles.xpPill}>
              <Ionicons name="flash" size={16} color={colors.primary} />
              <Text style={styles.xpText}>{stats?.xp ?? 0} XP</Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.metricValue}>{completionRate}%</Text>
              <Text style={styles.metricLabel}>Completion</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="scan" size={18} color={colors.primary} />
              <Text style={styles.metricValue}>{stats?.completed ?? 0}</Text>
              <Text style={styles.metricLabel}>AI Clears</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Weekly Analytics</Text>
              <Text style={styles.sectionHint}>7 days</Text>
            </View>
            <View style={styles.chartRow}>
              {DAYS.map((day, index) => {
                const active = stats?.week?.[index];
                return (
                  <View key={`${day}-${index}`} style={styles.chartItem}>
                    <View style={[styles.chartBar, active && styles.chartBarActive, { height: active ? 74 + index * 3 : 34 }]} />
                    <Text style={styles.chartLabel}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <Ionicons name="ribbon" size={18} color={colors.primary} />
            </View>
            {(stats?.achievements || []).map((achievement) => (
              <View key={achievement} style={styles.achievementRow}>
                <View style={styles.achievementIcon}>
                  <Ionicons name="trophy" size={16} color={colors.primary} />
                </View>
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: typography.family.extraBold, fontSize: 30, color: colors.text.primary },
  subtitle: { fontFamily: typography.family.regular, fontSize: 15, color: colors.text.secondary, marginTop: 6 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#F0D7D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    marginTop: spacing.md,
    backgroundColor: colors.text.primary,
    borderRadius: 26,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 5,
  },
  heroValue: { fontFamily: typography.family.extraBold, fontSize: 58, color: colors.white },
  heroLabel: { fontFamily: typography.family.bold, fontSize: 14, color: 'rgba(255,255,255,0.72)' },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  xpText: { fontFamily: typography.family.bold, color: colors.text.primary },
  metricRow: { flexDirection: 'row', gap: 12, marginTop: spacing.sm },
  metricCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  metricValue: { fontFamily: typography.family.extraBold, fontSize: 28, color: colors.primary, marginTop: 8 },
  metricLabel: { fontFamily: typography.family.bold, fontSize: 12, color: colors.text.secondary },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: typography.family.extraBold, fontSize: 16, color: colors.text.primary },
  sectionHint: { fontFamily: typography.family.bold, fontSize: 12, color: colors.text.secondary },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.md },
  chartItem: { alignItems: 'center', gap: 8 },
  chartBar: { width: 26, borderRadius: 13, backgroundColor: colors.inactive },
  chartBarActive: { backgroundColor: colors.primary },
  chartLabel: { fontFamily: typography.family.bold, fontSize: 12, color: colors.text.secondary },
  achievementRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  achievementIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementText: { fontFamily: typography.family.bold, fontSize: 14, color: colors.text.primary },
});
