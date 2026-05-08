import vision from '@google-cloud/vision';
import sharp from 'sharp';

const client = new vision.ImageAnnotatorClient();

const thresholds = {
  toothbrush: 0.85,
  pet: 0.9,
  sky: 0.82,
  running_tap: 0.88,
  make_bed: 0.86,
};

const aliases = {
  toothbrush: ['toothbrush'],
  pet: ['dog', 'cat', 'pet', 'animal'],
  sky: ['sky', 'cloud', 'sunlight', 'atmosphere'],
  running_tap: ['faucet', 'tap', 'plumbing fixture', 'water'],
  make_bed: ['bed', 'bed sheet', 'bedroom', 'pillow'],
};

const normalize = (value = '') => value.toLowerCase().trim();

const brightnessScore = async (image) => {
  const stats = await sharp(image).greyscale().stats();
  return stats.channels[0]?.mean ?? 0;
};

export const verifyImageForChallenge = async ({ image, challengeId, challengeTitle, targets }) => {
  const [labelResult] = await client.labelDetection({ image: { content: image } });
  const [objectResult] = await client.objectLocalization({ image: { content: image } });

  const labels = [
    ...(labelResult.labelAnnotations || []).map((label) => ({
      name: normalize(label.description),
      score: label.score || 0,
    })),
    ...(objectResult.localizedObjectAnnotations || []).map((object) => ({
      name: normalize(object.name),
      score: object.score || 0,
    })),
  ];

  const acceptedTargets = [...(aliases[challengeId] || []), ...targets].map(normalize);
  const bestMatch = labels
    .filter((label) => acceptedTargets.some((target) => label.name.includes(target) || target.includes(label.name)))
    .sort((a, b) => b.score - a.score)[0];

  const threshold = thresholds[challengeId] || 0.85;
  let confidence = bestMatch?.score || 0;

  if (challengeId === 'sky') {
    const brightness = await brightnessScore(image);
    const brightnessPass = brightness > 95;
    confidence = brightnessPass ? Math.max(confidence, 0.83) : confidence * 0.65;
  }

  if (challengeId === 'running_tap') {
    const hasFixture = labels.some((label) => ['faucet', 'tap', 'sink'].some((target) => label.name.includes(target)));
    const hasWater = labels.some((label) => label.name.includes('water'));
    confidence = hasFixture && hasWater ? Math.max(confidence, 0.9) : confidence * 0.7;
  }

  const success = confidence >= threshold;

  return {
    success,
    confidence: Number(confidence.toFixed(3)),
    labels,
    message: success
      ? `${challengeTitle} verified.`
      : `Could not verify ${challengeTitle}. Try a clearer live frame.`,
  };
};
