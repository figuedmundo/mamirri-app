# AI Analysis Feature Guide

## Overview

The AI Analysis feature provides physiotherapists with evidence-based clinical suggestions by performing semantic search over medical literature (RAG) and generating structured reasoning using Google Gemini 3 Flash.

## Technical Architecture

The feature is implemented in the `AiAnalysisModule` and follows a pipelined execution flow:

1.  **Case Loading**: Retrieves full clinical case data, ensuring therapist ownership.
2.  **Anonymization**: Uses `AnonymizerService` to strip PII.
    - Replaces names with `[PATIENT]`.
    - Converts birthdates to `[AGE] años`.
    - Removes emails/phones.
3.  **Multi-Query RAG**: Executes 3 parallel searches via `KnowledgeBaseService`:
    - **Diagnosis Search**: Based on initial diagnosis and reason for consultation.
    - **Treatment Search**: Based on clinical presentation and pain scale.
    - **Safety Search**: Checks contraindications based on pharmacological history.
4.  **LLM Generation**: Calls Gemini 3 Flash with a Chain-of-Thought (CoT) system prompt.
5.  **Translation**: If literature is in English, the `TranslatorService` converts citations to Spanish while preserving the original.
6.  **Rehydration**: Restores original patient names in the final response before returning to the client.

## Components

### Services

- `AiAnalysisService`: Orchestrator of the pipeline.
- `AnonymizerService`: Handles reversible PII masking.
- `TranslatorService`: Manages EN-ES translation and caching.
- `PromptBuilderService`: Constructs specialized prompts and RAG queries.

### CLI Tools

- `pnpm knowledge:search "query"`: Test semantic search independently.
- `pnpm exec ts-node scripts/ingest-books.ts`: Ingest new PDF literature.
- `pnpm exec ts-node scripts/list-books.ts`: List currently ingested books.

## Development & Testing

### Environment Variables

Required variables in `.env`:

```bash
GOOGLE_API_KEY=your_key
AI_MODEL=gemini-3-flash
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=4096
```

### Running Tests

```bash
# Run AI module tests
pnpm test src/modules/ai-analysis

# Run knowledge base tests
pnpm test src/modules/knowledge-base
```

## Privacy & Security

- **In-Memory Only**: Anonymization mappings are never persisted to the database.
- **GDPR Compliance**: No PII is sent to external LLM providers.
- **Tenant Isolation**: Only the owner of a clinical case can request an analysis.

---

**Last Updated:** 2026-02-05
