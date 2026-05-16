import { StyleSheet, View } from 'react-native';

import { theme } from '../../../shared/theme';

export function OnboardingDots({ activeIndex, count }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, activeIndex === index ? styles.activeDot : styles.inactiveDot]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 999,
    height: 7,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 22,
  },
  inactiveDot: {
    backgroundColor: theme.colors.border,
    width: 7,
  },
});
