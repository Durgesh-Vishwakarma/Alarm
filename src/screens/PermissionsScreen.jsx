import { Ionicons } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { setPermissionsComplete } from "../services/alarmStorage";
import { requestNotificationPermissions } from "../services/notificationService";
import { spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";

export const PermissionsScreen = () => {
  const { theme } = useTheme();
  const [permission, requestCameraPermission] = useCameraPermissions();
  const [isRequesting, setIsRequesting] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("Not requested");

  const cameraGranted = permission?.granted === true;
  const notificationsGranted = notificationStatus === "Granted";
  const canContinue = cameraGranted && notificationsGranted;

  const handleGrant = async () => {
    setIsRequesting(true);
    try {
      if (!cameraGranted) { await requestCameraPermission(); return; }
      if (!notificationsGranted) {
        const status = await requestNotificationPermissions();
        setNotificationStatus(status);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleContinue = async () => {
    await setPermissionsComplete();
    router.replace("/(tabs)/home");
  };

  useEffect(() => {
    if (!canContinue) return;
    handleContinue();
  }, [canContinue]);

  const grantLabel = cameraGranted
    ? notificationsGranted ? "All set" : "Grant Notifications"
    : "Grant Camera";

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Enable Permissions</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              SnapWake needs camera and notification access to verify challenges and ring alarms on time.
            </Text>
          </View>

          <View style={[styles.heroPanel, { backgroundColor: theme.heroCard, borderColor: theme.heroBorder }]}>
            <View style={[styles.heroIcon, { backgroundColor: theme.primary }]}>
              <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Reliable wake-up needs access.</Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.row}>
              <View style={[styles.iconShell, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="camera" size={20} color={theme.primary} />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>Camera</Text>
                <Text style={[styles.value, { color: cameraGranted ? theme.primary : theme.textMuted }]}>
                  {cameraGranted ? "Granted ✓" : "Required"}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <View style={styles.row}>
              <View style={[styles.iconShell, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="notifications" size={20} color={theme.primary} />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>Notifications</Text>
                <Text style={[styles.value, { color: notificationsGranted ? theme.primary : theme.textMuted }]}>
                  {notificationsGranted ? "Granted ✓" : "Required"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.primary }, (isRequesting || canContinue) && styles.disabled]}
              onPress={handleGrant}
              activeOpacity={0.9}
              disabled={isRequesting || canContinue}
            >
              {isRequesting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryText}>{grantLabel}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: spacing.md },
  content: { flex: 1 },
  header: { marginTop: spacing.md, marginBottom: spacing.lg },
  title: { fontFamily: typography.family.bold, fontSize: 28 },
  subtitle: { fontFamily: typography.family.regular, fontSize: 14, marginTop: 8, lineHeight: 20 },
  heroPanel: {
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontFamily: typography.family.bold,
    fontSize: 24,
    color: "#FFFFFF",
    lineHeight: 30,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  divider: { height: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1 },
  label: { fontFamily: typography.family.bold, fontSize: 14 },
  value: { fontFamily: typography.family.bold, fontSize: 12, marginTop: 4 },
  actions: { marginTop: spacing.xl, gap: 12 },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: { fontFamily: typography.family.bold, fontSize: 14, color: "#FFFFFF" },
  disabled: { opacity: 0.5 },
});
