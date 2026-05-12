import pg from "pg";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// ----------------------------------------------------
// Create PostgreSQL connection pool
// ----------------------------------------------------
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,

      ssl:
        process.env.NODE_ENV === "production"
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
// PostgreSQL connection test
// ----------------------------------------------------
if (pool) {
  pool
    .connect()
    .then((client) => {
      console.log("✅ PostgreSQL connected successfully");

      client.release();
    })
    .catch((error) => {
      console.error(
        "❌ PostgreSQL connection failed:",
        error?.message || error,
      );
    });
}



let dbDisabled = false;
let initPromise = null;

const initializeDatabase = async () => {
  if (!pool || dbDisabled) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const schema = await readFile(join(__dirname, "schema.sql"), "utf8");
      await pool.query(schema);
      await pool.query(`
        ALTER TABLE challenge_results
        ALTER COLUMN alarm_id DROP NOT NULL
      `);
    } catch (error) {
      dbDisabled = true;
      console.warn(
        "PostgreSQL logging disabled:",
        error?.message || error,
      );
    }
  })();

  return initPromise;
};

// ----------------------------------------------------
// Log verification result
// ----------------------------------------------------
export const logVerificationResult = async (entry = {}) => {
  // Database disabled
  if (!pool || dbDisabled) {
    return;
  }

  try {
    await initializeDatabase();
    if (dbDisabled) return;

    const {
      alarmId = null,
      challengeId = null,

      success = false,
      confidence = 0,

      reason = "Unknown result",

      labels = [],

      provider = null,
    } = entry;

    // Normalize labels safely
    const normalizedLabels = Array.isArray(labels) ? labels : [];

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
        (SELECT id FROM alarms WHERE id = $1),
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

        JSON.stringify(normalizedLabels),
      ],
    );
  } catch (error) {
    if (
      error?.code === "ECONNREFUSED" ||
      error?.code === "ENOTFOUND" ||
      error?.code === "28P01" ||
      error?.code === "3D000"
    ) {
      dbDisabled = true;
      console.warn(
        "PostgreSQL logging disabled:",
        error?.message || error,
      );
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
  if (!pool) {
    return;
  }

  try {
    await pool.end();

    console.log("PostgreSQL pool closed.");
  } catch (error) {
    console.error("Failed to close PostgreSQL pool:", error);
  }
};
