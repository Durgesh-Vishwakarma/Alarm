export const DIFFICULTY_LEVELS = ['Easy', 'Focused', 'Strict'];

export const STRICTNESS_LEVELS = ['Standard', 'Strict', 'Lockdown'];

const CHALLENGE_ID_ALIASES = {
  brush_teeth: "toothbrush",
};

export const AI_CHALLENGES = [
  {
    id: 'toothbrush',
    title: 'Scan Toothbrush',
    icon: 'brush-outline',
    difficulty: 'Easy',
    aiType: 'Object detection',
    estimatedTime: '8 sec',
    targets: ['toothbrush', 'brush'],
    verificationTips: '🪥 Clear view',
    category: 'Bathroom',
    cameraRequired: true,
  },
  {
    id: 'sky',
    title: 'Capture Sky',
    icon: 'partly-sunny-outline',
    difficulty: 'Easy',
    aiType: 'Scene + brightness',
    estimatedTime: '10 sec',
    targets: ['sky', 'clouds', 'sunlight'],
    verificationTips: '☀ Good lighting',
    category: 'Outdoor',
    cameraRequired: true,
  },
  {
    id: 'pet',
    title: 'Take Photo of Pet',
    icon: 'paw-outline',
    difficulty: 'Focused',
    aiType: 'Object detection',
    estimatedTime: '12 sec',
    targets: ['dog', 'cat', 'pet', 'animal'],
    verificationTips: '🐾 Clear view',
    category: 'Home',
    cameraRequired: true,
  },
  {
    id: 'running_tap',
    title: 'Capture Running Tap',
    icon: 'water-outline',
    difficulty: 'Strict',
    aiType: 'Object + motion',
    estimatedTime: '15 sec',
    targets: ['faucet', 'tap', 'water', 'sink'],
    verificationTips: '💧 Motion needed',
    category: 'Kitchen',
    cameraRequired: true,
  },
  {
    id: 'make_bed',
    title: 'Make Your Bed',
    icon: 'bed-outline',
    difficulty: 'Strict',
    aiType: 'Semantic analysis',
    estimatedTime: '20 sec',
    targets: ['bed', 'made bed', 'bedroom'],
    verificationTips: '🛏 Room scene',
    category: 'Bedroom',
    cameraRequired: true,
  },
  {
    id: "custom",
    title: "Custom challenge",
    icon: "create-outline",
    difficulty: "Your wording",
    aiType: "Semantic",
    estimatedTime: "15 sec",
    targets: ["photo", "proof"],
    verificationTips: "Describe what the photo should show",
    category: "Custom",
    cameraRequired: true,
  },
];

export const getChallengeById = (id) => {
  if (!id) return AI_CHALLENGES[0];
  const resolved = CHALLENGE_ID_ALIASES[id] || id;
  return AI_CHALLENGES.find((challenge) => challenge.id === resolved) || AI_CHALLENGES[0];
};

export const getChallengeByTitle = (title) =>
  AI_CHALLENGES.find((challenge) => challenge.title === title) || AI_CHALLENGES[0];
