import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { INITIAL_WAKE_SESSION, wakeSessionAtom } from "../atoms/alarmAtoms";
import { Card } from "../components/Card";
import { loadAlarms } from "../services/alarmStorage";
import { spacing, typography, tokens } from "../theme";
import { useTheme } from "../theme/ThemeContext";

export const AlarmAlertScreen = () => {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const wakeSession = useAtomValue(wakeSessionAtom);
  const setWakeSession = useSetAtom(wakeSessionAtom);
  const [isLoadingAlarm, setIsLoadingAlarm] = useState(false);
  const [alarmData, setAlarmData] = useState(null);

  const alarmId = useMemo(() => {
    return params?.alarmId ? String(params.alarmId) : params?.id ? String(params.id) : wakeSession.alarmId;
  }, [params?.alarmId, params?.id, wakeSession.alarmId]);

  useEffect(() => {
    if (!alarmId) return;

    let mounted = true;
    setIsLoadingAlarm(true);

    loadAlarms()
      .then((alarms) => {
        if (!mounted) return;
        const alarm = alarms.find((item) => String(item.id) === alarmId);
        if (!alarm) {
          // If alarm not found in storage, we might still have partial data from active session
          return;
        }
        setAlarmData(alarm);

        if (!wakeSession.alarmId) {
          setWakeSession({
            ...INITIAL_WAKE_SESSION,
            status: "ringing",
            alarmId: alarm.id,
            challengeId: alarm.challengeId,
            challengeTitle: alarm.challengeTitle || alarm.task || "AI Challenge",
            targets: alarm.targets || [],
            strictness: alarm.antiCheatStrictness || "Strict",
          });
        }
      })
      .catch((err) => console.error("[AlarmAlert] Load failed", err))
      .finally(() => {
        if (mounted) setIsLoadingAlarm(false);
      });

    return () => {
      mounted = false;
    };
  }, [alarmId, setWakeSession, wakeSession.alarmId]);

  const title = alarmData?.label || wakeSession.challengeTitle || "Wake up mission";
  const challengeText = wakeSession.challengeTitle || alarmData?.challengeTitle || "AI Verification";
  const canContinue = Boolean(wakeSession.alarmId || alarmId) && !isLoadingAlarm;
  
  const timeLabel = useMemo(() => {
    if (alarmData?.time) return `${alarmData.time} ${alarmData.period || ""}`;
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [alarmData]);

  const continueToWakeUp = () => {
    if (!canContinue) return;
    router.push({
      pathname: "/wake-up",
      params: { alarmId: wakeSession.alarmId || alarmId, ringing: "true" },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <Animated.View entering={FadeInDown.duration(450)} style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.time, { color: theme.textPrimary }]}>{timeLabel}</Text>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {alarmData?.label ? alarmData.label : "SnapWake Alarm"}
          </Text>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.cardTop}>
            <View style={[styles.taskIcon, { backgroundColor: `${theme.primary}22` }]}>
              <Ionicons name="camera" size={20} color={theme.primary} />
            </View>
            <View>
              <Text style={[styles.cardEyebrow, { color: theme.textMuted }]}>REQUIRED CHALLENGE</Text>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{challengeText}</Text>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
              <Text style={styles.badgeText}>STRICT MODE</Text>
            </View>
            <Text style={[styles.statusHint, { color: theme.textMuted }]}>Prove it to stop sound</Text>
          </View>
        </Card>

        <View style={styles.actionArea}>
          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: theme.primary }, !canContinue && styles.disabled]}
            onPress={continueToWakeUp}
            disabled={!canContinue}
            activeOpacity={0.9}
          >
            {isLoadingAlarm ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.verifyText}>Tap to Start Verification</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
          <Text style={[styles.footerHint, { color: theme.textMuted }]}>
            Challenge must be completed to silence the alarm.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: "center" },
  content: { gap: spacing.xl },
  header: { alignItems: "center", marginBottom: spacing.md },
  time: { fontFamily: typography.family.hero, fontSize: 64, letterSpacing: -1 },
  label: { fontFamily: typography.family.bold, fontSize: 18, marginTop: -4 },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  taskIcon: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cardEyebrow: { fontFamily: typography.family.bold, fontSize: 10, letterSpacing: 1, opacity: 0.6 },
  cardTitle: { fontFamily: typography.family.bold, fontSize: 22, marginTop: 2 },
  divider: { height: 1, width: "100%", opacity: 0.5 },
  badgeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#111111",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  badgeText: { color: "#FFFFFF", fontFamily: typography.family.bold, fontSize: 10, letterSpacing: 0.5 },
  statusHint: { fontFamily: typography.family.regular, fontSize: 12 },
  actionArea: { gap: spacing.md, marginTop: spacing.lg },
  verifyButton: {
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  verifyText: { fontFamily: typography.family.bold, fontSize: 16, color: "#FFFFFF" },
  footerHint: { textAlign: "center", fontSize: 12, fontFamily: typography.family.regular, opacity: 0.8 },
  disabled: { opacity: 0.6 },
});
