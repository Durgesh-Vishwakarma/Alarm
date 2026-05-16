import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';
import { formatDays } from '../utils';

export function PreviewCard({ draft, selectedChallenge, onToggleEnabled }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.challengeIcon, { backgroundColor: selectedChallenge.backgroundColor }]}>
          <Ionicons name={selectedChallenge.icon} size={34} color={selectedChallenge.iconColor} />
        </View>
        <View style={styles.copy}>
          <View style={styles.timeRow}>
            <Text style={styles.time}>
              {String(draft.hour).padStart(2, '0')}:{String(draft.minute).padStart(2, '0')}
            </Text>
            <Text style={styles.period}>{draft.period}</Text>
          </View>
          <Text style={styles.title}>{selectedChallenge.title}</Text>
        </View>
        <View style={styles.switchWrap}>
          <Text style={styles.onLabel}>{draft.notification ? 'ON' : 'OFF'}</Text>
          <Switch
            value={draft.notification}
            onValueChange={onToggleEnabled}
            trackColor={{ false: '#E3E8EF', true: theme.colors.primary }}
            thumbColor={theme.colors.white}
            ios_backgroundColor="#E3E8EF"
          />
        </View>
      </View>
      <View style={styles.bottomRow}>
        <Ionicons name="options" size={16} color={theme.colors.textMuted} />
        <Text style={styles.days}>{formatDays(draft.days)}</Text>
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
    padding: theme.space.lg,
    ...theme.shadows.soft,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  challengeIcon: {
    alignItems: 'center',
    borderRadius: theme.radii.md,
    height: 72,
    justifyContent: 'center',
    marginRight: theme.space.lg,
    width: 72,
  },
  copy: {
    flex: 1,
  },
  timeRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: theme.space.xs,
  },
  time: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 35,
    lineHeight: 41,
  },
  period: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.md,
    marginBottom: 5,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.md,
  },
  switchWrap: {
    alignItems: 'center',
  },
  onLabel: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.xs,
  },
  bottomRow: {
    alignItems: 'center',
    borderTopColor: theme.colors.borderSoft,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: theme.space.md,
    marginTop: theme.space.lg,
    paddingTop: theme.space.lg,
  },
  days: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSizes.md,
  },
});
