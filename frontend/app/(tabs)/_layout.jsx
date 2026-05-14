import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, View } from "react-native";
import { tokens } from "../../src/theme";
import { useTheme } from "../../src/theme/ThemeContext";

const TAB_HEIGHT = 76;

const TabIcon = ({ name, color, focused, theme }) => (
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
        size={focused ? 26 : 24}
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
        : "rgba(255, 255, 255, 0.92)";

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
            bottom: 14,
            left: 18,
            right: 18,
            height: TAB_HEIGHT,
            borderRadius: 28,
            borderTopWidth: 0,
            backgroundColor: barBg,
            borderWidth: 1,
            borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.06)",
            paddingHorizontal: 8,
            ...Platform.select({
              ios: tokens.shadows.md,
              android: { elevation: 12 },
            }),
          },
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <View style={[StyleSheet.absoluteFillObject, { borderRadius: 28, overflow: "hidden" }]}>
                <BlurView intensity={isDark ? 42 : 72} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
                <View
                  style={[
                    StyleSheet.absoluteFillObject,
                    {
                      borderRadius: 28,
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: "rgba(255, 255, 255, 0.12)",
                    },
                  ]}
                  pointerEvents="none"
                />
              </View>
            ) : (
              <View style={[StyleSheet.absoluteFillObject, { borderRadius: 28, overflow: "hidden" }]}>
                <LinearGradient
                  colors={
                    isDark
                      ? ["rgba(30, 41, 59, 0.98)", "rgba(15, 23, 42, 0.99)"]
                      : ["rgba(255, 255, 255, 0.98)", "rgba(248, 250, 252, 0.95)"]
                  }
                  style={StyleSheet.absoluteFillObject}
                />
                <View
                  style={[
                    StyleSheet.absoluteFillObject,
                    {
                      borderRadius: 28,
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: "rgba(255, 255, 255, 0.14)",
                    },
                  ]}
                  pointerEvents="none"
                />
              </View>
            ),
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: (p) => <TabIcon name="home" theme={theme} {...p} />,
          }}
        />
        <Tabs.Screen
          name="streaks"
          options={{
            title: "Stats",
            tabBarIcon: (p) => <TabIcon name="stats-chart" theme={theme} {...p} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: (p) => <TabIcon name="settings" theme={theme} {...p} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const s = StyleSheet.create({
  tabIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingTop: 10,
  },
  iconHighlight: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
});
