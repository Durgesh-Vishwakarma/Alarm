import { StatusBar } from "expo-status-bar";
import { AlarmAlertScreen } from "../src/screens/AlarmAlertScreen";

export default function AlarmAlertRoute() {
  return (
    <>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <AlarmAlertScreen />
    </>
  );
}
