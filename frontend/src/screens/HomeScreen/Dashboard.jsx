import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import Header from "../../components/Header";
import { AlarmItem } from "./AlarmItem";
import { PrimaryButton } from "../../components/PrimaryButton";
import { CustomSwitch } from "../../components/CustomSwitch";
import { tokens, typography } from "../../theme";
import { haptics } from "../../services/hapticService";

const { width } = Dimensions.get("window");
const delay = (i) => 80 + i * 80;

export const Dashboard = ({
  name = "Durgesh",
  avatarUri,
  alarms = [],
  nextAlarm,
  wakeStats,
  completionRate = 0,
  recommendations,
  theme,
  toggleAlarm,
  onAddAlarm,
  onLongPressAlarm,
  renderRightActions,
}) => {
  const heroScale = useSharedValue(1);

  const heroAnim = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  const activeAlarms = alarms.filter((alarm) => alarm.isActive);
  const streak = wakeStats?.streak || 0;
  const completed = wakeStats?.completed || 0;
  const avgWake = wakeStats?.avgWake || "6:42";

  const toggleNextAlarm = () => {
    if (!nextAlarm) return;
    haptics.selection();
    toggleAlarm(nextAlarm.id);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(450)}
      style={[s.screen, { backgroundColor: theme.bg }]}
    >
      <View style={s.orangeOrb} />
      <View style={s.orangeOrbTwo} />

      <Header name={name} avatarUri={avatarUri} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <Animated.View entering={FadeInDown.delay(delay(0)).duration(420)} style={s.intro}>
          <Text style={[s.kicker, { color: theme.primary }]}>SNAPWAKE</Text>
          <Text style={[s.headline, { color: theme.textPrimary }]}>
            Own your morning.
          </Text>
          <Text style={[s.subline, { color: theme.textSecondary }]}>
            Your wake mission, streak, and discipline in one place.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(delay(1)).duration(420)} style={[s.heroWrap, heroAnim]}>
          <Pressable
            onPressIn={() => {
              heroScale.value = withSpring(0.985, tokens.animation.spring);
            }}
            onPressOut={() => {
              heroScale.value = withSpring(1, tokens.animation.spring);
            }}
          >
            <LinearGradient
              colors={["#FF8A1C", "#FF5E1A", "#111827"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.hero}
            >
              <View style={s.heroBlobOne} />
              <View style={s.heroBlobTwo} />
              <View style={s.heroBlobThree} />

              {nextAlarm ? (
                <>
                  <View style={s.heroTop}>
                    <View style={s.heroTopText}>
                      <Text style={s.heroTiny}>
                        {nextAlarm.isActive ? "NEXT WAKE MISSION" : "MISSION OFF"}
                      </Text>
                      <Text style={s.heroInfo}>
                        {nextAlarm.isActive
                          ? `Starts in ${nextAlarm.mins || 0} minutes`
                          : "Turn on when ready"}
                      </Text>
                    </View>

                    <CustomSwitch
                      value={nextAlarm.isActive}
                      onValueChange={toggleNextAlarm}
                      activeColor="#FFFFFF"
                      inactiveColor="rgba(255,255,255,0.34)"
                      thumbOnColor="#FF6A1A"
                      thumbOffColor="#FFFFFF"
                    />
                  </View>

                  <View style={s.heroMiddle}>
                    <View>
                      <Text style={s.heroTime}>{nextAlarm.time}</Text>
                      <Text style={s.heroPeriod}>{nextAlarm.period}</Text>
                    </View>

                    <View style={s.countdownCircle}>
                      <Text style={s.countdownValue}>{nextAlarm.mins || 0}</Text>
                      <Text style={s.countdownLabel}>min</Text>
                    </View>
                  </View>

                  <View style={s.heroBottom}>
                    <View style={s.challengeBox}>
                      <Ionicons name="sparkles" size={16} color="#FFF" />
                      <Text style={s.challengeText} numberOfLines={1}>
                        {nextAlarm.challengeTitle || nextAlarm.task || "AI wake challenge"}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={s.emptyHero}>
                  <Text style={s.emptyHeroTitle}>No mission yet</Text>
                  <Text style={s.emptyHeroText}>
                    Create your first alarm and start your streak.
                  </Text>
                  <PrimaryButton
                    label="Create Alarm"
                    icon="add"
                    onPress={onAddAlarm}
                    style={s.createButton}
                  />
                </View>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(delay(2)).duration(420)} style={s.statsRow}>
          <WideStat theme={theme} icon="flame" value={streak} label="Day streak" />
          <WideStat theme={theme} icon="trophy" value={`${completionRate}%`} label="Success" />
          <WideStat theme={theme} icon="time" value={avgWake} label="Avg wake" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(delay(3)).duration(420)} style={s.identityPanel}>
          <LinearGradient
            colors={["rgba(255,122,24,0.18)", "rgba(255,255,255,0.04)"]}
            style={StyleSheet.absoluteFillObject}
          />
          <View>
            <Text style={[s.panelKicker, { color: theme.textMuted }]}>WAKE IDENTITY</Text>
            <Text style={[s.panelTitle, { color: theme.textPrimary }]}>
              {streak >= 7 ? "Morning Warrior" : "Discipline Builder"}
            </Text>
            <Text style={[s.panelText, { color: theme.textSecondary }]}>
              {completed} missions completed. Keep building your morning system.
            </Text>
          </View>

          <View style={s.panelBadge}>
            <Ionicons name="shield-checkmark" size={28} color="#FFF" />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(delay(4)).duration(420)} style={s.insightPanel}>
          <View style={s.insightIcon}>
            <Ionicons name="bulb" size={20} color="#FF7A18" />
          </View>
          <View style={s.insightText}>
            <Text style={[s.insightTitle, { color: theme.textPrimary }]}>
              Today’s direction
            </Text>
            <Text style={[s.insightCopy, { color: theme.textSecondary }]}>
              {recommendations || "Sleep earlier tonight. Tomorrow’s discipline begins before bed."}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(delay(5)).duration(420)} style={s.alarmHeader}>
          <View>
            <Text style={[s.alarmTitle, { color: theme.textPrimary }]}>Alarms</Text>
            <Text style={[s.alarmSub, { color: theme.textMuted }]}>
              {activeAlarms.length} active of {alarms.length}
            </Text>
          </View>

          <PrimaryButton
            label="Add Alarm"
            icon="add"
            variant="ghost"
            fullWidth={false}
            onPress={onAddAlarm}
            style={s.addBtn}
          />
        </Animated.View>

        <View style={s.alarmList}>
          {alarms.length > 0 ? (
            alarms.map((alarm, index) => (
              <View key={alarm.id} style={s.alarmFullWidth}>
                <AlarmItem
                  item={alarm}
                  index={index}
                  theme={theme}
                  toggleAlarm={toggleAlarm}
                  onLongPress={onLongPressAlarm || (() => {})}
                  renderRightActions={renderRightActions || (() => null)}
                />
              </View>
            ))
          ) : (
            <View
              style={[
                s.emptyAlarm,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
            >
              <Ionicons name="alarm-outline" size={34} color={theme.textMuted} />
              <Text style={[s.emptyAlarmTitle, { color: theme.textPrimary }]}>
                No alarms yet
              </Text>
              <Text style={[s.emptyAlarmText, { color: theme.textMuted }]}>
                Add one alarm to begin your Snapwake journey.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const WideStat = ({ theme, icon, value, label }) => (
  <View style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
    <View style={s.statIcon}>
      <Ionicons name={icon} size={16} color="#FF7A18" />
    </View>
    <Text style={[s.statValue, { color: theme.textPrimary }]}>{value}</Text>
    <Text style={[s.statLabel, { color: theme.textMuted }]}>{label}</Text>
  </View>
);

const s = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 56,
  },

  orangeOrb: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(255,122,24,0.18)",
    top: 90,
    right: -170,
  },

  orangeOrbTwo: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,94,26,0.10)",
    top: 430,
    left: -150,
  },

  intro: {
    paddingTop: 14,
    marginBottom: 24,
  },

  kicker: {
    ...typography.styles.caption,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 10,
  },

  headline: {
    fontFamily: typography.family.extraBold,
    fontSize: 42,
    lineHeight: 47,
    letterSpacing: -2,
  },

  subline: {
    ...typography.styles.body,
    marginTop: 12,
    lineHeight: 23,
    maxWidth: width - 70,
  },

  heroWrap: {
    width: "100%",
    marginBottom: 30,
    borderRadius: 42,
    shadowColor: "#FF7A18",
    shadowOpacity: 0.34,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 20 },
    elevation: 10,
  },

  hero: {
    width: "100%",
    minHeight: 340,
    borderRadius: 42,
    paddingHorizontal: 28,
    paddingVertical: 30,
    overflow: "hidden",
    justifyContent: "space-between",
  },

  heroBlobOne: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(255,255,255,0.13)",
    right: -70,
    top: -66,
  },

  heroBlobTwo: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255,255,255,0.08)",
    left: -52,
    bottom: -56,
  },

  heroBlobThree: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.08)",
    right: 42,
    bottom: 52,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },

  heroTopText: {
    flex: 1,
  },

  heroTiny: {
    ...typography.styles.caption,
    color: "rgba(255,255,255,0.88)",
    fontWeight: "900",
    letterSpacing: 1,
  },

  heroInfo: {
    ...typography.styles.body,
    color: "rgba(255,255,255,0.68)",
    marginTop: 7,
  },

  heroMiddle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 28,
  },

  heroTime: {
    fontFamily: typography.family.extraBold,
    fontSize: 76,
    lineHeight: 82,
    color: "#FFF",
    letterSpacing: -4.5,
  },

  heroPeriod: {
    ...typography.styles.titleMedium,
    color: "rgba(255,255,255,0.78)",
    marginTop: -4,
  },

  countdownCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  countdownValue: {
    fontFamily: typography.family.extraBold,
    fontSize: 25,
    color: "#FFF",
  },

  countdownLabel: {
    ...typography.styles.caption,
    color: "rgba(255,255,255,0.68)",
    marginTop: -3,
  },

  heroBottom: {
    marginTop: 28,
  },

  challengeBox: {
    width: "100%",
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  challengeText: {
    flex: 1,
    ...typography.styles.body,
    color: "#FFF",
    fontWeight: "800",
  },

  emptyHero: {
    flex: 1,
    justifyContent: "center",
  },

  emptyHeroTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 36,
    color: "#FFF",
    letterSpacing: -1.4,
  },

  emptyHeroText: {
    ...typography.styles.body,
    color: "rgba(255,255,255,0.72)",
    marginTop: 10,
    marginBottom: 24,
    maxWidth: 280,
  },

  createButton: {
    width: 210,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    minHeight: 118,
    borderRadius: 28,
    borderWidth: 1,
    padding: 16,
    justifyContent: "space-between",
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,122,24,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  statValue: {
    fontFamily: typography.family.extraBold,
    fontSize: 23,
    letterSpacing: -0.7,
  },

  statLabel: {
    ...typography.styles.caption,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  identityPanel: {
    minHeight: 150,
    overflow: "hidden",
    borderRadius: 34,
    padding: 24,
    marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  panelKicker: {
    ...typography.styles.caption,
    letterSpacing: 1,
    marginBottom: 8,
  },

  panelTitle: {
    ...typography.styles.titleLarge,
    letterSpacing: -0.6,
  },

  panelText: {
    ...typography.styles.body,
    marginTop: 8,
    maxWidth: width - 150,
    lineHeight: 22,
  },

  panelBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FF7A18",
    alignItems: "center",
    justifyContent: "center",
  },

  insightPanel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 34,
  },

  insightIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,122,24,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  insightText: {
    flex: 1,
  },

  insightTitle: {
    ...typography.styles.titleMedium,
    marginBottom: 5,
  },

  insightCopy: {
    ...typography.styles.body,
    lineHeight: 22,
  },

  alarmHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  alarmTitle: {
    ...typography.styles.titleLarge,
  },

  alarmSub: {
    ...typography.styles.caption,
    marginTop: 3,
  },

  addBtn: {
    width: 126,
  },

  alarmList: {
    gap: 14,
  },

  alarmFullWidth: {
    width: "100%",
  },

  emptyAlarm: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 32,
    padding: 30,
    alignItems: "center",
  },

  emptyAlarmTitle: {
    ...typography.styles.titleMedium,
    marginTop: 14,
  },

  emptyAlarmText: {
    ...typography.styles.caption,
    marginTop: 5,
    textAlign: "center",
  },
});