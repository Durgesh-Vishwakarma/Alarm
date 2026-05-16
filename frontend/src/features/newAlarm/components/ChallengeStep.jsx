import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';
import { challenges } from '../data';
import { SectionTitle } from './FormPrimitives';

export function ChallengeStep({ draft, updateDraft }) {
  const selectChallenge = (challenge) => {
    updateDraft({ challengeId: challenge.id });
  };
  const visibleChallenges = challenges.filter((challenge) => challenge.id !== 'custom-challenge');

  return (
    <View>
      <SectionTitle
        title="What challenge will wake you up?"
        subtitle="Select a challenge to complete to stop your alarm."
      />

      <View style={styles.list}>
        {visibleChallenges.map((challenge) => {
          const selected = draft.challengeId === challenge.id;

          return (
            <View key={challenge.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={challenge.title}
                onPress={() => selectChallenge(challenge)}
                style={({ pressed }) => [
                  styles.card,
                  selected && styles.cardSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: challenge.backgroundColor }]}>
                  <Ionicons name={challenge.icon} size={42} color={challenge.iconColor} />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.title}>{challenge.title}</Text>
                  <Text style={styles.description}>{challenge.description}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? (
                    <Ionicons name="checkmark" size={18} color={theme.colors.white} />
                  ) : null}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>

     
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.space.sm,
  },
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 82,
    padding: theme.space.sm,
    ...theme.shadows.soft,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: theme.radii.sm,
    height: 54,
    justifyContent: 'center',
    marginRight: theme.space.md,
    width: 54,
  },
  copy: {
    flex: 1,
    gap: theme.space.xs,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 13,
  },
  description: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.xs,
    lineHeight: 16,
  },
  radio: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radii.full,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginLeft: theme.space.md,
    width: 24,
  },
  radioSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tip: {
    alignItems: 'center',
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    gap: theme.space.md,
    marginTop: theme.space.md,
    padding: theme.space.md,
  },
  tipCopy: {
    flex: 1,
    gap: theme.space.xs,
  },
  tipTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 13,
  },
  tipText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.xs,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.68,
  },
});
