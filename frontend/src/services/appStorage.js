import AsyncStorage from '@react-native-async-storage/async-storage';

export const APP_STORAGE_KEYS = {
  onboardingCompleted: 'snapwake:onboardingCompleted',
  permissionsCompleted: 'snapwake:permissionsCompleted',
};

async function getBoolean(key) {
  const value = await AsyncStorage.getItem(key);
  return value === 'true';
}

async function setBoolean(key, value) {
  await AsyncStorage.setItem(key, value ? 'true' : 'false');
}

export function getOnboardingCompleted() {
  return getBoolean(APP_STORAGE_KEYS.onboardingCompleted);
}

export function setOnboardingCompleted(completed) {
  return setBoolean(APP_STORAGE_KEYS.onboardingCompleted, completed);
}

export function getPermissionsCompleted() {
  return getBoolean(APP_STORAGE_KEYS.permissionsCompleted);
}

export function setPermissionsCompleted(completed) {
  return setBoolean(APP_STORAGE_KEYS.permissionsCompleted, completed);
}
