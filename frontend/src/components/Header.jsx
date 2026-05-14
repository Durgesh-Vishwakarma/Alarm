import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";
import { haptics } from "../services/hapticService";

const Header = ({ name = "Durgesh", avatarUri }) => {
  const { theme, isDark, toggleDark } = useTheme();

  const handleThemeToggle = () => {
    haptics.selection();
    toggleDark();
  };

  return (
    <View style={styles.topBar}>
      <View style={styles.profileSection}>
        <LinearGradient
          colors={
            isDark
              ? ["rgba(255,122,24,0.95)", "rgba(49,145,151,0.95)"]
              : ["#FFB86B", "#FF7A18"]
          }
          style={styles.avatarRing}
        >
          <Image
            source={
              avatarUri
                ? { uri: avatarUri }
                : require("../../assets/images/icon.png")
            }
            style={[styles.avatar, { backgroundColor: theme.card }]}
          />
        </LinearGradient>

        <View style={styles.textBlock}>
          <Text style={[styles.eyebrow, { color: theme.textMuted }]}>
            Welcome back
          </Text>

          <Text
            style={[styles.userName, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={handleThemeToggle}
        hitSlop={10}
        style={[
          styles.themeBtn,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(15,23,42,0.055)",
            borderColor: isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(15,23,42,0.08)",
          },
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? ["rgba(245,200,66,0.22)", "rgba(255,255,255,0.02)"]
              : ["rgba(15,23,42,0.08)", "rgba(255,255,255,0.02)"]
          }
          style={StyleSheet.absoluteFillObject}
        />

        <Ionicons
          name={isDark ? "sunny" : "moon"}
          size={19}
          color={isDark ? "#F5C842" : "#334155"}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 13,
  },

  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 2.5,

    shadowColor: "#FF7A18",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  avatar: {
    width: 41,
    height: 41,
    borderRadius: 20.5,
  },

  textBlock: {
    flex: 1,
  },

  eyebrow: {
    ...typography.styles.caption,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  userName: {
    fontFamily: typography.family.extraBold || typography.family.bold,
    fontSize: 19,
    letterSpacing: -0.45,
  },

  themeBtn: {
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
});

export default Header;