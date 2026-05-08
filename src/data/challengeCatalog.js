export const DIFFICULTY_LEVELS = ['Easy', 'Focused', 'Strict'];

export const STRICTNESS_LEVELS = ['Standard', 'Strict', 'Lockdown'];

export const AI_CHALLENGES = [
  {
    id: 'toothbrush',
    title: 'Scan Toothbrush',
    icon: 'brush-outline',
    difficulty: 'Easy',
    aiType: 'Object detection',
    estimatedTime: '8 sec',
    confidenceThreshold: 0.85,
    targets: ['toothbrush'],
  },
  {
    id: 'sky',
    title: 'Capture Sky',
    icon: 'partly-sunny-outline',
    difficulty: 'Easy',
    aiType: 'Scene + brightness',
    estimatedTime: '10 sec',
    confidenceThreshold: 0.82,
    targets: ['sky', 'cloud'],
  },
  {
    id: 'pet',
    title: 'Take Photo of Pet',
    icon: 'paw-outline',
    difficulty: 'Focused',
    aiType: 'Object detection',
    estimatedTime: '12 sec',
    confidenceThreshold: 0.9,
    targets: ['dog', 'cat', 'pet'],
  },
  {
    id: 'running_tap',
    title: 'Capture Running Tap',
    icon: 'water-outline',
    difficulty: 'Strict',
    aiType: 'Object + motion',
    estimatedTime: '15 sec',
    confidenceThreshold: 0.88,
    targets: ['faucet', 'tap', 'water'],
  },
  {
    id: 'make_bed',
    title: 'Make Your Bed',
    icon: 'bed-outline',
    difficulty: 'Strict',
    aiType: 'Reference similarity',
    estimatedTime: '20 sec',
    confidenceThreshold: 0.86,
    targets: ['bed'],
    requiresReference: true,
  },
];

export const getChallengeById = (id) =>
  AI_CHALLENGES.find((challenge) => challenge.id === id) || AI_CHALLENGES[0];

export const getChallengeByTitle = (title) =>
  AI_CHALLENGES.find((challenge) => challenge.title === title) || AI_CHALLENGES[0];
