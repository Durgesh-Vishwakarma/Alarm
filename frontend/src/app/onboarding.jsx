import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { useRef, useState } from 'react';

import { OnboardingDots } from '../components/onboarding/OnboardingDots';
import { OnboardingSlide } from '../components/onboarding/OnboardingSlide';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { onboardingSlides } from '../data/onboardingSlides';
import { setOnboardingCompleted } from '../services/appStorage';
import { theme } from '../theme';

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const pagerRef = useRef(null);
  const [index, setIndex] = useState(0);
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

    const nextIndex = index + 1;
    pagerRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    setIndex(nextIndex);
  };

  const handleMomentumEnd = (event) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(nextIndex);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        horizontal
        onMomentumScrollEnd={handleMomentumEnd}
        pagingEnabled
        ref={pagerRef}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      >
        {onboardingSlides.map((slide) => (
          <OnboardingSlide key={slide.title} slide={slide} width={width} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <OnboardingDots activeIndex={index} count={onboardingSlides.length} />
        <PrimaryButton title={finalSlide ? 'Continue' : 'Next'} onPress={goNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.black,
    flex: 1,
  },
  footer: {
    bottom: 34,
    gap: theme.space.lg,
    left: 24,
    position: 'absolute',
    right: 24,
  },
});
