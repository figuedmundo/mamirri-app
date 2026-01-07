-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- CreateTable: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'THERAPIST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: patients
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "therapistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: sessions
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "patients_name_idx" ON "patients"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "sessions_patient_idx" ON "sessions"("patientId");

-- CreateIndex
CREATE INDEX "sessions_therapist_idx" ON "sessions"("therapistId");

-- CreateIndex
CREATE INDEX "sessions_date_idx" ON "sessions"("date");

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Alter tables for pgvector (optional, for future use)
ALTER TABLE sessions ADD COLUMN "embedding" vector(1536);
