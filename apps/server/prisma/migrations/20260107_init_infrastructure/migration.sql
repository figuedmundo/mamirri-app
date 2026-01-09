CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "SessionStatus" AS ENUM ('DRAFT', 'FINALIZED');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'THERAPIST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "therapistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE INDEX "users_email_idx" ON "users"("email");

CREATE INDEX "patients_firstName_lastName_idx" ON "patients"("firstName", "lastName");

CREATE INDEX "sessions_patientId_therapistId_date_idx" ON "sessions"("patientId", "therapistId", "date");

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE EXTENSION IF NOT EXISTS vector;
