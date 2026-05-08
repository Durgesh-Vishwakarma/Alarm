import Constants from 'expo-constants';

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'http://localhost:4000';

export const verifyChallengeImage = async ({ photo, alarm, challenge }) => {
  const formData = new FormData();
  formData.append('image', {
    uri: photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`,
    name: `snapwake-${Date.now()}.jpg`,
    type: 'image/jpeg',
  });
  formData.append('alarmId', alarm?.id || 'manual');
  formData.append('challengeId', challenge.id);
  formData.append('challengeTitle', challenge.title);
  formData.append('capturedAt', new Date().toISOString());
  formData.append('strictness', alarm?.antiCheatStrictness || 'Strict');
  formData.append('targets', JSON.stringify(challenge.targets));

  const response = await fetch(`${API_BASE_URL}/api/verify`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'AI verification failed');
  }

  return result;
};
