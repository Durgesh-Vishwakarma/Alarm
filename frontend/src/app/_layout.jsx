import {
  Outfit_400Regular,
  Outfit_500Medium,
  useFonts as useOutfitFonts,
} from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_700Bold,
  useFonts as useJakartaFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { theme } from '../theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [outfitLoaded] = useOutfitFonts({
    Outfit_400Regular,
    Outfit_500Medium,
  });
  const [jakartaLoaded] = useJakartaFonts({
    PlusJakartaSans_700Bold,
  });

  const fontsReady = outfitLoaded && jakartaLoaded;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor={theme.colors.background} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
