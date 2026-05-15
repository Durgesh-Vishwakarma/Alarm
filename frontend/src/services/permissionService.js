import { Camera } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { requiredPermissions } from '../data/requiredPermissions';
import {
  getOnboardingCompleted,
  getPermissionsCompleted,
  setPermissionsCompleted,
} from './appStorage';
import {
  getAlarmPermissionStatus,
  openAppSettings,
  openFullScreenAlarmSettings,
  openOverlaySettings,
  requestExactAlarmPermission,
  requestIgnoreBatteryOptimizations,
} from './nativeAlarmService';

const GRANTED = 'granted';
const MISSING = 'missing';
const BLOCKED = 'blocked';

function normalizePermission(status, canAskAgain = true) {
  if (status === GRANTED) {
    return GRANTED;
  }

  return canAskAgain ? MISSING : BLOCKED;
}

function applyCopy(statuses) {
  return requiredPermissions.map((permission) => ({
    ...permission,
    ...(statuses[permission.key] ?? { status: MISSING }),
  }));
}

async function getNotificationStatus() {
  const permission = await Notifications.getPermissionsAsync();

  return {
    status: normalizePermission(permission.status, permission.canAskAgain),
    actionLabel: permission.canAskAgain ? 'Enable' : 'Settings',
  };
}

async function getCameraStatus() {
  const permission = await Camera.getCameraPermissionsAsync();

  return {
    status: normalizePermission(permission.status, permission.canAskAgain),
    actionLabel: permission.canAskAgain ? 'Enable' : 'Settings',
  };
}

export function areRequiredPermissionsGranted(permissions) {
  return permissions.every((permission) => permission.status === GRANTED);
}

export async function getRequiredPermissionStatuses() {
  const [notification, camera, nativeStatus] = await Promise.all([
    getNotificationStatus(),
    getCameraStatus(),
    getAlarmPermissionStatus(),
  ]);

  const fullScreenGranted =
    Platform.OS !== 'android' ||
    (nativeStatus.fullScreenIntentAllowed !== false && nativeStatus.overlayAllowed !== false);

  return applyCopy({
    notifications: notification,
    camera,
    exactAlarm: {
      status: nativeStatus.canScheduleExactAlarms ? GRANTED : MISSING,
      actionLabel: 'Enable',
    },
    fullScreenAlarm: {
      status: fullScreenGranted ? GRANTED : MISSING,
      actionLabel: nativeStatus.overlayAllowed === false ? 'Overlay' : 'Settings',
    },
    batteryOptimization: {
      status: nativeStatus.ignoringBatteryOptimizations ? GRANTED : MISSING,
      actionLabel: 'Allow',
    },
    backgroundExecution: {
      status: nativeStatus.backgroundExecutionSupported === false ? MISSING : GRANTED,
      actionLabel: 'Settings',
    },
  });
}

export async function refreshAndPersistPermissions() {
  const permissions = await getRequiredPermissionStatuses();
  const allGranted = areRequiredPermissionsGranted(permissions);
  const savedCompleted = await getPermissionsCompleted();

  if (allGranted !== savedCompleted) {
    await setPermissionsCompleted(allGranted);
  }

  return { permissions, allGranted };
}

export async function requestRequiredPermission(key, currentStatus) {
  if (currentStatus === BLOCKED) {
    return openAppSettings();
  }

  if (key === 'notifications') {
    const permission = await Notifications.requestPermissionsAsync();
    if (permission.status !== GRANTED && permission.canAskAgain === false) {
      return openAppSettings();
    }
    return permission.status === GRANTED;
  }

  if (key === 'camera') {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (permission.status !== GRANTED && permission.canAskAgain === false) {
      return openAppSettings();
    }
    return permission.status === GRANTED;
  }

  if (key === 'exactAlarm') {
    return requestExactAlarmPermission();
  }

  if (key === 'fullScreenAlarm') {
    if (Platform.OS === 'android') {
      await openFullScreenAlarmSettings();
      return openOverlaySettings();
    }

    return openAppSettings();
  }

  if (key === 'batteryOptimization') {
    return requestIgnoreBatteryOptimizations();
  }

  return openAppSettings();
}

export async function getLaunchDestination() {
  const onboardingCompleted = await getOnboardingCompleted();

  if (!onboardingCompleted) {
    return '/onboarding';
  }

  const { allGranted } = await refreshAndPersistPermissions();
  return allGranted ? '/home' : '/permissions';
}
