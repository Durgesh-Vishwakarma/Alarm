import Constants from "expo-constants";
import { Platform } from "react-native";
import { getNextAlarmDate, to24Hour } from "./alarmRuntime";

/**
 * SnapWake Native Notification Service
 * Orchestrates cross-platform alarm delivery with action categories and high-urgency channels.
 */

const isExpoGo = Constants.appOwnership === "expo";

// Expo Notifications Weekday: 1 = Sunday, 7 = Saturday
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

/**
 * Lazily loads expo-notifications to prevent issues in Expo Go / development environments.
 */
const getExpoNotifications = async () => {
  if (isExpoGo) return null;
  if (notificationsModule) return notificationsModule;

  try {
    notificationsModule = await import("expo-notifications");
    return notificationsModule;
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "expo-notifications unavailable. Native scheduling skipped.",
        error,
      );
    }
    return null;
  }
};

/**
 * Requests native notification permissions and configures alarm action categories.
 * Categories enable 'Snooze' and 'Open Challenge' buttons directly on the notification.
 */
export const requestNotificationPermissions = async () => {
  const Notifications = await getExpoNotifications();
  if (!Notifications) return "Realtime in-app only";

  // Configure high-priority alarm categories with action buttons
  try {
    await Notifications.setNotificationCategoryAsync("alarm", [
      {
        identifier: "OPEN_CHALLENGE",
        buttonTitle: "Verify Challenge",
        options: { isDestructive: false, isAuthenticationRequired: true },
      },
      {
        identifier: "SNOOZE",
        buttonTitle: "Snooze 5m",
        options: { isDestructive: true, isAuthenticationRequired: false },
      },
    ]);
  } catch (_error) {
    if (__DEV__) console.warn("[Notifications] Failed to set categories");
  }

  Notifications.setNotificationHandler?.({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority?.MAX,
    }),
  });

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return "Granted";

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted ? "Granted" : "Denied";
};

/**
 * Cancels all scheduled notifications for a specific alarm.
 */
export const cancelAlarmNotification = async (alarm) => {
  const Notifications = await getExpoNotifications();
  if (!Notifications) return;

  const ids =
    alarm?.notificationIds ||
    (alarm?.notificationId ? [alarm.notificationId] : []);
  const validIds = ids.filter(Boolean);

  await Promise.all(
    validIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
};

/**
 * Schedules native notifications for an alarm (one-time or repeating).
 * Uses high-importance Android channels with lockscreen visibility.
 */
export const scheduleAlarmNotification = async (alarm) => {
  const Notifications = await getExpoNotifications();
  if (!Notifications || !alarm.isActive) return null;
  if (typeof Notifications.scheduleNotificationAsync !== "function")
    return null;

  const { hour, minute } = to24Hour(alarm.time, alarm.period);
  const repeatDays = alarm.repeatDays || [];
  const dateType = Notifications.SchedulableTriggerInputTypes?.DATE || "date";
  const weeklyType =
    Notifications.SchedulableTriggerInputTypes?.WEEKLY || "weekly";

  // Android Channel Setup for critical delivery
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("alarm-channel", {
        name: "SnapWake Critical Alarms",
        importance: Notifications.AndroidImportance?.MAX ?? 5,
        vibrationPattern: [0],
        enableVibrate: false,
        bypassDnd: true, // Attempts to bypass Do Not Disturb for critical alarms
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility?.PUBLIC,
      });
    } catch (error) {
      if (__DEV__) console.warn("[Notifications] Channel setup failed", error);
    }
  }

  const scheduleOne = (trigger) =>
    Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || "SnapWake Alarm",
        body: `Time to wake up. Complete "${alarm.challengeTitle || "Challenge"}" to dismiss.`,
        categoryIdentifier: "alarm",
        data: {
          alarmId: alarm.id,
          challengeId: alarm.challengeId,
          challengeTitle: alarm.challengeTitle,
        },
        sound: alarm.ringtone === "Silent" ? false : true,
        priority: Notifications.AndroidNotificationPriority?.MAX,
      },
      trigger,
    });

  let notificationIds = [];

  if (repeatDays.length) {
    notificationIds = await Promise.all(
      repeatDays.map((day) =>
        scheduleOne({
          type: weeklyType,
          weekday: weekdayMap[day],
          hour,
          minute,
          repeats: true,
          channelId: "alarm-channel",
        }),
      ),
    );
  } else {
    notificationIds = [
      await scheduleOne({
        type: dateType,
        date: getNextAlarmDate(alarm),
        channelId: "alarm-channel",
      }),
    ];
  }

  return notificationIds.filter(Boolean);
};

/**
 * Presents an immediate notification (foreground-safe) so alarms can ring while app is open.
 */
export const presentAlarmNotification = async (alarm) => {
  const Notifications = await getExpoNotifications();
  if (!Notifications) return false;
  if (typeof Notifications.presentNotificationAsync !== "function")
    return false;

  try {
    await Notifications.presentNotificationAsync({
      content: {
        title: alarm.label || "SnapWake Alarm",
        body: `Time to wake up. Complete "${alarm.task || alarm.challengeTitle || "Challenge"}" to dismiss.`,
        categoryIdentifier: "alarm",
        data: {
          alarmId: alarm.id,
          challengeId: alarm.challengeId,
          challengeTitle: alarm.challengeTitle || alarm.task,
        },
        sound: alarm.ringtone === "Silent" ? false : true,
        priority: Notifications.AndroidNotificationPriority?.MAX,
        channelId: "alarm-channel",
      },
      trigger: null,
    });
    return true;
  } catch (error) {
    if (__DEV__) console.warn("[Notifications] Present failed", error);
    return false;
  }
};

/**
 * Reschedules an alarm by canceling existing notifications and creating new ones.
 */
export const rescheduleAlarm = async (previousAlarm, nextAlarm) => {
  try {
    await cancelAlarmNotification(previousAlarm);
    const notificationIds = await scheduleAlarmNotification(nextAlarm);

    return {
      ...nextAlarm,
      notificationIds: notificationIds || [],
      notificationId: undefined,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "[Notifications] Reschedule failed. Realtime in-app tracking active.",
        error,
      );
    }
    return nextAlarm;
  }
};
