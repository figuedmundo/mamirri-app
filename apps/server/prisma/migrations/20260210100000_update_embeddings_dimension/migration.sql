-- Drop existing vector index
DROP INDEX IF EXISTS embeddings_vector_idx;

-- Alter the vector column to 1024 dimensions
-- Note: This works because the table is expected to be empty or clean
-- If it has data, those vectors will be invalid for the new model anyway
ALTER TABLE embeddings 
  ALTER COLUMN vector TYPE VECTOR(1024);

-- Recreate vector index for similarity search
-- Using ivfflat which is standard for pgvector
CREATE INDEX embeddings_vector_idx ON embeddings 
  USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);
