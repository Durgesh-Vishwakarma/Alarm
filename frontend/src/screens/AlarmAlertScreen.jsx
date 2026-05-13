import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { wakeSessionAtom } from "../atoms/alarmAtoms";
import { Card } from "../components/Card";
import { spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";

export const AlarmAlertScreen = () => {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const wakeSession = useAtomValue(wakeSessionAtom);

  const alarmId = params?.alarmId ? String(params.alarmId) : wakeSession.alarmId;
  const title = wakeSession.challengeTitle || "AI Challenge";
  const label = wakeSession.alarmId ? "SnapWake Alarm" : "Wake-up";
  const timeLabel = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}> 
      <Animated.View entering={FadeInDown.duration(350)} style={styles.content}>
        <Text style={[styles.time, { color: theme.textPrimary }]}>{timeLabel}</Text>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>

        <Card style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{title}</Text>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.badgeText}>Security Active</Text>
          </View>
        </Card>

        <TouchableOpacity
          style={[styles.verifyButton, { backgroundColor: theme.primary }]}
          onPress={() =>
            router.push({
              pathname: "/wake-up",
              params: { alarmId, ringing: "true" },
            })
          }
          activeOpacity={0.9}
        >
          <Ionicons name="camera" size={18} color="#FFFFFF" />
          <Text style={styles.verifyText}>Verify to wake up</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: spacing.lg },
  content: { gap: spacing.lg },
  time: { fontFamily: typography.family.bold, fontSize: 48 },
  label: { fontFamily: typography.family.medium, fontSize: 16 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: { fontFamily: typography.family.bold, fontSize: 20 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#111111",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  badgeText: { color: "#FFFFFF", fontFamily: typography.family.medium, fontSize: 12 },
  verifyButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  verifyText: { fontFamily: typography.family.bold, fontSize: 14, color: "#FFFFFF" },
});
