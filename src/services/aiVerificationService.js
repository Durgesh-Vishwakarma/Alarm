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
  formData.append("capturedAt", photo.capturedAt || new Date().toISOString());
  formData.append("strictness", alarm?.antiCheatStrictness || "Strict");
  
  // Safe targets stringification
  const targets = Array.isArray(challenge.targets) ? challenge.targets : [];
  formData.append("targets", JSON.stringify(targets));

  return formData;
};

const buildResponseError = (result, status) => {
  const error = new Error(result?.message || `AI verification failed (Status: ${status})`);
  error.status = status;
  error.result = result;
  error.fromBackend = true;
  return error;
};

/**
 * Verifies a challenge image with the AI backend.
 * Includes production-grade resilience: timeouts, safe parsing, and error differentiation.
 */
export const verifyChallengeImage = async ({ photo, alarm, challenge }) => {
  const apiBaseUrls = await getApiBaseUrls();
  let lastError = null;

  for (const apiBaseUrl of apiBaseUrls) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      if (__DEV__) {
        console.log(`[AI] Attempting verification via: ${apiBaseUrl}`);
      }

      const response = await fetch(`${apiBaseUrl}/api/verify`, {
        method: "POST",
        body: createVerificationFormData({ photo, alarm, challenge }),
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Safe JSON parsing to prevent crashes on HTML errors
      let result;
      const responseText = await response.text();
      try {
        result = JSON.parse(responseText);
      } catch (_error) {
        throw new Error(`Invalid server response (Status: ${response.status})`);
      }

      if (response.status === 422 && result) {
        return result;
      }

      if (!response.ok) {
        throw buildResponseError(result, response.status);
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (__DEV__) {
        console.warn(`[AI] Failure via ${apiBaseUrl}:`, error.message);
      }

      // Handle specific network errors
      if (error.name === "AbortError") {
        lastError = new Error("AI verification timed out. Check your connection.");
      }

      if (error.fromBackend) {
        throw error;
      }
    }
  }

  // If we've exhausted all URLs, throw a specialized error
  const errorMessage = lastError?.message || "AI backend unreachable";
  
  throw new Error(
    `${errorMessage}. Please ensure the SnapWake backend is running and accessible on your network.`
  );
};
