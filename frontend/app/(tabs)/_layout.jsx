import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, View } from "react-native";
import { tokens } from "../../src/theme";
import { useTheme } from "../../src/theme/ThemeContext";

const TAB_HEIGHT = 68;
const TAB_RADIUS = tokens.radius.xl;
const ACTIVE_SIZE = 42;

const TabIcon = ({ name, focused, theme }) => (
  <View style={s.tabIconWrap}>
    <View
      style={[
        s.iconHighlight,
        focused && {
          backgroundColor: theme.primaryLight,
          ...Platform.select({
            ios: tokens.shadows.sm,
            android: { elevation: 2 },
          }),
        },
      ]}
    >
      <Ionicons
        name={focused ? name : `${name}-outline`}
        size={focused ? 24 : 22}
        color={focused ? theme.primary : theme.textMuted}
      />
    </View>
  </View>
);

export default function TabLayout() {
  const { theme, isDark } = useTheme();

  const barBg =
    Platform.OS === "ios"
      ? "transparent"
      : isDark
        ? "rgba(15, 23, 42, 0.94)"
        : "rgba(255, 255, 255, 0.94)";

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: 10,
            left: 18,
            right: 18,
            height: TAB_HEIGHT,
            borderRadius: TAB_RADIUS,
            borderTopWidth: 0,
            backgroundColor: barBg,
            borderWidth: 1,
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.06)",
            paddingHorizontal: tokens.spacing.sm,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 18,
            elevation: 4,
          },
          tabBarBackground: () => (
            <View style={[StyleSheet.absoluteFillObject, { borderRadius: TAB_RADIUS, overflow: "hidden" }]}>
              {Platform.OS === "ios" ? (
                <BlurView intensity={isDark ? 42 : 72} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
              ) : (
                <LinearGradient
                  colors={isDark ? tokens.gradients.glassDark : tokens.gradients.glassLight}
                  style={StyleSheet.absoluteFillObject}
                />
              )}
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    borderRadius: TAB_RADIUS,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: "rgba(255, 255, 255, 0.12)",
                  },
                ]}
                pointerEvents="none"
              />
            </View>
          ),
        }}
      >
        <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: (p) => <TabIcon name="home" theme={theme} {...p} /> }} />
        <Tabs.Screen name="streaks" options={{ title: "Stats", tabBarIcon: (p) => <TabIcon name="stats-chart" theme={theme} {...p} /> }} />
        <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: (p) => <TabIcon name="settings" theme={theme} {...p} /> }} />
      </Tabs>
    </View>
  );
}

const s = StyleSheet.create({
  tabIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconHighlight: {
    width: ACTIVE_SIZE,
    height: ACTIVE_SIZE,
    borderRadius: ACTIVE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
