import { Ionicons } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { setPermissionsComplete } from "../services/alarmStorage";
import {
  ensureBatteryOptimizationDisabled,
  ensureExactAlarmPermission,
} from "../services/alarmScheduler";
import { requestNotificationPermissions } from "../services/notificationService";
import { spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";

export const PermissionsScreen = () => {
  const { theme } = useTheme();
  const [permission, requestCameraPermission] = useCameraPermissions();
  const [isRequesting, setIsRequesting] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("Not requested");
  const [exactAlarmGranted, setExactAlarmGranted] = useState(false);
  const [batteryOptimizationGranted, setBatteryOptimizationGranted] =
    useState(false);

  const cameraGranted = permission?.granted === true;
  const notificationsGranted = notificationStatus === "Granted";

  const permissions = useMemo(
    () => [
      {
        key: "camera",
        title: "Camera",
        description: "Used only to verify your wake-up challenge.",
        icon: "camera",
        granted: cameraGranted,
      },
      {
        key: "notifications",
        title: "Notifications",
        description: "Lets SnapWake ring and remind you on time.",
        icon: "notifications",
        granted: notificationsGranted,
      },
      {
        key: "exactAlarm",
        title: "Exact alarms",
        description: "Keeps your alarm timing accurate and reliable.",
        icon: "alarm",
        granted: exactAlarmGranted,
      },
      {
        key: "battery",
        title: "Battery reliability",
        description: "Prevents battery saver from stopping your alarm.",
        icon: "battery-charging",
        granted: batteryOptimizationGranted,
      },
    ],
    [
      cameraGranted,
      notificationsGranted,
      exactAlarmGranted,
      batteryOptimizationGranted,
    ]
  );

  const completedCount = permissions.filter((item) => item.granted).length;
  const canContinue = completedCount === permissions.length;

  const nextPermission = permissions.find((item) => !item.granted);

  const grantLabel = nextPermission
    ? `Step ${completedCount + 1} of ${permissions.length} · Enable ${
        nextPermission.title
      }`
    : "All set";

  const handleGrant = async () => {
    setIsRequesting(true);

    try {
      if (!cameraGranted) {
        await requestCameraPermission();
        return;
      }

      if (!notificationsGranted) {
        const status = await requestNotificationPermissions();
        setNotificationStatus(status);
        return;
      }

      if (!exactAlarmGranted) {
        const allowed = await ensureExactAlarmPermission();
        setExactAlarmGranted(allowed);
        return;
      }

      if (!batteryOptimizationGranted) {
        const allowed = await ensureBatteryOptimizationDisabled();
        setBatteryOptimizationGranted(allowed);
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
    if (canContinue) {
      handleContinue();
    }
  }, [canContinue]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>

        <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
  >

        <Animated.View entering={FadeInDown.duration(450)} style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>
              SnapWake setup
            </Text>

            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Protect your wake-up alarm
            </Text>

            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              These permissions help SnapWake ring on time, verify your challenge,
              and avoid missed alarms.
            </Text>
          </View>

          <View
            style={[
              styles.heroPanel,
              {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              },
            ]}
          >
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Ionicons name="shield-checkmark" size={34} color={theme.primary} />
              </View>

              <View style={styles.progressPill}>
                <Text style={styles.progressText}>
                  {completedCount}/{permissions.length} done
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              Your alarm should work even when your phone tries to save battery.
            </Text>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            {permissions.map((item, index) => (
              <View key={item.key}>
                <PermissionRow item={item} theme={theme} />

                {index !== permissions.length - 1 && (
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: theme.divider },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: theme.primary },
                (isRequesting || canContinue) && styles.disabled,
              ]}
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

            <Text style={[styles.footerNote, { color: theme.textMuted }]}>
              You can change these later from your phone settings.
            </Text>
          </View>
        </Animated.View>

 </ScrollView>

      </SafeAreaView>
    </View>
  );
};

const PermissionRow = ({ item, theme }) => {
  const statusText = item.granted ? "Granted" : "Needed";

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconShell,
          {
            backgroundColor: item.granted ? theme.primary : theme.primaryLight,
          },
        ]}
      >
        <Ionicons
          name={item.granted ? "checkmark" : item.icon}
          size={20}
          color={item.granted ? "#FFFFFF" : theme.primary}
        />
      </View>

      <View style={styles.copy}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          {item.title}
        </Text>

        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {item.description}
        </Text>
      </View>

      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: item.granted ? theme.primaryLight : theme.card,
            borderColor: item.granted ? theme.primary : theme.cardBorder,
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            {
              color: item.granted ? theme.primary : theme.textMuted,
            },
          ]}
        >
          {statusText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },

  content: {
    flex: 1,
  },

  header: {
    marginBottom: spacing.md,
  },

  eyebrow: {
    ...typography.styles.caption,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  title: {
    ...typography.styles.titleLarge,
  },

  subtitle: {
    ...typography.styles.body,
    marginTop: 8,
    lineHeight: 21,
  },

  heroPanel: {
    borderRadius: 22,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  progressPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  progressText: {
    ...typography.styles.caption,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  heroTitle: {
    ...typography.styles.body,
    color: "#FFFFFF",
    lineHeight: 22,
    fontWeight: "700",
  },

  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: spacing.md,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 2,
  },

  iconShell: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  copy: {
    flex: 1,
  },

  label: {
    ...typography.styles.body,
    fontWeight: "700",
  },

  description: {
    ...typography.styles.caption,
    marginTop: 3,
    lineHeight: 17,
  },

  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  statusText: {
    ...typography.styles.caption,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    marginVertical: 10,
  },

  actions: {
    marginTop: spacing.lg,
    gap: 10,
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryText: {
    ...typography.styles.body,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  footerNote: {
    ...typography.styles.caption,
    textAlign: "center",
  },

  disabled: {
    opacity: 0.5,
  },
});