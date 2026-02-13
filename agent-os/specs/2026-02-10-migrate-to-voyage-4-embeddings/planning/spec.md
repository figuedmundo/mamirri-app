# Technical Specification: Migrate to Voyage-4-Large Embeddings

## Overview

This specification defines the migration from Google Gemini embeddings to Voyage-4-large embeddings for the RAG (Retrieval-Augmented Generation) system. The migration addresses Google account limit issues while improving retrieval quality and cost efficiency.

## Background

### Current Implementation

- **Embedding Provider:** Google GenAI (`gemini-embedding-001`)
- **Dimensions:** 768
- **Issues:** Google account hitting rate limits and quota walls

### Target Implementation

- **Embedding Provider:** Voyage AI
- **Document Model:** `voyage-4-large` (1024 dimensions)
- **Query Model:** `voyage-4` (1024 dimensions)
- **Benefits:**
  - Superior retrieval quality (state-of-the-art on RTEB benchmarks)
  - 40% lower serving costs than comparable dense models
  - Asymmetric retrieval support (different models for docs/queries)
  - Shared embedding space across Voyage-4 series

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    KnowledgeBaseService                      │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │ VoyageEmbedding  │    │ Existing Components          │  │
│  │ Service          │    │                              │  │
│  │                  │    │  ┌──────────────────────┐   │  │
│  │ ┌──────────────┐ │    │  │ Cohere Reranker      │   │  │
│  │ │ voyage-4     │ │    │  │ (unchanged)          │   │  │
│  │ │ (queries)    │ │    │  └──────────────────────┘   │  │
│  │ └──────────────┘ │    │                              │  │
│  │                  │    │  ┌──────────────────────┐   │  │
│  │ ┌──────────────┐ │    │  │ Google GenAI         │   │  │
│  │ │ voyage-4-    │ │    │  │ (LLM/Vision only)    │   │  │
│  │ │ large (docs) │ │    │  └──────────────────────┘   │  │
│  │ └──────────────┘ │    │                              │  │
│  └────────┬─────────┘    └──────────────────────────────┘  │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL + pgvector                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ embeddings table (NEW)                               │  │
│  │  - vector: 1024 dimensions                           │  │
│  │  - Compatible with both voyage-4 and voyage-4-large  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Service Architecture

```typescript
// New Service: VoyageEmbeddingService
@Injectable()
class VoyageEmbeddingService {
  - voyageClient: VoyageAIClient
  - documentModel: string = 'voyage-4-large'
  - queryModel: string = 'voyage-4'
  - rateLimiter: TokenRateLimiter

  + generateDocumentEmbedding(text: string): Promise<number[]>
  + generateQueryEmbedding(text: string): Promise<number[]>
  + generateDocumentEmbeddingsBatch(texts: string[]): Promise<number[][]>
  + generateQueryEmbeddingsBatch(texts: string[]): Promise<number[][]>
}

// Modified: KnowledgeBaseService
@Injectable()
class KnowledgeBaseService {
  - voyageEmbeddingService: VoyageEmbeddingService  // NEW
  - cohere: CohereClient                           // UNCHANGED
  // ... other dependencies

  // Methods updated to use VoyageEmbeddingService:
  + ingestFile()           // Uses document embeddings
  + findSimilar()          // Uses query embeddings
  + semanticChunk()        // Uses document embeddings
}
```

## Implementation Details

### 1. VoyageEmbeddingService

**Location:** `apps/server/src/modules/knowledge-base/services/voyage-embedding.service.ts`

**Responsibilities:**

- Wrap Voyage AI SDK with provider-specific logic
- Handle asymmetric retrieval (different models for docs/queries)
- Implement rate limiting for Voyage API constraints
- Support batch processing with optimal batch sizes
- Provide mock embeddings for development/testing

**Key Implementation Details:**

```typescript
import { VoyageAIClient } from 'voyageai';

@Injectable()
export class VoyageEmbeddingService {
  private readonly voyageClient: VoyageAIClient;
  private readonly documentModel = 'voyage-4-large';
  private readonly queryModel = 'voyage-4';
  private readonly rateLimiter: TokenRateLimiter;

  // Voyage-specific constraints:
  private readonly MAX_BATCH_SIZE = 1000; // Voyage limit
  private readonly DOCUMENT_MAX_TOKENS = 120000; // voyage-4-large limit
  private readonly QUERY_MAX_TOKENS = 320000; // voyage-4 limit

  async generateDocumentEmbedding(text: string): Promise<number[]> {
    // Use voyage-4-large for document embeddings
    const response = await this.voyageClient.embed({
      input: text,
      model: this.documentModel,
      inputType: 'document',
      outputDimension: 1024,
    });
    return response.embeddings[0];
  }

  async generateQueryEmbedding(text: string): Promise<number[]> {
    // Use voyage-4 for query embeddings (cost optimization)
    const response = await this.voyageClient.embed({
      input: text,
      model: this.queryModel,
      inputType: 'query',
      outputDimension: 1024,
    });
    return response.embeddings[0];
  }
}
```

**Voyage API Constraints:**

- Max 1000 texts per batch request
- voyage-4-large: 120K token limit per request
- voyage-4: 320K token limit per request
- Rate limits vary by plan (implement with safety margins)

### 2. Database Migration

**Migration Strategy:** ALTER Existing Table

Since the embeddings table is clean/empty, we'll simply alter the existing table to change the vector dimension from 768 to 1024.

**Migration SQL:**

```sql
-- Drop existing vector index (will be recreated with new dimensions)
DROP INDEX IF EXISTS idx_embeddings_vector;

-- Alter the vector column to 1024 dimensions
-- Note: This works because the table is empty/clean
ALTER TABLE embeddings
  ALTER COLUMN vector TYPE VECTOR(1024);

-- Recreate vector index for similarity search
CREATE INDEX idx_embeddings_vector ON embeddings
  USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);
```

**Migration Steps:**

1. Backup/dump existing embeddings table (just in case)
2. Run ALTER TABLE to change vector dimension from 768 to 1024
3. Verify column type is now VECTOR(1024)
4. Recreate vector index
5. Deploy code changes
6. Run ingestion scripts to populate embeddings with Voyage

### 3. Configuration

**Environment Variables:**

```bash
# New Voyage AI Configuration
VOYAGE_API_KEY=your_voyage_api_key_here
VOYAGE_DOCUMENT_MODEL=voyage-4-large  # For document embeddings
VOYAGE_QUERY_MODEL=voyage-4           # For query embeddings

# Keep existing Google configuration for LLM/Vision
GOOGLE_API_KEY=your_google_key_here   # Still needed for LLM
COHERE_API_KEY=your_cohere_key_here   # Unchanged

# Optional: Voyage-specific settings
VOYAGE_MAX_BATCH_SIZE=1000
VOYAGE_RATE_LIMIT_RPM=300  # Requests per minute
VOYAGE_RATE_LIMIT_TPM=1000000  # Tokens per minute
```

**Config Service Integration:**

```typescript
// apps/server/src/config/voyage.config.ts
export default () => ({
  voyage: {
    apiKey: process.env.VOYAGE_API_KEY,
    documentModel: process.env.VOYAGE_DOCUMENT_MODEL || 'voyage-4-large',
    queryModel: process.env.VOYAGE_QUERY_MODEL || 'voyage-4',
    maxBatchSize: parseInt(process.env.VOYAGE_MAX_BATCH_SIZE, 10) || 1000,
    rateLimitRpm: parseInt(process.env.VOYAGE_RATE_LIMIT_RPM, 10) || 300,
    rateLimitTpm: parseInt(process.env.VOYAGE_RATE_LIMIT_TPM, 10) || 1000000,
  },
});
```

### 4. Rate Limiter Updates

**Enhanced TokenRateLimiter:**

```typescript
// Support both Google and Voyage rate limits
class TokenRateLimiter {
  constructor(
    maxTokensPerMinute: number,
    maxRequestsPerMinute: number,
    private readonly provider: 'google' | 'voyage' = 'voyage',
  ) {
    // Provider-specific safety margins
    this.safetyMargin = provider === 'voyage' ? 0.9 : 0.85;
  }

  // Voyage has different token estimation
  estimateTokens(text: string): number {
    if (this.provider === 'voyage') {
      // Voyage uses their own tokenizer
      // Conservative estimate: 1.4 tokens per word
      return Math.ceil(text.split(/\s+/).length * 1.4);
    }
    // Google: 1.6 tokens per word
    return Math.ceil(text.split(/\s+/).length * 1.6);
  }
}
```

### 5. Integration Points

**KnowledgeBaseService Changes:**

**File:** `apps/server/src/modules/knowledge-base/knowledge-base.service.ts`

**Changes Required:**

1. Replace `GoogleGenAI` import with `VoyageEmbeddingService`
2. Update constructor to inject `VoyageEmbeddingService`
3. Replace `generateEmbedding()` calls with appropriate method:
   - Document ingestion → `generateDocumentEmbedding()`
   - Query search → `generateQueryEmbedding()`
4. Update `generateEmbeddingsBatch()` similarly

**Code Changes:**

```typescript
// BEFORE:
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class KnowledgeBaseService {
  private readonly genAI: GoogleGenAI;

  private async generateEmbedding(text: string): Promise<number[]> {
    const result = await this.genAI.models.embedContent({
      model: 'gemini-embedding-001',
      outputDimensionality: 768,
      // ...
    });
  }
}

// AFTER:
import { VoyageEmbeddingService } from './services/voyage-embedding.service';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    private readonly voyageEmbeddingService: VoyageEmbeddingService,
    // ... other deps
  ) {}

  private async generateDocumentEmbedding(text: string): Promise<number[]> {
    return this.voyageEmbeddingService.generateDocumentEmbedding(text);
  }

  private async generateQueryEmbedding(text: string): Promise<number[]> {
    return this.voyageEmbeddingService.generateQueryEmbedding(text);
  }
}
```

### 6. Asymmetric Retrieval Implementation

**Document vs Query Embeddings:**

```typescript
// In KnowledgeBaseService

async ingestFile(filePath: string): Promise<void> {
  // ... chunking logic ...

  // Use voyage-4-large for document embeddings
  const vector = await this.voyageEmbeddingService.generateDocumentEmbedding(
    content.content
  );

  // Store in database
  await this.prisma.$executeRaw`
    INSERT INTO embeddings (id, content, vector, ...)
    VALUES (...)
  `;
}

async findSimilar(query: string, limit: number = 5): Promise<any[]> {
  // Use voyage-4 for query embeddings
  const vector = await this.voyageEmbeddingService.generateQueryEmbedding(query);

  // Search using the query embedding
  return this.prisma.$queryRaw`
    SELECT ... FROM embeddings
    ORDER BY vector <=> ${vector}::vector
    LIMIT ${limit}
  `;
}
```

### 7. Mock Embeddings for Development

**Fallback Implementation:**

```typescript
// When VOYAGE_API_KEY is not set
private generateMockEmbedding(text: string): number[] {
  // Generate deterministic mock embeddings
  // Use text hash to create consistent vectors
  const hash = createHash('md5').update(text).digest('hex');
  const vector = new Array(1024).fill(0);

  // Use hash to populate vector values
  for (let i = 0; i < 1024; i++) {
    const byte = parseInt(hash[i % 32], 16);
    vector[i] = (byte / 128) - 1;  // Normalize to [-1, 1]
  }

  return vector;
}
```

## Testing Strategy

### Unit Tests

**VoyageEmbeddingService Tests:**

```typescript
describe('VoyageEmbeddingService', () => {
  it('should generate document embeddings with voyage-4-large', async () => {
    // Test document embedding generation
  });

  it('should generate query embeddings with voyage-4', async () => {
    // Test query embedding generation
  });

  it('should handle batch processing', async () => {
    // Test batch embedding with optimal sizing
  });

  it('should return mock embeddings when API key unavailable', async () => {
    // Test fallback behavior
  });

  it('should respect rate limits', async () => {
    // Test rate limiting integration
  });
});
```

### Integration Tests

**RAG Pipeline Tests:**

```typescript
describe('RAG Pipeline with Voyage Embeddings', () => {
  it('should ingest documents and create embeddings', async () => {
    // End-to-end ingestion test
  });

  it('should retrieve relevant chunks for queries', async () => {
    // Search and retrieval test
  });

  it('should maintain retrieval quality vs baseline', async () => {
    // Compare with Google Gemini baseline
  });
});
```

### Evaluation Tests

**RAG Evaluation:**

- Run existing `rag-evaluation.spec.ts` tests
- Compare metrics: context precision, recall, faithfulness
- Ensure quality meets or exceeds previous baseline

## Migration Plan

### Phase 1: Development & Testing (Week 1)

- [ ] Implement VoyageEmbeddingService
- [ ] Update KnowledgeBaseService integration
- [ ] Create database migration script
- [ ] Write unit and integration tests
- [ ] Test locally with mock embeddings

### Phase 2: Staging Deployment (Week 2)

- [ ] Deploy to staging environment
- [ ] Set up VOYAGE_API_KEY in staging
- [ ] Run database migration on staging DB (ALTER TABLE to 1024 dims)
- [ ] Re-ingest test document corpus
- [ ] Validate retrieval quality with RAG evaluation
- [ ] Performance testing and rate limit validation

### Phase 3: Production Migration (Week 3)

- [ ] Backup production embeddings table
- [ ] Run database migration (ALTER TABLE to 1024 dims)
- [ ] Deploy code to production
- [ ] Run ingestion scripts for all documents
- [ ] Monitor retrieval metrics
- [ ] Compare with baseline metrics

### Phase 4: Validation (Week 4)

- [ ] Validate retrieval quality metrics
- [ ] Update documentation
- [ ] Monitor for issues

## Performance Considerations

### Latency

- Voyage-4: ~100-200ms per request (typical)
- Voyage-4-large: ~150-300ms per request (typical)
- Batch processing reduces per-text latency significantly

### Cost Analysis

| Metric                  | Google Gemini | Voyage-4-large | Voyage-4  | Savings |
| ----------------------- | ------------- | -------------- | --------- | ------- |
| Per 1M tokens           | ~$0.10        | $0.12          | $0.10     | ~0%     |
| Document quality        | Baseline      | +15-20%        | +5-10%    | N/A     |
| Query cost (asymmetric) | $0.10         | N/A            | $0.10     | 0%      |
| **Effective cost**      | $0.10         | **$0.08\***    | **$0.10** | **20%** |

\*With asymmetric retrieval: documents (expensive, once) + queries (cheaper, ongoing)

### Throughput

- Voyage supports higher batch sizes (1000 vs Gemini's lower limits)
- Better parallelization opportunities

## Risk Mitigation

### Risks

1. **Embedding Quality Regression**
   - **Mitigation:** Run A/B evaluation before full migration
   - **Rollback:** Restore from database backup if needed

2. **API Rate Limit Issues**
   - **Mitigation:** Implement robust rate limiting with safety margins
   - **Monitoring:** Add alerts for rate limit proximity

3. **Cost Overruns**
   - **Mitigation:** Implement token budgets and usage monitoring
   - **Asymmetric retrieval:** Use cheaper model for queries

4. **Migration Downtime**
   - **Mitigation:** ALTER TABLE is fast on empty/clean tables
   - **Backup:** Full database backup before migration

## Success Criteria

1. **Functional:**
   - All existing RAG tests pass
   - Retrieval works end-to-end
   - Mock embeddings work in dev/test

2. **Performance:**
   - Retrieval latency < 500ms (p95)
   - No rate limit errors in production
   - Batch processing maintains throughput

3. **Quality:**
   - RAG evaluation metrics ≥ baseline
   - Context precision > 75%
   - Faithfulness > 80%

4. **Operational:**
   - Zero-downtime migration
   - Rollback capability within 1 hour
   - Monitoring and alerting in place

## References

- [Voyage AI Documentation](https://docs.voyageai.com/docs/embeddings)
- [Voyage-4 Announcement](https://blog.voyageai.com/2026/01/15/voyage-4/)
- [Voyage TypeScript SDK](https://www.npmjs.com/package/voyageai)
- Current Implementation: `apps/server/src/modules/knowledge-base/knowledge-base.service.ts`
- Current Schema: `apps/server/prisma/schema.prisma`
