import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';

export function OnboardingSlide({ slide, width }) {
  return (
    <View style={[styles.slide, { width }]}>
      <ImageBackground
        resizeMode="cover"
        source={slide.image}
        style={styles.image}
      >
        <LinearGradient
          colors={['rgba(5, 12, 26, 0)', 'rgba(5, 12, 26, 0.04)', 'rgba(5, 12, 26, 0.62)']}
          locations={[0, 0.52, 1]}
          style={styles.overlay}
        >
          <View style={styles.copy}>
            <View style={styles.eyebrowPill}>
              <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    backgroundColor: theme.colors.black,
    flex: 1,
  },
  image: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 140,
    paddingHorizontal: 24,
  },
  copy: {
    gap: 10,
  },
  eyebrowPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: theme.radii.full,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: 27,
    lineHeight: 34,
  },
  body: {
    color: 'rgba(255, 255, 255, 0.94)',
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
  },
});
