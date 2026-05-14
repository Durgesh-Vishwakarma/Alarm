import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeIn, 
  withRepeat, 
  withTiming, 
  withSequence, 
  useAnimatedStyle, 
  useSharedValue,
  Easing
} from "react-native-reanimated";
import { activeAlarmIdAtom, wakeSessionAtom } from "../atoms/alarmAtoms";
import { verifyChallengeImage } from "../services/aiVerificationService";
import { dismissAlarm } from "../services/alarmEngine";
import { recordWakeResult } from "../services/streakService";
import { haptics } from "../services/hapticService";
import { typography, tokens } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { VerificationResult } from "./WakeUpScreen/VerificationResult";

export const WakeUpScreen = () => {
  const { theme } = useTheme();
  const cameraRef = useRef(null);
  const [wakeSession, setWakeSession] = useAtom(wakeSessionAtom);
  const setActiveAlarmId = useSetAtom(activeAlarmIdAtom);

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const scanLinePos = useSharedValue(0);
  const focusAnim = useSharedValue(1);
  const overlayOpacity = useSharedValue(0.4);

  useEffect(() => {
    // Block system back button during active alarm
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);

    // AI Scan Line Animation
    scanLinePos.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );

    // Breathing Focus Corners
    focusAnim.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Cinematic Breathing Overlay
    overlayOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2500 }),
        withTiming(0.3, { duration: 2500 })
      ),
      -1,
      true
    );

    return () => backHandler.remove();
  }, []);

  const animatedFocusStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusAnim.value }],
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanLinePos.value * 100}%`,
    opacity: isProcessing ? 1 : 0.6,
  }));

  const breathingOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleCapture = async () => {
    if (!cameraReady || isProcessing || !wakeSession.alarmId) return;

    try {
      haptics.impact("medium");
      setIsProcessing(true);
      setWakeSession(p => ({ ...p, status: "capturing", verificationResult: null }));
      setStatusMessage("Capturing Proof...");

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.4, skipProcessing: true });
      setStatusMessage("AI Verifying...");
      setWakeSession(p => ({ ...p, status: "verifying" }));

      const result = await verifyChallengeImage({
        photo: { path: photo.uri, width: photo.width, height: photo.height },
        alarm: { id: wakeSession.alarmId, antiCheatStrictness: wakeSession.strictness },
        challenge: { id: wakeSession.challengeId, title: wakeSession.challengeTitle, targets: wakeSession.targets },
      });

      if (result.success) {
        haptics.success();
        setWakeSession(p => ({ ...p, status: "success", verificationResult: result }));
        await recordWakeResult({ alarmId: wakeSession.alarmId, challengeId: wakeSession.challengeId, success: true });
        setTimeout(() => dismissAlarm({ setActiveAlarmId, setWakeSession }), 2500);
      } else {
        haptics.error();
        setIsProcessing(false);
        setWakeSession(p => ({ ...p, status: "failed", retries: p.retries + 1, verificationResult: result }));
        await recordWakeResult({ alarmId: wakeSession.alarmId, challengeId: wakeSession.challengeId, success: false });
      }
    } catch (e) {
      haptics.error();
      setIsProcessing(false);
      setStatusMessage(null);
      setWakeSession(p => ({ ...p, status: "failed", verificationResult: { success: false, message: e.message } }));
    }
  };

  if (!permission?.granted) return <View style={s.container}><ActivityIndicator color={theme.primary} /></View>;

  return (
    <View style={s.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" onCameraReady={() => setCameraReady(true)} />
      
      {/* Cinematic Breathing Overlays */}
      <Animated.View 
        style={[StyleSheet.absoluteFill, { backgroundColor: "#020617" }, breathingOverlayStyle]} 
      />
      
      <LinearGradient colors={["rgba(2, 6, 23, 0.95)", "transparent"]} style={s.overlayTop} />
      <LinearGradient colors={["transparent", "rgba(2, 6, 23, 0.98)"]} style={s.overlayBottom} />

      <Animated.View entering={FadeInUp} style={s.header}>
        <BlurView intensity={20} tint="dark" style={s.hudBadge}>
          <View style={s.scanDot} />
          <Text style={s.badgeTxt}>Neural Engine Active</Text>
        </BlurView>
        <Text style={s.instruction}>Snap: <Text style={{ color: tokens.colors.primary }}>{wakeSession.challengeTitle}</Text></Text>
      </Animated.View>

      {/* Focus Area */}
      <Animated.View style={[s.focusArea, animatedFocusStyle]}>
        <View style={[s.corner, s.topLeft, { borderColor: tokens.colors.primary }]} />
        <View style={[s.corner, s.topRight, { borderColor: tokens.colors.primary }]} />
        <View style={[s.corner, s.bottomLeft, { borderColor: tokens.colors.primary }]} />
        <View style={[s.corner, s.bottomRight, { borderColor: tokens.colors.primary }]} />
        
        {/* AI Scanning Line */}
        <Animated.View style={[s.scanLine, scanLineStyle]}>
          <LinearGradient
            colors={["transparent", tokens.colors.primary + "66", "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.scanLineGradient}
          />
        </Animated.View>
      </Animated.View>

      <Animated.View entering={FadeInDown} style={s.footer}>
        <View style={s.statusRow}>
          {isProcessing ? (
            <ActivityIndicator color={tokens.colors.primary} size="small" />
          ) : (
            <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.6)" />
          )}
          <Text style={s.tip}>{isProcessing ? statusMessage : "Center the object in frame"}</Text>
        </View>

        <TouchableOpacity 
          style={s.shutterBtn} 
          onPress={handleCapture} 
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <BlurView intensity={30} tint="light" style={s.shutterOuter}>
            <View style={[s.shutterInner, { backgroundColor: isProcessing ? "rgba(255,255,255,0.2)" : "#FFF" }]} />
          </BlurView>
        </TouchableOpacity>
      </Animated.View>

      {(wakeSession.status === "success" || wakeSession.status === "failed") && (
        <VerificationResult 
          success={wakeSession.status === "success"} 
          message={wakeSession.verificationResult?.message} 
          onRetry={() => setWakeSession(p => ({ ...p, status: "ringing" }))}
          theme={theme}
        />
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlayTop: { position: "absolute", top: 0, left: 0, right: 0, height: 180 },
  overlayBottom: { position: "absolute", bottom: 0, left: 0, right: 0, height: 280 },
  header: { position: "absolute", top: 64, left: 24, right: 24, alignItems: "center" },
  hudBadge: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: tokens.spacing.sm, 
    paddingHorizontal: tokens.spacing.lg, 
    paddingVertical: tokens.spacing.sm, 
    borderRadius: tokens.radius.full, 
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    overflow: "hidden",
  },
  scanDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: tokens.colors.primary },
  badgeTxt: { 
    color: "rgba(255,255,255,0.8)", 
    fontFamily: typography.family.metadata, 
    fontSize: tokens.typography.size.tiny, 
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  instruction: { 
    fontFamily: typography.family.section, 
    fontSize: tokens.typography.size.section, 
    color: "#FFF", 
    textAlign: "center", 
    letterSpacing: -1,
  },
  focusArea: { 
    position: "absolute", 
    top: "25%", 
    left: "12%", 
    right: "12%", 
    height: "40%", 
    justifyContent: "center", 
    alignItems: "center",
  },
  corner: { 
    position: "absolute", 
    width: 40, 
    height: 40, 
    borderStyle: "solid",
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: tokens.radius.lg },
  topRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: tokens.radius.lg },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: tokens.radius.lg },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: tokens.radius.lg },
  footer: { position: "absolute", bottom: 48, width: "100%", alignItems: "center", gap: tokens.spacing.giant },
  statusRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: tokens.spacing.sm,
    backgroundColor: "rgba(2, 6, 23, 0.7)",
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tip: { 
    color: "#FFF", 
    fontFamily: typography.family.metadata, 
    fontSize: tokens.typography.size.body, 
    opacity: 0.9,
  },
  shutterBtn: { alignItems: "center", justifyContent: "center" },
  shutterOuter: { 
    width: 88, 
    height: 88, 
    borderRadius: 44, 
    borderWidth: 1.5, 
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center", 
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  shutterInner: { width: 68, height: 68, borderRadius: 34 },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    zIndex: 10,
  },
  scanLineGradient: {
    width: "100%",
    height: "100%",
  },
});
