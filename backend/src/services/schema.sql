-- =====================================================
-- ALARMS
-- =====================================================

CREATE TABLE IF NOT EXISTS alarms (
  id TEXT PRIMARY KEY,

  label TEXT NOT NULL,

  time TEXT NOT NULL,

  repeat_days TEXT[] NOT NULL DEFAULT '{}',

  challenge_id TEXT NOT NULL,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_alarms_active
ON alarms(is_active);

CREATE INDEX IF NOT EXISTS idx_alarms_created_at
ON alarms(created_at DESC);

-- =====================================================
-- WAKE HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS wake_history (
  id BIGSERIAL PRIMARY KEY,

  alarm_id TEXT REFERENCES alarms(id)
    ON DELETE SET NULL,

  woke_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  success BOOLEAN NOT NULL,

  xp INTEGER NOT NULL DEFAULT 0
    CHECK (xp >= 0)
);

CREATE INDEX IF NOT EXISTS idx_wake_history_alarm_id
ON wake_history(alarm_id);

CREATE INDEX IF NOT EXISTS idx_wake_history_woke_at
ON wake_history(woke_at DESC);

CREATE INDEX IF NOT EXISTS idx_wake_history_success
ON wake_history(success);

-- =====================================================
-- CHALLENGE RESULTS
-- =====================================================

CREATE TABLE IF NOT EXISTS challenge_results (
  id BIGSERIAL PRIMARY KEY,

  alarm_id TEXT
    REFERENCES alarms(id)
    ON DELETE SET NULL,

  challenge_id TEXT NOT NULL,

  success BOOLEAN NOT NULL,

  confidence NUMERIC(4,3) NOT NULL
    CHECK (
      confidence >= 0
      AND confidence <= 1
    ),

  provider TEXT,

  reason TEXT,

  labels JSONB NOT NULL DEFAULT '[]'::jsonb,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenge_results_alarm_id
ON challenge_results(alarm_id);

CREATE INDEX IF NOT EXISTS idx_challenge_results_challenge_id
ON challenge_results(challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenge_results_success
ON challenge_results(success);

CREATE INDEX IF NOT EXISTS idx_challenge_results_created_at
ON challenge_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_challenge_results_provider
ON challenge_results(provider);

-- JSON search optimization
CREATE INDEX IF NOT EXISTS idx_challenge_results_labels
ON challenge_results
USING GIN(labels);

-- =====================================================
-- OPTIONAL UPDATED_AT AUTO UPDATE
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_alarms_updated_at
ON alarms;

CREATE TRIGGER trigger_update_alarms_updated_at
BEFORE UPDATE ON alarms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
