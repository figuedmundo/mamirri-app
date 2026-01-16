# Spec Initialization: Wire Session Callbacks

## Source

Roadmap Task 6.10

## Raw Description

Wire callbacks: onAddSession, onEditSession, onViewSession

## Context

This task is part of Week 6: Pacientes — Evaluation & Timeline (Milestone 2b), specifically under the "Integrations" section. It follows task 6.9 which wired callbacks for onSave, onPosturogramaChange, and onPainScaleChange.

The TreatmentTimeline component (formerly Cronograma) already has internal session management (add, edit, delete) implemented. This task is about wiring those callbacks to parent components so session changes propagate correctly through the application state.

## Related Components

- `TreatmentTimeline.tsx` (formerly `Cronograma.tsx`) - Has session CRUD with internal API calls
- `CaseDetailLayout.tsx` - Parent layout that should receive session updates
- `PatientsApi` - API client for session operations

## Date Initialized

2026-01-16
