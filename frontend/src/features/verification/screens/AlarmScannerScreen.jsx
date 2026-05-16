import { CameraView } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScannerOverlay } from '../components/scanner/ScannerOverlay';
import { VerificationLoader } from '../components/scanner/VerificationLoader';
import { useAlarmSession } from '../hooks/useAlarmSession';
import { useVerification } from '../hooks/useVerification';
import { captureLiveCameraPhoto } from '../services/scannerService';
import { theme } from '../../../shared/theme';
import { logClientEvent, warnClientEvent } from '../../../shared/utils/clientLogger';
import { ensureCameraPermission } from '../../permissions/utils/permission';

export function AlarmScannerScreen() {
  const params = useLocalSearchParams();
  const alarmId = String(params.id ?? '');
  const cameraRef = useRef(null);
  const navigatingRef = useRef(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraAllowed, setCameraAllowed] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const { alarm, loading } = useAlarmSession(alarmId);
  const { isVerifying, verifyPhoto } = useVerification(alarm);

  useEffect(() => {
    ensureCameraPermission().then(setCameraAllowed);
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  const finishVerification = (result) => {
    if (!result) {
      warnClientEvent('scanner', 'navigation.skipped_no_result', { alarmId });
      setCameraError('Verification did not start. Try again.');
      return;
    }

    if (navigatingRef.current) {
      warnClientEvent('scanner', 'navigation.skipped_already_navigating', { alarmId });
      return;
    }

    navigatingRef.current = true;
    logClientEvent('scanner', 'navigation.result', {
      alarmId,
      success: Boolean(result.success),
      message: result.message,
    });
    router.replace({
      pathname: '/verification-result',
      params: {
        id: alarmId,
        message: result.message ?? '',
        provider: result.provider ?? '',
        success: result.success ? 'true' : 'false',
      },
    });
  };

  const captureAndVerify = async () => {
    if (!cameraReady) {
      warnClientEvent('scanner', 'capture.skipped_camera_not_ready', { alarmId });
      setCameraError('Camera is not ready yet.');
      return;
    }

    if (isVerifying) {
      warnClientEvent('scanner', 'capture.skipped_verifying', { alarmId });
      return;
    }

    if (!alarm) {
      warnClientEvent('scanner', 'capture.skipped_alarm_loading', { alarmId });
      setCameraError('Alarm details are still loading.');
      return;
    }

    try {
      setCameraError(null);
      logClientEvent('scanner', 'capture.started', {
        alarmId,
        challengeId: alarm.challengeId,
      });
      const photo = await captureLiveCameraPhoto(cameraRef);
      logClientEvent('scanner', 'capture.completed', {
        alarmId,
        height: photo.height,
        uri: photo.uri,
        width: photo.width,
      });
      const result = await verifyPhoto(photo);
      finishVerification(result);
    } catch (error) {
      warnClientEvent('scanner', 'capture.failed', {
        alarmId,
        message: error.message,
      });
      setCameraError(error.message);
    }
  };

  if (cameraAllowed !== true) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionTitle}>
          {cameraAllowed === false ? 'Camera access required' : 'Checking camera access'}
        </Text>
        <Text style={styles.permissionText}>
          {cameraAllowed === false
            ? 'Enable camera access to complete live wake-up verification.'
            : 'Live camera verification is required to stop this alarm.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        facing="back"
        onCameraReady={() => setCameraReady(true)}
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.dim} />
      <ScannerOverlay challengeTitle={alarm?.challengeTitle ?? 'your challenge'} />

      <View style={styles.footer}>
        {cameraError ? <Text style={styles.error}>{cameraError}</Text> : null}
        {loading || isVerifying ? <VerificationLoader /> : null}
        {!isVerifying ? (
          <Pressable
            accessibilityRole="button"
            disabled={!cameraReady}
            onPress={captureAndVerify}
            style={({ pressed }) => [
              styles.captureButton,
              !cameraReady && styles.captureDisabled,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.captureInner} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.black,
    flex: 1,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  footer: {
    alignItems: 'center',
    bottom: 38,
    gap: theme.space.md,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  captureButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.full,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  captureInner: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    height: 58,
    width: 58,
  },
  captureDisabled: {
    opacity: 0.5,
  },
  error: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    textAlign: 'center',
  },
  permissionScreen: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: theme.space.xl,
  },
  permissionTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontSize: 17,
  },
  permissionText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: theme.space.sm,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.86,
  },
});
