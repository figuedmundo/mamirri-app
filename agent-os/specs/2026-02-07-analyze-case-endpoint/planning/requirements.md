# Spec Requirements: Analyze Case Endpoint (Task 15.3)

## Initial Description

From roadmap task 15.3: "Analyze Case" endpoint (orchestrates all services)

This endpoint should orchestrate Voice + Vision + RAG + LLM services to provide AI-powered clinical case analysis with treatment suggestions and citations from medical literature.

## Requirements Discussion

### First Round Questions

**Q1:** Given the "Analyze Case" infrastructure already exists, what is the specific scope for task 15.3?

**Answer:** The existing endpoint is incomplete. Vision analysis is disconnected - images are uploaded but never analyzed, and the VisionService results are never saved to the database. The scope is to complete the vision integration using a hybrid caching strategy.

**Q2:** Regarding Vision Integration - should we use pre-analyzed vision findings stored in the database, or actively call VisionService during case analysis?

**Answer:** Use a **hybrid caching strategy**:

- On first case analysis: Check if `footprint.analysis` exists
- If NULL: Call VisionService, analyze the image, **save results to DB**
- If EXISTS: Use cached findings (no API call)
- Optional: Allow `forceVision=true` parameter to force re-analysis

**Q3:** What output format/granularity do you expect?

**Answer:** The existing response structure is sufficient:

```json
{
  "primarySuggestion": { "title": "", "description": "", "confidence": "HIGH/MEDIUM/LOW" },
  "alternatives": [...],
  "citations": [{ "quote": "", "documentTitle": "", "author": "", "pageNumber": 0 }],
  "reasoning": { "step1_understanding": "", "step2_literature": "", "step3_synthesis": "" },
  "metadata": { "processingTimeMs": 0, "serviceStatus": {...} }
}
```

**Q4:** Anything explicitly out of scope for this task?

**Answer:** Yes, the following are separate roadmap tasks:

- 15.4: Frontend Suggestions UI (cards, citations)
- 15.5: Feedback loop (Like/Dislike buttons)
- 15.6: Test with real patient data

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Voice Note Transcription - Path: `apps/server/src/modules/media/media.service.ts`
  - Pattern: Upload audio → Transcribe immediately → Save result to JSON field
  - Relevant because: Similar "process on upload vs. process on demand" decision was made

- Feature: AI Analysis Service - Path: `apps/server/src/modules/ai-analysis/ai-analysis.service.ts`
  - Components to potentially reuse: `analyzeCase()` orchestration flow
  - This is the main file to modify

- Feature: Vision Service - Path: `apps/server/src/modules/ai-analysis/services/vision.service.ts`
  - Backend logic to reference: `analyzeImage()` and `analyzeImageById()` methods
  - Already complete, just needs to be wired into the orchestration

- Feature: Data Aggregation Service - Path: `apps/server/src/modules/ai-analysis/services/data-aggregation.service.ts`
  - This is where vision findings are extracted from DB
  - Key modification point: Add logic to call VisionService if findings are NULL

### Follow-up Questions

**Follow-up 1:** Should we analyze images in parallel or sequentially during case analysis?

**Answer:** In parallel - use `Promise.all()` for better performance since images are independent.

**Follow-up 2:** Should we add a timestamp field to track when vision analysis was performed?

**Answer:** Yes - add `analyzedAt` field to support future cache invalidation strategies.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - This is a backend-only task.

## Requirements Summary

### Functional Requirements

1. **Vision Analysis Caching (Core Feature)**
   - When `analyzeCase()` is called, check each footprint's `analysis` field
   - If `analysis` is NULL or empty: Call `VisionService.analyzeImage()` for that image
   - Save the vision analysis results to `footprint.analysis` JSON field
   - If `analysis` exists: Use cached findings (no API call)

2. **Force Re-analysis Option**
   - Add optional query parameter: `?forceVision=true`
   - When true: Re-analyze all images regardless of cache
   - Update the cached findings with new results

3. **Parallel Processing**
   - Analyze multiple images in parallel using `Promise.all()`
   - Don't block on sequential image processing

4. **Analysis Timestamp**
   - Add `analyzedAt: DateTime` field to Footprint model
   - Set this when vision analysis is performed
   - Useful for future cache invalidation strategies

5. **Service Status Reporting**
   - Update `metadata.serviceStatus.vision` to accurately reflect:
     - `true` if vision analysis was performed (cached or fresh)
     - `false` if no images were available to analyze
   - Add `metadata.visionCacheHits` and `metadata.visionApiCalls` counts

### Technical Requirements

1. **Database Schema Change**
   - Add `analyzedAt DateTime?` to Footprint model in Prisma schema
   - Run migration

2. **DataAggregationService Enhancement**
   - Inject `VisionService` dependency
   - Modify `extractVisionFindings()` to:
     - Check if analysis exists
     - Call VisionService if not
     - Save results to database
     - Return findings (cached or fresh)

3. **API Enhancement**
   - Add `forceVision?: boolean` to `AnalyzeCaseDto` or as query param
   - Pass through to orchestration logic

4. **Error Handling**
   - If VisionService fails for one image, continue with others
   - Log errors but don't fail entire case analysis
   - Report partial failures in response metadata

### Reusability Opportunities

- `VisionService` already exists and is complete
- `DataAggregationService` already fetches footprints with evaluations
- `StorageService` already provides `getFile()` for retrieving image buffers
- Response structure already has `metadata.serviceStatus` for reporting

### Scope Boundaries

**In Scope:**

- Wire VisionService into case analysis orchestration
- Implement caching strategy (analyze once, cache forever)
- Add forceVision parameter for re-analysis
- Add analyzedAt timestamp to Footprint model
- Parallel image processing
- Error handling for vision failures
- Update service status metadata

**Out of Scope:**

- Frontend UI for displaying suggestions (task 15.4)
- Like/Dislike feedback buttons (task 15.5)
- End-to-end testing with real data (task 15.6)
- Automatic cache invalidation (future enhancement)
- Background job processing for images
- Posturogram image analysis (posturogram is stored as JSON data, not images)

### Technical Considerations

- **API Cost:** Gemini Vision API calls cost money. Caching is critical.
- **Performance:** Image analysis takes 2-5 seconds per image. Parallel processing essential.
- **Storage:** VisionService needs image buffer from MinIO via StorageService.
- **Prisma:** Need to update Footprint record after analysis (transaction-safe).
- **Error Resilience:** One failed image shouldn't block entire case analysis.

## Architecture Decision Record

### Decision: Hybrid Caching Strategy

**Context:** We need to decide when to call the Vision AI to analyze clinical images.

**Options Considered:**

| Option                          | Description                                   | Pros                             | Cons                               |
| ------------------------------- | --------------------------------------------- | -------------------------------- | ---------------------------------- |
| A: Pre-analyze on upload        | Analyze immediately when image uploaded       | Fast case analysis               | Wastes API calls for unused images |
| B: Analyze on-demand (no cache) | Analyze every time case is analyzed           | Always fresh                     | 3x+ API costs, slow UX             |
| C: Hybrid with caching          | Analyze on first case analysis, cache forever | Cost-efficient, fast after first | Slightly slower first analysis     |
| D: User-triggered only          | Only analyze when user explicitly requests    | Full user control                | Extra clicks, bad UX               |

**Decision:** Option C - Hybrid with caching

**Rationale:**

1. **Cost-efficient:** Only 1 API call per image, ever (unless force refresh)
2. **No wasted calls:** Images that are never used in case analysis are never analyzed
3. **Fast UX:** Second and subsequent analyses are instant
4. **Simple implementation:** No background jobs or queues needed
5. **User control:** forceVision=true allows re-analysis when needed

### Decision: No Pre-analysis on Upload

**Context:** Should we analyze images immediately when they are uploaded?

**Decision:** No

**Rationale:**

1. Many images may never be used in a case analysis
2. User may upload multiple images and delete some
3. Immediate analysis would slow down the upload experience
4. Voice notes already do immediate transcription (different - audio is always used)
