import { useCallback, useRef, useState } from 'react';

import { verifyChallengePhoto } from '../services/verificationService';
import { logClientEvent, warnClientEvent } from '../../../shared/utils/clientLogger';

export function useVerification(alarm) {
  const inFlightRef = useRef(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');

  const verifyPhoto = useCallback(
    async (photo) => {
      if (!alarm) {
        warnClientEvent('verify', 'skipped_missing_alarm');
        return {
          success: false,
          message: 'Alarm details are still loading. Try again in a moment.',
        };
      }

      if (inFlightRef.current) {
        warnClientEvent('verify', 'skipped_already_in_flight', {
          alarmId: alarm.id,
        });
        return null;
      }

      inFlightRef.current = true;
      setStatus('verifying');
      setResult(null);

      try {
        logClientEvent('verify', 'started', {
          alarmId: alarm.id,
          challengeId: alarm.challengeId,
        });
        const nextResult = await verifyChallengePhoto({ alarm, photo });
        setResult(nextResult);
        setStatus(nextResult?.success ? 'success' : 'failed');
        logClientEvent('verify', 'completed', {
          alarmId: alarm.id,
          success: Boolean(nextResult?.success),
          status: nextResult?.status,
          message: nextResult?.message,
        });
        return nextResult;
      } catch (error) {
        const failure = {
          success: false,
          message: error.message || 'Verification failed before the request completed.',
        };
        setResult(failure);
        setStatus('failed');
        warnClientEvent('verify', 'failed_unhandled', {
          alarmId: alarm.id,
          message: error.message,
        });
        return failure;
      } finally {
        inFlightRef.current = false;
      }
    },
    [alarm],
  );

  const reset = useCallback(() => {
    setResult(null);
    setStatus('idle');
    inFlightRef.current = false;
  }, []);

  return {
    isVerifying: status === 'verifying',
    reset,
    result,
    status,
    verifyPhoto,
  };
}
