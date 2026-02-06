# Phase 3: Supervised Clinical Intelligence

**Duration:** 6-10 weeks  
**Status:** 🟡 In Progress  
**Goal:** AI provides evidence-based suggestions while maintaining therapist oversight

---

## Completed Features

### Multi-Modal AI Orchestration

The AI now combines multiple data sources to provide comprehensive clinical suggestions:

**Data Sources Integrated:**

- **Voice transcripts**: Natural language notes from evaluations and sessions
- **Vision findings**: AI-analyzed posturograms and footprint scans
- **Medical literature**: Evidence from ingested textbooks (RAG)
- **Clinical history**: Evaluations, pain scales, and treatment sessions

**How Therapists Use It:**

1. Navigate to a clinical case
2. Click **Analizar con IA** button
3. Review pattern recognition and suggestions
4. Check citations from medical books
5. Make clinical decision with AI support

### Explainable AI

Every suggestion includes:

- **Pattern recognized**: Clinical patterns identified from data
- **Confidence level**: HIGH/MEDIUM/LOW based on evidence quality
- **Rationale**: Why this suggestion makes sense
- **Citations**: Specific book passages supporting the suggestion
- **Service status**: Which data sources contributed (green/yellow/red indicator)

---

## In Progress

### Decision Capture (Week 15.5)

Recording therapist feedback on AI suggestions:

- Like/dislike buttons on suggestions
- Track which suggestions were accepted
- Monitor clinical outcomes
- Improve future recommendations

---

## Architecture

### Data Flow

```
Clinical Case + Evaluations + Sessions + Vision + Voice
                    ↓
          DataAggregationService
                    ↓
            AnonymizerService
                    ↓
      Parallel RAG (4 queries)
                    ↓
      Gemini 3 Flash (LLM)
                    ↓
        Suggestions + Citations
```

### Performance

- **Response time**: <2.5 seconds average
- **Data gathering**: Parallel (evaluations, sessions, vision, voice)
- **RAG retrieval**: 4 parallel similarity searches
- **Graceful degradation**: Works with partial data

---

## Privacy & Safety

**Anonymization:**

- All PII stripped before external API calls
- Patient names → "Patient"
- Dates → relative time references
- Only clinical patterns sent to LLM

**Safety Constraints:**

- AI provides **suggestions**, not diagnoses
- Every recommendation includes confidence level
- Citations trace to actual book content
- Therapist makes final clinical decisions

---

## Related Documentation

- [AI Analysis Feature Guide](../../technical/ai-analysis-feature-guide.md)
- [Knowledge Base & RAG](../../technical/knowledge-base-rag.md)

**Last Updated:** 2026-02-06
