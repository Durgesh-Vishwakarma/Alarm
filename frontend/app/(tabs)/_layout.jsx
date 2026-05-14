import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { tokens } from "../../src/theme";
import { useTheme } from "../../src/theme/ThemeContext";

const TAB_HEIGHT = 62;
const TAB_RADIUS = 32;
const ACTIVE_SIZE = 46;

const TabIcon = ({ name, focused, theme }) => {
  return (
    <View style={s.tabIconWrap}>
      {focused ? (
        <LinearGradient
          colors={[theme.primary, "#FF5E1A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.activeBubble}
        >
          <Ionicons name={name} size={23} color="#FFF" />
        </LinearGradient>
      ) : (
        <View style={s.inactiveBubble}>
          <Ionicons name={`${name}-outline`} size={22} color={theme.textMuted} />
        </View>
      )}
    </View>
  );
};

export default function TabLayout() {
  const { theme, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: Platform.OS === "ios" ? 18 : 12,
            left: 20,
            right: 20,
            height: TAB_HEIGHT,
            borderRadius: TAB_RADIUS,
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: isDark
              ? "rgba(255,255,255,0.10)"
              : "rgba(15,23,42,0.08)",
            backgroundColor: Platform.OS === "ios"
              ? "transparent"
              : isDark
              ? "rgba(15,23,42,0.92)"
              : "rgba(255,255,255,0.94)",
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 14 },
            shadowOpacity: isDark ? 0.35 : 0.12,
            shadowRadius: 24,
            elevation: 10,
          },
          tabBarBackground: () => (
            <View style={s.barBg}>
              {Platform.OS === "ios" ? (
                <BlurView
                  intensity={isDark ? 45 : 80}
                  tint={isDark ? "dark" : "light"}
                  style={StyleSheet.absoluteFillObject}
                />
              ) : (
                <LinearGradient
                  colors={
                    isDark
                      ? ["rgba(15,23,42,0.96)", "rgba(30,41,59,0.92)"]
                      : ["rgba(255,255,255,0.98)", "rgba(248,250,252,0.94)"]
                  }
                  style={StyleSheet.absoluteFillObject}
                />
              )}

              <View style={s.topHighlight} pointerEvents="none" />
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
            tabBarIcon: (p) => (
              <TabIcon name="stats-chart" theme={theme} {...p} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: (p) => (
              <TabIcon name="settings" theme={theme} {...p} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const s = StyleSheet.create({
  tabIconWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  activeBubble: {
    width: ACTIVE_SIZE,
    height: ACTIVE_SIZE,
    borderRadius: ACTIVE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#FF7A18",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },

  inactiveBubble: {
    width: ACTIVE_SIZE,
    height: ACTIVE_SIZE,
    borderRadius: ACTIVE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },

  barBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TAB_RADIUS,
    overflow: "hidden",
  },

  topHighlight: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
});