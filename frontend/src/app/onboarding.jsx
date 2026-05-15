import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

import { OnboardingDots } from '../components/onboarding/OnboardingDots';
import { OnboardingSlide } from '../components/onboarding/OnboardingSlide';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { Screen } from '../components/ui/Screen';
import { onboardingSlides } from '../data/onboardingSlides';
import { setOnboardingCompleted } from '../services/appStorage';
import { theme } from '../theme';

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const activeSlide = onboardingSlides[index];
  const finalSlide = index === onboardingSlides.length - 1;

  const completeOnboarding = async () => {
    await setOnboardingCompleted(true);
    router.replace('/permissions');
  };

  const goNext = () => {
    if (finalSlide) {
      completeOnboarding();
      return;
    }

    setIndex((current) => current + 1);
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>Snapwake</Text>
        <Pressable accessibilityRole="button" onPress={completeOnboarding} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.middle}>
        <OnboardingSlide slide={activeSlide} />
      </View>

      <View style={styles.footer}>
        <OnboardingDots activeIndex={index} count={onboardingSlides.length} />
        <PrimaryButton title={finalSlide ? 'Continue' : 'Next'} onPress={goNext} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'space-between',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brand: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 17,
  },
  skip: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
  },
  middle: {
    justifyContent: 'center',
  },
  footer: {
    gap: theme.space.xl,
    paddingBottom: theme.space.lg,
  },
});
