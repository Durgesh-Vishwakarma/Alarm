import { z } from "zod";
import { runAntiCheatChecks } from "../services/antiCheat.service.js";
import { verifyImageWithGemini } from "../services/gemini.service.js";

const bodySchema = z.object({
  challengeId: z.string().min(1),
  challengeTitle: z.string().min(1),
  capturedAt: z.string().datetime(),
  strictness: z.enum(["Standard", "Strict", "Lockdown"]).default("Strict"),
  targets: z.string().optional(),
});

export const verifyWakeChallenge = async (req, res) => {
  try {
    // 1. Validate uploaded image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image capture is required.",
      });
    }

    // 2. Validate request body
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification payload.",
        errors: parsed.error.flatten(),
      });
    }

    const payload = parsed.data;

    // 3. Parse targets
    let targets = [];
    try {
      targets = payload.targets ? JSON.parse(payload.targets) : [];
      if (!Array.isArray(targets)) targets = [];
    } catch {
      targets = [];
    }

    // 4. Run anti-cheat checks
    const antiCheat = await runAntiCheatChecks({
      image: req.file.buffer,
      mimetype: req.file.mimetype,
      capturedAt: payload.capturedAt,
      strictness: payload.strictness,
    });

    if (!antiCheat.passed) {
      return res.status(422).json({
        success: false,
        confidence: 0,
        provider: "anti-cheat",
        message: antiCheat.reason,
      });
    }

    // 5. Run AI verification (Simplified flow)
    const result = await verifyImageWithGemini({
      image: req.file.buffer,
      mimetype: req.file.mimetype,
      challengeTitle: payload.challengeTitle,
      targets,
    });

    // 6. Response
    return res.status(result.success ? 200 : 422).json(result);
  } catch (error) {
    console.error("Verification controller failed:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed.",
      error: process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
};
