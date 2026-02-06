# Spec Requirements: Gemini Vision API

## Initial Description

**Task 15.1** from the product roadmap (Week 15: Vision & Full Analysis):

> Gemini Vision: Image description API

This feature adds visual analysis capabilities to the AI infrastructure, enabling automated clinical image analysis for posturograms and footprints.

## Requirements Discussion

### First Round Questions

**Q1:** I assume we're focusing on posturograms and footprints as the primary use cases for vision analysis. Is that correct, or should session photos/videos also be analyzed?
**Answer:** Focus on **posturograms and footprints** first. These are clinically valuable with structured analysis needs. Session photos are documentation-focused and less amenable to automated clinical analysis. Videos deferred to task 15.2.

**Q2:** Should we create a standalone VisionService or extend the existing AiAnalysisService?
**Answer:** Create a **new `VisionService`** inside the existing `ai-analysis` module. Follows existing modular pattern, keeps vision logic isolated and testable, allows orchestration in task 15.2.

**Q3:** The existing codebase uses `@google/generative-ai` (deprecated). Should we migrate to `@google/genai`?
**Answer:** **Yes, migrate to `@google/genai`**. The old package is explicitly deprecated by Google. New SDK has better TypeScript support, cleaner API, and required for Gemini 2.5/3.0 features. Migration scope includes ai-analysis.service.ts, knowledge-base.service.ts, and new vision.service.ts.

**Q4:** Should analysis happen server-side on-demand or automatically on every upload?
**Answer:** **On-demand server-side**, triggered explicitly by the therapist. Matches "Zero-Friction" philosophy, avoids wasted API costs, respects therapist expertise. Aligns with existing transcription pattern.

**Q5:** For output format, should we store structured JSON, raw text, or both?
**Answer:** Store **both structured JSON and raw text**. Structured enables Card-Based UI, raw preserves full context for audit/legal. Allows future UI improvements without re-analyzing.

**Q6:** Should the vision API reject low-quality images or attempt analysis with a warning?
**Answer:** **Attempt analysis with quality warning**, don't reject. Therapist already took the photo. Some analysis is better than none. Gemini handles imperfect images well. Warning informs them results may be less reliable.

**Q7:** What should be explicitly out of scope?
**Answer:** Video frame analysis (task 15.2), real-time streaming (Part 4), bounding box visualization (stretch goal), automatic analysis on upload (never), multi-image comparison (task 15.2), patient-facing reports (Week 22).

### Existing Code to Reference

**Similar Features Identified:**

- Feature: LLM Integration - Path: `apps/server/src/modules/ai-analysis/ai-analysis.service.ts`
- Feature: Service Structure - Path: `apps/server/src/modules/ai-analysis/services/anonymizer.service.ts`
- Feature: Prompts - Path: `apps/server/src/modules/ai-analysis/constants/system-prompts.ts`
- Feature: Image Retrieval - Path: `apps/server/src/modules/storage/storage.service.ts`
- Feature: Quality Validation - Path: `apps/client/src/utils/quality-validation.ts`

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - This is a backend API feature with no new UI components in scope for task 15.1.

## Requirements Summary

### Functional Requirements

- Single image analysis endpoint for posturograms and footprints
- Structured JSON output with findings, concerns, recommendations
- Raw analysis text preserved for audit purposes
- Quality warning for suboptimal images (don't reject)
- On-demand analysis triggered by therapist action

### Reusability Opportunities

- `VisionService` pattern from existing `AnonymizerService`
- `@google/genai` SDK patterns from librarian research
- Error handling and retry logic from `AiAnalysisService`
- Image retrieval via `StorageService.getFile()`
- Prompt organization in `constants/vision-prompts.ts`

### Scope Boundaries

**In Scope:**

- VisionService implementation with Gemini Vision API
- SDK migration from @google/generative-ai to @google/genai
- Posturogram analysis prompt (spine alignment, shoulder symmetry, deviations)
- Footprint analysis prompt (arch type, pressure distribution, gait patterns)
- Structured output schema with findings/concerns/recommendations
- Quality warning integration
- Unit tests for VisionService

**Out of Scope:**

- Video frame analysis (task 15.2)
- Real-time streaming analysis
- Bounding box visualization on images
- Automatic analysis on upload
- Multi-image Before/After comparison
- Patient-facing reports
- Frontend UI changes (separate task)
- Session photo analysis (future)

### Technical Considerations

- Must use new `@google/genai` SDK (deprecated package migration)
- Follow existing ai-analysis module patterns
- Store analysis results in database for persistence
- Use StorageService for image buffer retrieval
- Temperature 0.1 for deterministic medical analysis
- Include medical disclaimers in prompts
