import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getNextAlarmDate, to24Hour } from './alarmRuntime';

const isExpoGo = Constants.appOwnership === 'expo';

const weekdayMap = {
  Sun: 1,
  Mon: 2,
  Tue: 3,
  Wed: 4,
  Thu: 5,
  Fri: 6,
  Sat: 7,
};

let notificationsModule = null;

const getExpoNotifications = async () => {
  if (isExpoGo) return null;
  if (notificationsModule) return notificationsModule;

  try {
    notificationsModule = await import('expo-notifications');
    return notificationsModule;
  } catch (error) {
    console.warn('expo-notifications is unavailable. Native scheduling skipped.', error);
    return null;
  }
};

export const requestNotificationPermissions = async () => {
  const Notifications = await getExpoNotifications();
  if (!Notifications) return 'Realtime in-app only';

  Notifications.setNotificationHandler?.({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'Granted';

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted ? 'Granted' : 'Denied';
};

export const cancelAlarmNotification = async (alarm) => {
  const Notifications = await getExpoNotifications();
  if (!Notifications) return;

  const ids = alarm?.notificationIds || (alarm?.notificationId ? [alarm.notificationId] : []);
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
};

export const scheduleAlarmNotification = async (alarm) => {
  const Notifications = await getExpoNotifications();
  if (!Notifications || !alarm.isActive) return null;
  if (typeof Notifications.scheduleNotificationAsync !== 'function') return null;

  const { hour, minute } = to24Hour(alarm.time, alarm.period);
  const repeatDays = alarm.repeatDays || [];
  const dateType = Notifications.SchedulableTriggerInputTypes?.DATE || 'date';
  const weeklyType = Notifications.SchedulableTriggerInputTypes?.WEEKLY || 'weekly';

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('alarm-channel', {
        name: 'SnapWake Alarms',
        importance: Notifications.AndroidImportance?.MAX ?? 5,
        vibrationPattern: [0, 700, 250, 700, 250, 1200],
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility?.PUBLIC,
      });
    } catch (error) {
      console.warn('Alarm notification channel setup skipped.', error);
    }
  }

  const scheduleOne = (trigger) =>
    Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || 'SnapWake Alarm',
        body: `Time to wake up. Complete "${alarm.task}" to dismiss.`,
        categoryIdentifier: 'alarm',
        data: { alarmId: alarm.id, challengeId: alarm.challengeId },
        sound: alarm.ringtone === 'Silent' ? false : true,
        priority: Notifications.AndroidNotificationPriority?.MAX,
      },
      trigger,
    });

  if (repeatDays.length) {
    return Promise.all(
      repeatDays.map((day) =>
        scheduleOne({
          type: weeklyType,
          weekday: weekdayMap[day],
          hour,
          minute,
          repeats: true,
          channelId: 'alarm-channel',
        })
      )
    );
  }

  return [
    await scheduleOne({
      type: dateType,
      date: getNextAlarmDate(alarm),
      channelId: 'alarm-channel',
    }),
  ];
};

export const rescheduleAlarm = async (previousAlarm, nextAlarm) => {
  try {
    await cancelAlarmNotification(previousAlarm);
    const notificationIds = await scheduleAlarmNotification(nextAlarm);
    return notificationIds ? { ...nextAlarm, notificationIds, notificationId: undefined } : nextAlarm;
  } catch (error) {
    console.warn('Native notification scheduling failed. Realtime in-app alarm remains active.', error);
    return nextAlarm;
  }
};
