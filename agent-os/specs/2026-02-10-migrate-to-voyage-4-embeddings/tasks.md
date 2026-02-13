# Task Breakdown: Migrate to Voyage-4-Large Embeddings

## Overview

Total Tasks: 4 major task groups with 18 sub-tasks

## Task List

### Backend Layer - Voyage Embedding Service

#### Task Group 1: VoyageEmbeddingService Implementation

**Dependencies:** None

- [x] 1.0 Complete VoyageEmbeddingService implementation
  - [x] 1.1 Write 2-4 focused tests for VoyageEmbeddingService
  - [x] 1.2 Install voyageai npm package
  - [x] 1.3 Create VoyageEmbeddingService class
  - [x] 1.4 Implement batch embedding methods
  - [x] 1.5 Add mock embedding support for development
  - [x] 1.6 Ensure VoyageEmbeddingService tests pass

**Acceptance Criteria:**

- The 2-4 tests written in 1.1 pass
- VoyageEmbeddingService can generate 1024-dimension embeddings
- Batch processing handles up to 1000 texts
- Mock embeddings work without API key
- Service follows existing patterns (Cohere, Google GenAI)

---

### Backend Layer - Rate Limiter & Configuration

#### Task Group 2: Rate Limiter and Configuration Updates

**Dependencies:** Task Group 1

- [x] 2.0 Complete rate limiter and configuration updates
  - [x] 2.1 Write 2-4 focused tests for rate limiter updates
  - [x] 2.2 Update TokenRateLimiter for Voyage support
  - [x] 2.3 Create Voyage configuration module
  - [x] 2.4 Update environment configuration files
  - [x] 2.5 Ensure rate limiter and config tests pass

**Acceptance Criteria:**

- The 2-4 tests written in 2.1 pass
- TokenRateLimiter supports both Google and Voyage providers
- Configuration module loads Voyage settings correctly
- Environment variables documented and validated
- Rate limiting prevents Voyage API quota exceeded errors

---

### Database Layer

#### Task Group 3: Database Migration

**Dependencies:** Task Group 2

- [x] 3.0 Complete database migration for 1024 dimensions
  - [x] 3.1 Write 2-4 focused tests for database layer
  - [x] 3.2 Create database migration script
  - [x] 3.3 Update Prisma schema
  - [x] 3.4 Create migration verification script
  - [x] 3.5 Ensure database layer tests pass

**Acceptance Criteria:**

- The 2-4 tests written in 3.1 pass
- Existing embeddings table altered to VECTOR(1024)
- Vector similarity search works with new dimensions
- No duplicate tables created
- Verification script confirms migration success

---

### Integration & Testing

#### Task Group 4: KnowledgeBaseService Integration and Testing

**Dependencies:** Task Groups 1, 2, 3

- [x] 4.0 Complete KnowledgeBaseService integration
  - [x] 4.1 Write 3-6 focused integration tests
  - [x] 4.2 Integrate VoyageEmbeddingService into KnowledgeBaseService
  - [x] 4.3 Update ingestion scripts
  - [x] 4.4 Update retrieval methods for asymmetric usage
  - [x] 4.5 Update RAG evaluation tests
  - [x] 4.6 Ensure all integration tests pass

**Acceptance Criteria:**

- The 3-6 tests written in 4.1 pass
- RAG evaluation metrics ≥ baseline (precision > 75%, faithfulness > 80%)
- KnowledgeBaseService uses Voyage embeddings end-to-end
- Ingestion scripts work with new embedding provider
- Asymmetric retrieval works (voyage-4-large for docs, voyage-4 for queries)
- All existing RAG functionality preserved

---

### Testing & Gap Analysis

#### Task Group 5: Test Review & Gap Analysis (Optional)

**Dependencies:** Task Groups 1-4

- [x] 5.0 Review existing tests and fill critical gaps only
  - [x] 5.1 Review tests from Task Groups 1-4
  - [x] 5.2 Analyze test coverage gaps for THIS feature only
  - [x] 5.3 Write up to 5 additional strategic tests maximum
  - [x] 5.4 Run all feature-specific tests

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 15-25 tests)
- Critical error paths have test coverage
- Rollback scenario is tested
- No more than 5 additional tests added beyond task groups 1-4

---

## Execution Order

Recommended implementation sequence:

1. **Backend Layer - VoyageEmbeddingService** (Task Group 1)
   - No dependencies, can start immediately
   - Provides core embedding functionality

2. **Backend Layer - Rate Limiter & Configuration** (Task Group 2)
   - Depends on Task Group 1
   - Prepares infrastructure for Voyage API usage

3. **Database Layer** (Task Group 3)
   - Depends on Task Group 2
   - Creates schema for 1024-dimension embeddings

4. **Integration & Testing** (Task Group 4)
   - Depends on Task Groups 1, 2, 3
   - Integrates everything into working pipeline
   - Validates quality metrics

5. **Testing & Gap Analysis** (Task Group 5, Optional)
   - Depends on Task Groups 1-4
   - Final test coverage review

---

## Migration Checklist (For Production Deployment)

After completing all task groups, follow this production migration process:

### Pre-Deployment

- [ ] Set VOYAGE_API_KEY in production environment
- [ ] Verify GOOGLE_API_KEY still set for LLM/Vision
- [ ] Backup/dump existing embeddings table (safety)
- [ ] Prepare rollback plan

### Deployment

- [ ] Run database migration: ALTER TABLE to VECTOR(1024) (Task Group 3)
- [ ] Deploy code changes (Task Groups 1, 2, 4)
- [ ] Run ingestion scripts to populate embeddings with Voyage
- [ ] Monitor retrieval metrics

### Post-Deployment

- [ ] Run RAG evaluation to verify quality
- [ ] Monitor API rate limits and costs
- [ ] Compare metrics with baseline
- [ ] Update documentation

---

## Key Files to Modify

### New Files

- `apps/server/src/modules/knowledge-base/services/voyage-embedding.service.ts`
- `apps/server/src/config/voyage.config.ts`
- `apps/server/prisma/migrations/YYYYMMDD_update_embeddings_dimension/migration.sql`
- `apps/server/scripts/verify-voyage-migration.ts`

### Modified Files

- `apps/server/src/modules/knowledge-base/knowledge-base.service.ts`
- `apps/server/src/modules/knowledge-base/knowledge-base.service.spec.ts`
- `apps/server/scripts/ingest.ts`
- `apps/server/.env.example`
- `apps/server/package.json`

### Reference Files (for patterns)

- `apps/server/src/modules/knowledge-base/knowledge-base.service.ts` (lines 23-142, 165-185, 1291-1456)
- `apps/server/src/modules/knowledge-base/rag-evaluation.spec.ts`

---

## Success Metrics

### Functional

- [ ] All 15-25 feature-specific tests pass
- [ ] VoyageEmbeddingService generates 1024-dimension embeddings
- [ ] Batch processing handles up to 1000 texts
- [ ] Mock embeddings work in dev/test environments

### Quality

- [ ] RAG evaluation context precision ≥ 75%
- [ ] RAG evaluation faithfulness ≥ 80%
- [ ] Retrieval quality meets or exceeds Google baseline

### Performance

- [ ] Retrieval latency < 500ms (p95)
- [ ] No rate limit errors in production
- [ ] Batch processing maintains throughput

### Operational

- [ ] Zero-downtime migration completed
- [ ] Rollback capability tested and documented
- [ ] Cost savings achieved with asymmetric retrieval
