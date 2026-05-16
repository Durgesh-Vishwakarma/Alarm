import Constants from 'expo-constants';

import {
  CHALLENGE_TARGETS,
  VERIFICATION_API_PATH,
  VERIFICATION_TIMEOUT_MS,
} from '../constants';
import { logClientEvent, warnClientEvent } from '../../../shared/utils/clientLogger';
import { toMultipartImage } from '../../../shared/utils/image';

function getBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};

  return envUrl || extra.devBackendUrl || extra.apiBaseUrl || '';
}

function buildVerifyUrl() {
  const baseUrl = getBaseUrl().replace(/\/$/, '');

  if (!baseUrl) {
    throw new Error('Verification server is not configured.');
  }

  return `${baseUrl}${VERIFICATION_API_PATH}`;
}

export async function verifyChallengePhoto({ alarm, photo }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VERIFICATION_TIMEOUT_MS);
  const form = new FormData();
  const verifyUrl = buildVerifyUrl();
  const startedAt = Date.now();
  const image = toMultipartImage(photo);

  form.append('image', image);
  form.append('challengeId', alarm.challengeId);
  form.append('challengeTitle', alarm.challengeTitle);
  form.append('capturedAt', new Date().toISOString());
  form.append(
    'targets',
    JSON.stringify(alarm.targets ?? CHALLENGE_TARGETS[alarm.challengeId] ?? [alarm.challengeTitle]),
  );

  try {
    logClientEvent('verify', 'request.sending', {
      alarmId: alarm.id,
      challengeId: alarm.challengeId,
      imageName: image.name,
      imageType: image.type,
      imageUri: image.uri,
      url: verifyUrl,
    });

    const response = await fetch(verifyUrl, {
      body: form,
      method: 'POST',
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    const durationMs = Date.now() - startedAt;

    logClientEvent('verify', 'response.received', {
      alarmId: alarm.id,
      durationMs,
      ok: response.ok,
      status: response.status,
      message: payload?.message,
    });

    if (!response.ok) {
      return {
        success: false,
        message: payload?.message ?? 'Verification failed. Try again with a clearer photo.',
        status: response.status,
      };
    }

    return payload;
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    if (error.name === 'AbortError') {
      warnClientEvent('verify', 'request.timeout', {
        alarmId: alarm.id,
        durationMs,
        timeoutMs: VERIFICATION_TIMEOUT_MS,
        url: verifyUrl,
      });

      return {
        success: false,
        message: 'Verification timed out. Check your connection and try again.',
        status: 0,
      };
    }

    warnClientEvent('verify', 'request.failed', {
      alarmId: alarm.id,
      durationMs,
      message: error.message,
      url: verifyUrl,
    });

    return {
      success: false,
      message: error.message || 'Could not reach verification server.',
      status: 0,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
