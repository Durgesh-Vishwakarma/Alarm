import { z } from "zod";

import { verifyImageForChallenge } from "../ai/ai.service.js";
import { runAntiCheatChecks } from "../services/antiCheat.service.js";
import { logVerificationResult } from "../services/history.service.js";

const bodySchema = z.object({
  alarmId: z.string().min(1),
  challengeId: z.string().min(1),
  challengeTitle: z.string().min(1),

  capturedAt: z.string().datetime(),

  strictness: z.enum(["Standard", "Strict", "Lockdown"]).default("Strict"),

  targets: z.string().optional(),
});

export const verifyWakeChallenge = async (req, res) => {
  try {
    // ------------------------------------------------
    // Validate uploaded image
    // ------------------------------------------------
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image capture is required.",
      });
    }

    // ------------------------------------------------
    // Validate request body
    // ------------------------------------------------
    const parsed = bodySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification payload.",
        errors: parsed.error.flatten(),
      });
    }

    const payload = parsed.data;

    // ------------------------------------------------
    // Safely parse targets
    // ------------------------------------------------
    let targets = [];

    try {
      targets = payload.targets ? JSON.parse(payload.targets) : [];

      if (!Array.isArray(targets)) {
        targets = [];
      }
    } catch {
      targets = [];
    }

    // ------------------------------------------------
    // Run anti-cheat checks
    // ------------------------------------------------
    const antiCheat = await runAntiCheatChecks({
      image: req.file.buffer,
      mimetype: req.file.mimetype,
      capturedAt: payload.capturedAt,
      strictness: payload.strictness,
    });

    // ------------------------------------------------
    // Reject failed anti-cheat attempts
    // ------------------------------------------------
    if (!antiCheat.passed) {
      await logVerificationResult({
        alarmId: payload.alarmId,
        challengeId: payload.challengeId,
        success: false,
        confidence: 0,
        reason: antiCheat.reason,
        labels: [],
      });

      return res.status(422).json({
        success: false,
        confidence: 0,
        provider: "anti-cheat",
        message: antiCheat.reason,
      });
    }

    // ------------------------------------------------
    // Run AI verification
    // ------------------------------------------------
    const result = await verifyImageForChallenge({
      image: req.file.buffer,
      mimetype: req.file.mimetype,

      challengeId: payload.challengeId,
      challengeTitle: payload.challengeTitle,

      targets,
    });

    // ------------------------------------------------
    // Store verification history
    // ------------------------------------------------
    await logVerificationResult({
      alarmId: payload.alarmId,
      challengeId: payload.challengeId,

      success: result.success,
      confidence: result.confidence,

      reason: result.message,
      labels: result.labels,
    });

    // ------------------------------------------------
    // Handle Gemini service failure
    // ------------------------------------------------
    if (result.provider === "gemini-error") {
      return res.status(503).json(result);
    }

    // ------------------------------------------------
    // Final response
    // ------------------------------------------------
    return res.status(result.success ? 200 : 422).json(result);
  } catch (error) {
    console.error("Verification controller failed:", error);

    return res.status(500).json({
      success: false,
      confidence: 0,
      provider: "server-error",

      message: "Verification server encountered an unexpected error.",

      error:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
};
