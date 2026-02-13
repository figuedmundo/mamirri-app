# Specification: Analyze Case Endpoint - Vision Integration

## Goal

Complete the "Analyze Case" endpoint by wiring VisionService into the orchestration flow, implementing a hybrid caching strategy that analyzes images on first case analysis and caches results to avoid redundant API calls.

## User Stories

- As a physiotherapist, I want the AI to automatically analyze my patient's footprint images when I click "Analyze Case" so that I get comprehensive treatment suggestions that include visual findings.
- As a physiotherapist, I want to force re-analysis of images when needed so that I can get fresh AI insights after uploading better quality photos.

## Specific Requirements

**Vision Analysis Caching**

- When `analyzeCase()` is called, check each footprint's `analysis` JSON field
- If `analysis` is NULL or empty object: Call `VisionService.analyzeImage()` for that image
- Save the structured analysis results to `footprint.analysis` and set `footprint.analyzedAt`
- If `analysis` exists and is non-empty: Use cached findings without making an API call
- Transform VisionService output to match the existing `VisionFinding` interface format

**Force Re-analysis Parameter**

- Add optional query parameter `forceVision` to `POST /ai/cases/:caseId/analyze`
- Accept as query param: `?forceVision=true`
- When true: Re-analyze ALL footprint images regardless of existing cached analysis
- Update `footprint.analysis` and `footprint.analyzedAt` with fresh results
- Default behavior (false or omitted): Use cached analysis when available

**Parallel Image Processing**

- Analyze multiple footprint images concurrently using `Promise.allSettled()`
- Use `allSettled` instead of `all` to continue processing if one image fails
- Collect successful analyses and log failures without blocking the entire flow
- Limit concurrency if needed to avoid overwhelming the Vision API (optional)

**Database Schema Update**

- Add `analyzedAt DateTime?` field to the Footprint model in Prisma schema
- Create a focused migration with descriptive name (e.g., `add_footprint_analyzed_at`)
- Field is nullable to support existing records that haven't been analyzed yet

**Enhanced Metadata Reporting**

- Add `visionAnalysis` object to response `metadata` containing:
  - `totalImages`: Number of footprint images found
  - `cacheHits`: Number of images with existing cached analysis
  - `apiCalls`: Number of fresh VisionService API calls made
  - `failures`: Number of images that failed analysis
- Update existing `serviceStatus.vision` to reflect actual vision processing status

**Error Resilience**

- If VisionService fails for one image, continue analyzing other images
- Log errors with image ID and error message using existing Logger pattern
- Include failed image IDs in response metadata for debugging
- Never fail the entire case analysis due to a single image analysis failure

## Visual Design

No visual assets provided - this is a backend-only task.

## Existing Code to Leverage

**DataAggregationService (`services/data-aggregation.service.ts`)**

- Contains `extractVisionFindings()` method that currently only reads cached data
- Modify this method to call VisionService when `analysis` is NULL
- Already has access to footprints via Prisma includes
- Already returns `VisionFinding[]` interface - maintain compatibility

**VisionService (`services/vision.service.ts`)**

- `analyzeImage(imageBuffer, imageType, mimeType)` - core analysis method
- `analyzeImageById(imageId, imageType, therapistId)` - fetches image and analyzes
- Returns `VisionAnalysisResult` with `structuredAnalysis` field
- Already handles retries and mock responses when API key is missing

**StorageService (`modules/storage/storage.service.ts`)**

- `getFile(storagePath)` returns image Buffer from MinIO
- Use this to fetch footprint images by their `url` field
- Already used by VisionService's `analyzeImageById` method

**AiAnalysisService (`ai-analysis.service.ts`)**

- Main orchestration in `analyzeCase()` method
- Pass `forceVision` option through to DataAggregationService
- Already builds response with `metadata.serviceStatus` object

**Footprint Model (Prisma schema)**

- Already has `analysis Json?` field for storing vision results
- Already has `url String` field pointing to MinIO storage path
- Add `analyzedAt DateTime?` field via migration

## Out of Scope

- Frontend UI for displaying AI suggestions and citations (roadmap task 15.4)
- Like/Dislike feedback buttons for AI suggestions (roadmap task 15.5)
- End-to-end testing with real patient data (roadmap task 15.6)
- Automatic cache invalidation based on age or model version
- Background job processing or queue system for image analysis
- Posturogram image analysis (posturogram data is stored as JSON, not images)
- Video analysis (PostureVideo entity - separate feature)
- Rate limiting or throttling of Vision API calls
- Pre-analyzing images on upload (decided against in ADR)
