import { challenges } from './data';

export function formatTime({ hour, minute, period }) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
}

export function formatDays(days) {
  return days.join(' - ');
}

export function getSelectedChallenge(draftOrChallengeId) {
  const challengeId =
    typeof draftOrChallengeId === 'string'
      ? draftOrChallengeId
      : draftOrChallengeId.challengeId;
  const challenge = challenges.find((item) => item.id === challengeId) ?? challenges[0];

  if (challenge.id !== 'custom-challenge' || typeof draftOrChallengeId === 'string') {
    return challenge;
  }

  return {
    ...challenge,
    title: draftOrChallengeId.customChallengeTitle?.trim() || challenge.title,
    description:
      draftOrChallengeId.customChallengeDescription?.trim() || challenge.description,
  };
}

export function cycleValue(currentValue, values) {
  const currentIndex = values.indexOf(currentValue);
  return values[(currentIndex + 1) % values.length];
}
