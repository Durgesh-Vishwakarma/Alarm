import { StatusBar } from 'expo-status-bar';
import { WakeUpScreen } from '../src/screens/WakeUpScreen';

/**
 * Wake-Up Route Wrapper
 * Optimized for high-intensity dark-mode UI with high-contrast StatusBar.
 */
export default function WakeUpRoute() {
  return (
    <>
      <StatusBar style="light" />
      <WakeUpScreen />
    </>
  );
}
