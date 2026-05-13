import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors, typography } from "../../src/theme";

/**
 * SnapWake Tab Layout
 * Re-aligned with the futuristic 'AI Scanner' identity.
 * Features a dark-mode immersive bar with neon active indicators.
 */
export default function TabLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <Tabs
        screenOptions={{
          headerShown: false,
          // PRODUCTION FIX: Using high-contrast neon cyan for active state
          tabBarActiveTintColor: colors.verification,
          tabBarInactiveTintColor: colors.text.muted,
          tabBarStyle: {
            // Dark immersive theme to match the core Wake experience
            backgroundColor: colors.dark.background,
            borderTopWidth: 1,
            borderTopColor: colors.dark.border,
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
        <Tabs.Screen
          name="home"
          options={{
            title: "Alarms",
            tabBarIcon: ({ color }) => (
              <Ionicons name="alarm" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="streaks"
          options={{
            title: "Streaks",
            tabBarIcon: ({ color }) => (
              <Ionicons name="flame" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <Ionicons name="options" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
