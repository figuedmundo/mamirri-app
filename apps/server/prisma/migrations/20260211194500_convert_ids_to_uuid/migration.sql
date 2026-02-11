-- Drop foreign keys first
ALTER TABLE "embeddings" DROP CONSTRAINT IF EXISTS "embeddings_documentId_fkey";
ALTER TABLE "embeddings" DROP CONSTRAINT IF EXISTS "embeddings_parentId_fkey";

-- Drop primary keys
ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "documents_pkey";
ALTER TABLE "embeddings" DROP CONSTRAINT IF EXISTS "embeddings_pkey";

-- Alter columns to UUID using cast
ALTER TABLE "documents" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "embeddings" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "embeddings" ALTER COLUMN "documentId" TYPE UUID USING "documentId"::uuid;
ALTER TABLE "embeddings" ALTER COLUMN "parentId" TYPE UUID USING "parentId"::uuid;

-- Recreate primary keys
ALTER TABLE "documents" ADD PRIMARY KEY ("id");
ALTER TABLE "embeddings" ADD PRIMARY KEY ("id");

-- Recreate foreign keys
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "embeddings"("id") ON UPDATE CASCADE ON DELETE SET NULL;
