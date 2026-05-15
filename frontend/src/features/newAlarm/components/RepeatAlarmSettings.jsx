import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';
import { dayOptions, repeatPresets } from '../data';
import { SectionTitle } from './FormPrimitives';

export function RepeatAlarmSettings({ draft, updateDraft }) {
  const ringOnce = draft.repeatPreset === 'Once' || draft.days.length === 0;

  const setRingOnce = () => {
    updateDraft({ days: [], repeatPreset: 'Once' });
  };

  const setSelectedDays = () => {
    updateDraft({
      days: draft.days.length > 0 ? draft.days : repeatPresets.Weekdays,
      repeatPreset: draft.days.length > 0 ? draft.repeatPreset : 'Weekdays',
    });
  };

  const toggleDay = (day) => {
    const selected = draft.days.includes(day);
    const nextDays = selected
      ? draft.days.filter((item) => item !== day)
      : [...draft.days, dayOptions.find((item) => item === day)].filter(Boolean);

    updateDraft({
      days: nextDays,
      repeatPreset: nextDays.length === 0 ? 'Once' : 'Custom',
    });
  };

  return (
    <View>
      <SectionTitle
        title="Repeat"
        subtitle="Ring once or choose the days this alarm should repeat."
      />

      <View style={styles.card}>
        <View style={styles.modeRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ring once"
            onPress={setRingOnce}
            style={({ pressed }) => [
              styles.modeButton,
              ringOnce && styles.modeButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="radio-button-on"
              size={15}
              color={ringOnce ? theme.colors.white : theme.colors.textMuted}
            />
            <Text style={[styles.modeText, ringOnce && styles.modeTextActive]}>Ring once</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select repeat days"
            onPress={setSelectedDays}
            style={({ pressed }) => [
              styles.modeButton,
              !ringOnce && styles.modeButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={15}
              color={!ringOnce ? theme.colors.white : theme.colors.textMuted}
            />
            <Text style={[styles.modeText, !ringOnce && styles.modeTextActive]}>Select days</Text>
          </Pressable>
        </View>

        {!ringOnce ? (
          <View style={styles.dayRow}>
            {dayOptions.map((day) => {
              const selected = draft.days.includes(day);

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Repeat on ${day}`}
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={({ pressed }) => [
                    styles.dayChip,
                    selected && styles.dayChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.dayText, selected && styles.dayTextActive]}>{day}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    padding: theme.space.md,
    ...theme.shadows.soft,
  },
  modeRow: {
    flexDirection: 'row',
    gap: theme.space.sm,
  },
  modeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.full,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    height: 42,
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  modeText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
  },
  modeTextActive: {
    color: theme.colors.white,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space.sm,
    marginTop: theme.space.md,
  },
  dayChip: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: theme.space.md,
  },
  dayChipActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  dayText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
  },
  dayTextActive: {
    color: theme.colors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});
