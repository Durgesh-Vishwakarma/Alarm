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
import { SafeAreaView } from "react-native-safe-area-context";
import { setPermissionsComplete } from "../services/alarmStorage";
import { requestNotificationPermissions } from "../services/notificationService";
import { colors, spacing, typography } from "../theme";

export const PermissionsScreen = () => {
  const [permission, requestCameraPermission] = useCameraPermissions();
  const [isRequesting, setIsRequesting] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("Not requested");

  const cameraGranted = permission?.granted === true;
  const notificationsGranted = notificationStatus === "Granted";
  const canContinue = cameraGranted && notificationsGranted;

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
    ? notificationsGranted
      ? "All set"
      : "Grant Notifications"
    : "Grant Camera";

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Enable Permissions</Text>
          <Text style={styles.subtitle}>
            SnapWake needs camera and notification access to verify challenges
            and ring alarms on time.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconShell}>
              <Ionicons name="camera" size={20} color={colors.primary} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.label}>Camera</Text>
              <Text style={styles.value}>
                {cameraGranted ? "Granted" : "Required"}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.iconShell}>
              <Ionicons name="notifications" size={20} color={colors.primary} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.label}>Notifications</Text>
              <Text style={styles.value}>
                {notificationsGranted ? "Granted" : "Required"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGrant}
            activeOpacity={0.9}
            disabled={isRequesting || canContinue}
          >
            {isRequesting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={colors.white}
                />
                <Text style={styles.primaryText}>{grantLabel}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1, padding: spacing.md },
  header: { marginTop: spacing.md, marginBottom: spacing.lg },
  title: {
    fontFamily: typography.family.extraBold,
    fontSize: 28,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: typography.family.regular,
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1 },
  label: {
    fontFamily: typography.family.bold,
    fontSize: 14,
    color: colors.text.primary,
  },
  value: {
    fontFamily: typography.family.bold,
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  actions: { marginTop: spacing.xl, gap: 12 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: {
    fontFamily: typography.family.extraBold,
    fontSize: 14,
    color: colors.white,
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  secondaryText: {
    fontFamily: typography.family.bold,
    fontSize: 14,
    color: colors.text.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
