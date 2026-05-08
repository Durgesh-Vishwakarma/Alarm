import {
    Outfit_400Regular,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    useFonts
} from '@expo-google-fonts/outfit';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlarmRuntimeProvider } from '../src/components/AlarmRuntimeProvider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Bold': Outfit_700Bold,
    'Outfit-ExtraBold': Outfit_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    // Expo Go no longer supports remote notifications in SDK 53+.
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
            const { router } = require('expo-router');
            router.push({
              pathname: '/wake-up',
              params: { alarmId, challengeId },
            });
          }
        });
      } catch (e) {
        console.warn('Notifications listener setup failed', e);
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
          </Stack>
          <StatusBar style="dark" />
        </AlarmRuntimeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
