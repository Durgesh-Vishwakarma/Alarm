import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { theme } from '../../../theme';
import { challenges } from '../data';
import { SectionTitle } from './FormPrimitives';

export function ChallengeStep({ draft, updateDraft }) {
  const selectChallenge = (challenge) => {
    updateDraft({ challengeId: challenge.id });
  };

  return (
    <View>
      <SectionTitle
        title="What challenge will wake you up?"
        subtitle="Select a challenge to complete to stop your alarm."
      />

      <View style={styles.list}>
        {challenges.map((challenge) => {
          const selected = draft.challengeId === challenge.id;
          const isCustom = challenge.id === 'custom-challenge';
          const title =
            isCustom && draft.customChallengeTitle?.trim()
              ? draft.customChallengeTitle
              : challenge.title;
          const description =
            isCustom && draft.customChallengeDescription?.trim()
              ? draft.customChallengeDescription
              : challenge.description;

          return (
            <View key={challenge.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={title}
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
                  <Text style={styles.title}>{title}</Text>
                  <Text style={styles.description}>{description}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? (
                    <Ionicons name="checkmark" size={18} color={theme.colors.white} />
                  ) : null}
                </View>
              </Pressable>

              {selected && isCustom ? (
                <View style={styles.customEditor}>
                  <Text style={styles.editorLabel}>Challenge name</Text>
                  <TextInput
                    accessibilityLabel="Custom challenge name"
                    onChangeText={(customChallengeTitle) =>
                      updateDraft({ customChallengeTitle })
                    }
                    placeholder="Example: Drink a glass of water"
                    placeholderTextColor={theme.colors.textLight}
                    style={styles.input}
                    value={draft.customChallengeTitle}
                  />

                  <Text style={styles.editorLabel}>What should you do?</Text>
                  <TextInput
                    accessibilityLabel="Custom challenge description"
                    multiline
                    onChangeText={(customChallengeDescription) =>
                      updateDraft({ customChallengeDescription })
                    }
                    placeholder="Write the action needed to stop the alarm"
                    placeholderTextColor={theme.colors.textLight}
                    style={[styles.input, styles.textArea]}
                    textAlignVertical="top"
                    value={draft.customChallengeDescription}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <LinearGradient colors={['#FFF5EB', '#FFEAD9']} style={styles.tip}>
        <Ionicons name="trophy" size={31} color={theme.colors.primary} />
        <View style={styles.tipCopy}>
          <Text style={styles.tipTitle}>Stay consistent, stay unstoppable!</Text>
          <Text style={styles.tipText}>Challenges help you build powerful morning routines.</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.space.lg,
  },
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 114,
    padding: theme.space.lg,
    ...theme.shadows.soft,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: theme.radii.md,
    height: 78,
    justifyContent: 'center',
    marginRight: theme.space.lg,
    width: 78,
  },
  copy: {
    flex: 1,
    gap: theme.space.xs,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.md,
  },
  description: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.sm,
    lineHeight: 20,
  },
  radio: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radii.full,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    marginLeft: theme.space.md,
    width: 28,
  },
  radioSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tip: {
    alignItems: 'center',
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    gap: theme.space.lg,
    marginTop: theme.space.xxl,
    padding: theme.space.xl,
  },
  tipCopy: {
    flex: 1,
    gap: theme.space.xs,
  },
  tipTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.sm,
  },
  tipText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.sm,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.68,
  },
  customEditor: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    gap: theme.space.sm,
    marginTop: theme.space.md,
    padding: theme.space.lg,
    ...theme.shadows.soft,
  },
  editorLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.xs,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.md,
    minHeight: 48,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
  },
  textArea: {
    minHeight: 86,
  },
});
