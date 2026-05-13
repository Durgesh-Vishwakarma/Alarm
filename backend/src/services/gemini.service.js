import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from "sharp";
import { buildPrompt } from "../ai/prompts.js";

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env");
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

export const verifyImageWithGemini = async ({
  image,
  mimetype,
  challengeTitle,
  targets = [],
}) => {
  // 1. Image Optimization (width 512, quality 45)
  const optimizedImage = await sharp(image)
    .resize({ width: 512, withoutEnlargement: true })
    .jpeg({ quality: 45 })
    .toBuffer();

  // 2. Setup Gemini (Single model, single request)
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2,
    },
  });

  const prompt = buildPrompt({ challengeTitle, targets });

  // 3. Single request with 10s timeout
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Gemini request timeout")), 10000)
  );

  const result = await Promise.race([
    model.generateContent([
      {
        inlineData: {
          data: optimizedImage.toString("base64"),
          mimeType: mimetype,
        },
      },
      prompt,
    ]),
    timeoutPromise,
  ]);

  const response = await result.response;
  const text = response.text().trim().toUpperCase();
  const success = text === "YES";

  return {
    success,
    confidence: success ? 0.9 : 0.1,
    message: success
      ? `${challengeTitle} verified.`
      : `Could not verify "${challengeTitle}".`,
    provider: "gemini-lite",
  };
};
