import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';

export function FooterActions({ currentStep, isLastStep, onBack, onContinue }) {
  return (
    <View style={styles.footer}>
      {currentStep > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isLastStep ? 'Save alarm' : 'Continue'}
        onPress={onContinue}
        style={({ pressed }) => [
          styles.primaryButton,
          currentStep === 0 && styles.primaryButtonFull,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.primaryText}>{isLastStep ? 'Save Alarm' : 'Continue'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: theme.colors.background,
    bottom: 0,
    flexDirection: 'row',
    gap: theme.space.lg,
    left: 0,
    paddingBottom: theme.space.xl,
    paddingHorizontal: 22,
    paddingTop: theme.space.md,
    position: 'absolute',
    right: 0,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    flex: 0.8,
    height: 60,
    justifyContent: 'center',
    ...theme.shadows.soft,
  },
  backText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.md,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    flex: 1.2,
    height: 60,
    justifyContent: 'center',
    ...theme.shadows.glow,
  },
  primaryButtonFull: {
    flex: 1,
  },
  primaryText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.md,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});
