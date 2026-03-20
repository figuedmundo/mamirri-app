# Use the Vision API for clinical analysis

Analyze clinical images (footprints and posturograms) using the Google Gemini 3 Flash Vision API.

## What the Vision API does

The Vision API provides structured clinical analysis of images uploaded by therapists. It identifies:

- **Anatomical findings** (spine alignment, shoulder symmetry, arch type)
- **Clinical concerns** and their implications
- **Treatment recommendations**
- **Confidence levels** (LOW/MEDIUM/HIGH)
- **Quality warnings** for suboptimal images

## How the module is structured

### Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AiAnalysisModule                              │
│  ├─ AiAnalysisController                                   │
│  │   ├─ POST /ai/analyze (existing)                    │
│  │   └─ POST /ai/vision/analyze (new)              │
│  ├─ AiAnalysisService                                      │
│  ├─ VisionService (new)                                  │
│  ├─ VisionPromptBuilderService (new)                         │
│  ├─ AnonymizerService                                      │
│  ├─ TranslatorService                                       │
│  └─ PromptBuilderService                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data flow

1. Therapist uploads an image via the `MediaService`, which stores it in MinIO.
2. Therapist calls `POST /ai/vision/analyze` with an `imageId` and `imageType`.
3. The `VisionService` then:
   - Retrieves the image from `StorageService` (MinIO).
   - Verifies the therapist owns the patient (via Prisma).
   - Sends the image and a Spanish medical prompt to Gemini.
   - Parses the structured JSON response.
   - Returns the analysis with findings, concerns, and recommendations.
4. The frontend displays the results to the therapist.

## Use the analysis endpoint

### POST /ai/vision/analyze

Analyze a clinical image (footprint or posturogram) to get structured AI results.

**Request:**

```typescript
{
  imageId: string,      // ID of Footprint record
  imageType: 'POSTUROGRAM' | 'FOOTPRINT'
}
```

**Response:**

```typescript
{
  rawAnalysis: string,                      // Full AI response text
  structuredAnalysis: {
    findings: Finding[],                  // Anatomical observations
    concerns: Concern[],                  // Clinical implications
    recommendations: string[],             // Treatment suggestions
    confidence: 'LOW' | 'MEDIUM' | 'HIGH'   // AI confidence level
  },
  qualityWarning: string | null,            // Image quality issues (if any)
    metadata: {
      processingTimeMs: number,              // Time taken for analysis
      modelUsed: 'gemini-3-flash',       // AI model used
      imageType: 'POSTUROGRAM' | 'FOOTPRINT'
    }

}
```

**Finding:**

```typescript
{
  area: string,          // e.g., "Columna cervical", "Arco plantar derecho"
  observation: string,     // Clinical observation
  severity: 'normal' | 'mild' | 'moderate' | 'severe'
}
```

**Concern:**

```typescript
{
  description: string,           // e.g., "Posible tensión muscular cervical"
  clinicalImplication: string,  // e.g., "Puede contribuir a cefaleas tensionales"
}
```

## Set environment variables for configuration

| Variable                | Description       | Default          | Notes                                    |
| ----------------------- | ----------------- | ---------------- | ---------------------------------------- |
| `GOOGLE_API_KEY`        | Google AI API key | Required         | Get from Google AI Studio                |
| `AI_VISION_MODEL`       | Vision model name | `gemini-3-flash` | Recommended: `gemini-3-flash-preview`    |
| `AI_VISION_TEMPERATURE` | Temperature       | `0.1`            | Lower for deterministic medical analysis |

## Choose a vision model

**Gemini 3 Flash** (Recommended)

- **Purpose**: Latest frontier model with advanced intelligence built for speed.
- **Capabilities**: Superior image analysis, spatial reasoning, and faster processing.
- **Note**: Use `gemini-3-flash-preview` for the absolute latest features and best performance in agentic workflows.

**Gemini 2.5 Flash** (Legacy)

- **Purpose**: Previous generation high-speed multimodal vision model.
- **Capabilities**: Stable image analysis and text understanding.
- **Cost**: Check the [official pricing](https://ai.google.dev/pricing) for the latest rates.

**Gemini 2.0 Flash Experimental**

- Higher quality vision
- Lower rate limits
- Higher cost

**Recommendation**: Start with `gemini-3-flash`, monitor usage, and upgrade to `gemini-3-flash-preview` if you need the absolute latest capabilities.

## Call the API from the frontend

### Request an analysis

```typescript
// Therapist makes request
const response = await fetch('/api/ai/vision/analyze', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    imageId: 'footprint-abc123',
    imageType: 'FOOTPRINT',
  }),
});
```

### Use mock mode for development

When `GOOGLE_API_KEY` isn't configured, the service returns mock responses. This is useful for:

- Developing without API costs
- Testing frontend integration
- Showing demos

**Detection**: Check if `metadata.modelUsed === 'mock-model'` to identify mock responses.

## Troubleshoot common errors

| Error                | HTTP Status | Cause                         | Solution                                 |
| -------------------- | ----------- | ----------------------------- | ---------------------------------------- |
| Image not found      | 404         | Invalid `imageId`             | Verify the image exists                  |
| Access denied        | 403         | Therapist doesn't own patient | Verify patient-therapist relationship    |
| Invalid image type   | 400         | Unknown `imageType`           | Use `POSTUROGRAM` or `FOOTPRINT`         |
| API quota exceeded   | 429         | Rate limit                    | Implement retry with exponential backoff |
| Invalid API response | 500         | LLM parsing failed            | Log the error and return a fallback      |

## Verify the implementation

### Run automated tests

Run vision-related tests:

```bash
pnpm test -- ai-analysis
```

### Test the implementation manually

1. **Test Mock Mode**:
   - Set `GOOGLE_API_KEY=""`
   - Request an analysis
   - Verify the service returns a mock response
   - Check that `modelUsed === 'mock-model'`

2. **Test the real API**:
   - Set a valid `GOOGLE_API_KEY`
   - Upload a test image
   - Verify it returns a structured analysis
   - Check that findings contain Spanish medical terms

3. **Check access control**:
   - Create a test therapist account with an assigned patient
   - Try to analyze an image belonging to a different therapist's patient (this should fail with a 403)

## Current limitations

1. **POSTUROGRAM Type**: Currently returns null or mock data because posturogram data is stored as JSON in the `Evaluation` table, not as separate image files. Full support requires a database schema update to add posturogram image storage.

2. **Rate Limits**: The Gemini API has rate limits. High-frequency usage may trigger 429 errors. The service implements a 3-retry logic with exponential backoff.

3. **Image Quality**: The vision model may return a `qualityWarning` if image resolution is too low, lighting is poor, or anatomical features aren't clearly visible.

## What's coming next

1. **Batch Analysis**: Add an endpoint to analyze multiple images at once.
2. **Comparison Mode**: Track analysis over time to show patient progress.
3. **Export Analysis**: Generate PDF reports of findings for patient records.
4. **Citations**: Add reference citations for recommendations (linking to the Biblioteca Médica).

## Learn more

- [System Prompts](../constants/system-prompts.md) — Text analysis prompts
- [Analysis Interfaces](../interfaces/analysis.interfaces.ts) — Core data structures
- [Vision Interfaces](../interfaces/vision.interfaces.ts) — Vision-specific types
- [Vision Prompts](../constants/vision-prompts.ts) — Medical vision prompts in Spanish

## Get support

If you have issues or questions about the Vision API feature:

- Check the logs: `apps/server/src/modules/ai-analysis/`
- Review the test files: `*.vision*.spec.ts`
- See the [Verification Report](../../specs/2026-02-06-gemini-vision-api/verifications/final-verification.html)
