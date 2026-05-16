import { stopNativeAlarmService } from './nativeAlarmService';

export function stopAlarmVibration() {
  return stopNativeAlarmService();
}
