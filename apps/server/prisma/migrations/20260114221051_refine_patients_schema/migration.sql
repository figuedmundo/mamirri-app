/*
  Warnings:

  - Added the required column `type` to the `evaluations` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "evaluations_clinicalCaseId_key";

-- AlterTable
ALTER TABLE "evaluations" ADD COLUMN "type" TEXT;

UPDATE "evaluations" SET "type" = 'INITIAL' WHERE "type" IS NULL;

ALTER TABLE "evaluations" ALTER COLUMN "type" SET NOT NULL;
