import AsyncStorage from '@react-native-async-storage/async-storage';

const ALARMS_STORAGE_KEY = 'snapwake:alarms:v1';

export async function loadAlarms() {
  const raw = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveAlarms(alarms) {
  await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
}
