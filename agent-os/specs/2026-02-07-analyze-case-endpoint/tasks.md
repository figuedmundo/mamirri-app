# Task Breakdown: Analyze Case Endpoint - Vision Integration

## Overview

Total Tasks: 16

This is a **backend-only** implementation. No frontend components are needed as the API contract remains the same with enhanced metadata.

## Task List

### Database Layer

#### Task Group 1: Schema Migration

**Dependencies:** None

- [x] 1.0 Complete database schema update
  - [x] 1.1 Add `analyzedAt` field to Footprint model
    - Open `apps/server/prisma/schema.prisma`
    - Add `analyzedAt DateTime?` to Footprint model (line ~150)
    - Field is nullable to support existing records
  - [x] 1.2 Create and run migration
    - Run: `npx prisma migrate dev --name add_footprint_analyzed_at`
    - Verify migration file is created in `prisma/migrations/`
    - Confirm migration runs successfully
  - [x] 1.3 Regenerate Prisma client
    - Run: `npx prisma generate`
    - Verify `Footprint` type now includes `analyzedAt` field

**Acceptance Criteria:**

- Migration runs without errors
- `analyzedAt` field exists on Footprint model
- Existing footprint records remain intact with `analyzedAt: null`
- Prisma client types are updated

---

### Service Layer

#### Task Group 2: DataAggregationService Enhancement

**Dependencies:** Task Group 1

- [x] 2.0 Complete DataAggregationService modifications
  - [x] 2.1 Write 4-6 focused tests for vision integration
    - Test: Returns cached analysis when `footprint.analysis` exists
    - Test: Calls VisionService when `footprint.analysis` is NULL
    - Test: Saves analysis results to database after VisionService call
    - Test: Continues processing when one image fails (error resilience)
    - Test: Respects `forceVision=true` to re-analyze all images
    - Mock VisionService, StorageService, and PrismaService
  - [x] 2.2 Inject dependencies into DataAggregationService
    - Add `VisionService` to constructor
    - Add `StorageService` to constructor
    - Update `DataAggregationService` imports
    - Update `AiAnalysisModule` providers if needed
  - [x] 2.3 Create helper method for single footprint analysis
    - Method: `analyzeFootprintIfNeeded(footprint, forceVision): Promise<VisionFinding | null>`
    - Check if `footprint.analysis` exists and is non-empty (unless forceVision)
    - Fetch image buffer via `StorageService.getFile(footprint.url)`
    - Call `VisionService.analyzeImage(buffer, 'FOOTPRINT', mimeType)`
    - Transform `VisionAnalysisResult` to `VisionFinding` format
    - Save results to `footprint.analysis` and `footprint.analyzedAt`
    - Return finding or null on failure
  - [x] 2.4 Modify `extractVisionFindings()` to call VisionService
    - Add `forceVision: boolean` parameter
    - Use `Promise.allSettled()` for parallel processing of footprints
    - Call `analyzeFootprintIfNeeded()` for each footprint
    - Collect successful results and log failures
    - Return combined `VisionFinding[]` (posturogram JSON + footprint analyses)
  - [x] 2.5 Add vision analysis statistics tracking
    - Track: `totalImages`, `cacheHits`, `apiCalls`, `failures`
    - Return stats alongside findings for metadata reporting
    - Create interface: `VisionAnalysisStats`
  - [x] 2.6 Run DataAggregationService tests
    - Run: `pnpm test -- data-aggregation`
    - Verify all 4-6 tests pass
    - Confirm mocks are working correctly

**Acceptance Criteria:**

- Tests pass for cached analysis usage
- Tests pass for VisionService integration
- Tests pass for error resilience (one failure doesn't block others)
- Tests pass for forceVision re-analysis
- Statistics tracking works correctly

---

#### Task Group 3: AiAnalysisService Orchestration Update

**Dependencies:** Task Group 2

- [x] 3.0 Complete AiAnalysisService updates
  - [x] 3.1 Write 2-3 focused tests for orchestration changes
    - Test: `analyzeCase()` passes `forceVision` option through to aggregation
    - Test: Response metadata includes `visionAnalysis` stats object
    - Test: `serviceStatus.vision` reflects actual vision processing status
  - [x] 3.2 Update `aggregateCaseData()` call signature
    - Add `forceVision` parameter to `DataAggregationService.aggregateCaseData()`
    - Pass through from `AiAnalysisService.analyzeCase()`
    - Update `CaseDataAggregate` interface to include vision stats
  - [x] 3.3 Enhance response metadata with vision stats
    - Add `visionAnalysis` object to `AnalysisResult.metadata`
    - Include: `totalImages`, `cacheHits`, `apiCalls`, `failures`, `failedImageIds`
    - Update `serviceStatus.vision` based on actual processing
  - [x] 3.4 Update interfaces and DTOs
    - Update `AnalysisResult` interface in `analysis.interfaces.ts`
    - Add `visionAnalysis` to metadata type definition
    - Update `AnalysisResultDto` for Swagger documentation
  - [x] 3.5 Run AiAnalysisService tests
    - Run: `pnpm test -- ai-analysis.service`
    - Verify all tests pass including new ones

**Acceptance Criteria:**

- `forceVision` flows through the entire call chain
- Response metadata includes complete vision analysis stats
- `serviceStatus.vision` accurately reflects processing status
- Existing tests continue to pass

---

### API Layer

#### Task Group 4: Controller and API Updates

**Dependencies:** Task Group 3

- [x] 4.0 Complete API layer updates
  - [x] 4.1 Write 2-3 focused tests for API endpoint changes
    - Test: Endpoint accepts `?forceVision=true` query parameter
    - Test: Endpoint returns enhanced metadata in response
    - Test: Endpoint handles missing/invalid forceVision gracefully
  - [x] 4.2 Add `forceVision` query parameter to controller
    - Update `analyzeCaseMultiModal()` in `AiAnalysisController`
    - Add `@Query('forceVision') forceVision?: string` parameter
    - Parse to boolean (default: false)
    - Pass to `AiAnalysisService.analyzeCase()`
  - [x] 4.3 Update Swagger documentation
    - Add `@ApiQuery()` decorator for `forceVision` parameter
    - Update response schema to include `visionAnalysis` in metadata
    - Add description explaining the parameter's purpose
  - [x] 4.4 Update `analyzeCase()` method signature
    - Add `forceVision?: boolean` parameter to service method
    - Update the legacy `POST /ai/analyze` endpoint if needed
  - [x] 4.5 Run controller tests
    - Run: `pnpm test -- ai-analysis.controller`
    - Verify all tests pass

**Acceptance Criteria:**

- `?forceVision=true` query parameter is accepted
- Swagger docs show the new parameter
- Response includes `visionAnalysis` metadata
- Both `/ai/cases/:caseId/analyze` and `/ai/analyze` endpoints work

---

### Testing & Verification

#### Task Group 5: Integration Testing and Verification

**Dependencies:** Task Group 1-4

- [x] 5.0 Complete integration testing
  - [x] 5.1 Review all tests written in Task Groups 2-4
    - Confirm DataAggregationService tests (4-6 tests)
    - Confirm AiAnalysisService tests (2-3 tests)
    - Confirm Controller tests (2-3 tests)
    - Total: approximately 8-12 tests
  - [x] 5.2 Run all AI analysis module tests
    - Run: `pnpm test -- ai-analysis`
    - Verify all tests pass
    - Check test output for any warnings
  - [x] 5.3 Manual verification (if development server available)
    - Start server: `pnpm dev`
    - Test endpoint via Swagger UI at `/api/docs`
    - Call `POST /ai/cases/{caseId}/analyze` with a test case
    - Verify response includes `visionAnalysis` metadata
    - Test with `?forceVision=true` parameter
  - [x] 5.4 Verify error handling
    - Test with case that has no footprint images
    - Test with invalid case ID
    - Confirm graceful degradation

**Acceptance Criteria:**

- All 8-12 feature-specific tests pass
- Endpoint works via Swagger UI (if manually tested)
- Error cases are handled gracefully
- No regressions in existing functionality

---

## Execution Order

Recommended implementation sequence:

```
1. Database Layer (Task Group 1)     - 15 min
   └── Add analyzedAt field, run migration

2. Service Layer (Task Group 2)      - 2-3 hours
   └── DataAggregationService + VisionService integration

3. Service Layer (Task Group 3)      - 1-2 hours
   └── AiAnalysisService orchestration updates

4. API Layer (Task Group 4)          - 1 hour
   └── Controller updates, Swagger docs

5. Testing (Task Group 5)            - 30 min
   └── Integration testing, verification
```

**Estimated Total Time:** 5-7 hours

---

## Files to Modify

| File                                        | Changes                                       |
| ------------------------------------------- | --------------------------------------------- |
| `prisma/schema.prisma`                      | Add `analyzedAt DateTime?` to Footprint       |
| `services/data-aggregation.service.ts`      | Inject VisionService, add analysis logic      |
| `services/data-aggregation.service.spec.ts` | Add 4-6 tests                                 |
| `interfaces/aggregation.interfaces.ts`      | Add `VisionAnalysisStats` interface           |
| `ai-analysis.service.ts`                    | Pass forceVision, update metadata             |
| `ai-analysis.service.spec.ts`               | Add 2-3 tests                                 |
| `interfaces/analysis.interfaces.ts`         | Update `AnalysisResult` metadata type         |
| `ai-analysis.controller.ts`                 | Add forceVision query param                   |
| `ai-analysis.controller.spec.ts`            | Add 2-3 tests                                 |
| `dto/analysis-result.dto.ts`                | Update Swagger schema                         |
| `ai-analysis.module.ts`                     | Ensure VisionService/StorageService available |

---

## Notes

- **No frontend changes needed** - API contract enhancement only
- **Backward compatible** - forceVision defaults to false, new metadata fields are additive
- **Test-driven approach** - Write tests first in each task group
- **Error resilience is critical** - Vision failures must not block case analysis
