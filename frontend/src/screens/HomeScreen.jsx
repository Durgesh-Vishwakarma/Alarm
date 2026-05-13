import { Ionicons } from "@expo/vector-icons";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import Animated, {
  Easing,
  FadeInDown,
  Layout,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  activeAlarmAtom,
  alarmsAtom,
  wakeSessionAtom,
} from "../atoms/alarmAtoms";
import { Card } from "../components/Card";
import Header from "../components/Header";
import AlarmSettingsModal from "../components/modals/AlarmSettingsModal";
import {
  getChallengeById,
  getChallengeByTitle,
} from "../data/challengeCatalog";
import { getNextAlarmDate } from "../services/alarmRuntime";
import {
  deleteAlarm,
  loadAlarms,
  saveAlarms,
  upsertAlarm,
} from "../services/alarmStorage";
import {
  requestNotificationPermissions,
  rescheduleAlarm,
} from "../services/notificationService";
import { loadWakeStats } from "../services/streakService";
import { colors, spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getMinutesUntilAlarm = (alarm) => {
  const now = new Date();
  const next = getNextAlarmDate(alarm, now);
  return Math.round((next.getTime() - now.getTime()) / 60000);
};

const formatTimeLeft = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const prefix =
    minutes > 1440
      ? "In over 24h"
      : hours > 0
        ? `${hours}h ${mins}m left`
        : `${mins}m left`;
  const dayPrefix =
    new Date().getHours() + minutes / 60 > 24 ? "Tomorrow - " : "Today - ";
  return dayPrefix + prefix;
};

const strictnessMeta = {
  Standard: { color: "#12A150", icon: "shield-outline", label: "Standard" },
  Strict:   { color: "#F59E0B", icon: "shield-half",   label: "Strict"   },
  Lockdown: { color: "#C8463A", icon: "shield",         label: "Lockdown" },
};

export const HomeScreen = () => {
  const { theme, isDark } = useTheme();
  const [alarms, setAlarms] = useAtom(alarmsAtom);
  const activeAlarm = useAtomValue(activeAlarmAtom);
  const wakeSession = useAtomValue(wakeSessionAtom);
  const [wakeStats, setWakeStats] = useState(null);
  const [expandedAlarmId, setExpandedAlarmId] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState("Not requested");
  const isEmptyState = alarms.length === 0;
  const fabPulse = useSharedValue(0);

  const hydrate = useCallback(async () => {
    const [storedAlarms, storedStats] = await Promise.all([
      loadAlarms(),
      loadWakeStats(),
    ]);
    setAlarms(storedAlarms);
    setWakeStats(storedStats);
  }, [setAlarms]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isEmptyState) {
      cancelAnimation(fabPulse);
      fabPulse.value = 0;
      return;
    }

    fabPulse.value = 0;
    fabPulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
  }, [fabPulse, isEmptyState]);

  const fabPulseStyle = useAnimatedStyle(() => ({
    opacity: 0.45 - fabPulse.value * 0.35,
    transform: [{ scale: 1 + fabPulse.value * 0.5 }],
  }));

  const activeAlarms = useMemo(
    () => alarms.filter((alarm) => alarm.isActive),
    [alarms],
  );
  const activeCount = activeAlarms.length;

  const nextAlarm = useMemo(() => {
    return activeAlarms
      .map((alarm) => ({ ...alarm, minutesUntil: getMinutesUntilAlarm(alarm) }))
      .sort((a, b) => a.minutesUntil - b.minutesUntil)[0];
  }, [activeAlarms]);

  const completionRate = wakeStats?.attempted
    ? Math.round((wakeStats.completed / wakeStats.attempted) * 100)
    : 0;

  const recommendations = useMemo(() => {
    if (!nextAlarm) return "Create one strict AI alarm to start a wake streak.";
    if (nextAlarm.minutesUntil < 420)
      return "Wind down soon. Strict challenges work best with enough sleep.";
    if (completionRate < 80)
      return "Try an easier challenge for two mornings, then raise strictness.";
    return "Your wake rhythm looks strong. Keep tomorrow within 30 minutes of this time.";
  }, [completionRate, nextAlarm]);

  const groupedAlarms = useMemo(() => {
    const active = alarms.filter((alarm) => alarm.isActive);
    const paused = alarms.filter((alarm) => !alarm.isActive);
    return [
      ...(active.length
        ? [
            { id: "active-group", type: "heading", title: "Active Alarms" },
            ...active,
          ]
        : []),
      ...(paused.length
        ? [{ id: "paused-group", type: "heading", title: "Paused" }, ...paused]
        : []),
    ];
  }, [alarms]);

  const persistAlarms = async (nextAlarms) => {
    setAlarms(nextAlarms);
    await saveAlarms(nextAlarms);
  };

  const toggleAlarm = async (id) => {
    const currentAlarm = alarms.find((alarm) => alarm.id === id);
    const toggled = { ...currentAlarm, isActive: !currentAlarm.isActive };
    const scheduledAlarm = await rescheduleAlarm(currentAlarm, toggled);
    const nextAlarms = alarms.map((alarm) =>
      alarm.id === id ? scheduledAlarm : alarm,
    );
    await persistAlarms(nextAlarms);
  };

  const openSettings = (alarm = null) => {
    setEditingAlarm(alarm);
    setModalVisible(true);
  };

  const closeSettings = () => {
    setModalVisible(false);
    setEditingAlarm(null);
  };

  const handleSaveAlarm = async (payload) => {
    const previousAlarm = alarms.find((alarm) => alarm.id === payload.id);
    const normalized = {
      ...payload,
      id: payload.id,
      challengeId: payload.challengeId || getChallengeByTitle(payload.task).id,
      completionRate: previousAlarm?.completionRate ?? 100,
    };
    const scheduledAlarm = await rescheduleAlarm(previousAlarm, normalized);
    const nextAlarms = await upsertAlarm(alarms, scheduledAlarm);
    await persistAlarms(nextAlarms);
    closeSettings();
  };

  const handleDeleteAlarm = async (alarm) => {
    const nextAlarms = await deleteAlarm(alarms, alarm.id);
    await rescheduleAlarm(alarm, { ...alarm, isActive: false });
    await persistAlarms(nextAlarms);
  };

  const handleDuplicateAlarm = async (alarm) => {
    const copy = {
      ...alarm,
      id: Date.now().toString(),
      label: `${alarm.label || "Alarm"} Copy`,
      notificationId: undefined,
      notificationIds: undefined,
    };
    const scheduledCopy = await rescheduleAlarm(null, copy);
    const nextAlarms = await upsertAlarm(alarms, scheduledCopy);
    await persistAlarms(nextAlarms);
  };

  const handleLongPress = (alarm) => {
    Alert.alert(alarm.label || "Alarm", "Quick actions", [
      { text: "Duplicate", onPress: () => handleDuplicateAlarm(alarm) },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteAlarm(alarm),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleRequestPermission = async () => {
    const status = await requestNotificationPermissions();
    setPermissionStatus(status);
  };

  const renderRightActions = (alarm) => (
    <View style={styles.swipeActions}>
      <RectButton
        style={[styles.swipeButton, styles.duplicateButton]}
        onPress={() => handleDuplicateAlarm(alarm)}
      >
        <Ionicons name="copy-outline" size={20} color={colors.white} />
      </RectButton>
      <RectButton
        style={[styles.swipeButton, styles.deleteButton]}
        onPress={() => handleDeleteAlarm(alarm)}
      >
        <Ionicons name="trash-outline" size={20} color={colors.white} />
      </RectButton>
    </View>
  );

  const renderHeader = () => {
    const headerChallenge = nextAlarm
      ? nextAlarm.challengeId === "custom"
        ? { icon: "sparkles", title: "Custom" }
        : getChallengeById(nextAlarm.challengeId)
      : null;

    return (
      <Animated.View entering={FadeInDown.duration(450)} style={styles.dashboard}>

        {/* ── Next Alarm Card ── */}
        <View style={[styles.nextAlarmCard, { backgroundColor: theme.heroCard }]}>
          <View style={styles.naTopRow}>
            <Text style={styles.naEyebrow}>NEXT ALARM</Text>
            {nextAlarm ? (
              <View style={[styles.naCountdownChip, { backgroundColor: theme.heroCountdown }]}>
                <Ionicons name="time-outline" size={12} color={theme.heroNeon} />
                <Text style={[styles.naCountdownText, { color: theme.heroNeon }]}>
                  {formatTimeLeft(nextAlarm.minutesUntil)}
                </Text>
              </View>
            ) : null}
          </View>

          {nextAlarm ? (
            <View style={styles.naTimeRow}>
              <Text style={styles.naTime}>{nextAlarm.time}</Text>
              <Text style={[styles.naPeriod, { color: theme.heroNeon }]}>{nextAlarm.period}</Text>
            </View>
          ) : (
            <Text style={styles.naNoAlarm}>No alarm set</Text>
          )}

          <View style={[styles.naBottomRow, { borderTopColor: "rgba(255,255,255,0.08)" }]}>
            <Text style={styles.naLabel} numberOfLines={1}>
              {nextAlarm ? nextAlarm.label || "Unnamed alarm" : "Tap + to schedule"}
            </Text>
            {headerChallenge ? (
              <View style={[styles.naChallengePill, { backgroundColor: theme.heroAccent }]}>
                <Ionicons name={headerChallenge.icon} size={12} color={theme.heroNeon} />
                <Text style={[styles.naChallengeText, { color: theme.heroNeon }]} numberOfLines={1}>
                  {headerChallenge.title}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Stat Row ── */}
        <View style={styles.statRow}>
          <View style={[styles.statCard, { backgroundColor: theme.heroCard, borderColor: theme.heroBorder }]}>
            <View style={[styles.statIconShell, { backgroundColor: "rgba(245,158,11,0.2)" }]}>
              <Ionicons name="flame" size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.statValue, { color: "#FFFFFF" }]}>
              {wakeStats?.wakeStreak ?? 0}d
            </Text>
            <Text style={[styles.statLabel, { color: "rgba(255,255,255,0.55)" }]}>Wake Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.statIconShell, { backgroundColor: theme.surface }]}>
              <Ionicons name="checkmark-done" size={18} color={theme.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{completionRate}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Morning Win Rate</Text>
          </View>
        </View>

        {/* ── AI Coach Card ── */}
        <View style={[styles.recommendationCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.recommendationBorder, { backgroundColor: theme.primary }]} />
          <View style={styles.recommendationContent}>
            <View style={styles.recommendationHeader}>
              <View style={[styles.aiBadge, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="sparkles" size={12} color={theme.primary} />
                <Text style={[styles.aiBadgeText, { color: theme.primary }]}>AI Coach</Text>
              </View>
            </View>
            <Text style={[styles.recommendationText, { color: theme.textSecondary }]}>
              {recommendations}
            </Text>
          </View>
        </View>

      </Animated.View>
    );
  };

  const renderAlarmCard = ({ item }) => {
    if (item.type === "heading") {
      return <Text style={[styles.groupHeading, { color: theme.textMuted }]}>{item.title}</Text>;
    }

    const isActive = item.isActive;
    const isRinging = activeAlarm?.id === item.id;
    const activeDays = item.repeatDays || [];
    const isExpanded = expandedAlarmId === item.id;
    const accentColor = isRinging ? theme.danger : isActive ? theme.primary : theme.cardBorder;
    const [hourPart, minutePart] = (item.time || "").split(":");
    const hasSplitTime = Boolean(minutePart);

    const isCustom = item.challengeId === "custom";
    const challenge = isCustom
      ? { icon: "sparkles", title: "Custom Prompt", verificationMode: "AI Semantic Verification" }
      : getChallengeById(item.challengeId);

    const strictness = item.antiCheatStrictness || "Strict";
    const sMeta = strictnessMeta[strictness];

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
        <Animated.View layout={Layout.springify().damping(18)} style={styles.alarmCardWrap}>
          <Card
            variant="default"
            padding="md"
            onPress={() => setExpandedAlarmId(isExpanded ? null : item.id)}
            onLongPress={() => handleLongPress(item)}
            style={[
              styles.alarmCardSurface,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              !isActive && styles.alarmCardInactive,
            ]}
          >
            <View style={[styles.alarmAccent, { backgroundColor: accentColor }]} />
            <View style={styles.cardHeader}>
              <View style={styles.headingContainer}>
                <View style={styles.alarmTitleRow}>
                  <View style={[
                    styles.statusDot,
                    isActive && { backgroundColor: theme.primary },
                    isRinging && { backgroundColor: theme.danger },
                  ]} />
                  <Text style={[styles.alarmHeading, { color: isActive ? theme.textPrimary : theme.textMuted }]}>
                    {item.label || "Untitled Alarm"}
                  </Text>
                </View>
                <View style={styles.dayIndicatorRow}>
                  {DAYS.map((day) => {
                    const isDayActive = activeDays.includes(day);
                    return (
                      <Text key={day} style={[styles.dayTinyText, {
                        color: isDayActive && isActive ? theme.textPrimary : theme.textMuted,
                        opacity: isDayActive && isActive ? 1 : 0.4,
                      }]}>
                        {day.charAt(0)}
                      </Text>
                    );
                  })}
                </View>
              </View>
              <Switch
                trackColor={{ false: theme.cardBorder, true: theme.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.cardBorder}
                onValueChange={() => toggleAlarm(item.id)}
                value={isActive}
              />
            </View>

            <View style={styles.timeRow}>
              {hasSplitTime ? (
                <View style={styles.timeGroup}>
                  <Text style={[styles.timeText, { color: isActive ? theme.textPrimary : theme.textMuted }]}>{hourPart}</Text>
                  <Text style={[styles.timeSeparator, { color: theme.primary }]}>:</Text>
                  <Text style={[styles.timeText, { color: isActive ? theme.textPrimary : theme.textMuted }]}>{minutePart}</Text>
                </View>
              ) : (
                <Text style={[styles.timeText, { color: isActive ? theme.textPrimary : theme.textMuted }]}>{item.time}</Text>
              )}
              <View style={[styles.periodBadge, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.periodText, { color: theme.primary }]}>{item.period}</Text>
              </View>
            </View>

            <Text style={[styles.alarmSubline, { color: theme.textMuted }]}>
              {isRinging ? (
                <Text style={[styles.liveStatusText, { color: theme.danger }]}>
                  {wakeSession.status === "verifying"
                    ? "AI Verifying..."
                    : wakeSession.status === "capturing"
                      ? "Capture Needed"
                      : "Alarm Active"}
                </Text>
              ) : (
                challenge.verificationMode || challenge.aiType + " verification"
              )}
            </Text>

            <View style={[styles.cardFooter, { borderTopColor: theme.divider }, !isActive && styles.cardFooterInactive]}>
              <View style={styles.footerBadges}>
                <View style={[styles.taskBadge, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name={challenge.icon} size={14} color={isActive ? theme.primary : theme.textMuted} />
                  <Text style={[styles.taskText, { color: isActive ? theme.primary : theme.textMuted }]}>{item.task}</Text>
                </View>
                <View style={[styles.strictBadge, { borderColor: sMeta.color + "44", backgroundColor: sMeta.color + "12" }]}>
                  <Ionicons name={sMeta.icon} size={12} color={sMeta.color} />
                  <Text style={[styles.strictText, { color: sMeta.color }]}>{sMeta.label}</Text>
                </View>
              </View>
              <Ionicons name={isExpanded ? "chevron-up" : "chevron-forward"} size={18} color={theme.textMuted} style={styles.cardChevron} />
            </View>

            {isExpanded ? (
              <Animated.View entering={FadeInDown.duration(200)} style={[styles.expandedPanel, { borderTopColor: theme.divider }]}>
                {item.targets?.length > 0 && (
                  <View style={styles.targetRow}>
                    <Text style={[styles.expandedLabel, { color: theme.textMuted }]}>Targets</Text>
                    <View style={styles.targetTags}>
                      {item.targets.map((t, i) => (
                        <View key={i} style={[styles.targetTag, { backgroundColor: theme.surface }]}>
                          <Text style={[styles.targetTagText, { color: theme.textSecondary }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                <View style={styles.expandedMetric}>
                  <Text style={[styles.expandedLabel, { color: theme.textMuted }]}>Verification</Text>
                  <Text style={[styles.expandedValue, { color: theme.textPrimary }]}>{challenge.verificationMode || "Semantic AI"}</Text>
                </View>
                <View style={styles.expandedMetric}>
                  <Text style={[styles.expandedLabel, { color: theme.textMuted }]}>Success Rate</Text>
                  <Text style={[styles.expandedValue, { color: theme.textPrimary }]}>{item.completionRate ?? 100}%</Text>
                </View>
                <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.primary }]} onPress={() => openSettings(item)}>
                  <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.editButtonText}>Edit Alarm</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : null}
          </Card>
        </Animated.View>
      </Swipeable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Animated.View
          entering={FadeInDown.duration(450)}
          style={styles.screenContent}
        >
          <Header
            name="Durgesh"
            avatarUri="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            activeCount={activeCount}
            streakDays={wakeStats?.wakeStreak ?? 0}
          />

          <FlatList
            data={groupedAlarms}
            keyExtractor={(item) => item.id}
            renderItem={renderAlarmCard}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.fabWrap} pointerEvents="box-none">
            {isEmptyState ? (
              <Animated.View style={[styles.fabPulse, { borderColor: theme.primary + "55" }]} />
            ) : null}
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: theme.primary }]}
              activeOpacity={0.9}
              onPress={() => openSettings(null)}
            >
              <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>

      <AlarmSettingsModal
        visible={isModalVisible}
        editingAlarm={editingAlarm}
        onClose={closeSettings}
        onSave={handleSaveAlarm}
        permissionStatus={permissionStatus}
        onRequestPermission={handleRequestPermission}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F0EB" },
  safeArea: { flex: 1 },
  screenContent: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 8,
  },
  dashboard: { marginBottom: spacing.md },

  // ── Next Alarm Card ──────────────────────────────────────────
  nextAlarmCard: {
    backgroundColor: "#1A2420",
    borderRadius: 20,
    padding: 22,
    marginBottom: 12,
    overflow: "hidden",
  },
  naTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  naEyebrow: {
    fontFamily: typography.family.semiBold,
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  naCountdownChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(158,216,194,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  naCountdownText: {
    fontFamily: typography.family.semiBold,
    fontSize: 11,
    color: colors.dark.neon,
    letterSpacing: 0.2,
  },
  naTimeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 14,
  },
  naTime: {
    fontFamily: typography.family.extraBold,
    fontSize: 52,
    color: colors.white,
    letterSpacing: -2,
    lineHeight: 56,
  },
  naPeriod: {
    fontFamily: typography.family.bold,
    fontSize: 18,
    color: colors.dark.neon,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  naNoAlarm: {
    fontFamily: typography.family.bold,
    fontSize: 28,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  naBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  naLabel: {
    fontFamily: typography.family.medium,
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    flex: 1,
    marginRight: 10,
  },
  naChallengePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(18,107,95,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  naChallengeText: {
    fontFamily: typography.family.semiBold,
    fontSize: 11,
    color: colors.dark.neon,
    maxWidth: 100,
  },

  // ── Stat Row ────────────────────────────────────────────────
  statRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8E4DC",
  },
  statCardPrimary: {
    backgroundColor: "#1A2420",
    borderColor: "#1A2420",
  },
  statIconShell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0EDE6",
    alignItems: "center",
    justifyContent: "center",
  },
  statIconShellPrimary: {
    backgroundColor: "rgba(18,107,95,0.35)",
  },
  statValue: {
    fontFamily: typography.family.bold,
    fontSize: 26,
    color: colors.text.primary,
    marginTop: 10,
    letterSpacing: -0.5,
  },
  statValuePrimary: {
    color: colors.white,
  },
  statLabel: {
    fontFamily: typography.family.medium,
    fontSize: 10,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  statLabelPrimary: {
    color: "rgba(255,255,255,0.6)",
  },

  // ── Recommendation Card ──────────────────────────────────────
  recommendationCard: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#E8E4DC",
    position: "relative",
    overflow: "hidden",
  },
  recommendationBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  recommendationContent: {
    flex: 1,
    paddingLeft: 14,
    gap: 8,
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.primaryLight,
  },
  aiBadgeText: {
    fontFamily: typography.family.semiBold,
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  recommendationText: {
    flex: 1,
    fontFamily: typography.family.medium,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },

  // ── Group Heading ────────────────────────────────────────────
  groupHeading: {
    fontFamily: typography.family.semiBold,
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: 10,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Alarm Card ───────────────────────────────────────────────
  alarmCardInactive: {
    opacity: 0.55,
  },
  alarmCardSurface: {
    backgroundColor: colors.white,
    borderColor: "#E8E4DC",
    borderWidth: 1,
    overflow: "hidden",
    paddingLeft: spacing.md + 8,
  },
  alarmCardWrap: {
    marginBottom: 10,
  },
  alarmAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headingContainer: { flex: 1 },
  alarmTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D0CCC4",
  },
  statusDotActive: {
    backgroundColor: colors.primary,
  },
  statusDotRinging: {
    backgroundColor: colors.ringing,
  },
  alarmHeading: {
    fontFamily: typography.family.semiBold,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 5,
  },
  dayIndicatorRow: { flexDirection: "row", gap: 7 },
  dayTinyText: { fontSize: 11, fontFamily: typography.family.medium },

  timeRow: { flexDirection: "row", alignItems: "baseline", marginVertical: 4 },
  timeGroup: { flexDirection: "row", alignItems: "baseline" },
  timeText: {
    fontFamily: typography.family.extraBold,
    fontSize: 42,
    color: colors.text.primary,
    letterSpacing: -1,
  },
  timeSeparator: {
    fontFamily: typography.family.extraBold,
    fontSize: 42,
    color: colors.primary,
    marginHorizontal: 1,
    letterSpacing: -1,
  },
  periodText: {
    fontFamily: typography.family.semiBold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.4,
  },
  periodTextInactive: { color: colors.text.muted },
  periodBadge: {
    marginLeft: 8,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
    alignSelf: "flex-start",
  },
  alarmSubline: {
    fontFamily: typography.family.regular,
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 4,
  },
  liveStatusText: {
    fontFamily: typography.family.semiBold,
    fontSize: 12,
    color: colors.ringing,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0EDE6",
  },
  cardFooterInactive: {
    borderTopWidth: 0,
    paddingTop: 0,
  },

  footerBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    flexWrap: "wrap",
  },

  taskBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    minHeight: 26,
  },
  taskText: {
    fontFamily: typography.family.medium,
    fontSize: 12,
    color: colors.primary,
    marginLeft: 5,
  },
  strictBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    minHeight: 26,
  },
  strictText: { fontFamily: typography.family.medium, fontSize: 11 },
  cardChevron: { marginLeft: "auto" },

  expandedPanel: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#F0EDE6",
    gap: 12,
  },
  targetRow: {
    gap: 8,
  },
  targetTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  targetTag: {
    backgroundColor: "#F0EDE6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  targetTagText: {
    fontFamily: typography.family.medium,
    fontSize: 11,
    color: colors.text.secondary,
  },
  expandedMetric: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandedLabel: {
    fontFamily: typography.family.medium,
    fontSize: 12,
    color: colors.text.muted,
  },
  expandedValue: {
    fontFamily: typography.family.semiBold,
    fontSize: 12,
    color: colors.text.primary,
  },
  editButton: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: { color: colors.white, fontFamily: typography.family.semiBold, fontSize: 14 },

  // ── Swipe Actions ────────────────────────────────────────────
  swipeActions: {
    flexDirection: "row",
    height: "88%",
    marginBottom: 10,
  },
  swipeButton: {
    width: 58,
    height: "100%",
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  duplicateButton: { backgroundColor: "#3D4A46" },
  deleteButton: {
    backgroundColor: colors.danger,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },

  // ── FAB ──────────────────────────────────────────────────────
  fabWrap: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  fabPulse: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: "rgba(18,107,95,0.3)",
    backgroundColor: "transparent",
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
