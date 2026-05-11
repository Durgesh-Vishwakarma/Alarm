import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Card } from '../components/Card';
import { getChallengeById } from '../data/challengeCatalog';
import { verifyChallengeImage } from '../services/aiVerificationService';
import { loadAlarms } from '../services/alarmStorage';
import { recordWakeResult } from '../services/streakService';
import { colors, spacing, typography } from '../theme';

const isFreshCapture = (photo) => {
  const createdAt = photo?.metadata?.DateTimeOriginal || photo?.metadata?.DateTimeDigitized;
  if (!createdAt) return true;

  const capturedAt = new Date(createdAt).getTime();
  if (Number.isNaN(capturedAt)) return true;

  return Date.now() - capturedAt < 30000;
};

const CameraUnavailableFallback = () => (
  <View style={styles.container}>
    <Card style={styles.unsupportedCard}>
      <Text style={styles.instructionText}>Camera Runtime</Text>
      <Text style={styles.targetObject}>Camera Unavailable</Text>
      <Text style={styles.unsupportedText}>
        We could not initialize the camera. Please check permissions and try again.
      </Text>
      <TouchableOpacity
        style={styles.fallbackButton}
        onPress={() => {
          Vibration.cancel();
          router.replace('/(tabs)/home');
        }}
      >
        <Text style={styles.fallbackButtonText}>Back to Alarms</Text>
      </TouchableOpacity>
    </Card>
  </View>
);

const VisionWakeUpExperience = () => {
  const camera = useRef(null);
  const params = useLocalSearchParams();
  const [alarm, setAlarm] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const scanLineY = useSharedValue(0);

  const [permission, requestPermission] = useCameraPermissions();
  const hasPermission = permission?.granted;

  useEffect(() => {
    const hydrateAlarm = async () => {
      const alarms = await loadAlarms();
      const selected =
        alarms.find((item) => item.id === params.alarmId) ||
        alarms.find((item) => item.isActive) ||
        alarms[0];
      setAlarm(selected);
    };

    hydrateAlarm();
  }, [params.alarmId]);

  useEffect(() => {
    if (hasPermission === false) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (isProcessing) {
      scanLineY.value = withRepeat(
        withSequence(withTiming(1, { duration: 1500 }), withTiming(0, { duration: 1500 })),
        -1
      );
    } else {
      scanLineY.value = 0;
    }
  }, [isProcessing, scanLineY]);

  const challenge = useMemo(() => getChallengeById(alarm?.challengeId), [alarm?.challengeId]);

  const animatedScanLine = useAnimatedStyle(() => ({
    top: `${scanLineY.value * 100}%`,
    opacity: isProcessing ? 1 : 0,
  }));

  const handleCapture = async () => {
    if (camera.current == null || isProcessing || !alarm) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      setIsProcessing(true);
      setStatusMessage('Capturing live frame...');

      const photo = await camera.current.takePictureAsync({
        quality: 0.9,
        exif: true,
        skipProcessing: true,
      });

      const normalizedPhoto = {
        path: photo.uri,
        width: photo.width,
        height: photo.height,
        metadata: photo.exif,
      };

      if (!isFreshCapture(normalizedPhoto)) {
        throw new Error('Capture is too old. Use the live camera frame.');
      }

      setStatusMessage('Checking anti-cheat signals...');
      const tooDark = normalizedPhoto.width < 24 || normalizedPhoto.height < 24;
      if (tooDark) {
        throw new Error('Frame is invalid. Point the camera at the challenge target.');
      }

      setStatusMessage('Uploading to AI backend...');
      const result = await verifyChallengeImage({ photo: normalizedPhoto, alarm, challenge });

      if (result.success) {
        Vibration.cancel();
        await recordWakeResult({
          alarmId: alarm.id,
          challengeId: challenge.id,
          success: true,
          confidence: result.confidence,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStatusMessage(result.message || 'Object verified. Alarm dismissed.');
        setTimeout(() => router.replace('/(tabs)/home'), 1200);
        return;
      }

      await recordWakeResult({
        alarmId: alarm.id,
        challengeId: challenge.id,
        success: false,
        confidence: result.confidence,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStatusMessage(result.message || 'Target not verified. Try again.');
      setTimeout(() => {
        setIsProcessing(false);
        setStatusMessage(null);
      }, 2600);
    } catch (error) {
      console.error('Capture Error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Verification Failed', error.message || 'Failed to process photo. Please try again.');
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  if (!hasPermission) {
    if (permission?.status === 'denied') {
      return <CameraUnavailableFallback />;
    }

    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.statusText}>Requesting Camera Access...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" />

      <Animated.View style={[styles.scanLine, animatedScanLine]} />

      <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.overlayContainer}>
        <Card style={styles.targetCard}>
          <Text style={styles.instructionText}>Verification Target</Text>
          <Text style={styles.targetObject}>{challenge.title}</Text>
          <Text style={styles.targetMeta}>
            {challenge.aiType} - {alarm?.antiCheatStrictness || 'Strict'} mode
          </Text>

          {statusMessage && (
            <Animated.View entering={ZoomIn} style={styles.statusBadge}>
              {isProcessing && !statusMessage.includes('verified') && !statusMessage.includes('Try again') && (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
              )}
              <Text style={styles.statusBadgeText}>{statusMessage}</Text>
            </Animated.View>
          )}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(800)} style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.buttonDisabled]}
          onPress={handleCapture}
          disabled={isProcessing}
        >
          <View style={styles.captureButtonInner}>
            {isProcessing && <ActivityIndicator color={colors.primary} />}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export const WakeUpScreen = () => {
  useEffect(() => {
    return () => Vibration.cancel();
  }, []);

  return <VisionWakeUpExperience />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: typography.family.regular,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorText: {
    fontFamily: typography.family.bold,
    color: colors.primary,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 15,
    zIndex: 10,
  },
  overlayContainer: {
    position: 'absolute',
    top: spacing.xl * 1.5,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  targetCard: {
    width: '100%',
    alignItems: 'center',
  },
  instructionText: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  targetObject: {
    fontFamily: typography.family.bold,
    fontSize: typography.size.lg,
    color: colors.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  targetMeta: {
    fontFamily: typography.family.bold,
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    marginTop: 6,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  statusBadgeText: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.xs,
    color: colors.text.light,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: spacing.xl * 1.5,
    width: '100%',
    alignItems: 'center',
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  captureButtonInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
