import * as Haptics from "expo-haptics";

/**
 * SnapWake Haptic Service
 * Standardized vibration patterns for premium feel.
 */

export const haptics = {
  // Soft selection for toggles/pickers
  selection: () => {
    Haptics.selectionAsync();
  },

  // Success haptic for verification
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  // Error haptic for failed verification
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  // Impact for buttons/shutter
  impact: (style = "light") => {
    switch (style) {
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  // Rhythm for alarm trigger (simulated via multiple impacts)
  alarmRhythm: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 400);
  }
};
