import { useCallback } from 'react';

import { stopAlarmAudio } from '../../../shared/services/audioService';
import { stopAlarmVibration } from '../../../shared/services/vibrationService';

export function useAlarmAudio() {
  const stopAlarmOutput = useCallback(async () => {
    await stopAlarmAudio();
    await stopAlarmVibration();
  }, []);

  return { stopAlarmOutput };
}
