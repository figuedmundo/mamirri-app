ALTER TABLE "evaluations"
ADD COLUMN IF NOT EXISTS "voiceNotes" JSONB;

ALTER TABLE "treatment_sessions"
ADD COLUMN IF NOT EXISTS "voiceNotes" JSONB;

ALTER TABLE "evaluations"
DROP COLUMN IF EXISTS "type";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'evaluations_clinicalCaseId_key'
  ) THEN
    CREATE UNIQUE INDEX "evaluations_clinicalCaseId_key"
      ON "evaluations"("clinicalCaseId");
  END IF;
END $$;
