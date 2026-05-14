import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { tokens, typography } from "../../theme";
import { haptics } from "../../services/hapticService";
import { CustomSwitch } from "../../components/CustomSwitch";

const delay = (index) => 100 + index * tokens.animation.stagger;

export const Dashboard = ({ nextAlarm, wakeStats, completionRate, recommendations, theme, toggleAlarm }) => {
  const heroScale = useSharedValue(1);

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  const onToggle = () => {
    haptics.selection();
    if (nextAlarm) toggleAlarm(nextAlarm.id);
  };

  const handleHeroIn = () => {
    heroScale.value = withSpring(tokens.animation.pressScale, tokens.animation.spring);
    haptics.impact("light");
  };

  const handleHeroOut = () => {
    heroScale.value = withSpring(1, tokens.animation.spring);
  };

  return (
    <Animated.View entering={FadeIn.duration(tokens.animation.duration.slow)} style={s.container}>
      <Animated.View entering={FadeInDown.delay(delay(0)).duration(tokens.animation.duration.normal)} style={s.header}>
        <View>
          <Text style={[s.greeting, { color: theme.textSecondary }]}>GOOD MORNING</Text>
          <Text style={[s.name, { color: theme.textPrimary }]}>Alex</Text>
        </View>
        <View style={[s.avatar, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <Ionicons name="person" size={20} color={theme.textMuted} />
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(delay(1)).duration(tokens.animation.duration.normal)}
        style={[s.heroContainer, nextAlarm?.isActive && s.heroGlow, heroAnimatedStyle]}
      >
        <Pressable onPressIn={handleHeroIn} onPressOut={handleHeroOut} onPress={onToggle} style={s.pressable}>
          <LinearGradient
            colors={nextAlarm?.isActive ? tokens.gradients.heroDark : tokens.gradients.heroIdle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.heroBg}
          />
          <View style={s.heroEdge} />
          <View style={s.heroContent}>
            {nextAlarm ? (
              <>
                <View style={s.nextHeader}>
                  <View style={s.heroLabelRow}>
                    <Ionicons name={nextAlarm?.isActive ? "sunny" : "moon"} size={15} color="rgba(255,255,255,0.82)" />
                    <Text style={s.nextLabel}>NEXT ALARM</Text>
                  </View>
                  <CustomSwitch value={nextAlarm?.isActive || false} onValueChange={onToggle} activeColor="rgba(255,255,255,0.4)" />
                </View>

                <View style={s.timeRow}>
                  <Text style={s.time}>{nextAlarm.time}</Text>
                  <Text style={s.period}>{nextAlarm.period}</Text>
                </View>

                <View style={s.heroFooter}>
                  <View style={s.taskRow}>
                    <View style={s.taskIconBox}>
                      <Ionicons name="sparkles" size={12} color="#FFF" />
                    </View>
                    <Text style={s.task} numberOfLines={1}>{nextAlarm?.challengeTitle || nextAlarm?.task || "AI challenge"}</Text>
                  </View>
                  <Text style={s.metaText}>In {nextAlarm?.mins || 0} mins</Text>
                </View>
              </>
            ) : (
              <View style={s.emptyHero}>
                <View style={s.emptyIconWrap}>
                  <Ionicons name="moon" size={30} color={theme.primary} />
                </View>
                <Text style={s.emptyTitle}>Ready for tomorrow?</Text>
                <Text style={s.emptySubtitle}>Create a wake mission to start your streak.</Text>
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(delay(2)).duration(tokens.animation.duration.normal)} style={s.statsRow}>
        <View style={[s.statPill, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[s.statValue, { color: theme.textPrimary }]}>{wakeStats?.streak || 0}</Text>
          <Text style={[s.statLabel, { color: theme.textMuted }]}>STREAK</Text>
        </View>
        <View style={[s.statPill, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[s.statValue, { color: theme.textPrimary }]}>{completionRate}%</Text>
          <Text style={[s.statLabel, { color: theme.textMuted }]}>SUCCESS</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(delay(3)).duration(tokens.animation.duration.normal)} style={[s.missionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={[s.missionIcon, { backgroundColor: `${theme.primary}22` }]}>
          <Ionicons name="flag" size={18} color={theme.primary} />
        </View>
        <View style={s.missionText}>
          <Text style={[s.missionTitle, { color: theme.textPrimary }]}>Today mission</Text>
          <Text style={[s.missionCopy, { color: theme.textSecondary }]} numberOfLines={2}>{recommendations}</Text>
        </View>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(delay(4)).duration(tokens.animation.duration.normal)} style={[s.sectionTitle, { color: theme.textPrimary }]}>Your Alarms</Animated.Text>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing.lg,
    paddingTop: tokens.spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.xs,
  },
  greeting: {
    fontFamily: typography.family.regular,
    fontSize: tokens.typography.size.tiny,
    letterSpacing: 0.8,
    marginBottom: tokens.spacing.xs,
  },
  name: {
    fontFamily: typography.family.hero,
    fontSize: 38,
    letterSpacing: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  heroContainer: {
    borderRadius: tokens.radius.xl,
    overflow: "hidden",
    marginBottom: tokens.spacing.lg,
    ...tokens.shadows.md,
  },
  heroGlow: tokens.shadows.glow,
  pressable: { flex: 1 },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroEdge: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: tokens.radius.xl,
  },
  heroContent: { padding: tokens.spacing.xxl },
  nextHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  nextLabel: {
    fontFamily: typography.family.regular,
    fontSize: tokens.typography.size.tiny,
    letterSpacing: 0.8,
    color: "rgba(255,255,255,0.72)",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: tokens.spacing.sm,
    marginVertical: tokens.spacing.md,
  },
  time: {
    fontFamily: typography.family.hero,
    fontSize: 62,
    color: "#FFF",
    letterSpacing: 0,
    lineHeight: 70,
  },
  period: {
    fontFamily: typography.family.card,
    fontSize: tokens.typography.size.card,
    color: "rgba(255,255,255,0.82)",
    marginBottom: tokens.spacing.lg,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: tokens.spacing.sm,
    gap: tokens.spacing.md,
  },
  taskRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.full,
  },
  taskIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  task: {
    flex: 1,
    fontFamily: typography.family.regular,
    fontSize: tokens.typography.size.body,
    color: "#FFF",
  },
  metaText: {
    fontFamily: typography.family.regular,
    fontSize: tokens.typography.size.caption,
    color: "rgba(255,255,255,0.68)",
  },
  emptyHero: {
    paddingVertical: tokens.spacing.sm,
    alignItems: "flex-start",
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 122, 24, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.family.card,
    fontSize: tokens.typography.size.card,
    color: "#FFF",
    marginBottom: tokens.spacing.xs,
  },
  emptySubtitle: {
    fontFamily: typography.family.regular,
    fontSize: tokens.typography.size.body,
    color: "rgba(255,255,255,0.64)",
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: "row",
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  statPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    ...tokens.shadows.sm,
  },
  statValue: {
    fontFamily: typography.family.card,
    fontSize: 22,
    letterSpacing: 0,
  },
  statLabel: {
    fontFamily: typography.family.regular,
    fontSize: tokens.typography.size.tiny,
    letterSpacing: 0.8,
    marginTop: tokens.spacing.xs,
  },
  missionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.xxl,
    ...tokens.shadows.sm,
  },
  missionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: tokens.spacing.md,
  },
  missionText: { flex: 1 },
  missionTitle: {
    fontFamily: typography.family.card,
    fontSize: tokens.typography.size.body,
    marginBottom: tokens.spacing.xs,
  },
  missionCopy: {
    fontFamily: typography.family.regular,
    fontSize: tokens.typography.size.caption,
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: typography.family.hero,
    fontSize: tokens.typography.size.section,
    marginBottom: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xs,
    letterSpacing: 0,
  },
});
