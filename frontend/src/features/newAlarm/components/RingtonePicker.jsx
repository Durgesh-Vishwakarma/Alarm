import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';
import { ringtoneOptions } from '../data';
import { playRingtonePreview } from '../ringtonePreview';
import { SectionTitle } from './FormPrimitives';

export function RingtonePicker({ draft, updateDraft }) {
  const selectRingtone = async (option) => {
    updateDraft({ sound: option.label });
    await playRingtonePreview(option.label);
  };

  return (
    <View>
      <SectionTitle title="Ringtone" subtitle="Tap a tone to preview it." />
      <View style={styles.list}>
        {ringtoneOptions.map((option) => {
          const selected = draft.sound === option.label;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Select ${option.label}`}
              key={option.id}
              onPress={() => selectRingtone(option)}
              style={({ pressed }) => [
                styles.row,
                selected && styles.rowSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={selected ? 'volume-high' : 'musical-notes-outline'}
                  size={22}
                  color={selected ? theme.colors.primary : theme.colors.textMuted}
                />
              </View>
              <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
              {selected ? (
                <View style={styles.check}>
                  <Ionicons name="checkmark" size={16} color={theme.colors.white} />
                </View>
              ) : null}
            </Pressable>
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
  row: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: theme.space.md,
    ...theme.shadows.soft,
  },
  rowSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.full,
    height: 34,
    justifyContent: 'center',
    marginRight: theme.space.md,
    width: 34,
  },
  label: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
  },
  labelSelected: {
    color: theme.colors.primary,
  },
  check: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  pressed: {
    opacity: 0.7,
  },
});
