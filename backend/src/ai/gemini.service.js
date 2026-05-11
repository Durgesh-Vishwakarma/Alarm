
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is missing in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.1,
    topP: 1,
    topK: 32,
    maxOutputTokens: 5,
  },
});

const brightnessScore = async (image) => {
  const stats = await sharp(image).greyscale().stats();
  return stats.channels[0]?.mean ?? 0;
};

const optimizeImage = async (image) => {
  return sharp(image)
    .resize({
      width: 768,
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 70,
    })
    .toBuffer();
};

const buildPrompt = ({
  challengeTitle,
  targets = [],
}) => {
  const targetText =
    targets.length > 0
      ? targets.join(', ')
      : challengeTitle;

  return `
You are verifying a wake-up alarm challenge.

Your task:
Determine whether this image CLEARLY contains or shows:

"${targetText}"

Rules:
- Object/scene must be real
- Ignore drawings if possible
- Ignore screenshots if possible
- Target should be clearly visible
- Be strict but reasonable

Reply ONLY with:
YES
or
NO
`;
};

const geminiRequestWithTimeout = async (
  payload,
  timeoutMs = 8000
) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Gemini request timeout'));
    }, timeoutMs);
  });

  return Promise.race([
    model.generateContent(payload),
    timeoutPromise,
  ]);
};

export const verifyImageForChallenge = async ({
  image,
  mimetype = 'image/jpeg',
  challengeId,
  challengeTitle,
  targets = [],
}) => {
  try {
    // -----------------------------
    // Local anti-cheat brightness check
    // -----------------------------
    const brightness = await brightnessScore(image);

    if (brightness < 30) {
      return {
        success: false,
        confidence: 0.15,
        labels: [
          {
            name: 'too-dark',
            score: 1,
          },
        ],
        provider: 'local-precheck',
        message:
          'Image is too dark. Turn on lights and try again.',
      };
    }

    // -----------------------------
    // Compress image
    // -----------------------------
    const optimizedImage = await optimizeImage(image);

    // -----------------------------
    // Dynamic AI prompt
    // -----------------------------
    const prompt = buildPrompt({
      challengeTitle,
      targets,
    });

    // -----------------------------
    // Gemini API call
    // -----------------------------
    const result =
      await geminiRequestWithTimeout([
        {
          inlineData: {
            data: optimizedImage.toString('base64'),
            mimeType: mimetype,
          },
        },
        prompt,
      ]);

    const response = await result.response;

    const text = response
      .text()
      .trim()
      .toUpperCase();

    // Strict YES/NO parsing
    const success = text === 'YES';

    return {
      success,
      confidence: success ? 0.85 : 0.25,
      labels: [
        {
          name: text,
          score: success ? 0.85 : 0.25,
        },
      ],
      provider: 'gemini-flash',
      message: success
        ? `${challengeTitle} verified.`
        : `Could not verify "${challengeTitle}". Make sure the target is clearly visible.`,
    };
  } catch (error) {
    console.error(
      'Gemini verification failed:',
      error
    );

    return {
      success: false,
      confidence: 0,
      labels: [],
      provider: 'gemini-error',
      message:
        'AI verification service is temporarily unavailable.',
      providerError:
        error?.message || 'Unknown Gemini error',
    };
  }
};

