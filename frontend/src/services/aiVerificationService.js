import Constants from "expo-constants";
import { Platform } from "react-native";

const getBaseUrl = () => {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl;
  if (configured) return configured;
  
  // Dev Fallbacks
  if (__DEV__) {
    const host = Constants.expoConfig?.hostUri?.split(":")?.[0];
    if (host) return `http://${host}:4000`;
    return Platform.OS === "android" ? "http://10.0.2.2:4000" : "http://localhost:4000";
  }
  return "https://api.snapwake.ai"; // Production fallback
};

export const verifyChallengeImage = async ({ photo, alarm, challenge }) => {
  const baseUrl = getBaseUrl();
  const formData = new FormData();
  
  formData.append("image", {
    uri: photo.path.startsWith("file://") ? photo.path : `file://${photo.path}`,
    name: "capture.jpg",
    type: "image/jpeg",
  });
  formData.append("alarmId", alarm?.id || "manual");
  formData.append("challengeId", challenge.id);
  formData.append("challengeTitle", challenge.title);
  formData.append("strictness", alarm?.antiCheatStrictness || "Strict");
  formData.append("targets", JSON.stringify(challenge.targets || []));

  try {
    const res = await fetch(`${baseUrl}/api/verify`, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Verification failed");
    return result;
  } catch (e) {
    throw new Error(e.message === "Network request failed" ? "Backend unreachable" : e.message);
  }
};
