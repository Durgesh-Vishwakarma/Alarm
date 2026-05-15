export const steps = [
  { key: 'time', label: 'Time', icon: 'sparkles' },
  { key: 'repeat', label: 'Repeat', icon: 'calendar' },
  { key: 'challenge', label: 'Challenge', icon: 'link' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline' },
];

export const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const repeatPresets = {
  Once: [],
  Weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  Weekend: ['Sat', 'Sun'],
  Daily: dayOptions,
};

export const ringtoneOptions = [
  {
    id: 'ringtone',
    label: 'Bright Morning',
    nativeId: 'ringtone',
  },
  {
    id: 'cincin',
    label: 'Soft Chime',
    nativeId: 'cincin',
  },
  {
    id: 'iphone',
    label: 'Classic Ring',
    nativeId: 'iphone',
  },
];

export const challenges = [
  {
  id: "scan-toothbrush",
  title: "Scan Toothbrush",
  description: "Take a photo of your toothbrush to prove you are awake",
  icon: "sparkles-outline",
  iconColor: "#FF5A00",
  backgroundColor: "#FFF0E8",
  },

  {
    id: "drink-water",
    title: "Drink Water",
    description: "Take a photo of a glass or bottle of water",
    icon: "water-outline",
    iconColor: "#22C55E",
    backgroundColor: "#EAFBF0",
  },

  {
    id: "scan-bathroom-mirror",
    title: "Bathroom Mirror",
    description: "Take a selfie in your bathroom mirror",
    icon: "camera-outline",
    iconColor: "#3B82F6",
    backgroundColor: "#EEF4FF",
  },

  {
    id: "scan-sunlight",
    title: "Morning Sunlight",
    description: "Capture natural morning light near a window",
    icon: "sunny-outline",
    iconColor: "#F59E0B",
    backgroundColor: "#FFF7E6",
  },
];

export const initialAlarmDraft = {
  hour: 6,
  minute: 0,
  period: 'AM',
  repeatPreset: 'Weekdays',
  days: repeatPresets.Weekdays,
  challengeId: 'scan-toothbrush',
  customChallengeTitle: 'My Challenge',
  customChallengeDescription: 'Write what you must complete to stop the alarm',
  label: 'Morning Routine',
  snooze: 10,
  sound: ringtoneOptions[0].label,
  vibration: true,
  notification: true,
  smartWake: true,
  volume: 80,
};
