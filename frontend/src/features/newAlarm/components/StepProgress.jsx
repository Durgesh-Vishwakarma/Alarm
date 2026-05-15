import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';
import { steps } from '../data';

export function StepProgress({ currentStep, onStepPress }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.line} />
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;
        const filled = isActive || isDone;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Go to ${step.label}`}
            key={step.key}
            onPress={() => onStepPress(index)}
            style={({ pressed }) => [styles.step, pressed && styles.pressed]}
          >
            <View style={[styles.circle, filled && styles.circleActive]}>
              <Ionicons
                name={isDone ? 'checkmark' : step.icon}
                size={18}
                color={filled ? theme.colors.white : theme.colors.textLight}
              />
            </View>
            <Text style={[styles.label, filled && styles.labelActive]}>{step.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.space.xxl,
    marginTop: theme.space.xl,
    position: 'relative',
  },
  line: {
    backgroundColor: theme.colors.border,
    height: 2,
    left: 26,
    position: 'absolute',
    right: 26,
    top: 20,
  },
  step: {
    alignItems: 'center',
    flex: 1,
    gap: theme.space.xs,
  },
  circle: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.full,
    borderWidth: 2,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  circleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  label: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.xs,
  },
  labelActive: {
    color: theme.colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});
