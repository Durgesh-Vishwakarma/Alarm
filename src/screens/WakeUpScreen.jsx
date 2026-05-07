import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  ZoomIn, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { colors, typography, spacing } from '../theme';
import { Card } from '../components/Card';

// Mock function to simulate backend AI verification
const verifyWakeUpTask = async (base64Image) => {
  console.log('Sending image to AI backend...');
  await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate latency
  
  const success = Math.random() > 0.2; 
  return {
    success,
    message: success ? "Object Verified!" : "Object not recognized. Please scan again."
  };
};

export const WakeUpScreen = () => {
  const camera = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  // Animation Values
  const scanLineY = useSharedValue(0);
  
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // Scanning line animation loop
  useEffect(() => {
    if (isProcessing) {
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1
      );
    } else {
      scanLineY.value = 0;
    }
  }, [isProcessing]);

  const animatedScanLine = useAnimatedStyle(() => ({
    top: `${scanLineY.value * 100}%`,
    opacity: isProcessing ? 1 : 0,
  }));

  const handleCapture = async () => {
    if (camera.current == null || isProcessing) return;

    try {
      // Sensory Feedback: Initial click
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      setIsProcessing(true);
      setStatusMessage("Capturing...");
      
      // Capture the photo
      const photo = await camera.current.takePhoto({ 
        flash: 'off',
        enableShutterSound: true 
      });
      
      setStatusMessage("Analyzing Frame...");
      const base64 = await FileSystem.readAsStringAsync(photo.path, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to mock backend
      setStatusMessage("Analyzing with AI...");
      const result = await verifyWakeUpTask(base64);

      if (result.success) {
        // Sensory Feedback: Success vibration
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStatusMessage(result.message);
        setTimeout(() => router.replace('/home'), 1500);
      } else {
        // Sensory Feedback: Error vibration
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setStatusMessage(result.message);
        setTimeout(() => {
          setIsProcessing(false);
          setStatusMessage(null);
        }, 3000);
      }
      
    } catch (error) {
      console.error('Capture Error:', error);
      Alert.alert("Error", "Failed to process photo. Please try again.");
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.statusText}>Requesting Camera Access...</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No Camera Device Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. The Raw Camera View */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true} 
        photo={true}
      />
      
      {/* Scanning Line Overlay */}
      <Animated.View style={[styles.scanLine, animatedScanLine]} />

      <Animated.View 
        entering={FadeInUp.delay(300).duration(800)} 
        style={styles.overlayContainer}
      >
        <Card style={styles.targetCard}>
          <Text style={styles.instructionText}>Verification Target</Text>
          <Text style={styles.targetObject}>Scan Coffee Mug</Text>
          
          {statusMessage && (
            <Animated.View entering={ZoomIn} style={styles.statusBadge}>
              {/* Spinner only shows during processing, not results */}
              {isProcessing && !statusMessage.includes("Verified") && !statusMessage.includes("recognized") && (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
              )}
              <Text style={styles.statusBadgeText}>{statusMessage}</Text>
            </Animated.View>
          )}
        </Card>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(500).duration(800)} 
        style={styles.bottomContainer}
      >
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
  }
});
