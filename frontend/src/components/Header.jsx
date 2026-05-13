import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";

const Header = ({ name, avatarUri }) => {
  const { theme, isDark, toggleDark } = useTheme();

  return (
    <View style={[styles.topBar, { backgroundColor: theme.bg }]}>
      <View style={styles.profileSection}>
        <Image
          source={avatarUri ? { uri: avatarUri } : require("../../assets/images/icon.png")}
          style={[styles.avatar, { borderColor: theme.cardBorder }]}
        />
        <Text style={[styles.userName, { color: theme.textPrimary }]} numberOfLines={1}>
          {name}
        </Text>
      </View>

      <TouchableOpacity
        onPress={toggleDark}
        style={[styles.themeBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isDark ? "sunny" : "moon"}
          size={18}
          color={isDark ? "#F5C842" : "#5B6B8A"}
        />
      </TouchableOpacity>
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
  profileSection: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  userName: {
    fontFamily: typography.family.bold,
    fontSize: 16,
  },
  themeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});

export default Header;
