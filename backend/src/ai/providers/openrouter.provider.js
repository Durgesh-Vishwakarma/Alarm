const DEFAULT_MODEL = "qwen/qwen2.5-vl-72b-instruct:free";

const getApiKey = () => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing in .env");
  }
  return process.env.OPENROUTER_API_KEY;
};

const getModelList = () => {
  const configured = process.env.OPENROUTER_MODEL
    ? process.env.OPENROUTER_MODEL.split(",").map((name) => name.trim())
    : [];

  return [
    ...configured,
    DEFAULT_MODEL,
    "google/gemma-3-27b-it:free",
    "meta-llama/llama-4-maverick:free",
  ].filter(Boolean);
};

const requestWithTimeout = async (url, options, timeoutMs = 20000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

const parseYesNo = (text) => {
  const normalized = (text || "").trim().toUpperCase();
  if (normalized === "YES") return true;
  if (normalized === "NO") return false;
  return normalized.includes("YES");
};

export const verifyWithOpenRouter = async ({
  image,
  mimetype,
  prompt,
  challengeTitle,
}) => {
  const apiKey = getApiKey();
  const modelList = getModelList();
  let lastError;

  for (const model of modelList) {
    const payload = {
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimetype};base64,${image.toString("base64")}`,
              },
            },
          ],
        },
      ],
    };

    const response = await requestWithTimeout(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      const normalized = text.toLowerCase();
      const isInvalidModel =
        response.status === 404 ||
        (response.status === 400 &&
          (normalized.includes("not a valid model") ||
            normalized.includes("invalid model") ||
            normalized.includes("not found"))) ||
        normalized.includes("no endpoints found");

      const error = new Error(
        `OpenRouter request failed (Status: ${response.status}) ${text}`,
      );
      error.status = response.status;
      lastError = error;

      if (isInvalidModel) {
        continue;
      }

      throw error;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const success = parseYesNo(content);

    return {
      success,
      confidence: success ? 0.85 : 0.25,
      labels: [
        {
          name: success ? "YES" : "NO",
          score: success ? 0.85 : 0.25,
        },
      ],
      provider: `openrouter:${model}`,
      message: success
        ? `${challengeTitle} verified.`
        : `Could not verify "${challengeTitle}". Make sure the target is clearly visible.`,
    };
  }

  throw lastError || new Error("OpenRouter request failed.");
};
