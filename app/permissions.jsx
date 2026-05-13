import { StatusBar } from "expo-status-bar";
import { PermissionsScreen } from "../src/screens/PermissionsScreen";
import { useTheme } from "../src/theme/ThemeContext";

export default function PermissionsRoute() {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme.statusBar} backgroundColor={theme.bg} translucent={false} />
      <PermissionsScreen />
    </>
  );
}
