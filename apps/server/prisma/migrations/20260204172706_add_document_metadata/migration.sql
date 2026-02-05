-- DropIndex
DROP INDEX "embeddings_vector_idx";

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "metadata" JSONB;
