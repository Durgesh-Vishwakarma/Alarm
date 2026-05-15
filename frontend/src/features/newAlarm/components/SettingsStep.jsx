import { Ionicons } from '@expo/vector-icons';
import { PanResponder, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useRef } from 'react';

import { theme } from '../../../theme';
import { cycleValue } from '../utils';
import { SectionTitle, SettingRow, ToggleRow } from './FormPrimitives';
import { PreviewCard } from './PreviewCard';

const snoozeValues = [5, 10, 15, 20];
const sounds = ['Bright Morning', 'Soft Chime', 'Neon Alarm'];

function LabelInputRow({ value, onChangeText }) {
  return (
    <View style={styles.labelInputRow}>
      <Text style={styles.inputLabel}>Label (Optional)</Text>
      <TextInput
        accessibilityLabel="Alarm label"
        onChangeText={onChangeText}
        placeholder="Morning Routine"
        placeholderTextColor={theme.colors.textLight}
        returnKeyType="done"
        style={styles.labelInput}
        value={value}
      />
    </View>
  );
}

function VolumeSlider({ value, onValueChange }) {
  const trackWidthRef = useRef(1);

  const updateFromX = (x) => {
    const width = trackWidthRef.current || 1;
    const boundedX = Math.max(0, Math.min(width, x));
    const nextValue = Math.round((boundedX / width) * 100);
    onValueChange(nextValue);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => updateFromX(event.nativeEvent.locationX),
      onPanResponderMove: (event) => {
        updateFromX(event.nativeEvent.locationX);
      },
    }),
  ).current;

  const fillWidth = `${value}%`;

  return (
    <View style={styles.volumeRow}>
      <Ionicons name="volume-medium" size={19} color={theme.colors.textMuted} />
      <View
        accessibilityLabel="Alarm volume slider"
        accessibilityRole="adjustable"
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          trackWidthRef.current = width;
        }}
        style={styles.volumeTrack}
        {...panResponder.panHandlers}
      >
        <View style={[styles.volumeFill, { width: fillWidth }]} />
        <View style={[styles.volumeKnob, { left: fillWidth }]} />
      </View>
      <Text style={styles.volumeValue}>{value}%</Text>
    </View>
  );
}

export function SettingsStep({ draft, selectedChallenge, updateDraft }) {
  return (
    <View>
      <View style={styles.columns}>
        <View style={styles.column}>
          <SectionTitle title="Alarm Settings" />
          <View style={styles.card}>
            <LabelInputRow
              onChangeText={(label) => updateDraft({ label })}
              value={draft.label}
            />
            <SettingRow
              label="Snooze"
              value={`${draft.snooze} minutes`}
              onPress={() => updateDraft({ snooze: cycleValue(draft.snooze, snoozeValues) })}
            />
            <SettingRow
              label="Sound"
              value={draft.sound}
              onPress={() => updateDraft({ sound: cycleValue(draft.sound, sounds) })}
            />
            <ToggleRow
              label="Vibration"
              value={draft.vibration}
              onValueChange={(vibration) => updateDraft({ vibration })}
            />
            <SettingRow
              label="Notification"
              value={draft.notification ? 'On' : 'Off'}
              onPress={() => updateDraft({ notification: !draft.notification })}
            />
          </View>
        </View>

        <View style={styles.column}>
          <SectionTitle title="Smart Wake" />
          <View style={styles.smartCard}>
            <View style={styles.smartTop}>
              <View style={styles.soundIcon}>
                <Ionicons name="pulse" size={24} color={theme.colors.textMuted} />
              </View>
              <Switch
                value={draft.smartWake}
                onValueChange={(smartWake) => updateDraft({ smartWake })}
                trackColor={{ false: '#E3E8EF', true: theme.colors.primary }}
                thumbColor={theme.colors.white}
                ios_backgroundColor="#E3E8EF"
              />
            </View>
            <Text style={styles.smartText}>
              Wake up within {draft.snooze} min before your alarm for a lighter start.
            </Text>
          </View>

          <Text style={styles.volumeLabel}>Alarm Volume</Text>
          <VolumeSlider
            onValueChange={(volume) => updateDraft({ volume })}
            value={draft.volume}
          />
        </View>

        <View style={styles.column}>
          <SectionTitle title="Preview" />
          <PreviewCard
            draft={draft}
            selectedChallenge={selectedChallenge}
            onToggleEnabled={(notification) => updateDraft({ notification })}
          />
          <View style={styles.miniGrid}>
            <View style={styles.miniCard}>
              <Ionicons name="pulse" size={23} color={theme.colors.text} />
              <Text style={styles.miniTitle}>Smart Wake</Text>
              <Text style={styles.miniMeta}>{draft.snooze} min before</Text>
            </View>
            <View style={styles.miniCard}>
              <Ionicons name="bed-outline" size={23} color={theme.colors.text} />
              <Text style={styles.miniTitle}>Snooze</Text>
              <Text style={styles.miniMeta}>{draft.snooze} minutes</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  columns: {
    gap: theme.space.xl,
  },
  column: {
    gap: theme.space.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  labelInputRow: {
    borderBottomColor: theme.colors.borderSoft,
    borderBottomWidth: 1,
    gap: theme.space.sm,
    minHeight: 74,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
  },
  inputLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.sm,
  },
  labelInput: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.sm,
    padding: 0,
  },
  smartCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    padding: theme.space.lg,
    ...theme.shadows.soft,
  },
  smartTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  soundIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.full,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  smartText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.sm,
    lineHeight: 21,
    marginTop: theme.space.md,
  },
  volumeLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.md,
    marginTop: theme.space.sm,
  },
  volumeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.space.md,
    height: 50,
    paddingRight: theme.space.xs,
  },
  volumeTrack: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.full,
    flex: 1,
    height: 4,
    position: 'relative',
  },
  volumeFill: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    height: 4,
  },
  volumeKnob: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    height: 16,
    marginLeft: -8,
    position: 'absolute',
    top: -6,
    width: 16,
  },
  volumeValue: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.sm,
    width: 42,
  },
  miniGrid: {
    flexDirection: 'row',
    gap: theme.space.md,
    marginTop: theme.space.lg,
  },
  miniCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    flex: 1,
    gap: theme.space.xs,
    padding: theme.space.lg,
    ...theme.shadows.soft,
  },
  miniTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSizes.sm,
  },
  miniMeta: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: theme.fontSizes.xs,
  },
  pressed: {
    opacity: 0.7,
  },
});
