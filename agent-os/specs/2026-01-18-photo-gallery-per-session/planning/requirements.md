# Spec Requirements: Photo Gallery Per Session

## Initial Description

**Source:** Roadmap Task 7.3 - Frontend: Photo gallery per session

Part of Week 7: Media & Dictation milestone (Milestone 3: "I can take photos and dictate notes").

## Requirements Discussion

### First Round Questions

**Q1:** Should photos be attached per TreatmentSession (session-specific) or at the ClinicalCase/Evaluation level?
**Answer:** Session-level photos. Evaluations already have structured media (footprints, posture videos) for formal before/after comparison. Sessions need informal procedure documentation - photos of what happens during treatment (techniques applied, patient exercises, progress snapshots). This fills the gap where sessions currently only have voice notes.

**Q2:** Should the gallery display as a thumbnail grid with tap-to-expand, and should SessionCard show mini-previews?
**Answer:** Photo count badge in SessionCard (minimal, non-intrusive), full thumbnail grid in SessionDetailView. User persona (45-60, high volume) needs quick scanning in timeline. Detailed viewing happens in SessionDetailView where space is available.

**Q3:** Should photos have categories/types (procedure, progress, clinical notes)?
**Answer:** No categorization for MVP. Aligns with "Zero-Friction" mission - every extra tap is friction. Voice notes don't have types either. Can add categorization later if users request it.

**Q4:** Should photos support captions/notes?
**Answer:** Optional short caption (max 140 chars). Sometimes a photo needs context ("Aplicando técnica de Jones en trapecio"), but forcing captions adds friction. Voice notes already capture detailed observations.

**Q5:** Where should the "Add Photo" action be available?
**Answer:**

- SessionForm (add/edit session) - Primary capture point with "Añadir Foto" button
- SessionDetailView - Photo grid with add button for viewing and adding
- SessionCard - Photo count badge only (no quick action, adds clutter)

**Q6:** Should offline support be included?
**Answer:** Basic connectivity handling for MVP. Show toast if offline, store temporarily in browser, upload when back online (basic retry). Full offline sync is Week 8 (PWA) and Part 4 scope.

**Q7:** What should be explicitly excluded?
**Answer:**

- Video capture per session (different UX, storage costs)
- AI analysis of session photos (Part 2, Week 15)
- Cross-session comparison (Evaluation-level feature)
- Batch upload from phone gallery (complexity, privacy)
- Photo editing/cropping (phones have this)
- Photo deletion by patient (no patient portal yet)

### Existing Code to Reference

**Similar Features Identified:**

- Feature: CameraCapture - Path: `apps/client/src/components/patients/CameraCapture.tsx`
  - Reuse for photo capture flow (already supports overlays, camera toggle, preview/confirm)
- Feature: MediaLightbox - Path: `apps/client/src/components/ui/media-lightbox.tsx`
  - Reuse for full-screen photo viewing with navigation
- Feature: Media API - Path: `apps/client/src/api/media.ts`
  - Extend with session photo upload method
- Feature: SessionForm - Path: `apps/client/src/components/patients/treatment-timeline/SessionForm.tsx`
  - Add photo capture/preview section
- Feature: SessionDetailView - Path: `apps/client/src/components/patients/treatment-timeline/SessionDetailView.tsx`
  - Add photo gallery grid section
- Feature: SessionCard - Path: `apps/client/src/components/patients/treatment-timeline/SessionCard.tsx`
  - Add photo count badge

- Feature: VoiceNotes pattern in TreatmentSession - Path: `apps/client/src/types/patient.ts`
  - Follow same optional array pattern for photos

### Follow-up Questions

None needed - recommendations were approved.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A

## Requirements Summary

### Functional Requirements

**Data Model:**

- Add `SessionPhoto` interface with: `id`, `sessionId`, `url`, `thumbnailUrl?`, `caption?`, `capturedAt`
- Add optional `photos?: SessionPhoto[]` field to `TreatmentSession` interface
- Backend: New endpoint for session photo upload/retrieval

**Photo Capture:**

- Use existing CameraCapture component (no overlays needed for session photos)
- After capture: Show preview with optional caption input (max 140 chars)
- Confirm to upload, cancel to discard
- Upload via extended mediaApi service

**Photo Display - SessionCard:**

- Show photo count badge (e.g., "📷 3") if session has photos
- No thumbnails in card view

**Photo Display - SessionDetailView:**

- Thumbnail grid (responsive, 3-4 columns)
- Tap thumbnail to open MediaLightbox
- "Añadir Foto" button in grid
- Empty state: "No hay fotos para esta sesión"

**Photo Display - SessionForm:**

- "Añadir Foto" button that opens CameraCapture
- Preview grid of pending/existing photos
- Remove photo option (X button on thumbnail)
- Photos saved when form is submitted

**Offline Handling (Basic):**

- Detect offline state before upload
- Show toast: "Sin conexión. La foto se guardará cuando vuelvas a conectar."
- Queue photo in IndexedDB
- Retry upload when connectivity returns

### Reusability Opportunities

- CameraCapture component (100% reuse)
- MediaLightbox component (100% reuse)
- mediaApi pattern for upload method
- VoiceNote array pattern for data model
- Existing thumbnail/grid patterns from PosturogramViewer

### Scope Boundaries

**In Scope:**

- SessionPhoto type definition
- Photo capture flow in SessionForm
- Photo gallery grid in SessionDetailView
- Photo count badge in SessionCard
- Media upload API extension
- Basic offline queueing
- Caption support (optional, 140 chars)

**Out of Scope:**

- Video capture per session
- AI analysis of photos
- Cross-session photo comparison
- Batch upload from device gallery
- Photo editing/cropping/filters
- Patient-facing photo access
- Photo categorization/tagging
- Evaluation-level changes (already complete)

### Technical Considerations

**Frontend:**

- React 19 + TypeScript
- Tailwind CSS + Shadcn/UI
- Existing component patterns

**Backend:**

- NestJS media module (already exists)
- MinIO storage via StorageService
- New endpoint: `POST /media/sessions/:sessionId/photos`
- New endpoint: `GET /media/sessions/:sessionId/photos`
- Signed URLs for secure access

**Database:**

- New `SessionPhoto` table with FK to `TreatmentSession`
- Fields: id, sessionId, storageKey, caption, capturedAt, createdAt

**Storage:**

- MinIO bucket: existing media bucket
- Path pattern: `sessions/{sessionId}/photos/{photoId}.jpg`
- Thumbnail generation (optional, can defer)

## Component Specifications

### New Components

1. **SessionPhotoGallery** - Thumbnail grid with lightbox integration
   - Props: `photos: SessionPhoto[]`, `onAdd?: () => void`, `onDelete?: (id: string) => void`
   - Location: `apps/client/src/components/patients/treatment-timeline/SessionPhotoGallery.tsx`

2. **SessionPhotoCapture** - Wrapper around CameraCapture with caption input
   - Props: `onSave: (blob: Blob, caption?: string) => void`, `onCancel: () => void`
   - Location: `apps/client/src/components/patients/treatment-timeline/SessionPhotoCapture.tsx`

### Modified Components

1. **SessionCard** - Add photo count badge
2. **SessionDetailView** - Add SessionPhotoGallery section
3. **SessionForm** - Add photo capture/preview section

### API Extensions

```typescript
// apps/client/src/api/media.ts
uploadSessionPhoto: async (
  sessionId: string,
  file: Blob,
  caption?: string
): Promise<SessionPhoto>

getSessionPhotos: async (
  sessionId: string
): Promise<SessionPhoto[]>

deleteSessionPhoto: async (
  sessionId: string,
  photoId: string
): Promise<void>
```

## UI Mockups (Text-Based)

### SessionCard with Photo Badge

```
┌─────────────────────────────────────────────┐
│ Sesión 5 - Fase 2                    📷 3  │
│ 15 Ene 2026 • END: 4/10                    │
│ Movilizaciones, Estiramientos              │
│ Respuesta: Buena tolerancia                │
└─────────────────────────────────────────────┘
```

### SessionDetailView Photo Section

```
┌─────────────────────────────────────────────┐
│ Fotos de la Sesión                         │
├─────────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────────┐       │
│ │ 📷  │ │ 📷  │ │ 📷  │ │ + Añadir│       │
│ │     │ │     │ │     │ │  Foto   │       │
│ └─────┘ └─────┘ └─────┘ └─────────┘       │
│ "Técn.." "Ejerc.." "Progr.."               │
└─────────────────────────────────────────────┘
```

### SessionForm Photo Section

```
┌─────────────────────────────────────────────┐
│ Fotos                                       │
├─────────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────────────────┐        │
│ │ 📷 ✕│ │ 📷 ✕│ │   📷 Capturar   │        │
│ └─────┘ └─────┘ │      Foto       │        │
│                 └─────────────────┘        │
└─────────────────────────────────────────────┘
```

### Photo Capture Flow

```
┌─────────────────────────────────────────────┐
│              [Camera Preview]               │
│                                             │
│                    ⚪                        │
│              [Capture Button]               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│              [Photo Preview]                │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Añadir descripción (opcional)...        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│    [Repetir]              [Guardar]         │
└─────────────────────────────────────────────┘
```

## Estimation

| Task                              | Effort        |
| --------------------------------- | ------------- |
| SessionPhoto type + API extension | 1 hour        |
| Backend endpoint (photos CRUD)    | 2 hours       |
| SessionPhotoGallery component     | 2 hours       |
| SessionPhotoCapture component     | 1 hour        |
| SessionCard badge modification    | 30 min        |
| SessionDetailView integration     | 1 hour        |
| SessionForm integration           | 1.5 hours     |
| Basic offline queueing            | 1.5 hours     |
| Testing                           | 2 hours       |
| **Total**                         | **~12 hours** |
