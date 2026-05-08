import React, { useRef, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  useWindowDimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  interpolate, 
  Extrapolate,
  FadeInDown
} from 'react-native-reanimated';
import { typography, spacing, colors } from '../theme';

const SLIDES = [
  {
    id: '1',
    title: 'Never oversleep again.',
    subtitle: 'Standard alarms are easily ignored. SnapWake forces you to get out of bed.',
    imageUri: 'https://cdn-icons-png.flaticon.com/512/3240/3240632.png',
    badge: 'Smart alarms',
  },
  {
    id: '2',
    title: 'Scan to stop.',
    subtitle: 'The siren only stops when your camera verifies you have scanned your morning item.',
    imageUri: 'https://cdn-icons-png.flaticon.com/512/1036/1036503.png',
    badge: 'Live AI checks',
  },
  {
    id: '3',
    title: 'Build elite habits.',
    subtitle: 'Track your wake-up streaks and dominate the first hour of your day.',
    imageUri: 'https://cdn-icons-png.flaticon.com/512/3176/3176294.png',
    badge: 'Habit momentum',
  }
];

// Sub-component to handle hooks correctly for each slide
const OnboardingSlide = ({ item, index, scrollX, width }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(scrollX.value, inputRange, [-width * 0.2, 0, width * 0.2]) },
    ],
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0]),
  }));

  return (
    <View style={[styles.slideContainer, { width }]}>
      {/* Top 60%: Massive Image Area */}
      <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
        <View style={styles.imageHalo}>
          <Image source={{ uri: item.imageUri }} style={styles.image} contentFit="contain" />
        </View>
      </Animated.View>

      <View style={styles.textContainer}>
        <View style={styles.slideBadge}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={styles.slideBadgeText}>{item.badge}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );
};

const PaginationDot = ({ index, scrollX, width }) => {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      width: interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolate.CLAMP),
      backgroundColor:
        scrollX.value >= (index - 0.5) * width && scrollX.value <= (index + 0.5) * width
          ? colors.primary
          : colors.dot,
    };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
};

export const OnboardingScreen = () => {
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      Haptics.selectionAsync();
      flatListRef.current?.scrollToOffset({ 
        offset: (currentIndex + 1) * width, 
        animated: true 
      });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/home'); 
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Clean, simple header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoPill}>
            <Ionicons name="alarm" size={18} color={colors.primary} />
            <Text style={styles.logoText}>SnapWake</Text>
          </View>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Animated.FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={({ item, index }) => (
            <OnboardingSlide item={item} index={index} scrollX={scrollX} width={width} />
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
          {/* Flat Pagination Dots */}
          <View style={styles.paginationContainer}>
            {SLIDES.map((slide, index) => (
              <PaginationDot key={slide.id} index={index} scrollX={scrollX} width={width} />
            ))}
          </View>

          {/* Giant Solid Button */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <TouchableOpacity 
              style={styles.mainButton} 
              activeOpacity={0.8}
              onPress={handleNext}
            >
              <Ionicons name={currentIndex === SLIDES.length - 1 ? 'arrow-forward' : 'chevron-forward'} size={20} color={colors.white} />
              <Text style={styles.buttonText}>
                {currentIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background
  },
  safeArea: { 
    flex: 1 
  },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm 
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoText: { 
    fontFamily: typography.family.extraBold,
    fontSize: 20, 
    color: colors.text.primary,
    letterSpacing: 0
  },
  skipText: {
    fontFamily: typography.family.bold,
    fontSize: 16,
    color: colors.text.secondary,
  },
  slideContainer: { 
    flex: 1, 
  },
  imageContainer: {
    flex: 0.55,
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  imageHalo: {
    width: '88%',
    aspectRatio: 1,
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3E4E5',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  image: { 
    width: '72%',
    height: '72%',
    tintColor: colors.primary 
  },
  textContainer: { 
    flex: 0.45,
    width: '100%', 
    paddingHorizontal: spacing.md,
    justifyContent: 'flex-start'
  },
  slideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: spacing.sm,
  },
  slideBadgeText: { fontFamily: typography.family.bold, fontSize: 12, color: colors.primary },
  title: { 
    fontFamily: typography.family.extraBold,
    fontSize: 34,
    color: colors.text.primary, 
    marginBottom: spacing.sm, 
    textAlign: 'left', 
    lineHeight: 40,
    letterSpacing: 0
  },
  subtitle: { 
    fontFamily: typography.family.regular,
    fontSize: 17,
    color: colors.text.secondary, 
    lineHeight: 26, 
    textAlign: 'left',
  },
  footerContainer: { 
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl 
  },
  paginationContainer: { 
    flexDirection: 'row', 
    justifyContent: 'flex-start', 
    marginBottom: spacing.xl 
  },
  dot: { 
    height: 8, 
    borderRadius: 4, 
    marginRight: 6 
  },
  mainButton: {
    backgroundColor: colors.primary,
    width: '100%',
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 5,
  },
  buttonText: { 
    fontFamily: typography.family.bold,
    fontSize: 18, 
    color: colors.white,
  },
});
