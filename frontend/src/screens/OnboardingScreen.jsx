import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  FadeInDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setOnboardingComplete } from "../services/alarmStorage";
import { tokens } from "../theme";
import { haptics } from "../services/hapticService";
import { PrimaryButton } from "../components/PrimaryButton";

const SLIDES = [
  {
    id: "1",
    bg: require("../../assets/images/onboarding/bg1.png"),
  },
  {
    id: "2",
    bg: require("../../assets/images/onboarding/bg2.png"),
  },
  {
    id: "3",
    bg: require("../../assets/images/onboarding/bg3.png"),
  },
];

const OnboardingSlide = ({ item, width }) => {
  return (
    <View style={[styles.slideContainer, { width }]}>
      <ImageBackground
        source={item.bg}
        style={StyleSheet.absoluteFillObject}
        imageStyle={styles.slideImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(2, 6, 23, 0)",
            "rgba(2, 6, 23, 0.08)",
            "rgba(2, 6, 23, 0.58)",
          ]}
          style={StyleSheet.absoluteFillObject}
          locations={[0, 0.62, 1]}
        />
      </ImageBackground>
    </View>
  );
};

export const OnboardingScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const finishOnboarding = async () => {
    haptics.success();
    await setOnboardingComplete();
    router.replace("/permissions");
  };

  const handleNext = () => {
    haptics.selection();

    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToOffset({
        offset: (currentIndex + 1) * width,
        animated: true,
      });
    } else {
      finishOnboarding();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const buttonLabel = isLast ? "Let's Go" : "Next";

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item }) => <OnboardingSlide item={item} width={width} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);

          if (idx !== currentIndex) {
            haptics.selection();
            setCurrentIndex(idx);
          }
        }}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 40) },
        ]}
      >
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => {
            const active = index === currentIndex;

            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  active ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            );
          })}
        </View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(
            tokens.animation.duration.normal
          )}
          style={[
            styles.buttonContainer,
            isLast ? styles.buttonGlowSuccess : styles.buttonGlow,
          ]}
        >
          <PrimaryButton
            label={buttonLabel}
            onPress={handleNext}
            icon={isLast ? "checkmark" : "arrow-forward"}
            variant={isLast ? "primary" : "primary"}
            style={styles.button}
            hapticOnPress="none"
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },

  slideContainer: {
    flex: 1,
  },

  slideImage: {
    backgroundColor: "#020617",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: tokens.spacing.giant,
    alignItems: "center",
  },

  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.xl,
    gap: 8,
  },

  dot: {
    height: 8,
    borderRadius: 999,
  },

  activeDot: {
    width: 24,
    backgroundColor: tokens.colors.primary,
  },

  inactiveDot: {
    width: 8,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },

  buttonContainer: {
    width: "100%",
  },

  button: {
    borderRadius: tokens.radius.xl,
  },

  buttonGlow: {
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },

  buttonGlowSuccess: {
    shadowColor: tokens.colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
});