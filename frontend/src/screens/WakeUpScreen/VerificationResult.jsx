import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { typography } from "../../theme";

export const VerificationResult = ({ success, message, onRetry, theme }) => (
  <Animated.View entering={FadeIn} style={s.overlay}>
    <Animated.View entering={ZoomIn} style={[s.card, { borderColor: success ? "#4CAF50" : "#F44336" }]}>
      <Ionicons 
        name={success ? "checkmark-circle" : "alert-circle"} 
        size={64} 
        color={success ? "#4CAF50" : "#F44336"} 
      />
      <Text style={[s.title, { color: success ? "#4CAF50" : "#F44336" }]}>
        {success ? "MORNING WIN!" : "FAILED"}
      </Text>
      <Text style={s.subtitle}>{message}</Text>
      
      {!success && (
        <TouchableOpacity style={[s.btn, { backgroundColor: theme.primary }]} onPress={onRetry}>
          <Text style={s.btnTxt}>TRY AGAIN</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  </Animated.View>
);

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center", zIndex: 100 },
  card: { width: "80%", padding: 32, borderRadius: 32, backgroundColor: "#000", alignItems: "center", borderWidth: 2, gap: 12 },
  title: { fontFamily: typography.family.extraBold, fontSize: 24, letterSpacing: 1 },
  subtitle: { fontFamily: typography.family.bold, fontSize: 14, color: "#AAA", textAlign: "center" },
  btn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnTxt: { color: "#FFF", fontFamily: typography.family.bold, fontSize: 14 },
});
