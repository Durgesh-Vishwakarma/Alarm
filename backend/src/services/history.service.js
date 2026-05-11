import pg from 'pg';

const { Pool } = pg;

// ----------------------------------------------------
// Create PostgreSQL connection pool
// ----------------------------------------------------
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString:
        process.env.DATABASE_URL,

      ssl:
        process.env.NODE_ENV ===
        'production'
          ? {
              rejectUnauthorized: false,
            }
          : false,

      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
  : null;

// ----------------------------------------------------
// Log verification result
// ----------------------------------------------------
export const logVerificationResult = async (
  entry = {}
) => {
  // Database disabled
  if (!pool) {
    return;
  }

  try {
    const {
      alarmId = null,
      challengeId = null,

      success = false,
      confidence = 0,

      reason = 'Unknown result',

      labels = [],

      provider = null,
    } = entry;

    // Normalize labels safely
    const normalizedLabels =
      Array.isArray(labels)
        ? labels
        : [];

    // Insert verification result
    await pool.query(
      `
      INSERT INTO challenge_results (
        alarm_id,
        challenge_id,
        success,
        confidence,
        reason,
        provider,
        labels,
        created_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        NOW()
      )
      `,
      [
        alarmId,
        challengeId,

        success,
        confidence,

        reason,
        provider,

        JSON.stringify(
          normalizedLabels
        ),
      ]
    );

  } catch (error) {
    console.error(
      'Failed to log verification result:',
      error?.message || error
    );
  }
};

// ----------------------------------------------------
// Optional graceful shutdown
// ----------------------------------------------------
export const closeDatabasePool = async () => {
  if (!pool) {
    return;
  }

  try {
    await pool.end();

    console.log(
      'PostgreSQL pool closed.'
    );
  } catch (error) {
    console.error(
      'Failed to close PostgreSQL pool:',
      error
    );
  }
};

