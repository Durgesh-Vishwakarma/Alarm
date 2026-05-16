import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';
import { ringtoneOptions } from '../data';
import { playRingtonePreview } from '../services/ringtonePreview';
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

      <View style={styles.vibrationRow}>
        <View style={styles.vibrationIcon}>
          <Ionicons
            name={draft.vibration ? 'phone-portrait' : 'phone-portrait-outline'}
            size={19}
            color={draft.vibration ? theme.colors.primary : theme.colors.textMuted}
          />
        </View>
        <View style={styles.vibrationCopy}>
          <Text style={styles.vibrationTitle}>Vibration</Text>
          <Text style={styles.vibrationSubtitle}>Vibrate while the alarm is ringing.</Text>
        </View>
        <Switch
          ios_backgroundColor="#E3E8EF"
          onValueChange={(vibration) => updateDraft({ vibration })}
          thumbColor={theme.colors.white}
          trackColor={{ false: '#E3E8EF', true: theme.colors.primary }}
          value={draft.vibration}
        />
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
    backgroundColor: theme.colors.primarySoft,
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
    fontSize: 12,
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
  vibrationRow: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.space.md,
    marginTop: theme.space.sm,
    minHeight: 66,
    paddingHorizontal: theme.space.md,
    ...theme.shadows.soft,
  },
  vibrationIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radii.full,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  vibrationCopy: {
    flex: 1,
    minWidth: 0,
  },
  vibrationTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
  },
  vibrationSubtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.7,
  },
});
