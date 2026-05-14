import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, ZoomIn, FadeInDown } from "react-native-reanimated";
import { typography, tokens } from "../../theme";

export const VerificationResult = ({ success, message, onRetry, theme }) => {
  const handleRetry = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Medium);
    onRetry();
  };

  return (
    <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill}>
    <LinearGradient
      colors={success ? ["rgba(2, 6, 23, 0.95)", "#020617"] : ["rgba(15, 23, 42, 0.98)", "#020617"]}
      style={StyleSheet.absoluteFillObject}
    />
    
    <View style={s.container}>
      <Animated.View 
        entering={ZoomIn.duration(800).springify()} 
        style={[s.iconBox, { backgroundColor: success ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)" }]}
      >
        <View style={[s.innerIconBox, { backgroundColor: success ? tokens.colors.success : tokens.colors.danger }]}>
          <Ionicons 
            name={success ? "checkmark" : "close"} 
            size={48} 
            color="#FFF" 
          />
        </View>
        {success && <View style={[s.glow, { backgroundColor: tokens.colors.success }]} />}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)}>
        <Text style={[s.title, { color: "#FFF" }]}>
          {success ? "Welcome to your day." : "Something's missing."}
        </Text>
        
        <Text style={[s.subtitle, { color: "rgba(255,255,255,0.6)" }]}>
          {success 
            ? "Your proof is verified. You've officially conquered the snooze." 
            : message || "We couldn't quite see the object. Let's try one more time."
          }
        </Text>
      </Animated.View>

      {success ? (
        <Animated.View entering={FadeInDown.delay(600)} style={s.successFooter}>
           <View style={s.xpBadge}>
             <Ionicons name="sparkles" size={14} color="#F59E0B" />
             <Text style={s.xpTxt}>+25 XP earned</Text>
           </View>
        </Animated.View>
      ) : (
        <TouchableOpacity 
          activeOpacity={0.8}
          style={[s.btn, { backgroundColor: tokens.colors.primary }]} 
          onPress={handleRetry}
        >
          <Text style={s.btnTxt}>Try verification again</Text>
        </TouchableOpacity>
      )}
    </View>
  </Animated.View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: tokens.spacing.giant },
  iconBox: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: tokens.spacing.giant,
  },
  innerIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    ...tokens.shadows.lg,
  },
  glow: { 
    position: "absolute", 
    width: 180, 
    height: 180, 
    borderRadius: 90, 
    opacity: 0.1, 
    zIndex: -1 
  },
  title: { 
    ...typography.styles.titleLarge,
    textAlign: "center",
    marginBottom: tokens.spacing.md,
  },
  subtitle: { 
    ...typography.styles.body,
    textAlign: "center", 
    paddingHorizontal: tokens.spacing.xl,
    opacity: 0.8,
  },
  btn: { 
    marginTop: tokens.spacing.massive, 
    width: "100%",
    height: 64, 
    borderRadius: tokens.radius.xl, 
    alignItems: "center",
    justifyContent: "center",
    ...tokens.shadows.md,
  },
  btnTxt: { 
    color: "#FFF", 
    ...typography.styles.body,
  },
  successFooter: { marginTop: tokens.spacing.massive, alignItems: "center" },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  xpTxt: { 
    ...typography.styles.caption,
    color: "#F59E0B", 
  },
});
