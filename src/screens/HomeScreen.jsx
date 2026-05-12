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
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
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
  Strict: { color: "#F59E0B", icon: "shield-half", label: "Strict" },
  Lockdown: { color: "#E23744", icon: "shield", label: "Lockdown" },
};

export const HomeScreen = () => {
  const [alarms, setAlarms] = useAtom(alarmsAtom);
  const activeAlarm = useAtomValue(activeAlarmAtom);
  const wakeSession = useAtomValue(wakeSessionAtom);
  const [wakeStats, setWakeStats] = useState(null);
  const [expandedAlarmId, setExpandedAlarmId] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState("Not requested");

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

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(450)} style={styles.dashboard}>
      <View style={styles.nextAlarmCard}>
        <View style={styles.nextAlarmTopRow}>
          <View>
            <Text style={styles.darkStatLabel}>Next Alarm</Text>
            <Text style={styles.nextAlarmText}>
              {nextAlarm ? `${nextAlarm.time} ${nextAlarm.period}` : "No alarm"}
            </Text>
          </View>
          <View style={styles.ringBadge}>
            <Ionicons name="radio-button-on" size={20} color={colors.white} />
          </View>
        </View>
        <View style={styles.nextAlarmBottomRow}>
          <Text style={styles.nextAlarmSubtext}>
            {nextAlarm ? nextAlarm.label : "Tap + to schedule"}
          </Text>
          {nextAlarm ? (
            <Text style={styles.nextAlarmChip}>
              {formatTimeLeft(nextAlarm.minutesUntil)}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <View style={styles.statIconShell}>
            <Ionicons name="flame" size={18} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{wakeStats?.wakeStreak ?? 0}d</Text>
          <Text style={styles.statLabel}>Wake Streak</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconShell}>
            <Ionicons name="checkmark-done" size={18} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{completionRate}%</Text>
          <Text style={styles.statLabel}>Morning Win Rate</Text>
        </View>
      </View>

      <View style={styles.recommendationCard}>
        <Ionicons name="sparkles" size={18} color={colors.primary} />
        <Text style={styles.recommendationText}>{recommendations}</Text>
      </View>
    </Animated.View>
  );

  const renderAlarmCard = ({ item }) => {
    if (item.type === "heading") {
      return <Text style={styles.groupHeading}>{item.title}</Text>;
    }

    const isActive = item.isActive;
    const isRinging = activeAlarm?.id === item.id;
    const activeDays = item.repeatDays || [];
    const isExpanded = expandedAlarmId === item.id;

    // Support Custom Challenges
    const isCustom = item.challengeId === "custom";
    const challenge = isCustom
      ? {
          icon: "sparkles",
          title: "Custom Prompt",
          verificationMode: "AI Semantic Verification",
        }
      : getChallengeById(item.challengeId);

    const strictness = item.antiCheatStrictness || "Strict";
    const sMeta = strictnessMeta[strictness];

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        overshootRight={false}
      >
        <Animated.View
          layout={Layout.springify().damping(18)}
          style={styles.alarmCardWrap}
        >
          <Card
            variant={isRinging ? "ringing" : isActive ? "active" : "default"}
            padding="md"
            onPress={() => setExpandedAlarmId(isExpanded ? null : item.id)}
            onLongPress={() => handleLongPress(item)}
            style={!isActive && styles.alarmCardInactive}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headingContainer}>
                <View style={styles.alarmTitleRow}>
                  <View
                    style={[
                      styles.statusDot,
                      isActive && styles.statusDotActive,
                      isRinging && styles.statusDotRinging,
                    ]}
                  />
                  <Text
                    style={[
                      styles.alarmHeading,
                      !isActive && styles.inactiveText,
                    ]}
                  >
                    {item.label || "Untitled Alarm"}
                  </Text>
                </View>
                <View style={styles.dayIndicatorRow}>
                  {DAYS.map((day) => {
                    const isDayActive = activeDays.includes(day);
                    return (
                      <Text
                        key={day}
                        style={[
                          styles.dayTinyText,
                          isDayActive && isActive
                            ? styles.dayTinyTextActive
                            : styles.dayTinyTextInactive,
                        ]}
                      >
                        {day.charAt(0)}
                      </Text>
                    );
                  })}
                </View>
              </View>

              <Switch
                trackColor={{ false: colors.dot, true: colors.primary }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.dot}
                onValueChange={() => toggleAlarm(item.id)}
                value={isActive}
              />
            </View>

            <View style={styles.timeRow}>
              <Text style={[styles.timeText, !isActive && styles.inactiveText]}>
                {item.time}
              </Text>
              <Text
                style={[styles.periodText, !isActive && styles.inactiveText]}
              >
                {item.period}
              </Text>
            </View>

            <Text
              style={[styles.alarmSubline, !isActive && styles.inactiveText]}
            >
              {isRinging ? (
                <Text style={styles.liveStatusText}>
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

            <View
              style={[
                styles.cardFooter,
                !isActive && styles.cardFooterInactive,
              ]}
            >
              <View
                style={[
                  styles.taskBadge,
                  !isActive && styles.taskBadgeInactive,
                ]}
              >
                <Ionicons
                  name={challenge.icon}
                  size={14}
                  color={isActive ? colors.primary : colors.text.muted}
                />
                <Text
                  style={[styles.taskText, !isActive && styles.inactiveText]}
                >
                  {isCustom ? item.task : item.task}
                </Text>
              </View>

              <View
                style={[
                  styles.strictBadge,
                  { borderColor: sMeta.color + "44" },
                ]}
              >
                <Ionicons name={sMeta.icon} size={12} color={sMeta.color} />
                <Text style={[styles.strictText, { color: sMeta.color }]}>
                  {sMeta.label}
                </Text>
              </View>

              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-forward"}
                size={18}
                color={colors.border}
                style={styles.cardChevron}
              />
            </View>

            {isExpanded ? (
              <Animated.View
                entering={FadeInDown.duration(200)}
                style={styles.expandedPanel}
              >
                {item.targets?.length > 0 && (
                  <View style={styles.targetRow}>
                    <Text style={styles.expandedLabel}>Targets</Text>
                    <View style={styles.targetTags}>
                      {item.targets.map((t, i) => (
                        <View key={i} style={styles.targetTag}>
                          <Text style={styles.targetTagText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.expandedMetric}>
                  <Text style={styles.expandedLabel}>Verification</Text>
                  <Text style={styles.expandedValue}>
                    {challenge.verificationMode || "Semantic AI"}
                  </Text>
                </View>

                <View style={styles.expandedMetric}>
                  <Text style={styles.expandedLabel}>Success Rate</Text>
                  <Text style={styles.expandedValue}>
                    {item.completionRate ?? 100}%
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openSettings(item)}
                >
                  <Ionicons
                    name="create-outline"
                    size={16}
                    color={colors.white}
                  />
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
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

        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.9}
          onPress={() => openSettings(null)}
        >
          <Ionicons name="add" size={32} color={colors.white} />
        </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: 120,
    paddingTop: spacing.sm,
  },
  dashboard: { marginBottom: spacing.md },

  nextAlarmCard: {
    backgroundColor: "#1C1C1C",
    borderRadius: 28,
    padding: 24,
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
  },
  nextAlarmTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  darkStatLabel: {
    fontFamily: typography.family.bold,
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  ringBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  nextAlarmText: {
    fontFamily: typography.family.extraBold,
    fontSize: 42,
    color: colors.white,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  nextAlarmBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  nextAlarmSubtext: {
    fontFamily: typography.family.bold,
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  nextAlarmChip: {
    backgroundColor: "rgba(226, 55, 68, 0.15)",
    color: colors.primary,
    fontFamily: typography.family.extraBold,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(226, 55, 68, 0.2)",
  },

  statRow: { flexDirection: "row", gap: 12, marginBottom: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  statIconShell: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontFamily: typography.family.extraBold,
    fontSize: 28,
    color: colors.text.primary,
    marginTop: 10,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: typography.family.bold,
    fontSize: 10,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginTop: 2,
  },

  recommendationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  recommendationText: {
    flex: 1,
    fontFamily: typography.family.bold,
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },

  groupHeading: {
    fontFamily: typography.family.extraBold,
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 12,
    marginTop: 4,
  },

  alarmCardInactive: {
    opacity: 0.6,
  },
  alarmCardWrap: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  headingContainer: { flex: 1 },
  alarmTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.muted,
  },
  statusDotActive: {
    backgroundColor: colors.primary,
  },
  statusDotRinging: {
    backgroundColor: "#FF3B30",
  },
  alarmHeading: {
    fontFamily: typography.family.bold,
    fontSize: 17,
    color: colors.text.primary,
    marginBottom: 6,
  },
  dayIndicatorRow: { flexDirection: "row", gap: 8 },
  dayTinyText: { fontSize: 11, fontFamily: typography.family.bold },
  dayTinyTextActive: { color: colors.primary },
  dayTinyTextInactive: { color: "#D1D1D1" },

  timeRow: { flexDirection: "row", alignItems: "baseline", marginVertical: 6 },
  timeText: {
    fontFamily: typography.family.extraBold,
    fontSize: 44,
    color: colors.text.primary,
    letterSpacing: 0,
  },
  periodText: {
    fontFamily: typography.family.bold,
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 6,
    opacity: 0.8,
  },
  inactiveText: { color: "#BDBDBD" },
  alarmSubline: {
    fontFamily: typography.family.bold,
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,

    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    gap: 8,
  },
  cardFooterInactive: {
    borderTopWidth: 0,
    paddingTop: 0,
  },

  taskBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(226, 55, 68, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  taskBadgeInactive: { backgroundColor: "#F0F0F0" },
  taskText: {
    fontFamily: typography.family.bold,
    fontSize: 12,
    color: colors.primary,
    marginLeft: 6,
  },
  strictBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  strictText: { fontFamily: typography.family.bold, fontSize: 11 },
  cardChevron: { marginLeft: "auto" },

  expandedPanel: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
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
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  targetTagText: {
    fontFamily: typography.family.bold,
    fontSize: 11,
    color: colors.text.secondary,
  },
  expandedMetric: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandedLabel: {
    fontFamily: typography.family.bold,
    fontSize: 12,
    color: colors.text.secondary,
  },
  expandedValue: {
    fontFamily: typography.family.bold,
    fontSize: 12,
    color: colors.text.primary,
  },
  editButton: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    backgroundColor: colors.text.primary,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: { color: colors.white, fontFamily: typography.family.bold },
  swipeActions: {
    flexDirection: "row",
    height: "88%",
    marginBottom: spacing.md,
  },
  swipeButton: {
    width: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  duplicateButton: { backgroundColor: colors.text.primary },
  deleteButton: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },

  fab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
