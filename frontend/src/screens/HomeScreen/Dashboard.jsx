import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../../theme";

export const Dashboard = ({ nextAlarm, wakeStats, completionRate, recommendations, theme }) => (
  <View style={s.container}>
    {/* Next Alarm Card */}
    <View style={[s.nextCard, { backgroundColor: theme.heroCard }]}>
      <Text style={s.eyebrow}>NEXT ALARM</Text>
      {nextAlarm ? (
        <View style={s.timeRow}>
          <Text style={s.time}>{nextAlarm.time}</Text>
          <Text style={[s.period, { color: theme.heroNeon }]}>{nextAlarm.period}</Text>
        </View>
      ) : (
        <Text style={s.noAlarm}>No alarm set</Text>
      )}
      <Text style={[s.label, { color: "rgba(255,255,255,0.5)" }]}>
        {nextAlarm ? nextAlarm.label || "Alarm" : "Tap + to start"}
      </Text>
    </View>

    {/* Stats Row */}
    <View style={s.stats}>
      <StatCard
        icon="flame"
        value={`${wakeStats?.wakeStreak ?? 0}d`}
        label="Streak"
        color="#F59E0B"
        theme={theme}
      />
      <StatCard
        icon="checkmark-done"
        value={`${completionRate}%`}
        label="Win Rate"
        color={theme.primary}
        theme={theme}
      />
    </View>

    {/* AI Coach */}
    <View style={[s.coach, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={[s.coachAccent, { backgroundColor: theme.primary }]} />
      <View style={s.coachContent}>
        <View style={[s.badge, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="sparkles" size={12} color={theme.primary} />
          <Text style={[s.badgeTxt, { color: theme.primary }]}>AI COACH</Text>
        </View>
        <Text style={[s.coachTxt, { color: theme.textSecondary }]}>{recommendations}</Text>
      </View>
    </View>
  </View>
);

const StatCard = ({ icon, value, label, color, theme }) => (
  <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
    <View style={[s.statIcon, { backgroundColor: theme.surface }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={[s.statVal, { color: theme.textPrimary }]}>{value}</Text>
    <Text style={[s.statLabel, { color: theme.textMuted }]}>{label}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { marginBottom: 20 },
  nextCard: { borderRadius: 20, padding: 22, marginBottom: 12 },
  eyebrow: { fontFamily: typography.family.bold, fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2 },
  timeRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginVertical: 8 },
  time: { fontFamily: typography.family.extraBold, fontSize: 48, color: "#FFF" },
  period: { fontFamily: typography.family.bold, fontSize: 18, marginBottom: 8 },
  noAlarm: { fontFamily: typography.family.bold, fontSize: 24, color: "rgba(255,255,255,0.2)", marginVertical: 12 },
  label: { fontFamily: typography.family.medium, fontSize: 13 },
  stats: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statVal: { fontFamily: typography.family.bold, fontSize: 22, marginTop: 8 },
  statLabel: { fontFamily: typography.family.medium, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 },
  coach: { borderRadius: 16, padding: 16, borderWidth: 1, flexDirection: "row", overflow: "hidden" },
  coachAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  coachContent: { paddingLeft: 12, gap: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: "flex-start" },
  badgeTxt: { fontFamily: typography.family.bold, fontSize: 9 },
  coachTxt: { fontFamily: typography.family.medium, fontSize: 13, lineHeight: 18 },
});
