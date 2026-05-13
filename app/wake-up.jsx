import { StatusBar } from "expo-status-bar";
import { WakeUpScreen } from "../src/screens/WakeUpScreen";

/**
 * Wake-Up screen always uses a dark camera UI.
 * StatusBar is always "light" here so system indicators stay white and visible
 * against the dark camera background, regardless of the chosen colour theme.
 */
export default function WakeUpRoute() {
  return (
    <>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <WakeUpScreen />
    </>
  );
}
