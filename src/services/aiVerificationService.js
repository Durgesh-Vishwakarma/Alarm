import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { NativeModules, Platform } from "react-native";

const normalizeHost = (value) => value?.replace(/^https?:\/\//, "")?.split(":")?.[0];

const extractHosts = (value) => {
  if (!value) return [];

  const decoded = decodeURIComponent(String(value));
  const matches = decoded.matchAll(/https?:\/\/([^/:?#]+)(?::\d+)?/g);
  return [...matches].map((match) => match[1]);
};

const getMetroHost = () => {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  const hostCandidates = [
    scriptURL,
    Constants.expoConfig?.hostUri,
    Constants.manifest?.debuggerHost,
    Constants.manifest2?.extra?.expoGo?.debuggerHost,
    Constants.linkingUri,
  ];

  for (const candidate of hostCandidates) {
    const host = normalizeHost(candidate) || extractHosts(candidate)[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  }

  return null;
};

const unique = (items) => [...new Set(items.filter(Boolean))];

const getLaunchUrlHost = async () => {
  const initialUrl = await Linking.getInitialURL();
  return extractHosts(initialUrl).find((host) => host !== "localhost" && host !== "127.0.0.1");
};

const getApiBaseUrls = async () => {
  const configured =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    Constants.expoConfig?.extra?.apiBaseUrl;
  const devBackendUrl = Constants.expoConfig?.extra?.devBackendUrl;
  const metroHost = getMetroHost();
  const launchHost = await getLaunchUrlHost();
  const configuredIsLocal =
    configured?.includes("localhost") || configured?.includes("127.0.0.1");

  return unique([
    devBackendUrl,
    Platform.OS !== "web" && launchHost ? `http://${launchHost}:4000` : null,
    Platform.OS !== "web" && metroHost ? `http://${metroHost}:4000` : null,
    configured && !configuredIsLocal ? configured : null,
    Platform.OS === "android" ? "http://10.0.2.2:4000" : null,
    configured,
    "http://localhost:4000",
  ]);
};

const createVerificationFormData = ({ photo, alarm, challenge }) => {
  const formData = new FormData();
  const imagePath = photo?.path || photo?.uri;
  if (!imagePath) {
    throw new Error("Missing photo path for verification");
  }

  formData.append("image", {
    uri: imagePath.startsWith("file://") ? imagePath : `file://${imagePath}`,
    name: `snapwake-${Date.now()}.jpg`,
    type: "image/jpeg",
  });
  formData.append("alarmId", alarm?.id || "manual");
  formData.append("challengeId", challenge.id);
  formData.append("challengeTitle", challenge.title);
  formData.append("capturedAt", new Date().toISOString());
  formData.append("strictness", alarm?.antiCheatStrictness || "Strict");
  formData.append("targets", JSON.stringify(challenge.targets));

  return formData;
};

export const verifyChallengeImage = async ({ photo, alarm, challenge }) => {
  const apiBaseUrls = await getApiBaseUrls();

  for (const apiBaseUrl of apiBaseUrls) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/verify`, {
        method: "POST",
        body: createVerificationFormData({ photo, alarm, challenge }),
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "AI verification failed");
      }

      return result;
    } catch (error) {
      console.warn(`AI verification failed via ${apiBaseUrl}`, error);
    }
  }

  throw new Error(
    `AI backend unreachable. Tried: ${apiBaseUrls.join(", ")}. Backend is running locally, but Android must reach your computer LAN IP. Check Windows Firewall allows port 4000.`
  );
};
