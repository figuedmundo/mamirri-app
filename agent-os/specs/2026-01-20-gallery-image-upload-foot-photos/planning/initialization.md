# Spec Initialization: Gallery Image Upload for Foot Photos

## Raw Idea (from User)

**Feature Description:**
Allow uploading pictures from device gallery (not just taking photos with camera) for foot/feet images. This should include left/right foot identification and potentially live in a "Multimedia" section.

**User Question:**

> "should we allow to upload pictures besides the pictures we take using the camera of the device ?"

**User Clarification:**

- Not just gallery upload - specifically for foot/feet photos
- Need left/right foot identification
- Should live in "Multimedia" section

## Product Context

### Mission Alignment

From `mission.md`:

- **"Zero-Friction" Digital Clinical Assistant** - gallery upload reduces friction for existing photos
- **"Data fragmentation" pain point** - "Critical info lives in memory, phone gallery, and paper notes"
- **Visual & Temporal Context** - treating visual evolution as a core vital sign
- **Before vs. After comparison** - existing photos may show previous state

### Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS + Shadcn/UI
- Backend: NestJS with MinIO (S3-compatible) storage
- PWA-ready

## Existing Infrastructure

### CameraCapture Component (Reference)

**Location:** `apps/client/src/components/patients/CameraCapture.tsx`

Current implementation:

- States: idle → requesting → previewing → captured → error
- Supports overlays for posture views (anterior, posterior, lateral-left, lateral-right)
- Supports footprint overlays (left, right)
- Returns `Blob` + `PhotoMetadata` via `onCapture` callback
- Built with `getUserMedia` API (no external dependencies)

### Media API Service (Reference)

**Location:** `apps/client/src/api/media.ts`

Key methods for foot photos:

```typescript
uploadFootprint(
  evaluationId: string,
  file: Blob,
  type: 'initial' | 'final' | 'followup',
  side: 'left' | 'right' | 'unknown' = 'unknown',
): Promise<Footprint>
```

### Data Types (Reference)

**Location:** `apps/client/src/types/patient.ts`

```typescript
export interface Footprint {
  id: string;
  evaluationId: string;
  type: 'initial' | 'final' | 'followup';
  side?: 'left' | 'right' | 'unknown'; // ← This field exists!
  date: string;
  url: string;
  analysis?: FootprintAnalysis;
  comparison?: FootprintComparison;
}
```

**Note:** The `side` field already exists in the type definition but isn't being utilized in the CameraCapture component.

### PostureView Type

Supports left/right identification for both posture and footprint:

```typescript
export type PostureView =
  | 'posture-anterior'
  | 'posture-posterior'
  | 'posture-lateral-left'
  | 'posture-lateral-right'
  | 'footprint-left'
  | 'footprint-right';
```

## Current Limitations

1. **No gallery upload** - Only live camera capture via `getUserMedia`
2. **No file picker** - Users must retake photos even if they exist
3. **Missing side selection for uploads** - Camera overlay handles this, but upload flow doesn't
4. **No multimedia hub** - No centralized place for media management

## Initial Date

2026-01-20

## Status

Requirements gathering in progress. Research phase active.
