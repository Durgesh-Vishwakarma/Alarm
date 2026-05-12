import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';
import { HomeScreen } from '../src/screens/HomeScreen';
import { checkOnboardingComplete } from '../src/services/alarmStorage';
import { colors } from '../src/theme';
import { StatusBar } from 'expo-status-bar';

/**
 * Entry Index
 * Handles persistence-based routing between Onboarding and Home.
 */
export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const completed = await checkOnboardingComplete();
        setShowOnboarding(!completed);
      } catch (_error) {
        // Fallback to onboarding if storage check fails
        setShowOnboarding(true);
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
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

  return (
    <>
      <StatusBar style="dark" />
      <HomeScreen />
    </>
  );
}
