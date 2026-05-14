import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    useFonts
} from '@expo-google-fonts/plus-jakarta-sans';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlarmRuntimeProvider } from '../src/components/AlarmRuntimeProvider';
import { ThemeProvider } from '../src/theme/ThemeContext';

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

const ThemedStatusBar = () => {
  const { theme } = require('../src/theme/ThemeContext').useTheme();
  return <StatusBar style={theme.statusBar} backgroundColor="transparent" translucent />;
};

export default function RootLayout() {
  // Load full brand typography suite
  const [loaded, error] = useFonts({
    'Plus-Regular': PlusJakartaSans_400Regular,
    'Plus-Medium': PlusJakartaSans_500Medium,
    'Plus-SemiBold': PlusJakartaSans_600SemiBold,
    'Plus-Bold': PlusJakartaSans_700Bold,
    'Plus-ExtraBold': PlusJakartaSans_800ExtraBold,
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
              pathname: '/alarm-alert',
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
        <ThemeProvider>
          <ThemedStatusBar />
          <AlarmRuntimeProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="alarm-alert" />
              <Stack.Screen 
                name="wake-up" 
                options={{ 
                  gestureEnabled: false,
                }} 
              />
            </Stack>
          </AlarmRuntimeProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
