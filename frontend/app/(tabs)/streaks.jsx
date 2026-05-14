import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { loadWakeStats } from "../../src/services/streakService";
import { tokens, typography } from "../../src/theme";
import { useTheme } from "../../src/theme/ThemeContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const delay = (i) => 80 + i * 80;

export default function StreaksTab() {
  const { theme, isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    loadWakeStats().then((s) => {
      if (alive) {
        setStats(s);
        setLoading(false);
      }
    });

    return () => {
      alive = false;
    };
  }, []);

  const data = useMemo(() => {
    if (!stats) {
      return {
        completionRate: 0,
        level: 1,
        xpProgress: 0,
        weekBars: [0, 0, 0, 0, 0, 0, 0],
        nextLevelLeft: 5,
      };
    }

    const completed = stats.completed || 0;
    const attempted = stats.attempted || 0;
    const rate = attempted ? Math.round((completed / attempted) * 100) : 0;
    const level = Math.floor(completed / 5) + 1;
    const xpProgress = (completed % 5) / 5;
    const nextLevelLeft = 5 - (completed % 5);

    const week =
      Array.isArray(stats.week) && stats.week.length === 7
        ? stats.week
        : [0, 0, 0, 0, 0, 0, 0];

    const maxVal = Math.max(...week, 1);
    const weekBars = week.map((w) =>
      Math.max(8, Math.min(100, Math.round((w / maxVal) * 100)))
    );

    return {
      completionRate: rate,
      level,
      xpProgress,
      weekBars,
      nextLevelLeft,
    };
  }, [stats]);

  if (loading || !stats) {
    return (
      <View style={[s.container, { backgroundColor: theme.bg }]}>
        <SafeAreaView style={[s.safeArea, s.loadingWrap]} edges={["top"]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[s.loadingText, { color: theme.textMuted }]}>
            Loading your journey…
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  const hasStats = stats.attempted > 0;

  return (
    <View style={[s.container, { backgroundColor: theme.bg }]}>
      <View style={s.orangeOrb} />
      <View style={s.orangeOrbTwo} />

      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <Animated.View
          entering={FadeIn.duration(tokens.animation.duration.normal)}
          style={s.header}
        >
          <Text style={[s.kicker, { color: theme.primary }]}>SNAPWAKE</Text>
          <Text style={[s.pageTitle, { color: theme.textPrimary }]}>
            Your Progress
          </Text>
          <Text style={[s.subtitle, { color: theme.textSecondary }]}>
            Discipline compounds daily.
          </Text>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
        >
          {!hasStats ? (
            <EmptyState theme={theme} />
          ) : (
            <>
              <Animated.View entering={FadeInDown.delay(delay(0)).duration(420)}>
                <LinearGradient
                  colors={["#FF8A1C", "#FF5E1A", "#111827"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.heroCard}
                >
                  <View style={s.heroBlobOne} />
                  <View style={s.heroBlobTwo} />

                  <View style={s.heroTop}>
                    <View>
                      <Text style={s.heroTiny}>CURRENT LEVEL</Text>
                      <Text style={s.heroLevel}>Level {data.level}</Text>
                    </View>

                    <View style={s.heroIcon}>
                      <Ionicons name="trophy" size={24} color="#FFF" />
                    </View>
                  </View>

                  <View style={s.heroStats}>
                    <View>
                      <Text style={s.heroBig}>{stats.completed || 0}</Text>
                      <Text style={s.heroSmall}>missions done</Text>
                    </View>

                    <View style={s.heroDivider} />

                    <View>
                      <Text style={s.heroBig}>{data.completionRate}%</Text>
                      <Text style={s.heroSmall}>success rate</Text>
                    </View>
                  </View>

                  <View style={s.xpBox}>
                    <View style={s.xpMeta}>
                      <Text style={s.xpLabel}>Next level progress</Text>
                      <Text style={s.xpCount}>
                        {Math.round(data.xpProgress * 5)}/5
                      </Text>
                    </View>

                    <View style={s.xpTrack}>
                      <View
                        style={[
                          s.xpFill,
                          { width: `${data.xpProgress * 100}%` },
                        ]}
                      />
                    </View>

                    <Text style={s.xpHint}>
                      {data.nextLevelLeft} more verification
                      {data.nextLevelLeft === 1 ? "" : "s"} to level up
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(delay(1)).duration(420)}
                style={s.metricsRow}
              >
                <MetricCard
                  theme={theme}
                  icon="flame"
                  value={stats.wakeStreak || 0}
                  label="Day streak"
                />

                <MetricCard
                  theme={theme}
                  icon="checkmark-circle"
                  value={`${data.completionRate}%`}
                  label="Success"
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(delay(2)).duration(420)}
                style={s.section}
              >
                <Text style={[s.sectionLabel, { color: theme.textMuted }]}>
                  Weekly consistency
                </Text>

                <View
                  style={[
                    s.chartCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <View style={s.chartTop}>
                    <View>
                      <Text style={[s.chartTitle, { color: theme.textPrimary }]}>
                        This week
                      </Text>
                      <Text style={[s.chartSub, { color: theme.textSecondary }]}>
                        Wake challenge activity
                      </Text>
                    </View>

                    <View style={s.chartBadge}>
                      <Ionicons name="stats-chart" size={16} color="#FF7A18" />
                    </View>
                  </View>

                  <View style={s.barContainer}>
                    {data.weekBars.map((val, i) => (
                      <View key={DAYS[i]} style={s.barCol}>
                        <View
                          style={[
                            s.barBg,
                            {
                              backgroundColor: isDark
                                ? "rgba(255,255,255,0.07)"
                                : "rgba(15,23,42,0.06)",
                            },
                          ]}
                        >
                          <LinearGradient
                            colors={
                              i === 6
                                ? ["#FF8A1C", "#FF5E1A"]
                                : ["rgba(255,122,24,0.42)", "rgba(255,122,24,0.2)"]
                            }
                            style={[s.barFill, { height: `${val}%` }]}
                          />
                        </View>

                        <Text
                          style={[
                            s.dayLabel,
                            {
                              color:
                                i === 6 ? theme.textPrimary : theme.textMuted,
                            },
                          ]}
                        >
                          {DAYS[i][0]}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(delay(3)).duration(420)}>
                <View
                  style={[
                    s.insightPanel,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <View style={s.insightIcon}>
                    <Ionicons name="bulb" size={20} color="#FF7A18" />
                  </View>

                  <View style={s.insightText}>
                    <Text style={[s.insightTitle, { color: theme.textPrimary }]}>
                      Progress insight
                    </Text>
                    <Text style={[s.insightCopy, { color: theme.textSecondary }]}>
                      Keep your alarm time consistent. Your streak grows faster
                      when your wake mission starts at the same time daily.
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </>
          )}

          <View style={{ height: 140 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const MetricCard = ({ theme, icon, value, label }) => (
  <View
    style={[
      s.metricCard,
      {
        backgroundColor: theme.card,
        borderColor: theme.cardBorder,
      },
    ]}
  >
    <View style={s.metricIcon}>
      <Ionicons name={icon} size={17} color="#FF7A18" />
    </View>

    <Text style={[s.metricValue, { color: theme.textPrimary }]}>{value}</Text>
    <Text style={[s.metricLabel, { color: theme.textMuted }]}>{label}</Text>
  </View>
);

const EmptyState = ({ theme }) => (
  <Animated.View entering={FadeInDown.delay(delay(0)).duration(420)}>
    <LinearGradient
      colors={["#FF8A1C", "#FF5E1A", "#111827"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.emptyCard}
    >
      <View style={s.heroBlobOne} />
      <View style={s.heroBlobTwo} />

      <View style={s.emptyIconWrap}>
        <Ionicons name="bar-chart" size={34} color="#FF7A18" />
      </View>

      <Text style={s.emptyTitle}>No stats yet</Text>
      <Text style={s.emptySubtitle}>
        Complete your first wake challenge to unlock streaks, success rate, and
        weekly consistency.
      </Text>
    </LinearGradient>
  </Animated.View>
);

const s = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  loadingText: {
    ...typography.styles.body,
  },

  orangeOrb: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,122,24,0.16)",
    top: 80,
    right: -170,
  },

  orangeOrbTwo: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,94,26,0.10)",
    top: 500,
    left: -140,
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 18,
  },

  kicker: {
    ...typography.styles.caption,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 8,
  },

  pageTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -2,
  },

  subtitle: {
    ...typography.styles.body,
    marginTop: 8,
    lineHeight: 22,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 24,
  },

  heroCard: {
    minHeight: 310,
    borderRadius: 38,
    padding: 26,
    overflow: "hidden",
    justifyContent: "space-between",

    shadowColor: "#FF7A18",
    shadowOpacity: 0.28,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },

  heroBlobOne: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(255,255,255,0.13)",
    right: -70,
    top: -70,
  },

  heroBlobTwo: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.08)",
    left: -52,
    bottom: -48,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  heroTiny: {
    ...typography.styles.caption,
    color: "rgba(255,255,255,0.78)",
    fontWeight: "900",
    letterSpacing: 1,
  },

  heroLevel: {
    fontFamily: typography.family.extraBold,
    fontSize: 38,
    lineHeight: 43,
    letterSpacing: -1.8,
    color: "#FFF",
    marginTop: 6,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },

  heroBig: {
    fontFamily: typography.family.extraBold,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1.8,
    color: "#FFF",
  },

  heroSmall: {
    ...typography.styles.caption,
    color: "rgba(255,255,255,0.66)",
    marginTop: 2,
  },

  heroDivider: {
    width: 1,
    height: 46,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginHorizontal: 28,
  },

  xpBox: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  xpMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  xpLabel: {
    ...typography.styles.caption,
    color: "rgba(255,255,255,0.76)",
    fontWeight: "800",
  },

  xpCount: {
    ...typography.styles.caption,
    color: "#FFF",
    fontWeight: "900",
  },

  xpTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },

  xpFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#FFF",
  },

  xpHint: {
    ...typography.styles.caption,
    color: "rgba(255,255,255,0.66)",
    marginTop: 9,
  },

  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },

  metricCard: {
    flex: 1,
    minHeight: 126,
    borderRadius: 28,
    borderWidth: 1,
    padding: 17,
    justifyContent: "space-between",
  },

  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,122,24,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  metricValue: {
    fontFamily: typography.family.extraBold,
    fontSize: 30,
    letterSpacing: -1,
  },

  metricLabel: {
    ...typography.styles.caption,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  section: {
    gap: 12,
  },

  sectionLabel: {
    ...typography.styles.caption,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: 4,
  },

  chartCard: {
    borderRadius: 30,
    borderWidth: 1,
    padding: 22,
  },

  chartTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  chartTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 20,
    letterSpacing: -0.6,
  },

  chartSub: {
    ...typography.styles.caption,
    marginTop: 3,
  },

  chartBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,122,24,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  barContainer: {
    height: 118,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  barCol: {
    alignItems: "center",
    gap: 10,
  },

  barBg: {
    width: 18,
    height: 88,
    borderRadius: 9,
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  barFill: {
    width: "100%",
    borderRadius: 9,

    shadowColor: "#FF7A18",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  dayLabel: {
    ...typography.styles.caption,
    fontWeight: "800",
    opacity: 0.8,
  },

  insightPanel: {
    minHeight: 112,
    borderRadius: 30,
    borderWidth: 1,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  insightIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,122,24,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  insightText: {
    flex: 1,
  },

  insightTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 18,
    letterSpacing: -0.5,
    marginBottom: 5,
  },

  insightCopy: {
    ...typography.styles.body,
    lineHeight: 22,
  },

  emptyCard: {
    minHeight: 330,
    borderRadius: 38,
    padding: 28,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIconWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 32,
    letterSpacing: -1.2,
    color: "#FFF",
    marginBottom: 10,
  },

  emptySubtitle: {
    ...typography.styles.body,
    color: "rgba(255,255,255,0.74)",
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 285,
  },
});