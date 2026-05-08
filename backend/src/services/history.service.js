import pg from 'pg';

const { Pool } = pg;

const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;

export const logVerificationResult = async (entry) => {
  if (!pool) return;

  await pool.query(
    `insert into challenge_results
      (alarm_id, challenge_id, success, confidence, reason, labels, created_at)
     values ($1, $2, $3, $4, $5, $6, now())`,
    [
      entry.alarmId,
      entry.challengeId,
      entry.success,
      entry.confidence,
      entry.reason,
      JSON.stringify(entry.labels),
    ]
  );
};
