-- DropForeignKey
ALTER TABLE "challenge_results" DROP CONSTRAINT "challenge_results_alarm_id_fkey";

-- DropForeignKey
ALTER TABLE "wake_history" DROP CONSTRAINT "wake_history_alarm_id_fkey";

-- DropIndex
DROP INDEX "idx_alarms_created_at";

-- DropIndex
DROP INDEX "idx_challenge_results_created_at";

-- DropIndex
DROP INDEX "idx_wake_history_woke_at";

-- AlterTable
ALTER TABLE "alarms" ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "repeat_days" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "challenge_results" ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "labels" DROP DEFAULT,
ALTER COLUMN "metadata" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "wake_history" ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "woke_at" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "google_sub" TEXT,
    "display_name" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "strictness" TEXT NOT NULL DEFAULT 'Strict',
    "timezone" TEXT,
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_sub_key" ON "users"("google_sub");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "settings_user_id_key" ON "settings"("user_id");

-- CreateIndex
CREATE INDEX "idx_alarms_user_id" ON "alarms"("user_id");

-- CreateIndex
CREATE INDEX "idx_alarms_created_at" ON "alarms"("created_at");

-- CreateIndex
CREATE INDEX "idx_challenge_results_user_id" ON "challenge_results"("user_id");

-- CreateIndex
CREATE INDEX "idx_challenge_results_created_at" ON "challenge_results"("created_at");

-- CreateIndex
CREATE INDEX "idx_wake_history_user_id" ON "wake_history"("user_id");

-- CreateIndex
CREATE INDEX "idx_wake_history_woke_at" ON "wake_history"("woke_at");

-- AddForeignKey
ALTER TABLE "alarms" ADD CONSTRAINT "alarms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wake_history" ADD CONSTRAINT "wake_history_alarm_id_fkey" FOREIGN KEY ("alarm_id") REFERENCES "alarms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wake_history" ADD CONSTRAINT "wake_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_results" ADD CONSTRAINT "challenge_results_alarm_id_fkey" FOREIGN KEY ("alarm_id") REFERENCES "alarms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_results" ADD CONSTRAINT "challenge_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

