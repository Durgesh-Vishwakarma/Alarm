import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import Animated, {
    Extrapolate,
    FadeIn,
    FadeInDown,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { setOnboardingComplete } from "../services/alarmStorage";
import { spacing, typography } from "../theme";
import { useTheme } from "../theme/ThemeContext";

const OnboardingSlide = ({ item, index, scrollX, width, theme }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(scrollX.value, inputRange, [0.6, 1, 0.6]) },
      { rotate: `${interpolate(scrollX.value, inputRange, [-30, 0, 30])}deg` },
    ],
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0]),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0]),
    transform: [{ translateY: interpolate(scrollX.value, inputRange, [40, 0, 40]) }],
  }));

  return (
    <View style={[styles.slideContainer, { width }]}>
      <Animated.View style={[styles.imageContainer, animatedIconStyle]}>
        <View style={[styles.iconHalo, { borderColor: item.color + "44", backgroundColor: theme.card }]}>
          <View style={[styles.neonRing, { borderColor: item.color, opacity: 0.3 }]} />
          <Ionicons name={item.icon} size={100} color={item.color} />
          {index === 1 && <View style={[styles.radarScan, { backgroundColor: item.color }]} />}
        </View>
      </Animated.View>

      <Animated.View style={[styles.textContainer, animatedTextStyle]}>
        <View style={[styles.slideBadge, { backgroundColor: item.color + "15" }]}>
          <Ionicons name="sparkles" size={14} color={item.color} />
          <Text style={[styles.slideBadgeText, { color: item.color }]}>{item.badge}</Text>
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{item.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
      </Animated.View>
    </View>
  );
};

const PaginationDot = ({ index, scrollX, width, theme }) => {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      width: interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolate.CLAMP),
      backgroundColor:
        scrollX.value >= (index - 0.5) * width && scrollX.value <= (index + 0.5) * width
          ? theme.textPrimary
          : theme.cardBorder,
    };
  });
  return <Animated.View style={[styles.dot, dotStyle]} />;
};

export const OnboardingScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const SLIDES = [
    {
      id: "1",
      title: "Alarms that\nfight back.",
      subtitle: "Standard alarms are easily ignored. SnapWake forces real wakefulness through reactive AI challenges.",
      icon: "flash",
      badge: "Active Engagement",
      color: theme.primary,
    },
    {
      id: "2",
      title: "Proof of\nWakefulness.",
      subtitle: "AI verifies your physical presence. The siren only stops once you complete your real-world task.",
      icon: "scan-outline",
      badge: "AI Verified",
      color: theme.primary,
    },
    {
      id: "3",
      title: "Build your\nmorning win.",
      subtitle: "Earn XP, maintain streaks, and level up. If you fail to wake up, SnapWake increases the pressure.",
      icon: "trophy",
      badge: "Gamified Growth",
      color: theme.accent,
    },
  ];

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const finishOnboarding = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setOnboardingComplete();
    router.replace("/permissions");
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      Haptics.selectionAsync();
      flatListRef.current?.scrollToOffset({ offset: (currentIndex + 1) * width, animated: true });
    } else {
      finishOnboarding();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.screenContent}>
          <Animated.View entering={FadeIn.delay(300)} style={styles.headerContainer}>
            <View style={[styles.logoPill, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Ionicons name="alarm" size={18} color={theme.primary} />
              <Text style={[styles.logoText, { color: theme.textPrimary }]}>SnapWake AI</Text>
            </View>
            <TouchableOpacity onPress={finishOnboarding}>
              <Text style={[styles.skipText, { color: theme.textMuted }]}>Skip</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.FlatList
            ref={flatListRef}
            data={SLIDES}
            renderItem={({ item, index }) => (
              <OnboardingSlide item={item} index={index} scrollX={scrollX} width={width} theme={theme} />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              if (index !== currentIndex) {
                setCurrentIndex(index);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          />

          <View style={styles.footerContainer}>
            <View style={styles.paginationContainer}>
              {SLIDES.map((slide, index) => (
                <PaginationDot key={slide.id} index={index} scrollX={scrollX} width={width} theme={theme} />
              ))}
            </View>
            <Animated.View entering={FadeInDown.duration(600).delay(400)}>
              <TouchableOpacity
                style={[styles.mainButton, { backgroundColor: theme.primary }]}
                activeOpacity={0.8}
                onPress={handleNext}
              >
                <Text style={styles.buttonText}>
                  {currentIndex === SLIDES.length - 1 ? "Wake Up Now" : "Next Challenge"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  screenContent: { flex: 1 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  logoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  logoText: {
    fontFamily: typography.family.bold,
    fontSize: 18,
    letterSpacing: 0,
  },
  skipText: {
    fontFamily: typography.family.bold,
    fontSize: 16,
    opacity: 0.6,
  },
  slideContainer: { flex: 1 },
  imageContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  iconHalo: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    ...Platform.select({ android: { elevation: 0 } }),
  },
  neonRing: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
  },
  radarScan: {
    position: "absolute",
    width: "100%",
    height: 2,
    top: "50%",
    opacity: 0.2,
  },
  textContainer: {
    flex: 0.5,
    width: "100%",
    paddingHorizontal: spacing.lg,
    justifyContent: "flex-start",
  },
  slideBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: spacing.md,
  },
  slideBadgeText: {
    fontFamily: typography.family.bold,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontFamily: typography.family.bold,
    fontSize: 40,
    marginBottom: spacing.md,
    textAlign: "left",
    lineHeight: 46,
    letterSpacing: 0,
  },
  subtitle: {
    fontFamily: typography.family.regular,
    fontSize: 18,
    lineHeight: 28,
    textAlign: "left",
    maxWidth: 320,
  },
  footerContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  dot: { height: 6, borderRadius: 3, marginRight: 8 },
  mainButton: {
    width: "100%",
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  buttonText: {
    fontFamily: typography.family.bold,
    fontSize: 19,
    color: "#FFFFFF",
  },
});
