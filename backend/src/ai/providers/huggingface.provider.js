const DEFAULT_MODEL = "Qwen/Qwen2.5-VL-7B-Instruct";

const getApiKey = () => {
  if (!process.env.HF_TOKEN) {
    throw new Error("HF_TOKEN is missing in .env");
  }
  return process.env.HF_TOKEN;
};

const getModelName = () => process.env.HF_MODEL || DEFAULT_MODEL;

const getApiUrl = (model) => {
  if (process.env.HF_API_URL) return process.env.HF_API_URL;
  if (model.startsWith("http://") || model.startsWith("https://")) {
    return model;
  }
  return `https://api-inference.huggingface.co/models/${model}`;
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

const extractText = (data) => {
  if (typeof data === "string") return data;
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }
  if (data?.generated_text) return data.generated_text;
  if (data?.output_text) return data.output_text;
  if (data?.choices?.[0]?.message?.content)
    return data.choices[0].message.content;
  return "";
};

export const verifyWithHuggingFace = async ({
  image,
  mimetype,
  prompt,
  challengeTitle,
  targets = [],
}) => {
  const apiKey = getApiKey();
  const model = getModelName();
  const base64Image = image.toString("base64");

  const payload = {
    inputs: {
      image: base64Image,
      text: prompt,
    },
  };

  const response = await requestWithTimeout(getApiUrl(model), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const error = new Error(
      `Hugging Face request failed (Status: ${response.status}) ${text}`,
    );
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const content = extractText(data);
  const normalized = content.toLowerCase();
  const keywords = targets.length ? targets : [challengeTitle];
  const success = keywords.some((keyword) =>
    normalized.includes(String(keyword || "").toLowerCase()),
  );

  return {
    success,
    confidence: success ? 0.85 : 0.25,
    labels: [
      {
        name: success ? "YES" : "NO",
        score: success ? 0.85 : 0.25,
      },
    ],
    provider: `huggingface:${model}`,
    message: success
      ? `${challengeTitle} verified.`
      : `Could not verify "${challengeTitle}". Make sure the target is clearly visible.`,
  };
};
