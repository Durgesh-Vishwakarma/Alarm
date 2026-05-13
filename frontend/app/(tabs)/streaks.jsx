import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadWakeStats } from "../../src/services/streakService";
import { spacing, typography } from "../../src/theme";
import { useTheme } from "../../src/theme/ThemeContext";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function StreaksTab() {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);

  useEffect(() => { loadWakeStats().then(setStats); }, []);

  const rollingWeek = useMemo(() => {
    if (!stats?.events) return [0, 0, 0, 0, 0, 0, 0];
    const activity = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    stats.events.forEach((e) => {
      const diff = Math.floor((now - new Date(e.createdAt)) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7 && e.success) activity[6 - diff] = 1;
    });
    return activity;
  }, [stats]);

  if (!stats) return null;

  return (
    <View style={[s.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={s.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          <Text style={[s.pageTitle, { color: theme.textPrimary }]}>Morning Stats</Text>

          <View style={[s.hero, { backgroundColor: theme.heroCard }]}>
            <Text style={s.streakVal}>{stats.wakeStreak}</Text>
            <Text style={s.streakLabel}>DAY STREAK</Text>
          </View>

          <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[s.cardTitle, { color: theme.textPrimary }]}>Activity (7 Days)</Text>
            <View style={s.chart}>
              {rollingWeek.map((active, i) => (
                <View key={i} style={s.barWrap}>
                  <View style={[s.bar, { backgroundColor: theme.surface }, active && { height: 60, backgroundColor: theme.primary }]} />
                  <Text style={[s.barLabel, { color: theme.textMuted }]}>{DAYS[i]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.statsGrid}>
            <StatBox label="TOTAL CLEARS" value={stats.completed} theme={theme} />
            <StatBox label="WIN RATE" value={`${stats.attempted ? Math.round((stats.completed / stats.attempted) * 100) : 0}%`} theme={theme} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const StatBox = ({ label, value, theme }) => (
  <View style={[s.card, { flex: 1, backgroundColor: theme.card, borderColor: theme.cardBorder, alignItems: "center" }]}>
    <Text style={[s.statVal, { color: theme.textPrimary }]}>{value}</Text>
    <Text style={[s.statLabel, { color: theme.textMuted }]}>{label}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: spacing.md, gap: 16 },
  pageTitle: { fontFamily: typography.family.extraBold, fontSize: 28, marginBottom: 8 },
  hero: { borderRadius: 24, padding: 32, alignItems: "center", gap: 4 },
  streakVal: { fontFamily: typography.family.extraBold, fontSize: 64, color: "#FFF" },
  streakLabel: { fontFamily: typography.family.bold, fontSize: 12, color: "#FFF", opacity: 0.6, letterSpacing: 2 },
  card: { borderRadius: 20, padding: 20, borderWidth: 1 },
  cardTitle: { fontFamily: typography.family.bold, fontSize: 16, marginBottom: 20 },
  chart: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 80 },
  barWrap: { alignItems: "center", gap: 8 },
  bar: { width: 30, height: 40, borderRadius: 8 },
  barLabel: { fontFamily: typography.family.bold, fontSize: 10 },
  statsGrid: { flexDirection: "row", gap: 12 },
  statVal: { fontFamily: typography.family.extraBold, fontSize: 24 },
  statLabel: { fontFamily: typography.family.bold, fontSize: 10, marginTop: 4 },
});
