import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from "react-native-reanimated";
import { tokens, typography } from "../../theme";
import { haptics } from "../../services/hapticService";
import { CustomSwitch } from "../../components/CustomSwitch";

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
    heroScale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    haptics.impact("light");
  };

  const handleHeroOut = () => {
    heroScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View entering={FadeIn.duration(tokens.animation.duration.slow)} style={s.container}>
      {/* Emotional Header Section */}
      <Animated.View entering={FadeInDown.delay(100).duration(tokens.animation.duration.normal)} style={s.header}>
        <View>
          <Text style={[s.greeting, { color: theme.textSecondary }]}>Good morning,</Text>
          <Text style={[s.name, { color: theme.textPrimary }]}>Alex 👋</Text>
        </View>
        <View style={[s.avatar, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <Ionicons name="person" size={20} color={theme.textMuted} />
        </View>
      </Animated.View>

      {/* Premium Next Alarm Hero Card with Lighting (Glow) */}
      <Animated.View 
        entering={FadeInDown.delay(200).duration(tokens.animation.duration.normal)}
        style={[s.heroContainer, nextAlarm?.isActive && s.heroGlow, heroAnimatedStyle]}
      >
        <Pressable 
          onPressIn={handleHeroIn}
          onPressOut={handleHeroOut}
          onPress={onToggle}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={
              nextAlarm?.isActive
                ? [theme.primary, tokens.colors.primaryDark, "#4C32B8"]
                : ["#1E293B", "#0F172A"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.heroBg}
          />
          <View style={s.heroContent}>
            {nextAlarm ? (
              <>
                <View style={s.nextHeader}>
                  <View style={s.heroLabelRow}>
                    <Ionicons name="alarm" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={s.nextLabel}>NEXT ALARM</Text>
                  </View>
                  <CustomSwitch
                    value={nextAlarm?.isActive || false}
                    onValueChange={onToggle}
                    activeColor="rgba(255,255,255,0.4)"
                  />
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
                    <Text style={s.task}>{nextAlarm?.task || "Tap + to start"}</Text>
                  </View>
                  <Text style={s.metaText}>In {nextAlarm?.mins || 0} mins</Text>
                </View>
              </>
            ) : (
              <View style={s.emptyHero}>
                <View style={s.emptyIconWrap}>
                  <Ionicons name="moon" size={32} color={theme.primary} />
                </View>
                <View style={s.emptyTextWrap}>
                  <Text style={s.emptyTitle}>Ready for tomorrow?</Text>
                  <Text style={s.emptySubtitle}>Create a wake mission to start your streak.</Text>
                </View>
                <View style={s.emptyCta}>
                  <Text style={[s.emptyCtaText, { color: theme.primary }]}>Create Mission</Text>
                  <Ionicons name="arrow-forward" size={16} color={theme.primary} />
                </View>
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>

      <Animated.Text 
        entering={FadeInDown.delay(300).duration(tokens.animation.duration.normal)}
        style={[s.sectionTitle, { color: theme.textPrimary }]}
      >
        Your Alarms
      </Animated.Text>
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
    paddingHorizontal: 4,
  },
  greeting: { 
    fontFamily: typography.family.metadata, 
    fontSize: tokens.typography.size.metadata,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: tokens.spacing.xs,
  },
  name: {
    fontFamily: typography.family.section,
    fontSize: 40,
    letterSpacing: -0.8,
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
    marginBottom: tokens.spacing.giant,
    elevation: 8,
  },
  heroGlow: {
    ...tokens.shadows.glow,
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    padding: tokens.spacing.xxl,
  },
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
    fontFamily: typography.family.metadata, 
    fontSize: tokens.typography.size.tiny, 
    letterSpacing: 1,
    color: "rgba(255,255,255,0.7)", 
  },
  timeRow: { 
    flexDirection: "row", 
    alignItems: "flex-end", 
    gap: 8, 
    marginVertical: tokens.spacing.md,
  },
  time: { 
    fontFamily: typography.family.hero, 
    fontSize: 64, // Keeping 64 for hero time as it's a specific "Huge" display beyond standard Hero size
    color: "#FFF",
    letterSpacing: -2,
    lineHeight: 72,
  },
  period: { 
    fontFamily: typography.family.section, 
    fontSize: 20, 
    color: "rgba(255,255,255,0.8)",
    marginBottom: tokens.spacing.lg,
  },
  emptyHero: {
    marginVertical: tokens.spacing.sm,
    alignItems: "flex-start",
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.lg,
  },
  emptyTextWrap: {
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.xl,
  },
  emptyTitle: { 
    fontFamily: typography.family.section, 
    fontSize: tokens.typography.size.card, 
    color: "#FFF", 
  },
  emptySubtitle: {
    fontFamily: typography.family.metadata,
    fontSize: tokens.typography.size.body,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 20,
  },
  emptyCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.full,
  },
  emptyCtaText: {
    fontFamily: typography.family.card,
    fontSize: tokens.typography.size.body,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: tokens.spacing.sm,
  },
  taskRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: tokens.spacing.sm,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.full,
  },
  taskIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  task: { 
    fontFamily: typography.family.metadata, 
    fontSize: tokens.typography.size.body, 
    color: "#FFF",
  },
  metaText: {
    fontFamily: typography.family.metadata,
    fontSize: tokens.typography.size.caption,
    color: "rgba(255,255,255,0.6)",
  },
  sectionTitle: { 
    fontFamily: typography.family.section, 
    fontSize: tokens.typography.size.section, 
    marginBottom: tokens.spacing.lg,
    paddingHorizontal: 4,
    letterSpacing: -0.5,
  },
});
