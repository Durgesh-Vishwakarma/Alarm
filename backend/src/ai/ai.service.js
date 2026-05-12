import sharp from "sharp";
import { buildPrompt } from "./prompts.js";
import { verifyWithGemini } from "./providers/gemini.provider.js";
import { verifyWithHuggingFace } from "./providers/huggingface.provider.js";
import { verifyWithOpenRouter } from "./providers/openrouter.provider.js";

const allowLocalAiFallback =
  process.env.ALLOW_LOCAL_AI_FALLBACK !== "false" &&
  process.env.NODE_ENV !== "production";

const getProvider = () => {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();

  if (process.env.NODE_ENV !== "production") {
    console.log("AI_PROVIDER =", provider);
  }

  switch (provider) {
    case "gemini":
      return verifyWithGemini;
    case "openrouter":
      return verifyWithOpenRouter;
    case "huggingface":
      return verifyWithHuggingFace;
    default:
      throw new Error(`Invalid AI provider: ${provider}`);
  }
};

const brightnessScore = async (image) => {
  const stats = await sharp(image).greyscale().stats();
  return stats.channels[0]?.mean ?? 0;
};

const imageQualityScore = async (image) => {
  const metadata = await sharp(image).metadata();
  const stats = await sharp(image).greyscale().stats();
  const channel = stats.channels?.[0] || {};

  return {
    brightness: channel.mean ?? 0,
    variation: channel.stdev ?? 0,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
};

const optimizeImage = async (image) => {
  return sharp(image)
    .resize({
      width: 512,
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 60,
    })
    .toBuffer();
};

const isQuotaError = (error) => {
  const message = (error?.message || "").toLowerCase();
  return (
    error?.status === 429 ||
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("credits")
  );
};

const localQuotaFallback = async ({ image, challengeTitle }) => {
  const quality = await imageQualityScore(image);
  const success =
    quality.brightness >= 35 &&
    quality.variation >= 10 &&
    quality.width >= 320 &&
    quality.height >= 320;

  return {
    success,
    confidence: success ? 0.55 : 0.2,
    labels: [
      {
        name: success ? "local-quality-pass" : "local-quality-fail",
        score: success ? 0.55 : 0.2,
      },
    ],
    provider: "local-quota-fallback",
    message: success
      ? `${challengeTitle} accepted by local fallback because provider quota is exhausted.`
      : "Image could not pass local fallback. Use a brighter, clearer live photo.",
  };
};

export const verifyImageForChallenge = async ({
  image,
  mimetype = "image/jpeg",
  challengeId,
  challengeTitle,
  targets = [],
}) => {
  try {
    const brightness = await brightnessScore(image);

    if (brightness < 30) {
      return {
        success: false,
        confidence: 0.15,
        labels: [
          {
            name: "too-dark",
            score: 1,
          },
        ],
        provider: "local-precheck",
        message: "Image is too dark. Turn on lights and try again.",
      };
    }

    const optimizedImage = await optimizeImage(image);

    const prompt = buildPrompt({
      challengeTitle,
      targets,
    });

    const provider = getProvider();
    const result = await provider({
      image: optimizedImage,
      mimetype,
      prompt,
      challengeId,
      challengeTitle,
      targets,
    });

    return result;
  } catch (error) {
    console.error("AI verification failed:", error);

    if (allowLocalAiFallback && isQuotaError(error)) {
      return localQuotaFallback({ image, challengeTitle });
    }

    return {
      success: false,
      confidence: 0,
      labels: [],
      provider: "ai-error",
      message: "AI verification service is temporarily unavailable.",
      providerError: error?.message || "Unknown AI error",
    };
  }
};
