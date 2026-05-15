export const steps = [
  { key: 'time', label: 'Time', icon: 'sparkles' },
  { key: 'repeat', label: 'Repeat', icon: 'calendar' },
  { key: 'challenge', label: 'Challenge', icon: 'link' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline' },
];

export const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const repeatPresets = {
  Weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  Weekend: ['Sat', 'Sun'],
  Daily: dayOptions,
};

export const challenges = [
  {
    id: 'scan-toothbrush',
    title: 'Scan Toothbrush',
    description: 'Scan your toothbrush to start your day fresh',
    icon: 'flashlight',
    iconColor: '#FF5A00',
    backgroundColor: '#FFF0E8',
  },
  {
    id: 'read-pages',
    title: 'Read 10 Pages',
    description: 'Read 10 pages from any book to wake up mindfully',
    icon: 'book-outline',
    iconColor: '#258CFF',
    backgroundColor: '#EAF5FF',
  },
  {
    id: 'morning-workout',
    title: 'Morning Workout',
    description: 'Do a quick workout to boost your energy',
    icon: 'walk',
    iconColor: '#8B5CF6',
    backgroundColor: '#F3EAFF',
  },
  {
    id: 'custom-challenge',
    title: 'Custom Challenge',
    description: 'Create your own personal challenge',
    icon: 'sparkles',
    iconColor: '#FF6A00',
    backgroundColor: '#FFF0E8',
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
  sound: 'Bright Morning',
  vibration: true,
  notification: true,
  smartWake: true,
  volume: 80,
};
