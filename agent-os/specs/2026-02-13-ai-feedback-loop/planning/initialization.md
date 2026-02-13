# Spec Initialization: AI Feedback Loop

## Source

Roadmap task 15.5: "Feedback loop: Like/Dislike buttons"

## Raw Idea

Add Like/Dislike feedback buttons to AI treatment suggestions so that the therapist can indicate whether the AI's clinical recommendations were helpful or not. This is part of Week 15 (Vision & Full Analysis) and follows the completed task 15.4 (Suggestions UI with cards, citations, warning banners, and re-open/retry states).

## Context

- The AI analysis generates treatment suggestions via RAG + Vision + Voice + LLM orchestration
- Suggestions are displayed in an `AnalysisResultsPanel` modal dialog with `SuggestionCard` components
- Each suggestion has: title, description, confidence level (HIGH/MEDIUM/LOW), and optional reasoning
- Currently, analysis results are **transient** — they are NOT persisted to the database
- No feedback models or endpoints exist yet in the Prisma schema or backend
