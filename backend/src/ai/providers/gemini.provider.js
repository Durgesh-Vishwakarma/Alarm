import { GoogleGenerativeAI } from "@google/generative-ai";

const defaultModelNames = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-preview-05-20",
];

const modelNames = (process.env.GEMINI_MODEL || defaultModelNames.join(","))
  .split(",")
  .map((name) => name.trim())
  .map((name) => name.replace(/^models\//, ""))
  .filter((name) => !name.startsWith("gemini-1.5-"))
  .filter((name) => !name.startsWith("gemini-2.0-"))
  .filter(Boolean);

if (!modelNames.length) {
  modelNames.push(...defaultModelNames);
}

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env");
  }

  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const getModel = (client, name) =>
  client.getGenerativeModel({
    model: name,
    generationConfig: {
      temperature: 0.1,
      topP: 1,
      topK: 32,
      maxOutputTokens: 5,
    },
  });

const geminiRequestWithTimeout = async (
  client,
  modelName,
  payload,
  timeoutMs = 20000,
) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Gemini request timeout"));
    }, timeoutMs);
  });

  return Promise.race([
    getModel(client, modelName).generateContent(payload),
    timeoutPromise,
  ]);
};

const isModelNotFound = (error) => {
  const message = error?.message || "";
  return (
    error?.status === 404 ||
    message.includes("404") ||
    message.includes("not found")
  );
};

const isRetryableError = (error) => {
  const message = (error?.message || "").toLowerCase();

  return (
    error?.status === 429 ||
    error?.status === 500 ||
    error?.status === 503 ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("429")
  );
};

const generateContentWithFallback = async (client, payload) => {
  let lastError;

  for (const name of modelNames) {
    try {
      const result = await geminiRequestWithTimeout(client, name, payload);
      return { result, modelName: name };
    } catch (error) {
      lastError = error;
      if (!isModelNotFound(error) && !isRetryableError(error)) {
        throw error;
      }
      console.warn(
        `Gemini model unavailable: ${name}. Trying next configured model.`,
      );
    }
  }

  throw lastError;
};

export const verifyWithGemini = async ({
  image,
  mimetype,
  prompt,
  challengeTitle,
}) => {
  const client = getClient();

  if (process.env.NODE_ENV !== "production") {
    console.log("Gemini models =", modelNames.join(", "));
  }

  const { result, modelName } = await generateContentWithFallback(client, [
    {
      inlineData: {
        data: image.toString("base64"),
        mimeType: mimetype,
      },
    },
    prompt,
  ]);

  const response = await result.response;
  const text = response.text().trim().toUpperCase();
  const success = text === "YES";

  return {
    success,
    confidence: success ? 0.85 : 0.25,
    labels: [
      {
        name: text,
        score: success ? 0.85 : 0.25,
      },
    ],
    provider: `gemini:${modelName}`,
    message: success
      ? `${challengeTitle} verified.`
      : `Could not verify "${challengeTitle}". Make sure the target is clearly visible.`,
  };
};
