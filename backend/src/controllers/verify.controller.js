import { z } from 'zod';
import { verifyImageForChallenge } from '../ai/googleVision.service.js';
import { runAntiCheatChecks } from '../services/antiCheat.service.js';
import { logVerificationResult } from '../services/history.service.js';

const bodySchema = z.object({
  alarmId: z.string().min(1),
  challengeId: z.string().min(1),
  challengeTitle: z.string().min(1),
  capturedAt: z.string().datetime(),
  strictness: z.enum(['Standard', 'Strict', 'Lockdown']).default('Strict'),
  targets: z.string().optional(),
});

export const verifyWakeChallenge = async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'Image capture is required.' });
    return;
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid verification payload.' });
    return;
  }

  const payload = parsed.data;
  const targets = payload.targets ? JSON.parse(payload.targets) : [];
  const antiCheat = await runAntiCheatChecks({
    image: req.file.buffer,
    mimetype: req.file.mimetype,
    capturedAt: payload.capturedAt,
    strictness: payload.strictness,
  });

  if (!antiCheat.passed) {
    await logVerificationResult({
      alarmId: payload.alarmId,
      challengeId: payload.challengeId,
      success: false,
      confidence: 0,
      reason: antiCheat.reason,
      labels: [],
    });
    res.status(422).json({ success: false, message: antiCheat.reason, confidence: 0 });
    return;
  }

  const result = await verifyImageForChallenge({
    image: req.file.buffer,
    challengeId: payload.challengeId,
    challengeTitle: payload.challengeTitle,
    targets,
  });

  await logVerificationResult({
    alarmId: payload.alarmId,
    challengeId: payload.challengeId,
    success: result.success,
    confidence: result.confidence,
    reason: result.message,
    labels: result.labels,
  });

  res.status(result.success ? 200 : 422).json(result);
};
