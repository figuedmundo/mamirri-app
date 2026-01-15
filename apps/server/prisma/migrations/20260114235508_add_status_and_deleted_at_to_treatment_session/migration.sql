-- AlterTable
ALTER TABLE "treatment_sessions" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';
