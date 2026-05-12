import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import {
  activeAlarmIdAtom,
  activeRouteAlarmIdAtom,
  wakeSessionAtom,
} from "../atoms/alarmAtoms";
import { Card } from "../components/Card";
import { verifyChallengeImage } from "../services/aiVerificationService";
import { dismissAlarm } from "../services/alarmEngine";
import { recordWakeResult } from "../services/streakService";
import { colors, spacing, typography } from "../theme";

const isFreshCapture = (photo) => {
  const capturedAt = photo?.capturedAt
    ? new Date(photo.capturedAt).getTime()
    : Date.now();
  return Date.now() - capturedAt < 30000;
};

const CameraUnavailableFallback = ({ onBack }) => (
  <View style={styles.container}>
    <Card style={styles.unsupportedCard}>
      <Text style={styles.instructionText}>Camera Runtime</Text>
      <Text style={styles.targetObject}>Camera Unavailable</Text>
      <Text style={styles.unsupportedText}>
        We could not initialize the camera. Please check permissions and try
        again.
      </Text>
      <TouchableOpacity style={styles.fallbackButton} onPress={onBack}>
        <Text style={styles.fallbackButtonText}>Back to Alarms</Text>
      </TouchableOpacity>
    </Card>
  </View>
);

export const WakeUpScreen = () => {
  const camera = useRef(null);
  const timeoutRef = useRef(null);
  const [wakeSession, setWakeSession] = useAtom(wakeSessionAtom);
  const setActiveAlarmId = useSetAtom(activeAlarmIdAtom);
  const setActiveRouteAlarmId = useSetAtom(activeRouteAlarmIdAtom);

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const scanLineY = useSharedValue(0);
  const pulseValue = useSharedValue(1);
  const intensityValue = useSharedValue(0);

  const [permission, requestPermission] = useCameraPermissions();
  const hasPermission = permission?.granted;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (hasPermission === false) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Escalated animations: faster pulse and higher intensity as retries increase
  useEffect(() => {
    if (wakeSession.status === "ringing") {
      const baseDuration = 1200;
      const speedMultiplier = 1 + wakeSession.retries * 0.25; // Speeds up 25% per retry
      const pulseDuration = Math.max(500, baseDuration / speedMultiplier);

      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.05 + wakeSession.retries * 0.02, {
            duration: pulseDuration,
          }),
          withTiming(1, { duration: pulseDuration }),
        ),
        -1,
        true,
      );

      const escalation = Math.min(1, wakeSession.retries * 0.35);
      intensityValue.value = withTiming(0.4 + escalation, { duration: 1000 });
    } else {
      pulseValue.value = withSpring(1);
      intensityValue.value = withTiming(0, { duration: 500 });
    }
  }, [intensityValue, pulseValue, wakeSession.status, wakeSession.retries]);

  // AI Scan animation speed scales with retries
  useEffect(() => {
    if (isProcessing) {
      const baseScanDuration = 1500;
      const speedMultiplier = 1 + wakeSession.retries * 0.2;
      const scanDuration = baseScanDuration / speedMultiplier;

      scanLineY.value = withRepeat(
        withSequence(
          withTiming(1, { duration: scanDuration }),
          withTiming(0, { duration: scanDuration }),
        ),
        -1,
      );
    } else {
      scanLineY.value = 0;
    }
  }, [isProcessing, scanLineY, wakeSession.retries]);

  const animatedScanLine = useAnimatedStyle(() => ({
    top: `${scanLineY.value * 100}%`,
    opacity: isProcessing ? 1 : 0,
  }));

  const animatedOverlay = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    borderColor: interpolate(
      intensityValue.value,
      [0, 1],
      ["rgba(255,255,255,0.1)", "rgba(255, 30, 60, 0.9)"],
    ),
  }));

  const handleDismiss = async () => {
    await dismissAlarm({
      setActiveAlarmId,
      setWakeSession,
      setActiveRouteAlarmId,
    });
  };

  const handleCapture = async () => {
    if (camera.current == null || isProcessing || !wakeSession.alarmId) return;

    let longVerifyingTimeout = null;

    try {
      setIsProcessing(true);
      setWakeSession((p) => ({
        ...p,
        status: "capturing",
        verificationResult: null,
      }));

      setStatusMessage("Capturing...");
      const photo = await camera.current.takePictureAsync({
        quality: 0.65,
        exif: false, // Optimized for speed on low-end devices
      });

      setStatusMessage("Optimizing...");
      const normalizedPhoto = {
        path: photo.uri,
        width: photo.width,
        height: photo.height,
        capturedAt: new Date().toISOString(),
      };

      if (!isFreshCapture(normalizedPhoto)) {
        throw new Error("Capture timestamp invalid.");
      }

      setStatusMessage("AI Verifying...");
      setWakeSession((p) => ({ ...p, status: "verifying" }));

      // Handle long-running verification
      longVerifyingTimeout = setTimeout(() => {
        setStatusMessage("AI Analyzing... High load.");
      }, 10000);

      const verificationContext = {
        photo: normalizedPhoto,
        alarm: {
          id: wakeSession.alarmId,
          antiCheatStrictness: wakeSession.strictness,
        },
        challenge: {
          id: wakeSession.challengeId,
          title: wakeSession.challengeTitle,
          targets: wakeSession.targets,
        },
      };

      const result = await verifyChallengeImage(verificationContext);
      clearTimeout(longVerifyingTimeout);

      if (result.success) {
        setWakeSession((p) => ({
          ...p,
          status: "success",
          verificationResult: result,
        }));
        await recordWakeResult({
          alarmId: wakeSession.alarmId,
          challengeId: wakeSession.challengeId,
          success: true,
          confidence: result.confidence,
        });
        setStatusMessage("Passed! Morning Win.");

        timeoutRef.current = setTimeout(handleDismiss, 2000);
      } else {
        setWakeSession((p) => ({
          ...p,
          status: "failed",
          retries: p.retries + 1,
          verificationResult: result,
        }));
        await recordWakeResult({
          alarmId: wakeSession.alarmId,
          challengeId: wakeSession.challengeId,
          success: false,
          confidence: result.confidence,
        });

        // Surface specific backend failure reasons aggressively
        setStatusMessage(result.message || "Analysis failed. Try again.");

        timeoutRef.current = setTimeout(() => {
          setIsProcessing(false);
          setStatusMessage(null);
          setWakeSession((p) => ({
            ...p,
            status: "ringing",
            verificationResult: null,
          }));
        }, 3500);
      }
    } catch (error) {
      if (longVerifyingTimeout) clearTimeout(longVerifyingTimeout);
      Alert.alert(
        "AI Feedback",
        error.message || "System error during verification.",
      );
      setIsProcessing(false);
      setStatusMessage(null);
      setWakeSession((p) => ({
        ...p,
        status: "failed",
        verificationResult: {
          success: false,
          message: error.message || "Verification failed. Try again.",
        },
      }));
    }
  };

  if (!hasPermission) {
    if (permission?.status === "denied")
      return <CameraUnavailableFallback onBack={handleDismiss} />;
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />

      {/* AI Radar Grid Overlay */}
      <View style={styles.radarOverlay} pointerEvents="none">
        <View style={styles.gridLineV} />
        <View style={[styles.gridLineV, { left: "33.3%" }]} />
        <View style={[styles.gridLineV, { left: "66.6%" }]} />
        <View style={styles.gridLineH} />
        <View style={[styles.gridLineH, { top: "33.3%" }]} />
        <View style={[styles.gridLineH, { top: "66.6%" }]} />
      </View>

      {/* AI HUD Brackets */}
      <View style={styles.hudContainer} pointerEvents="none">
        <View style={[styles.hudBracket, styles.hudTopLeft]} />
        <View style={[styles.hudBracket, styles.hudTopRight]} />
        <View style={[styles.hudBracket, styles.hudBottomLeft]} />
        <View style={[styles.hudBracket, styles.hudBottomRight]} />
      </View>

      {/* Dynamic Scan Line */}
      <Animated.View style={[styles.scanLine, animatedScanLine]} />

      {/* Challenge Header */}
      <Animated.View
        entering={FadeInUp.duration(800)}
        style={styles.overlayContainer}
      >
        <Animated.View style={[styles.targetCard, animatedOverlay]}>
          <View style={styles.headerRow}>
            <Text style={styles.instructionText}>SNAPWAKE AI CHALLENGE</Text>
            {wakeSession.retries > 0 && (
              <View style={styles.retryBadge}>
                <Text style={styles.retryText}>
                  LVL {wakeSession.retries} INTENSITY
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.targetObject}>{wakeSession.challengeTitle}</Text>

          <View style={styles.targetTags}>
            {(wakeSession.targets || []).slice(0, 3).map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>• {tag}</Text>
              </View>
            ))}
          </View>

          {statusMessage && (
            <Animated.View
              entering={ZoomIn}
              exiting={FadeOut}
              style={styles.statusBadge}
            >
              {isProcessing && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginRight: 8 }}
                />
              )}
              <Text style={styles.statusBadgeText}>{statusMessage}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>

      {/* Capture Controls */}
      <Animated.View
        entering={FadeInDown.duration(800)}
        style={styles.bottomContainer}
      >
        <View style={styles.strictnessInfo}>
          <Ionicons
            name="shield-checkmark"
            size={12}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.strictnessText}>
            {wakeSession.strictness} Security Active
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.buttonDisabled]}
          onPress={handleCapture}
          disabled={isProcessing}
        >
          <View style={styles.captureButtonInner}>
            {isProcessing ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : (
              <View style={styles.captureDot} />
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.captureTip}>
          Verify {wakeSession.challengeTitle} to wake up
        </Text>
      </Animated.View>

      {/* Success Dopamine Screen */}
      {wakeSession.status === "success" &&
        wakeSession.verificationResult?.success === true && (
          <Animated.View entering={FadeIn} style={styles.fullOverlay}>
            <Animated.View
              entering={ZoomIn.duration(600)}
              style={styles.successCard}
            >
              <Text style={styles.successIcon}>🏆</Text>
              <Text style={styles.successTitle}>MORNING WIN!</Text>
              <Text style={styles.successSubtitle}>
                AI Verified. Challenge complete.
              </Text>
            </Animated.View>
          </Animated.View>
        )}

      {(wakeSession.status === "failed" ||
        wakeSession.verificationResult?.success === false) && (
        <Animated.View entering={FadeIn} style={styles.fullOverlay}>
          <Animated.View
            entering={ZoomIn.duration(450)}
            style={styles.failCard}
          >
            <Text style={styles.failIcon}>⚠️</Text>
            <Text style={styles.failTitle}>VERIFICATION FAILED</Text>
            <Text style={styles.failSubtitle}>
              {wakeSession.verificationResult?.message ||
                "Could not verify. Try again."}
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  radarOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.15, zIndex: 1 },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  hudContainer: { ...StyleSheet.absoluteFillObject, zIndex: 5, padding: 40 },
  hudBracket: {
    position: "absolute",
    width: 35,
    height: 35,
    borderColor: "rgba(255,255,255,0.4)",
    borderWidth: 0,
  },
  hudTopLeft: { top: 60, left: 30, borderTopWidth: 2, borderLeftWidth: 2 },
  hudTopRight: { top: 60, right: 30, borderTopWidth: 2, borderRightWidth: 2 },
  hudBottomLeft: {
    bottom: 60,
    left: 30,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  hudBottomRight: {
    bottom: 60,
    right: 30,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
    zIndex: 10,
  },
  overlayContainer: {
    position: "absolute",
    top: spacing.xl * 2,
    left: spacing.lg,
    right: spacing.lg,
  },
  targetCard: {
    padding: spacing.lg,
    borderRadius: 24,
    alignItems: "center",
    backgroundColor: "rgba(10, 10, 10, 0.88)",
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  instructionText: {
    fontFamily: typography.family.extraBold,
    fontSize: 10,
    color: "#666",
    letterSpacing: 2,
  },
  retryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  retryText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: typography.family.extraBold,
  },
  targetObject: {
    fontFamily: typography.family.extraBold,
    fontSize: 32,
    color: colors.white,
    textAlign: "center",
  },
  targetTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: { fontFamily: typography.family.bold, fontSize: 11, color: "#999" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  statusBadgeText: {
    fontFamily: typography.family.bold,
    fontSize: 13,
    color: "#fff",
  },
  bottomContainer: {
    position: "absolute",
    bottom: spacing.xl * 2,
    width: "100%",
    alignItems: "center",
  },
  strictnessInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 32,
  },
  strictnessText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: typography.family.extraBold,
  },
  captureButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  captureButtonInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  captureDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  captureTip: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: typography.family.bold,
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.3 },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  successCard: {
    width: "85%",
    alignItems: "center",
    backgroundColor: "#050505",
    borderRadius: 40,
    paddingVertical: 60,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  successIcon: { fontSize: 72, marginBottom: 32 },
  successTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 30,
    color: colors.primary,
    marginBottom: 16,
  },
  successSubtitle: {
    fontFamily: typography.family.bold,
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  failCard: {
    width: "85%",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderRadius: 36,
    paddingVertical: 48,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  failIcon: { fontSize: 64, marginBottom: 20 },
  failTitle: {
    fontFamily: typography.family.extraBold,
    fontSize: 22,
    color: colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  failSubtitle: {
    fontFamily: typography.family.bold,
    fontSize: 15,
    color: "#8A8A8A",
    textAlign: "center",
  },
  unsupportedCard: { width: "85%", alignItems: "center" },
  unsupportedText: {
    fontFamily: typography.family.bold,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 14,
  },
  fallbackButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 36,
  },
  fallbackButtonText: {
    color: "#fff",
    fontFamily: typography.family.extraBold,
    fontSize: 18,
  },
});
