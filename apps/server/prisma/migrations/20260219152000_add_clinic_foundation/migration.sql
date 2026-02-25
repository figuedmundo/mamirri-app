CREATE TABLE "clinics" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "users"
ADD COLUMN "clinicId" TEXT;

ALTER TABLE "patients"
ADD COLUMN "clinicId" TEXT,
ADD COLUMN "primaryTherapistId" TEXT;

CREATE INDEX "users_clinicId_idx" ON "users"("clinicId");
CREATE INDEX "patients_clinicId_idx" ON "patients"("clinicId");
CREATE INDEX "patients_therapistId_idx" ON "patients"("therapistId");
CREATE INDEX "patients_primaryTherapistId_idx" ON "patients"("primaryTherapistId");

ALTER TABLE "users"
ADD CONSTRAINT "users_clinicId_fkey"
FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "patients"
ADD CONSTRAINT "patients_clinicId_fkey"
FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "clinic_invitations" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'THERAPIST',
  "clinicId" TEXT NOT NULL,
  "invitedById" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "clinic_invitations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clinic_invitations_token_key" ON "clinic_invitations"("token");
CREATE INDEX "clinic_invitations_clinicId_idx" ON "clinic_invitations"("clinicId");
CREATE INDEX "clinic_invitations_email_idx" ON "clinic_invitations"("email");
CREATE INDEX "clinic_invitations_expiresAt_idx" ON "clinic_invitations"("expiresAt");

ALTER TABLE "clinic_invitations"
ADD CONSTRAINT "clinic_invitations_clinicId_fkey"
FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "clinic_invitations"
ADD CONSTRAINT "clinic_invitations_invitedById_fkey"
FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "clinical_cases" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "evaluations" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "treatment_plans" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "treatment_sessions" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "session_photos" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "footprints" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "posture_videos" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "insoles" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "sessions" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "ai_analyses" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "ai_feedbacks" ADD COLUMN "clinicId" TEXT;

CREATE INDEX "clinical_cases_clinicId_idx" ON "clinical_cases"("clinicId");
CREATE INDEX "evaluations_clinicId_idx" ON "evaluations"("clinicId");
CREATE INDEX "treatment_plans_clinicId_idx" ON "treatment_plans"("clinicId");
CREATE INDEX "treatment_sessions_clinicId_idx" ON "treatment_sessions"("clinicId");
CREATE INDEX "session_photos_clinicId_idx" ON "session_photos"("clinicId");
CREATE INDEX "footprints_clinicId_idx" ON "footprints"("clinicId");
CREATE INDEX "posture_videos_clinicId_idx" ON "posture_videos"("clinicId");
CREATE INDEX "insoles_clinicId_idx" ON "insoles"("clinicId");
CREATE INDEX "sessions_clinicId_idx" ON "sessions"("clinicId");
CREATE INDEX "ai_analyses_clinicId_idx" ON "ai_analyses"("clinicId");
CREATE INDEX "ai_feedbacks_clinicId_idx" ON "ai_feedbacks"("clinicId");

UPDATE "patients" p
SET "clinicId" = u."clinicId"
FROM "users" u
WHERE p."therapistId" = u."id" AND p."clinicId" IS NULL;

UPDATE "clinical_cases" c
SET "clinicId" = p."clinicId"
FROM "patients" p
WHERE c."patientId" = p."id" AND c."clinicId" IS NULL;

UPDATE "evaluations" e
SET "clinicId" = c."clinicId"
FROM "clinical_cases" c
WHERE e."clinicalCaseId" = c."id" AND e."clinicId" IS NULL;

UPDATE "treatment_plans" tp
SET "clinicId" = c."clinicId"
FROM "clinical_cases" c
WHERE tp."clinicalCaseId" = c."id" AND tp."clinicId" IS NULL;

UPDATE "treatment_sessions" ts
SET "clinicId" = c."clinicId"
FROM "clinical_cases" c
WHERE ts."clinicalCaseId" = c."id" AND ts."clinicId" IS NULL;

UPDATE "session_photos" sp
SET "clinicId" = ts."clinicId"
FROM "treatment_sessions" ts
WHERE sp."sessionId" = ts."id" AND sp."clinicId" IS NULL;

UPDATE "footprints" f
SET "clinicId" = e."clinicId"
FROM "evaluations" e
WHERE f."evaluationId" = e."id" AND f."clinicId" IS NULL;

UPDATE "posture_videos" pv
SET "clinicId" = e."clinicId"
FROM "evaluations" e
WHERE pv."evaluationId" = e."id" AND pv."clinicId" IS NULL;

UPDATE "insoles" i
SET "clinicId" = c."clinicId"
FROM "clinical_cases" c
WHERE i."clinicalCaseId" = c."id" AND i."clinicId" IS NULL;

UPDATE "sessions" s
SET "clinicId" = p."clinicId"
FROM "patients" p
WHERE s."patientId" = p."id" AND s."clinicId" IS NULL;

UPDATE "ai_analyses" a
SET "clinicId" = c."clinicId"
FROM "clinical_cases" c
WHERE a."clinicalCaseId" = c."id" AND a."clinicId" IS NULL;

UPDATE "ai_feedbacks" af
SET "clinicId" = aa."clinicId"
FROM "ai_analyses" aa
WHERE af."aiAnalysisId" = aa."id" AND af."clinicId" IS NULL;

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "patients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clinical_cases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "evaluations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "treatment_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session_photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_analyses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_feedbacks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_clinic_isolation" ON "users"
FOR ALL
USING (
  current_setting('app.current_clinic_id', true) IS NULL
  OR "clinicId"::text = current_setting('app.current_clinic_id', true)
);

CREATE POLICY "patients_clinic_isolation" ON "patients"
FOR ALL
USING (
  current_setting('app.current_clinic_id', true) IS NULL
  OR "clinicId"::text = current_setting('app.current_clinic_id', true)
);

CREATE POLICY "clinical_cases_clinic_isolation" ON "clinical_cases"
FOR ALL
USING (
  current_setting('app.current_clinic_id', true) IS NULL
  OR "clinicId"::text = current_setting('app.current_clinic_id', true)
);

CREATE POLICY "evaluations_clinic_isolation" ON "evaluations"
FOR ALL
USING (
  current_setting('app.current_clinic_id', true) IS NULL
  OR "clinicId"::text = current_setting('app.current_clinic_id', true)
);

CREATE POLICY "treatment_sessions_clinic_isolation" ON "treatment_sessions"
FOR ALL
USING (
  current_setting('app.current_clinic_id', true) IS NULL
  OR "clinicId"::text = current_setting('app.current_clinic_id', true)
);

CREATE POLICY "session_photos_clinic_isolation" ON "session_photos"
FOR ALL
USING (
  current_setting('app.current_clinic_id', true) IS NULL
  OR "clinicId"::text = current_setting('app.current_clinic_id', true)
);

CREATE POLICY "sessions_clinic_isolation" ON "sessions"
FOR ALL
USING (
  current_setting('app.current_clinic_id', true) IS NULL
  OR "clinicId"::text = current_setting('app.current_clinic_id', true)
);

CREATE POLICY "ai_analyses_clinic_isolation" ON "ai_analyses"
FOR ALL
USING (
  current_setting('app.current_clinic_id', true) IS NULL
  OR "clinicId"::text = current_setting('app.current_clinic_id', true)
);

CREATE POLICY "ai_feedbacks_clinic_isolation" ON "ai_feedbacks"
FOR ALL
USING (
  current_setting('app.current_clinic_id', true) IS NULL
  OR "clinicId"::text = current_setting('app.current_clinic_id', true)
);
