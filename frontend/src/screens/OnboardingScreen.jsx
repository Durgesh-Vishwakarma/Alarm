import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View, ImageBackground, Pressable } from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  FadeInDown,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { setOnboardingComplete, setPermissionsComplete } from "../services/alarmStorage";
import { tokens, typography } from "../theme";
import { haptics } from "../services/hapticService";
import { GlassCard } from "../components/GlassCard";

const OnboardingSlide = ({ item, index, scrollX, width }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0]),
    transform: [{ translateY: interpolate(scrollX.value, inputRange, [40, 0, 40]) }],
  }));

  return (
    <View style={[styles.slideContainer, { width }]}>
      <ImageBackground 
        source={item.bg} 
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(2, 6, 23, 0.15)", "rgba(2, 6, 23, 0.45)", "rgba(2, 6, 23, 0.88)"]}
          style={StyleSheet.absoluteFillObject}
          locations={[0, 0.45, 1]}
        />
      </ImageBackground>

      <SafeAreaView style={styles.content}>
        <Animated.View style={[styles.textContainer, animatedTextStyle]}>
          <Text style={[styles.title, { color: tokens.colors.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.subtitle, { color: "rgba(248, 250, 252, 0.7)" }]}>{item.subtitle}</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export const OnboardingScreen = () => {
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const SLIDES = [
    {
      id: "1",
      title: "Wake up\nwith purpose.",
      subtitle: "AI-powered challenges that make mornings count.",
      bg: require("../../assets/images/onboarding/bg1.jpg"),
    },
    {
      id: "2",
      title: "AI verifies\nyour proof.",
      subtitle: "Complete challenges — verified with your camera.",
      bg: require("../../assets/images/onboarding/bg2.jpg"),
    },
    {
      id: "3",
      title: "Built for\nconsistency.",
      subtitle: "Strong habits. Better streaks. A better you.",
      bg: require("../../assets/images/onboarding/bg3.jpg"),
    },
  ];

  const scrollHandler = useAnimatedScrollHandler((e) => { scrollX.value = e.contentOffset.x; });

  const finishOnboarding = async () => {
    haptics.success();
    await setOnboardingComplete();
    router.replace("/permissions");
  };

  const skipAll = async () => {
    haptics.selection();
    await setOnboardingComplete();
    await setPermissionsComplete();
    router.replace("/(tabs)/home");
  };

  const handleNext = () => {
    haptics.selection();
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToOffset({ offset: (currentIndex + 1) * width, animated: true });
    } else {
      finishOnboarding();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const buttonLabel = isLast ? "Let's Go" : "Next";

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item, index }) => (
          <OnboardingSlide item={item} index={index} scrollX={scrollX} width={width} />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        onScroll={scrollHandler}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          if (idx !== currentIndex) {
            haptics.selection();
            setCurrentIndex(idx);
          }
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: currentIndex === i ? tokens.colors.primary : "rgba(255,255,255,0.2)",
                  width: currentIndex === i ? 14 : 3,
                  opacity: currentIndex === i ? 1 : 0.45,
                },
              ]}
            />
          ))}
        </View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(tokens.animation.duration.normal)}
          style={[styles.buttonContainer, isLast ? styles.buttonGlowSuccess : styles.buttonGlow]}
        >
          <GlassCard onPress={handleNext} style={styles.buttonWrapper} containerStyle={styles.blurButton}>
            <LinearGradient
              colors={
                isLast
                  ? ["rgba(16, 185, 129, 0.45)", "rgba(5, 150, 105, 0.15)"]
                  : ["rgba(255, 140, 56, 0.45)", "rgba(255, 106, 0, 0.12)"]
              }
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </GlassCard>
        </Animated.View>

        <Pressable onPress={skipAll} style={styles.skipWrap} hitSlop={14}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  slideContainer: { flex: 1 },
  content: { flex: 1, justifyContent: "flex-end", paddingBottom: 160 },
  textContainer: { paddingHorizontal: tokens.spacing.giant },
  title: {
    fontFamily: typography.family.hero,
    fontSize: 46,
    lineHeight: 50,
    marginBottom: tokens.spacing.md,
    letterSpacing: -1.8,
  },
  subtitle: {
    fontFamily: typography.family.regular,
    fontSize: tokens.typography.size.body,
    lineHeight: tokens.typography.size.body * 1.45,
    opacity: 0.82,
    maxWidth: "90%",
  },
  footer: { 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    paddingHorizontal: tokens.spacing.giant, 
    paddingBottom: tokens.spacing.massive,
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    marginBottom: 36,
    alignItems: "center",
    gap: 5,
  },
  dot: {
    height: 3,
    borderRadius: 2,
  },
  buttonContainer: {
    width: "100%",
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
  buttonWrapper: { 
    width: "100%", 
    height: 64, 
    borderRadius: 32, 
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  blurButton: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
  },
  buttonText: { 
    fontFamily: typography.family.card, 
    fontSize: tokens.typography.size.card, 
    color: "#FFF",
    letterSpacing: 0.5,
  },
  skipWrap: {
    marginTop: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
  },
  skipText: {
    fontFamily: typography.family.metadata,
    fontSize: tokens.typography.size.body,
    color: "rgba(248, 250, 252, 0.55)",
  },
});
