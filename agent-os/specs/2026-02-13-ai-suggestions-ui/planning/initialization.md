# Spec Initialization: AI Suggestions UI

## Raw Idea

**Roadmap Task 15.4:** Frontend: Suggestions UI (cards, citations)

Display AI-generated treatment suggestions and literature citations in the frontend after a therapist clicks "Analyze with IA" on a clinical case. The backend endpoint (`POST /api/v1/ai/cases/:caseId/analyze`) is fully implemented and returns structured data including a primary suggestion, alternatives, citations from medical literature, Chain-of-Thought reasoning, and service status metadata.

## Source

- Product Roadmap: `agent-os/product/roadmap.md` — Task 15.4
- Related backend specs:
  - `agent-os/specs/2026-02-05-ai-analysis-agent/` (AI module architecture)
  - `agent-os/specs/2026-02-06-ai-orchestration-voice-vision-rag/` (orchestration + UI requirements)
  - `agent-os/specs/2026-02-07-analyze-case-endpoint/` (vision caching endpoint)

## Date

2026-02-13
