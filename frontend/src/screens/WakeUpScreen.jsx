import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
  BackHandler,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    cancelAnimation,
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
import { useTheme } from "../theme/ThemeContext";

const isFreshCapture = (photo) => {
  const capturedAt = photo?.capturedAt
    ? new Date(photo.capturedAt).getTime()
    : Date.now();
  return Date.now() - capturedAt < 30000;
};

const CameraUnavailableFallback = ({ onBack, primaryColor }) => (
  <View style={styles.container}>
    <Card style={styles.unsupportedCard}>
      <Text style={styles.instructionText}>Camera Runtime</Text>
      <Text style={styles.targetObject}>Camera Unavailable</Text>
      <Text style={styles.unsupportedText}>
        We could not initialize the camera. Please check permissions and try again.
      </Text>
      <TouchableOpacity style={[styles.fallbackButton, { backgroundColor: primaryColor }]} onPress={onBack}>
        <Text style={styles.fallbackButtonText}>Back to Alarms</Text>
      </TouchableOpacity>
    </Card>
  </View>
);

export const WakeUpScreen = () => {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const cameraRef = useRef(null);
  const timeoutRef = useRef(null);
  const [wakeSession, setWakeSession] = useAtom(wakeSessionAtom);
  const setActiveAlarmId = useSetAtom(activeAlarmIdAtom);
  const setActiveRouteAlarmId = useSetAtom(activeRouteAlarmIdAtom);

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const scanLineY = useSharedValue(0);
  const pulseValue = useSharedValue(1);
  const intensityValue = useSharedValue(0);
  const bracketPulse = useSharedValue(1);
  const capturePulse = useSharedValue(0);
  const checkProgress = useSharedValue(0);

  const [permission, requestPermission] = useCameraPermissions();
  const hasPermission = permission?.granted;

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );

    return () => subscription.remove();
  }, []);

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

  useEffect(() => {
    bracketPulse.value = withRepeat(
      withTiming(1.05, { duration: 1600 }),
      -1,
      true,
    );
  }, [bracketPulse]);

  useEffect(() => {
    if (isProcessing) {
      cancelAnimation(capturePulse);
      capturePulse.value = 0;
      return;
    }

    capturePulse.value = 0;
    capturePulse.value = withRepeat(
      withTiming(1, { duration: 1400 }),
      -1,
      false,
    );
  }, [capturePulse, isProcessing]);

  useEffect(() => {
    if (
      wakeSession.status === "success" &&
      wakeSession.verificationResult?.success
    ) {
      checkProgress.value = 0;
      checkProgress.value = withTiming(1, { duration: 900 });
    }
  }, [checkProgress, wakeSession.status, wakeSession.verificationResult]);

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

  const bracketPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bracketPulse.value }],
  }));

  const capturePulseStyle = useAnimatedStyle(() => ({
    opacity: 0.5 - capturePulse.value * 0.35,
    transform: [{ scale: 1 + capturePulse.value * 0.45 }],
  }));

  const shortStrokeStyle = useAnimatedStyle(() => ({
    width: interpolate(checkProgress.value, [0, 1], [0, 18]),
  }));

  const longStrokeStyle = useAnimatedStyle(() => ({
    width: interpolate(checkProgress.value, [0, 1], [0, 38]),
  }));

  const handleDismiss = async () => {
    await dismissAlarm({
      setActiveAlarmId,
      setWakeSession,
      setActiveRouteAlarmId,
    });
  };

  const resolvedAlarmId =
    wakeSession.alarmId || (params?.alarmId ? String(params.alarmId) : null);

  const handleCapture = async () => {
    console.log("[WakeUp] Button pressed");
    console.log("[WakeUp] cameraReady", cameraReady);
    console.log("[WakeUp] alarmId", resolvedAlarmId);
    console.log("[WakeUp] cameraRef", !!cameraRef.current);

    if (!cameraReady || cameraRef.current == null || isProcessing || !resolvedAlarmId) {
      return;
    }

    let longVerifyingTimeout = null;

    try {
      setIsProcessing(true);
      setWakeSession((p) => ({
        ...p,
        status: "capturing",
        verificationResult: null,
      }));

      setStatusMessage("Capturing...");
      console.log("[WakeUp] Taking photo");
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.4,
        exif: false, // Optimized for speed on low-end devices
        skipProcessing: true,
      });
      console.log("[WakeUp] Photo success", photo?.uri);

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
          id: resolvedAlarmId,
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
          alarmId: resolvedAlarmId,
          challengeId: wakeSession.challengeId,
          success: true,
          confidence: result.confidence,
        });
        setStatusMessage("Passed! Morning Win.");

        timeoutRef.current = setTimeout(handleDismiss, 2000);
      } else {
        setIsProcessing(false);
        setWakeSession((p) => ({
          ...p,
          status: "failed",
          retries: p.retries + 1,
          verificationResult: result,
        }));
        await recordWakeResult({
          alarmId: resolvedAlarmId,
          challengeId: wakeSession.challengeId,
          success: false,
          confidence: result.confidence,
        });

        // Surface specific backend failure reasons aggressively
        setStatusMessage(result.message || "Analysis failed. Try again.");

        timeoutRef.current = setTimeout(() => {
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
      return <CameraUnavailableFallback onBack={handleDismiss} primaryColor={theme.primary} />;
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(450)} style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setCameraReady(true)}
        animateShutter={false}
        enableTorch={false}
      />

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
        <Animated.View
          style={[styles.hudBracket, styles.hudTopLeft, bracketPulseStyle]}
        />
        <Animated.View
          style={[styles.hudBracket, styles.hudTopRight, bracketPulseStyle]}
        />
        <Animated.View
          style={[styles.hudBracket, styles.hudBottomLeft, bracketPulseStyle]}
        />
        <Animated.View
          style={[styles.hudBracket, styles.hudBottomRight, bracketPulseStyle]}
        />
      </View>

      <Animated.View style={[styles.scanLine, animatedScanLine, { backgroundColor: theme.primary }]} />

      {/* Challenge Header */}
      <Animated.View
        entering={FadeInUp.duration(800)}
        style={styles.overlayContainer}
      >
        <Animated.View style={[styles.targetCard, animatedOverlay]}>
          <View style={styles.headerRow}>
            <Text style={styles.instructionText}>SNAPWAKE AI CHALLENGE</Text>
            {wakeSession.retries > 0 && (
              <View style={[styles.retryBadge, { backgroundColor: theme.primary }]}>
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
                <Text style={styles.tagText}>{tag}</Text>
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
                  color={theme.primary}
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
            color={colors.white}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.strictnessText}>
            {wakeSession.strictness} Security Active
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.captureButton,
            (isProcessing || !cameraReady || !resolvedAlarmId) && styles.buttonDisabled,
          ]}
          onPress={handleCapture}
          disabled={isProcessing || !cameraReady || !resolvedAlarmId}
        >
          {!isProcessing ? (
            <Animated.View style={[styles.capturePulseRing, capturePulseStyle, { borderColor: theme.heroNeon + "66" }]} />
          ) : null}
      <View style={[styles.captureButtonInner, { backgroundColor: theme.primary }, isProcessing && styles.captureButtonInnerProcessing]}>
          {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
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
              <View style={styles.successIconWrap}>
                <View style={styles.checkmarkShape}>
                  <Animated.View
                    style={[styles.checkmarkShort, shortStrokeStyle]}
                  />
                  <Animated.View
                    style={[styles.checkmarkLong, longStrokeStyle]}
                  />
                </View>
              </View>
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
            <Ionicons name="alert-circle" size={64} color={colors.danger} />
            <Text style={styles.failTitle}>VERIFICATION FAILED</Text>
            <Text style={styles.failSubtitle}>
              {wakeSession.verificationResult?.message ||
                "Could not verify. Try again."}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setIsProcessing(false);
                setStatusMessage(null);
                setWakeSession((p) => ({
                  ...p,
                  status: "ringing",
                  verificationResult: null,
                }));
              }}
            >
              <Text style={styles.retryButtonText}>RETRY VERIFICATION</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
    justifyContent: "center",
    alignItems: "center",
  },
  radarOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.25, zIndex: 1 },
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
    fontFamily: typography.family.bold,
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.6,
  },
  retryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  retryText: {
    color: colors.white,
    fontSize: 9,
    fontFamily: typography.family.bold,
  },
  targetObject: {
    fontFamily: typography.family.bold,
    fontSize: 42,
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
  tagText: {
    fontFamily: typography.family.bold,
    fontSize: 11,
    color: "rgba(255,255,255,0.68)",
  },
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
    color: colors.white,
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
    color: colors.white,
    fontSize: 11,
    fontFamily: typography.family.bold,
  },
  captureButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  capturePulseRing: {
    position: "absolute",
    width: 102,
    height: 102,
    borderRadius: 51,
    borderWidth: 2,
    borderColor: "rgba(158, 216, 194, 0.42)",
  },
  captureButtonInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInnerProcessing: {
    backgroundColor: "rgba(18, 107, 95, 0.7)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
  },
  captureDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
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
    borderColor: colors.success,
  },
  successIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(52, 199, 89, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.35)",
    marginBottom: 26,
  },
  checkmarkShape: {
    width: 56,
    height: 40,
  },
  checkmarkShort: {
    position: "absolute",
    left: 6,
    top: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    transform: [{ rotate: "45deg" }],
  },
  checkmarkLong: {
    position: "absolute",
    left: 18,
    top: 14,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    transform: [{ rotate: "-45deg" }],
  },
  successTitle: {
    fontFamily: typography.family.bold,
    fontSize: 30,
    color: colors.success,
    marginBottom: 16,
  },
  successSubtitle: {
    fontFamily: typography.family.bold,
    fontSize: 18,
    color: colors.text.muted,
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
    fontFamily: typography.family.bold,
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
  retryButton: {
    marginTop: 28,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 18,
  },
  retryButtonText: {
    color: colors.white,
    fontFamily: typography.family.bold,
    fontSize: 16,
  },
  unsupportedCard: { width: "85%", alignItems: "center" },
  unsupportedText: {
    fontFamily: typography.family.bold,
    fontSize: 14,
    color: colors.text.muted,
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
    color: colors.white,
    fontFamily: typography.family.bold,
    fontSize: 18,
  },
});

