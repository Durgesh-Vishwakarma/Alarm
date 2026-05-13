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
import { colors } from "../src/theme";

/**
 * Entry Index
 * Handles persistence-based routing between Onboarding and Home.
 */
export default function Index() {
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
        // Fallback to onboarding if storage check fails
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
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <>
        <StatusBar style="dark" />
        <OnboardingScreen />
      </>
    );
  }

  if (showPermissions) {
    return (
      <>
        <StatusBar style="dark" />
        <PermissionsScreen />
      </>
    );
  }

  return <Redirect href="/(tabs)/home" />;
}
