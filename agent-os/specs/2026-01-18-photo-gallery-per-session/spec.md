# Specification: Photo Gallery Per Session

## Goal

Enable therapists to capture and view photos for each treatment session, documenting procedures, patient progress, and clinical observations with minimal friction.

## User Stories

- As a physiotherapist, I want to take photos during a treatment session so that I can visually document the techniques applied and patient progress.
- As a physiotherapist, I want to view all photos from a session so that I can review what was done and track visual evolution.

## Specific Requirements

**SessionPhoto Data Model**

- Add `SessionPhoto` interface: `id`, `sessionId`, `url`, `thumbnailUrl?`, `caption?`, `capturedAt`
- Add optional `photos?: SessionPhoto[]` to existing `TreatmentSession` interface
- Follow the same pattern as existing `voiceNotes?: VoiceNote[]` field
- Backend: New Prisma model `SessionPhoto` with FK to `TreatmentSession`
- Storage path: `sessions/{sessionId}/photos/{photoId}.jpg`

**Photo Capture Flow**

- Reuse existing `CameraCapture` component with `overlayType='none'`
- After capture, show preview with optional caption input (max 140 characters)
- Caption placeholder: "Añadir descripción (opcional)..."
- Two actions: "Repetir" (retake) and "Guardar" (save)
- Upload photo immediately via `mediaApi.uploadSessionPhoto()`

**SessionCard Photo Badge**

- Display photo count badge when `session.photos?.length > 0`
- Badge format: camera icon + count (e.g., "📷 3")
- Position: alongside existing voice notes indicator
- Style: same pattern as voice notes badge (teal background, small text)

**SessionDetailView Photo Gallery**

- Add "Fotos de la Sesión" section below voice notes in `SessionReport`
- Display responsive thumbnail grid (3-4 columns based on viewport)
- Each thumbnail shows image with caption truncated below (if exists)
- Tap thumbnail to open `MediaLightbox` for full-screen viewing
- Include "Añadir Foto" button as last grid item
- Empty state: "No hay fotos para esta sesión"

**SessionForm Photo Section**

- Add "Fotos" section after "Observaciones" field
- Show thumbnail grid of pending/existing photos with X button for removal
- "Capturar Foto" button opens camera capture dialog
- Photos are held in form state until form submission
- On submit, upload new photos then save session

**API Endpoints**

- `POST /api/v1/media/sessions/:sessionId/photos` - Upload photo (multipart/form-data)
- `GET /api/v1/media/sessions/:sessionId/photos` - List session photos
- `DELETE /api/v1/media/sessions/:sessionId/photos/:photoId` - Delete photo
- Return signed URLs for secure MinIO access
- Validate session ownership (therapist isolation)

**Basic Offline Handling**

- Detect offline state before upload attempt
- Show toast: "Sin conexión. La foto se guardará cuando vuelvas a conectar."
- Queue photo blob + metadata in IndexedDB
- Retry upload when `navigator.onLine` becomes true
- Show pending indicator on queued photos

## Visual Design

No mockups provided. Follow existing treatment-timeline component patterns for consistency.

## Existing Code to Leverage

**CameraCapture Component**

- Path: `apps/client/src/components/patients/CameraCapture.tsx`
- Provides camera access, capture, preview, and confirm flow
- Reuse directly with `overlayType='none'` for session photos
- Returns `Blob` + `PhotoMetadata` on capture confirmation

**MediaLightbox Component**

- Path: `apps/client/src/components/ui/media-lightbox.tsx`
- Full-screen image/video viewer with navigation arrows
- Accepts `MediaItem[]` with `id`, `url`, `type`, `label`
- Map `SessionPhoto[]` to `MediaItem[]` for lightbox display

**Media API Service**

- Path: `apps/client/src/api/media.ts`
- Extend with `uploadSessionPhoto()`, `getSessionPhotos()`, `deleteSessionPhoto()`
- Follow existing multipart upload pattern from `uploadPatientPhoto()`

**SessionCard Voice Notes Pattern**

- Lines 140-146 show voice notes badge implementation
- Replicate same conditional rendering and styling for photos badge
- Use `Camera` icon from lucide-react instead of `FileText`

**SessionForm Structure**

- Path: `apps/client/src/components/patients/treatment-timeline/SessionForm.tsx`
- Add photos section after observations field (line 356)
- Follow same section pattern: label + content area + error handling

## Out of Scope

- Video capture per session (different UX and storage requirements)
- AI analysis or auto-tagging of photos
- Cross-session photo comparison or before/after sliders
- Batch upload from device photo gallery
- Photo editing, cropping, or filters
- Patient-facing photo access (no patient portal yet)
- Photo categorization or tagging system
- Thumbnail generation on backend (use original URL initially)
- Full offline sync with conflict resolution (Week 8 / Part 4)
- Changes to Evaluation-level media (already complete)
