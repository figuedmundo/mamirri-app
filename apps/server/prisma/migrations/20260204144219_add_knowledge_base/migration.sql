-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable

CREATE TABLE "embeddings" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "vector" vector(768) NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documents_filePath_key" ON "documents"("filePath");

-- CreateIndex
CREATE INDEX "embeddings_vector_idx" ON "embeddings" USING hnsw (vector vector_cosine_ops);

-- AddForeignKey
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
