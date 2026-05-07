import React, { useRef, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  useWindowDimensions 
} from 'react-native';
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
  },
  {
    id: '2',
    title: 'Scan to stop.',
    subtitle: 'The siren only stops when your camera verifies you have scanned your morning item.',
    imageUri: 'https://cdn-icons-png.flaticon.com/512/1036/1036503.png',
  },
  {
    id: '3',
    title: 'Build elite habits.',
    subtitle: 'Track your wake-up streaks and dominate the first hour of your day.',
    imageUri: 'https://cdn-icons-png.flaticon.com/512/3176/3176294.png',
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
        <Image source={{ uri: item.imageUri }} style={styles.image} contentFit="contain" />
      </Animated.View>

      {/* Bottom 40%: Clean, Left-Aligned Text */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );
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
          <Text style={styles.logoText}>SnapWake</Text>
          <TouchableOpacity onPress={() => router.replace('/home')}>
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
            {SLIDES.map((_, index) => {
               const dotStyle = useAnimatedStyle(() => {
                 const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                 return {
                   width: interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolate.CLAMP),
                   backgroundColor: scrollX.value >= (index - 0.5) * width && scrollX.value <= (index + 0.5) * width 
                    ? colors.primary 
                    : colors.dot,
                 };
               });
               return <Animated.View key={index} style={[styles.dot, dotStyle]} />;
            })}
          </View>

          {/* Giant Solid Button */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <TouchableOpacity 
              style={styles.mainButton} 
              activeOpacity={0.8}
              onPress={handleNext}
            >
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
    backgroundColor: colors.white 
  },
  safeArea: { 
    flex: 1 
  },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: spacing.lg, 
    marginTop: spacing.sm 
  },
  logoText: { 
    fontFamily: typography.family.extraBold,
    fontSize: 20, 
    color: colors.text.primary,
    letterSpacing: -0.5
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
    flex: 0.6, 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  image: { 
    width: '100%', 
    height: '80%', 
    tintColor: colors.primary 
  },
  textContainer: { 
    flex: 0.4, 
    width: '100%', 
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-start'
  },
  title: { 
    fontFamily: typography.family.extraBold,
    fontSize: 36, 
    color: colors.text.primary, 
    marginBottom: spacing.sm, 
    textAlign: 'left', 
    lineHeight: 40,
    letterSpacing: -1
  },
  subtitle: { 
    fontFamily: typography.family.regular,
    fontSize: 18, 
    color: colors.text.secondary, 
    lineHeight: 26, 
    textAlign: 'left',
  },
  footerContainer: { 
    paddingHorizontal: spacing.lg, 
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
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { 
    fontFamily: typography.family.bold,
    fontSize: 18, 
    color: colors.white,
  },
});
