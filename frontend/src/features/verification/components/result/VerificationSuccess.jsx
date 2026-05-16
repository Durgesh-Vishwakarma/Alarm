import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../../../shared/components/PrimaryButton';
import { theme } from '../../../../shared/theme';

export function VerificationSuccess({ message, onHomePress }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark" size={42} color={theme.colors.success} />
      </View>
      <Text style={styles.title}>Verification complete</Text>
      <Text style={styles.body}>{message || 'Alarm dismissed successfully.'}</Text>
      <Text style={styles.caption}>Returning home in 10 seconds.</Text>
      <PrimaryButton onPress={onHomePress} style={styles.button} title="Go Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(21, 176, 113, 0.12)',
    borderRadius: theme.radii.full,
    height: 86,
    justifyContent: 'center',
    marginBottom: theme.space.lg,
    width: 86,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 17,
  },
  body: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: theme.space.sm,
    textAlign: 'center',
  },
  caption: {
    color: theme.colors.textLight,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    marginTop: theme.space.md,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.space.xl,
    minWidth: 180,
    paddingHorizontal: theme.space.xl,
  },
});
