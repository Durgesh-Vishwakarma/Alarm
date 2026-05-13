import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { activeAlarmIdAtom, wakeSessionAtom } from "../atoms/alarmAtoms";
import { verifyChallengeImage } from "../services/aiVerificationService";
import { dismissAlarm } from "../services/alarmEngine";
import { recordWakeResult } from "../services/streakService";
import { typography } from "../theme";
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

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    if (!permission?.granted) requestPermission();
    return () => sub.remove();
  }, [permission]);

  const handleCapture = async () => {
    if (!cameraReady || isProcessing || !wakeSession.alarmId) return;

    try {
      setIsProcessing(true);
      setWakeSession(p => ({ ...p, status: "capturing", verificationResult: null }));
      setStatusMessage("Capturing...");

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.4, skipProcessing: true });
      setStatusMessage("AI Verifying...");
      setWakeSession(p => ({ ...p, status: "verifying" }));

      const result = await verifyChallengeImage({
        photo: { path: photo.uri, width: photo.width, height: photo.height },
        alarm: { id: wakeSession.alarmId, antiCheatStrictness: wakeSession.strictness },
        challenge: { id: wakeSession.challengeId, title: wakeSession.challengeTitle, targets: wakeSession.targets },
      });

      if (result.success) {
        setWakeSession(p => ({ ...p, status: "success", verificationResult: result }));
        await recordWakeResult({ alarmId: wakeSession.alarmId, challengeId: wakeSession.challengeId, success: true });
        setTimeout(() => dismissAlarm({ setActiveAlarmId, setWakeSession }), 2000);
      } else {
        setIsProcessing(false);
        setWakeSession(p => ({ ...p, status: "failed", retries: p.retries + 1, verificationResult: result }));
        await recordWakeResult({ alarmId: wakeSession.alarmId, challengeId: wakeSession.challengeId, success: false });
      }
    } catch (e) {
      setIsProcessing(false);
      setStatusMessage(null);
      setWakeSession(p => ({ ...p, status: "failed", verificationResult: { success: false, message: e.message } }));
    }
  };

  if (!permission?.granted) return <View style={s.container}><ActivityIndicator color={theme.primary} /></View>;

  return (
    <View style={s.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" onCameraReady={() => setCameraReady(true)} />

      <Animated.View entering={FadeInUp} style={s.header}>
        <View style={s.card}>
          <Text style={s.eyebrow}>AI CHALLENGE</Text>
          <Text style={s.title}>{wakeSession.challengeTitle}</Text>
          <View style={s.tags}>
            {wakeSession.targets?.map((t, i) => <View key={i} style={s.tag}><Text style={s.tagTxt}>{t}</Text></View>)}
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown} style={s.footer}>
        <TouchableOpacity 
          style={[s.btn, { backgroundColor: theme.primary }, isProcessing && { opacity: 0.5 }]} 
          onPress={handleCapture} 
          disabled={isProcessing}
        >
          {isProcessing ? <ActivityIndicator color="#FFF" /> : <View style={s.btnDot} />}
        </TouchableOpacity>
        <Text style={s.tip}>{isProcessing ? statusMessage : "Tap to verify"}</Text>
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
  header: { position: "absolute", top: 60, left: 20, right: 20 },
  card: { padding: 20, borderRadius: 24, backgroundColor: "rgba(0,0,0,0.8)", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  eyebrow: { fontFamily: typography.family.bold, fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2 },
  title: { fontFamily: typography.family.bold, fontSize: 32, color: "#FFF", textAlign: "center" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)" },
  tagTxt: { color: "#FFF", fontSize: 11, fontFamily: typography.family.bold },
  footer: { position: "absolute", bottom: 60, width: "100%", alignItems: "center", gap: 16 },
  btn: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "rgba(255,255,255,0.2)" },
  btnDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#FFF" },
  tip: { color: "#FFF", fontFamily: typography.family.bold, fontSize: 14 },
});
