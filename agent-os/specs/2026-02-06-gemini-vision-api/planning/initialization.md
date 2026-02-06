# Spec Initialization: Gemini Vision API

## Raw Idea

**Task 15.1** from the product roadmap (Week 15: Vision & Full Analysis):

> Gemini Vision: Image description API

This feature is part of the AI Infrastructure phase, building on the completed AI Agent (Week 14) to add visual analysis capabilities.

## Roadmap Context

This is the first task in Week 15, which includes:

- 15.1 Gemini Vision: Image description API (this spec)
- 15.2 Orchestration: Combine Voice + Vision + RAG + LLM
- 15.3 "Analyze Case" endpoint (orchestrates all services)
- 15.4 Frontend: Suggestions UI (cards, citations)
- 15.5 Feedback loop: Like/Dislike buttons
- 15.6 Test: Complete flow with real patient data

## Related Mission Context

From product mission:

- **"Hybrid Vision Analysis"**: Combines deterministic computer vision (for image alignment/homography) with generative AI (for qualitative analysis) to highlight pathologies
- **"Visual & Temporal Context"**: System aligns and compares "Before vs. After" images to objectively demonstrate progress

## Technical Context

- **Current SDK**: `@google/generative-ai` (deprecated - migration to `@google/genai` recommended)
- **Current Model**: `gemini-3-flash` for text analysis
- **Existing AI Module**: `apps/server/src/modules/ai-analysis/`
- **Storage**: MinIO via `StorageService` with signed URLs
- **Image Types in Use**: Posturograms, footprints, session photos, posture videos

## Date Created

2026-02-06
