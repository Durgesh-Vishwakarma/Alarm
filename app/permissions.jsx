import { StatusBar } from "expo-status-bar";
import { PermissionsScreen } from "../src/screens/PermissionsScreen";

export default function PermissionsRoute() {
  return (
    <>
      <StatusBar style="dark" />
      <PermissionsScreen />
    </>
  );
}
