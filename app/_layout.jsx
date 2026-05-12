import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  useFonts
} from '@expo-google-fonts/outfit';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlarmRuntimeProvider } from '../src/components/AlarmRuntimeProvider';

/**
 * Root Layout
 * Finalized with production font loading, navigation safety, and splash screen recovery.
 */

// Safety: prevent splash screen from auto-hiding
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  if (__DEV__) console.warn('[Layout] SplashScreen safety fallback', e);
}

export default function RootLayout() {
  // Load full brand typography suite
  const [loaded, error] = useFonts({
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
    'Outfit-ExtraBold': Outfit_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {
        if (__DEV__) console.warn('[Layout] Failed to hide splash screen');
      });
    }
  }, [loaded, error]);

  useEffect(() => {
    // Expo Go native notification limitations
    if (Constants.appOwnership === 'expo') {
      return undefined;
    }

    let subscription;

    async function setupNotifications() {
      try {
        const Notifications = await import('expo-notifications');
        if (typeof Notifications.addNotificationResponseReceivedListener !== 'function') {
          return;
        }

        subscription = Notifications.addNotificationResponseReceivedListener((response) => {
          const { alarmId, challengeId } = response.notification.request.content.data;
          
          if (alarmId) {
            // PRODUCTION FIX: Use replace instead of push to prevent wake-screen stacking
            const { router } = require('expo-router');
            router.replace({
              pathname: '/wake-up',
              params: { alarmId, challengeId },
            });
          }
        });
      } catch (e) {
        if (__DEV__) console.warn('[Notifications] Setup failed', e);
      }
    }

    setupNotifications();

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AlarmRuntimeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen 
              name="wake-up" 
              options={{ 
                gestureEnabled: false, // Prevent swiping back from verification
              }} 
            />
          </Stack>
          {/* Note: Global StatusBar removed to allow per-screen light/dark control */}
        </AlarmRuntimeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
