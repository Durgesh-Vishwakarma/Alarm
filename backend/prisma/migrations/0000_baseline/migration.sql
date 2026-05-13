-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."alarms" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "repeat_days" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "challenge_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alarms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."challenge_results" (
    "id" BIGSERIAL NOT NULL,
    "alarm_id" TEXT,
    "challenge_id" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "confidence" DECIMAL(4,3) NOT NULL,
    "provider" TEXT,
    "reason" TEXT,
    "labels" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wake_history" (
    "id" BIGSERIAL NOT NULL,
    "alarm_id" TEXT,
    "woke_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wake_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_alarms_active" ON "public"."alarms"("is_active" ASC);

-- CreateIndex
CREATE INDEX "idx_alarms_created_at" ON "public"."alarms"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_challenge_results_alarm_id" ON "public"."challenge_results"("alarm_id" ASC);

-- CreateIndex
CREATE INDEX "idx_challenge_results_challenge_id" ON "public"."challenge_results"("challenge_id" ASC);

-- CreateIndex
CREATE INDEX "idx_challenge_results_created_at" ON "public"."challenge_results"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_challenge_results_labels" ON "public"."challenge_results" USING GIN ("labels");

-- CreateIndex
CREATE INDEX "idx_challenge_results_provider" ON "public"."challenge_results"("provider" ASC);

-- CreateIndex
CREATE INDEX "idx_challenge_results_success" ON "public"."challenge_results"("success" ASC);

-- CreateIndex
CREATE INDEX "idx_wake_history_alarm_id" ON "public"."wake_history"("alarm_id" ASC);

-- CreateIndex
CREATE INDEX "idx_wake_history_success" ON "public"."wake_history"("success" ASC);

-- CreateIndex
CREATE INDEX "idx_wake_history_woke_at" ON "public"."wake_history"("woke_at" DESC);

-- AddForeignKey
ALTER TABLE "public"."challenge_results" ADD CONSTRAINT "challenge_results_alarm_id_fkey" FOREIGN KEY ("alarm_id") REFERENCES "public"."alarms"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."wake_history" ADD CONSTRAINT "wake_history_alarm_id_fkey" FOREIGN KEY ("alarm_id") REFERENCES "public"."alarms"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

