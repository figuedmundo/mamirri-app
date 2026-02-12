-- CreateEnum
CREATE TYPE "Archetype" AS ENUM ('PRACTICAL', 'ACADEMIC', 'ATLAS', 'CASE_STUDY', 'GENERAL');

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "archetype" "Archetype" NOT NULL DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "embeddings" ADD COLUMN     "isExcluded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sectionType" TEXT;
