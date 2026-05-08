import sharp from 'sharp';

const maxCaptureAgeMs = {
  Standard: 60000,
  Strict: 30000,
  Lockdown: 15000,
};

export const runAntiCheatChecks = async ({ image, mimetype, capturedAt, strictness }) => {
  if (!mimetype.startsWith('image/')) {
    return { passed: false, reason: 'Invalid capture format.' };
  }

  const age = Date.now() - new Date(capturedAt).getTime();
  if (Number.isNaN(age) || age < -5000 || age > maxCaptureAgeMs[strictness]) {
    return { passed: false, reason: 'Capture is not fresh. Use the live camera.' };
  }

  const metadata = await sharp(image).metadata();
  if (!metadata.width || !metadata.height || metadata.width < 320 || metadata.height < 320) {
    return { passed: false, reason: 'Capture resolution is too low for AI verification.' };
  }

  const stats = await sharp(image).greyscale().stats();
  const mean = stats.channels[0]?.mean ?? 0;
  const stdev = stats.channels[0]?.stdev ?? 0;

  if (mean < 18) {
    return { passed: false, reason: 'Frame is too dark. Point the camera at the real target.' };
  }

  if (strictness !== 'Standard' && stdev < 8) {
    return { passed: false, reason: 'Frame is too flat. Static or blank images are rejected.' };
  }

  return { passed: true };
};
