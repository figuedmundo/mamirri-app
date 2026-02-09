-- AlterTable
ALTER TABLE "embeddings" ADD COLUMN     "parentContent" TEXT,
ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "embeddings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Re-create HNSW index (was dropped in 20260204172706_add_document_metadata)
CREATE INDEX "embeddings_vector_idx" ON "embeddings" USING hnsw (vector vector_cosine_ops);

-- Create GIN index for full-text search (BM25/hybrid search)
CREATE INDEX "embeddings_content_fts" ON "embeddings" USING GIN (to_tsvector('english', content));
