import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

let dbDisabled = false;

const isConnectionError = (error) => {
  const code = error?.code;
  return (
    code === "P1000" ||
    code === "P1001" ||
    code === "P1002" ||
    code === "P1003" ||
    code === "P1005" ||
    code === "P1006" ||
    code === "P1013"
  );
};

const resolveAlarmId = async (alarmId) => {
  if (!alarmId) return null;

  const alarm = await prisma.alarm.findUnique({
    where: { id: alarmId },
    select: { id: true },
  });

  return alarm?.id ?? null;
};

// ----------------------------------------------------
// Log verification result
// ----------------------------------------------------
export const logVerificationResult = async (entry = {}) => {
  if (!process.env.DATABASE_URL || dbDisabled) {
    return;
  }

  try {
    const {
      alarmId = null,
      userId = null,
      challengeId = null,
      success = false,
      confidence = 0,
      reason = "Unknown result",
      labels = [],
      provider = null,
    } = entry;

    const normalizedLabels = Array.isArray(labels) ? labels : [];
    const resolvedAlarmId = await resolveAlarmId(alarmId);

    await prisma.challengeResult.create({
      data: {
        alarmId: resolvedAlarmId,
        userId,
        challengeId,
        success,
        confidence,
        reason,
        provider,
        labels: normalizedLabels,
        metadata: {},
      },
    });
  } catch (error) {
    if (isConnectionError(error)) {
      dbDisabled = true;
      console.warn("PostgreSQL logging disabled:", error?.message || error);
      return;
    }

    console.error(
      "Failed to log verification result:",
      error?.message || error,
    );
  }
};

// ----------------------------------------------------
// Optional graceful shutdown
// ----------------------------------------------------
export const closeDatabasePool = async () => {
  try {
    await prisma.$disconnect();
    console.log("Prisma client disconnected.");
  } catch (error) {
    console.error("Failed to close Prisma client:", error);
  }
};
