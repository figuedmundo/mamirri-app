/*
  Warnings:

  - You are about to drop the column `address` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `patients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "patients" DROP COLUMN "address",
DROP COLUMN "age",
ADD COLUMN     "emergencyContact" JSONB,
ADD COLUMN     "medicalFlags" TEXT[],
ADD COLUMN     "referralSource" TEXT;
