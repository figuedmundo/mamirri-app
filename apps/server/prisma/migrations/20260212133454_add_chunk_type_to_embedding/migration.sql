-- CreateEnum
CREATE TYPE "ChunkType" AS ENUM ('NARRATIVE', 'INDEX', 'TOC', 'REFERENCES');

-- AlterTable
ALTER TABLE "embeddings" ADD COLUMN     "chunkType" "ChunkType" NOT NULL DEFAULT 'NARRATIVE';
