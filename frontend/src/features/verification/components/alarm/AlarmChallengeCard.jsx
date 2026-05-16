import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { challenges } from '../../../newAlarm/data';
import { theme } from '../../../../shared/theme';

function getChallengeVisual(alarm) {
  return (
    challenges.find((challenge) => challenge.id === alarm?.challengeId) ??
    challenges.find((challenge) => challenge.title === alarm?.challengeTitle) ??
    challenges[0]
  );
}

export function AlarmChallengeCard({ alarm }) {
  const challenge = getChallengeVisual(alarm);
  const title = alarm?.challengeTitle ?? challenge.title;
  const description =
    challenge.description ?? 'Take a clear live photo to prove you are awake.';

  return (
    <View style={styles.card}>
      <View style={styles.heroRow}>
        <View style={styles.imageRing}>
          <View style={[styles.iconWrap, { backgroundColor: challenge.backgroundColor }]}>
            <Ionicons name={challenge.icon} size={38} color={challenge.iconColor} />
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{description}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.rules}>
        <Rule icon="camera-outline" title="Use your live camera" body="Screenshots or gallery photos won't work" />
        <Rule icon="sunny-outline" title="Good lighting" body="Make sure the object is clearly visible" />
        <Rule
          icon="shield-checkmark-outline"
          title="Complete to stop alarm"
          body="You must verify to turn off the alarm"
        />
      </View>
    </View>
  );
}

function Rule({ icon, title, body }) {
  return (
    <View style={styles.ruleRow}>
      <View style={styles.ruleIcon}>
        <Ionicons name={icon} size={21} color={theme.colors.primary} />
      </View>
      <View style={styles.ruleCopy}>
        <Text style={styles.ruleTitle}>{title}</Text>
        <Text style={styles.ruleBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 250, 244, 0.94)',
    borderColor: 'rgba(255, 255, 255, 0.62)',
    borderRadius: 24,
    borderWidth: 1.2,
    gap: theme.space.md,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.lg,
    shadowColor: '#8A2B00',
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 9,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.space.md,
  },
  imageRing: {
    alignItems: 'center',
    borderColor: 'rgba(255, 106, 0, 0.46)',
    borderRadius: 40,
    borderWidth: 2,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 18,
    lineHeight: 23,
  },
  body: {
    color: '#40515D',
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
    marginTop: theme.space.xs,
  },
  divider: {
    backgroundColor: 'rgba(255, 106, 0, 0.16)',
    height: 1,
  },
  rules: {
    gap: theme.space.md,
  },
  ruleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.space.md,
  },
  ruleIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.84)',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#E56B1F',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    width: 48,
  },
  ruleCopy: {
    flex: 1,
  },
  ruleTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
    lineHeight: 17,
  },
  ruleBody: {
    color: '#40515D',
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
});
