import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { typography } from "../../src/theme";
import { useTheme } from "../../src/theme/ThemeContext";

const TabIcon = ({ name, color, focused }) => (
  <View style={styles.tabIconWrap}>
    <Ionicons name={name} size={24} color={color} />
    <View style={[styles.tabDot, focused && styles.tabDotActive]} />
  </View>
);

const AlarmTabIcon    = (props) => <TabIcon name="alarm"   {...props} />;
const StreaksTabIcon  = (props) => <TabIcon name="flame"   {...props} />;
const SettingsTabIcon = (props) => <TabIcon name="options" {...props} />;

export default function TabLayout() {
  const { theme, isDark } = useTheme();

  // Tab bar always uses a deep dark surface so icons stay visible regardless of theme
  const tabBg     = isDark ? theme.heroCard   : "#111816";
  const tabBorder = isDark ? theme.heroBorder : "#1E2A20";

  return (
    <>
      {/*
        StatusBar style:
        - "light" → white clock/battery/signal icons (for dark backgrounds)
        - "dark"  → black icons (for light backgrounds)
        We always use "light" here because the tab bar is always dark,
        but the status bar sits above the screen content, so we drive it
        from the theme's statusBar value to keep indicators visible.
      */}
      <StatusBar
        style={theme.statusBar}
        backgroundColor={theme.bg}
        translucent={false}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
          tabBarStyle: {
            backgroundColor: tabBg,
            borderTopWidth: 1,
            borderTopColor: tabBorder,
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontFamily: typography.family.bold,
            fontSize: 11,
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen name="home"     options={{ title: "Alarms",   tabBarIcon: AlarmTabIcon    }} />
        <Tabs.Screen name="streaks"  options={{ title: "Streaks",  tabBarIcon: StreaksTabIcon  }} />
        <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: SettingsTabIcon }} />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: { alignItems: "center", justifyContent: "center", gap: 4 },
  tabDot:      { width: 5, height: 5, borderRadius: 3, backgroundColor: "transparent" },
  tabDotActive:{ backgroundColor: "#FFFFFF" },
});
