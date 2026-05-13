import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { OnboardingScreen } from "../src/screens/OnboardingScreen";
import { PermissionsScreen } from "../src/screens/PermissionsScreen";
import {
    checkOnboardingComplete,
    checkPermissionsComplete,
} from "../src/services/alarmStorage";
import { useTheme } from "../src/theme/ThemeContext";

export default function Index() {
  const { theme } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showPermissions, setShowPermissions] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const completed = await checkOnboardingComplete();
        setShowOnboarding(!completed);
        if (completed) {
          const permissionsComplete = await checkPermissionsComplete();
          setShowPermissions(!permissionsComplete);
        }
      } catch (_error) {
        setShowOnboarding(true);
        setShowPermissions(false);
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <>
        <StatusBar style={theme.statusBar} backgroundColor={theme.bg} translucent={false} />
        <OnboardingScreen />
      </>
    );
  }

  if (showPermissions) {
    return (
      <>
        <StatusBar style={theme.statusBar} backgroundColor={theme.bg} translucent={false} />
        <PermissionsScreen />
      </>
    );
  }

  return <Redirect href="/(tabs)/home" />;
}
