import { Camera } from 'expo-camera';

export async function ensureCameraPermission() {
  const current = await Camera.getCameraPermissionsAsync();

  if (current.status === 'granted') {
    return true;
  }

  if (current.canAskAgain === false) {
    return false;
  }

  const requested = await Camera.requestCameraPermissionsAsync();
  return requested.status === 'granted';
}
