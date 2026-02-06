# Specification: Gemini Vision API

## Goal

Enable AI-powered visual analysis of clinical images (posturograms and footprints) using Gemini Vision API, returning structured findings with medical recommendations to support therapist decision-making.

## User Stories

- As a physiotherapist, I want to analyze a patient's posturogram image so that I can get AI-assisted insights about spine alignment and postural deviations
- As a physiotherapist, I want to analyze a patient's footprint image so that I can get AI-assisted insights about arch type, pressure distribution, and gait patterns

## Specific Requirements

**SDK Migration to @google/genai**

- Migrate from deprecated `@google/generative-ai` to official `@google/genai` package
- Update `AiAnalysisService` to use new SDK initialization pattern: `new GoogleGenAI({ apiKey })`
- Update `KnowledgeBaseService` embeddings to use new SDK pattern
- Maintain existing retry logic via `withRetry` utility
- Update all imports and API call patterns to match new SDK

**VisionService Implementation**

- Create new `VisionService` in `ai-analysis/services/` directory
- Follow existing service pattern from `AnonymizerService` (Injectable, Logger, constructor injection)
- Accept image buffer and image type as inputs
- Return structured `VisionAnalysisResult` with findings, concerns, recommendations
- Use temperature 0.1 for deterministic medical analysis
- Include mock response fallback when `GOOGLE_API_KEY` is not set

**Vision Prompts**

- Create `ai-analysis/constants/vision-prompts.ts` for medical image prompts
- Implement `POSTUROGRAM_ANALYSIS_PROMPT` for spine alignment, shoulder symmetry, head position, postural deviations
- Implement `FOOTPRINT_ANALYSIS_PROMPT` for arch type, pressure distribution, gait patterns, orthotic recommendations
- Include medical disclaimer in all prompts: "Consult with a healthcare provider before making decisions"
- Use Spanish as primary language with option for English technical terms

**VisionAnalysisResult Interface**

- Create in `ai-analysis/interfaces/vision.interfaces.ts`
- Include `rawAnalysis: string` for full Gemini response text
- Include `structuredAnalysis: { findings: Finding[], concerns: Concern[], recommendations: string[], confidence: ConfidenceLevel }`
- Include `qualityWarning: string | null` for suboptimal image notification
- Include `metadata: { processingTimeMs, modelUsed, imageType }`

**API Endpoint**

- Add `POST /api/v1/ai/vision/analyze` endpoint to `AiAnalysisController`
- Accept `AnalyzeImageDto` with `imageId: string` (storage key) and `imageType: 'POSTUROGRAM' | 'FOOTPRINT'`
- Use `JwtAuthGuard` for authentication
- Use `CurrentTherapist` decorator for ownership verification
- Return `VisionAnalysisResultDto` response

**Image Retrieval Integration**

- Use `StorageService.getFile(path)` to retrieve image buffer from MinIO
- Convert buffer to base64 for Gemini inline data format
- Validate image mimetype is one of: `image/jpeg`, `image/png`, `image/webp`
- Lookup image storage path from database (Footprint or Posturogram table)

**Quality Warning System**

- If image analysis detects quality issues, include warning in response
- Quality warning is informational only - never reject analysis
- Warning text example: "Image quality may affect analysis accuracy. Consider retaking with better lighting."
- Allow Gemini to assess quality as part of analysis prompt

**Error Handling**

- Follow existing pattern: return default/mock result on API key missing
- Throw `NotFoundException` if image not found in storage
- Throw `ForbiddenException` if therapist lacks access to patient
- Use `withRetry` for transient Gemini API failures (3 retries)
- Log all errors with context via NestJS Logger

## Visual Design

No visual assets provided. This is a backend API feature.

## Existing Code to Leverage

**AiAnalysisService Pattern**

- Constructor with ConfigService for API key, model, temperature, maxTokens
- Mock response fallback when API key missing
- `withRetry` wrapper for LLM calls
- JSON parsing of LLM response with regex extraction

**AnonymizerService Structure**

- Injectable decorator with Logger
- Single-responsibility methods
- TypeScript interfaces for inputs/outputs
- Unit test file alongside service

**StorageService.getFile()**

- Returns `Promise<Buffer>` for given storage path
- Handles NotFoundException for missing files
- Already used by media module for transcription

**System Prompts Pattern**

- Constants file with exported prompt strings
- Builder functions for dynamic prompts
- Spanish as primary language
- Explicit JSON response format instructions

**Controller Pattern**

- ApiTags, ApiBearerAuth, UseGuards decorators
- ApiOperation and ApiResponse documentation
- CurrentTherapist decorator for user context
- DTO validation for request/response

## Out of Scope

- Video frame analysis (deferred to task 15.2)
- Real-time streaming analysis
- Bounding box visualization on images
- Automatic analysis triggered on image upload
- Multi-image Before/After comparison (deferred to task 15.2)
- Patient-facing reports (deferred to Week 22)
- Session photo analysis (future enhancement)
- Frontend UI components for displaying results (separate task)
- Segmentation masks for anatomical regions
- File API uploads (use inline base64 for simplicity)
