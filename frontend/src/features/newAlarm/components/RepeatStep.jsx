import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';
import { dayOptions, repeatPresets } from '../data';
import { formatDays } from '../utils';
import { SectionTitle } from './FormPrimitives';

export function RepeatStep({ draft, updateDraft }) {
  const toggleDay = (day) => {
    const daySet = new Set(draft.days);
    if (daySet.has(day)) {
      daySet.delete(day);
    } else {
      daySet.add(day);
    }

    const nextDays = dayOptions.filter((option) => daySet.has(option));
    updateDraft({
      days: nextDays,
      repeatPreset: presetFromDays(nextDays),
    });
  };

  const cyclePreset = () => {
    const presets = Object.keys(repeatPresets);
    const currentIndex = presets.indexOf(draft.repeatPreset);
    const nextPreset = presets[(currentIndex + 1) % presets.length];
    updateDraft({ repeatPreset: nextPreset, days: repeatPresets[nextPreset] });
  };

  return (
    <View>
      <SectionTitle
        title="When should it repeat?"
        subtitle="Choose the days for your alarm"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change repeat preset"
        onPress={cyclePreset}
        style={({ pressed }) => [styles.dropdown, pressed && styles.pressed]}
      >
        <View style={styles.dropdownIcon}>
          <Ionicons name="calendar" size={20} color={theme.colors.text} />
        </View>
        <Text style={styles.dropdownText}>{draft.repeatPreset}</Text>
        <Ionicons name="chevron-down" size={20} color={theme.colors.text} />
      </Pressable>

      <View style={styles.dayGrid}>
        {dayOptions.map((day) => {
          const selected = draft.days.includes(day);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={day}
              key={day}
              onPress={() => toggleDay(day)}
              style={({ pressed }) => [
                styles.day,
                selected && styles.daySelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>{day}</Text>
            </Pressable>
          );
        })}
      </View>

      <LinearGradient colors={['#FFF7ED', '#FFEAD5']} style={styles.tipCard}>
        <View style={styles.calendarArt}>
          <Ionicons name="calendar" size={62} color={theme.colors.primary} />
          <View style={styles.clockBadge}>
            <Ionicons name="time" size={24} color={theme.colors.white} />
          </View>
        </View>
        <Text style={styles.tipTitle}>Consistency is key!</Text>
        <Text style={styles.tipCopy}>
          Repeating on {draft.repeatPreset.toLowerCase()} helps build better morning habits.
        </Text>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </LinearGradient>

      <Text style={styles.previewTitle}>Preview</Text>
      <View style={styles.previewCard}>
        <Text style={styles.previewTime}>
          {String(draft.hour).padStart(2, '0')}:{String(draft.minute).padStart(2, '0')}{' '}
          <Text style={styles.previewPeriod}>{draft.period}</Text>
        </Text>
        <Text style={styles.previewMeta}>{draft.repeatPreset}</Text>
        <Text style={styles.previewDays}>{formatDays(draft.days)}</Text>
      </View>
    </View>
  );
}

function presetFromDays(days) {
  const key = Object.entries(repeatPresets).find(
    ([, presetDays]) => presetDays.length === days.length && presetDays.every((day) => days.includes(day)),
  )?.[0];

  return key ?? 'Custom';
}

const styles = StyleSheet.create({
  dropdown: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    height: 60,
    marginBottom: theme.space.xl,
    paddingHorizontal: theme.space.lg,
    ...theme.shadows.soft,
  },
  dropdownIcon: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    marginRight: theme.space.md,
    width: 34,
  },
  dropdownText: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.headingSemiBold,
    fontSize: theme.fontSizes.md,
  },
  dayGrid: {
    columnGap: theme.space.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: theme.space.xxl,
    rowGap: theme.space.lg,
  },
  day: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  daySelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    ...theme.shadows.glow,
  },
  dayLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.sm,
  },
  dayLabelSelected: {
    color: theme.colors.white,
  },
  tipCard: {
    alignItems: 'center',
    borderRadius: theme.radii.xl,
    minHeight: 260,
    padding: theme.space.xxl,
  },
  calendarArt: {
    marginBottom: theme.space.xl,
    position: 'relative',
  },
  clockBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.white,
    borderRadius: theme.radii.full,
    borderWidth: 4,
    bottom: -8,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: -20,
    width: 44,
  },
  tipTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.lg,
    marginBottom: theme.space.sm,
    textAlign: 'center',
  },
  tipCopy: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.sm,
    lineHeight: 21,
    maxWidth: 250,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: theme.space.sm,
    marginTop: theme.space.xl,
  },
  dot: {
    backgroundColor: '#FFD9BA',
    borderRadius: theme.radii.full,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
  previewTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.md,
    marginBottom: theme.space.md,
    marginTop: theme.space.xxl,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    padding: theme.space.xl,
    ...theme.shadows.soft,
  },
  previewTime: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 34,
  },
  previewPeriod: {
    fontSize: theme.fontSizes.md,
  },
  previewMeta: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.space.xs,
  },
  previewDays: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.space.sm,
  },
  pressed: {
    opacity: 0.68,
  },
});
