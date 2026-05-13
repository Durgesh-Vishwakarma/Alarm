import sharp from 'sharp';

const STRICTNESS_LIMITS = {
  Standard: 60_000,
  Strict: 30_000,
  Lockdown: 15_000,
};

const MIN_WIDTH = 320;
const MIN_HEIGHT = 320;

const MIN_BRIGHTNESS = 18;

const MIN_STDEV = {
  Standard: 0,
  Strict: 8,
  Lockdown: 10,
};

export const runAntiCheatChecks = async ({
  image,
  mimetype,
  capturedAt,
  strictness = 'Strict',
}) => {
  try {
    // ----------------------------------------
    // Validate image format
    // ----------------------------------------
    if (
      !mimetype ||
      !mimetype.startsWith('image/')
    ) {
      return {
        passed: false,
        reason: 'Invalid image format.',
      };
    }

    // ----------------------------------------
    // Validate capture timestamp
    // ----------------------------------------
    const captureTime =
      new Date(capturedAt).getTime();

    if (Number.isNaN(captureTime)) {
      return {
        passed: false,
        reason: 'Invalid capture timestamp.',
      };
    }

    const age = Date.now() - captureTime;

    // Allow small clock mismatch tolerance
    if (age < -5000) {
      return {
        passed: false,
        reason:
          'Device time appears incorrect.',
      };
    }

    const maxAge =
      STRICTNESS_LIMITS[strictness] ??
      STRICTNESS_LIMITS.Strict;

    if (age > maxAge) {
      return {
        passed: false,
        reason:
          'Capture is not fresh. Use live camera.',
      };
    }

    // ----------------------------------------
    // Read image metadata and analyze statistics
    // ----------------------------------------
    let metadata;
    let stats;

    try {
      const sharpImage = sharp(image);
      [metadata, stats] = await Promise.all([
        sharpImage.metadata(),
        sharpImage.greyscale().stats(),
      ]);
    } catch {
      return {
        passed: false,
        reason: 'Uploaded image could not be processed.',
      };
    }

    // ----------------------------------------
    // Validate resolution
    // ----------------------------------------
    if (!metadata.width || !metadata.height) {
      return {
        passed: false,
        reason: 'Image dimensions are invalid.',
      };
    }

    if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
      return {
        passed: false,
        reason: 'Image resolution is too low.',
      };
    }

    const mean = stats.channels?.[0]?.mean ?? 0;
    const stdev = stats.channels?.[0]?.stdev ?? 0;

    // ----------------------------------------
    // Detect extremely dark images
    // ----------------------------------------
    if (mean < MIN_BRIGHTNESS) {
      return {
        passed: false,
        reason: 'Frame is too dark. Improve lighting.',
      };
    }

    // ----------------------------------------
    // Detect flat/static images
    // ----------------------------------------
    const minStdev =
      MIN_STDEV[strictness] ?? 8;

    if (stdev < minStdev) {
      return {
        passed: false,
        reason:
          'Frame appears too flat or blank.',
      };
    }

    // ----------------------------------------
    // Passed anti-cheat
    // ----------------------------------------
    return {
      passed: true,

      metrics: {
        brightness: Number(
          mean.toFixed(2)
        ),

        variation: Number(
          stdev.toFixed(2)
        ),

        width: metadata.width,
        height: metadata.height,

        ageMs: age,
      },
    };

  } catch (error) {
    console.error(
      'Anti-cheat validation failed:',
      error
    );

    return {
      passed: false,
      reason:
        'Failed to validate image capture.',
    };
  }
};

