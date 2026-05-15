export const initialAlarms = [
 {
  id: 'scan-toothbrush',
  time: '06:00',
  meridiem: 'AM',
  title: 'Scan Toothbrush',
  schedule: 'Weekdays  |  Wake Verification',
  icon: 'brush-outline',
  iconColor: '#FF6A00',
  backgroundColor: '#FFF0E8',
  active: true,
},

  {
    id: 'drink-water',
    time: '06:15',
    meridiem: 'AM',
    title: 'Drink Water',
    schedule: 'Daily  |  Morning Routine',
    icon: 'water-outline',
    iconColor: '#22C55E',
    backgroundColor: '#EAFBF0',
    active: true,
  },

  {
    id: 'bathroom-mirror',
    time: '06:45',
    meridiem: 'AM',
    title: 'Bathroom Mirror',
    schedule: 'Weekends  |  Photo Check',
    icon: 'camera-outline',
    iconColor: '#258CFF',
    backgroundColor: '#EAF5FF',
    active: false,
  },
];