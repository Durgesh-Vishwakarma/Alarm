import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";

const getDynamicGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Rise & Verify";
  if (hour < 17) return "Stay Focused";
  if (hour < 21) return "Evening Energy";
  return "Rest & Recharge";
};

const Header = ({ name, avatarUri, activeCount, streakDays = 0 }) => {
  const { theme, isDark, toggleDark } = useTheme();
  const greeting = useMemo(() => getDynamicGreeting(), []);

  return (
    <View style={[styles.topBar, { backgroundColor: theme.bg }]}>
      {/* Left: avatar + greeting */}
      <View style={styles.profileSection}>
        <Image
          source={
            avatarUri
              ? { uri: avatarUri }
              : require("../../assets/images/icon.png")
          }
          style={[styles.avatar, { borderColor: theme.cardBorder }]}
        />
        <View style={styles.textStack}>
          <Text style={[styles.greeting, { color: theme.textMuted }]}>
            {greeting}
          </Text>
          <Text style={[styles.userName, { color: theme.textPrimary }]} numberOfLines={1}>
            {name}
          </Text>
        </View>
      </View>

      {/* Right: stats badge + dark toggle */}
      <View style={styles.topBarRight}>
        <View style={[styles.dashboardBadge, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          {/* Streak */}
          <View style={styles.statItem}>
            <Ionicons name="flame" size={14} color="#F59E0B" />
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{streakDays}</Text>
          </View>

          <View style={[styles.separator, { backgroundColor: theme.cardBorder }]} />

          {/* Active alarms */}
          <View style={styles.statItem}>
            <Ionicons name="alarm" size={14} color={theme.primary} />
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{activeCount}</Text>
          </View>

          <View style={[styles.separator, { backgroundColor: theme.cardBorder }]} />

          {/* Dark mode toggle */}
          <TouchableOpacity
            onPress={toggleDark}
            style={styles.themeBtn}
            activeOpacity={0.7}
            accessibilityLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={15}
              color={isDark ? "#F5C842" : "#5B6B8A"}
            />
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: spacing.sm,
  },
  profileSection: { flexDirection: "row", alignItems: "center", flex: 1 },
  textStack: { flex: 1, marginRight: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
  },
  greeting: {
    fontFamily: typography.family.bold,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  userName: {
    fontFamily: typography.family.bold,
    fontSize: 18,
    marginTop: -2,
  },
  topBarRight: { alignItems: "flex-end" },
  dashboardBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    gap: 2,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 2,
  },
  statNumber: {
    fontFamily: typography.family.bold,
    fontSize: 14,
  },
  separator: {
    width: 1,
    height: 14,
    marginHorizontal: 6,
  },
  themeBtn: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Header;
