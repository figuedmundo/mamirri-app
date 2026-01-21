# Task Breakdown: Photo Gallery Per Session

## Overview

Total Tasks: 24

## Task List

### Database & Backend Layer

#### Task Group 1: Data Model and Migration

**Dependencies:** None

- [x] 1.0 Complete database layer for SessionPhoto
  - [x] 1.1 Write 4 focused tests for SessionPhoto model
    - Test SessionPhoto creation with valid data
    - Test FK relationship to TreatmentSession
    - Test caption length validation (max 140 chars)
    - Test cascade delete when session is deleted
  - [x] 1.2 Create Prisma migration for SessionPhoto table
    - Fields: `id` (uuid), `sessionId` (FK), `storageKey`, `caption` (varchar 140, nullable), `capturedAt`, `createdAt`
    - Index on `sessionId` for query performance
    - FK constraint to `TreatmentSession` with cascade delete
  - [x] 1.3 Update Prisma schema with SessionPhoto model
    - Add `SessionPhoto` model definition
    - Add `photos SessionPhoto[]` relation to `TreatmentSession` model
    - Follow existing pattern from `VoiceNote` model
  - [x] 1.4 Run migration and verify database layer tests pass
    - Run `prisma migrate dev`
    - Run only the 4 tests from 1.1

**Acceptance Criteria:**

- Migration creates SessionPhoto table with correct schema
- FK relationship works correctly
- Cascade delete removes photos when session deleted
- 4 tests pass

---

#### Task Group 2: API Endpoints

**Dependencies:** Task Group 1

- [x] 2.0 Complete API layer for session photos
  - [x] 2.1 Write 5 focused tests for session photo endpoints
    - Test POST upload returns SessionPhoto with signed URL
    - Test GET list returns all photos for session
    - Test DELETE removes photo from storage and DB
    - Test therapist isolation (can't access other therapist's session photos)
    - Test 404 for non-existent session
  - [x] 2.2 Create SessionPhotoController in media module
    - `POST /api/v1/media/sessions/:sessionId/photos` - multipart upload
    - `GET /api/v1/media/sessions/:sessionId/photos` - list with signed URLs
    - `DELETE /api/v1/media/sessions/:sessionId/photos/:photoId`
    - Follow pattern from existing media controller
  - [x] 2.3 Implement SessionPhotoService
    - `uploadPhoto(sessionId, file, caption?)` - validate, store in MinIO, create DB record
    - `getPhotos(sessionId)` - fetch photos with signed URLs
    - `deletePhoto(sessionId, photoId)` - delete from MinIO and DB
    - Reuse `StorageService` for MinIO operations
  - [x] 2.4 Add session ownership validation
    - Verify session belongs to authenticated therapist
    - Return 403 if unauthorized access attempt
    - Reuse existing auth guards pattern
  - [x] 2.5 Define storage path convention
    - Path: `sessions/{sessionId}/photos/{photoId}.jpg`
    - Generate signed URLs with 1-hour expiry
  - [x] 2.6 Ensure API layer tests pass
    - Run only the 5 tests from 2.1

**Acceptance Criteria:**

- All 3 endpoints work correctly
- Multipart upload stores file in MinIO
- Signed URLs returned for secure access
- Therapist isolation enforced
- 5 tests pass

---

### Frontend Layer

#### Task Group 3: Type Definitions and API Client

**Dependencies:** Task Group 2

- [x] 3.0 Complete frontend types and API integration
  - [x] 3.1 Add SessionPhoto interface to patient.ts
    - Fields: `id`, `sessionId`, `url`, `thumbnailUrl?`, `caption?`, `capturedAt`
    - Add `photos?: SessionPhoto[]` to `TreatmentSession` interface
  - [x] 3.2 Extend mediaApi with session photo methods
    - `uploadSessionPhoto(sessionId, file, caption?)` - multipart upload
    - `getSessionPhotos(sessionId)` - fetch list
    - `deleteSessionPhoto(sessionId, photoId)` - delete
    - Follow existing `uploadPatientPhoto` pattern

**Acceptance Criteria:**

- Types match backend response shape
- API methods work with backend endpoints
- Multipart upload handles Blob correctly

---

#### Task Group 4: UI Components

**Dependencies:** Task Group 3

- [x] 4.0 Complete UI components for photo gallery
  - [x] 4.1 Write 6 focused tests for UI components
    - Test SessionPhotoGallery renders thumbnails correctly
    - Test SessionPhotoGallery opens lightbox on thumbnail click
    - Test SessionPhotoGallery shows empty state when no photos
    - Test SessionPhotoCapture calls onSave with blob and caption
    - Test SessionCard shows photo badge when photos exist
    - Test SessionCard hides badge when no photos
  - [x] 4.2 Create SessionPhotoGallery component
    - Path: `apps/client/src/components/patients/treatment-timeline/SessionPhotoGallery.tsx`
    - Props: `photos`, `onAdd?`, `onDelete?`, `readonly?`
    - Responsive grid: 3 cols mobile, 4 cols desktop
    - Thumbnail with caption truncation
    - Integrate with MediaLightbox for full-screen view
    - "Añadir Foto" button as last grid item
    - Empty state: "No hay fotos para esta sesión"
  - [x] 4.3 Create SessionPhotoCapture component
    - Path: `apps/client/src/components/patients/treatment-timeline/SessionPhotoCapture.tsx`
    - Props: `onSave(blob, caption?)`, `onCancel`
    - Wrap CameraCapture with caption input step
    - Caption input: max 140 chars, placeholder "Añadir descripción (opcional)..."
    - Actions: "Repetir" and "Guardar" buttons
  - [x] 4.4 Modify SessionCard to show photo badge
    - Add camera icon + count badge when `session.photos?.length > 0`
    - Position below voice notes indicator
    - Style: match voice notes badge pattern (teal, small)
  - [x] 4.5 Modify SessionDetailView to show photo gallery
    - Add "Fotos de la Sesión" section in SessionReport
    - Use SessionPhotoGallery component
    - Add "Añadir Foto" functionality with SessionPhotoCapture
    - Handle photo upload and refresh
  - [x] 4.6 Modify SessionForm to include photo section
    - Add "Fotos" section after "Observaciones" field
    - Show pending photos grid with remove (X) button
    - "Capturar Foto" button opens SessionPhotoCapture dialog
    - Hold photos in form state, upload on submit
  - [x] 4.7 Ensure UI component tests pass
    - Run only the 6 tests from 4.1

**Acceptance Criteria:**

- Gallery displays thumbnails in responsive grid
- Lightbox opens on thumbnail tap
- Capture flow includes caption input
- SessionCard shows photo count badge
- SessionForm allows photo capture before submit
- 6 tests pass

---

#### Task Group 5: Basic Offline Handling

**Dependencies:** Task Group 4

- [x] 5.0 Implement basic offline queueing
  - [x] 5.1 Create photo upload queue utility
    - Path: `apps/client/src/lib/photo-queue.ts`
    - Use IndexedDB to store pending uploads
    - Store: blob, sessionId, caption, timestamp
  - [x] 5.2 Implement offline detection in upload flow
    - Check `navigator.onLine` before upload
    - If offline, queue photo and show toast
    - Toast: "Sin conexión. La foto se guardará cuando vuelvas a conectar."
  - [x] 5.3 Implement retry on reconnection
    - Listen to `online` event on window
    - Process queued photos when connectivity returns
    - Show success toast when queue processed
  - [x] 5.4 Show pending indicator on queued photos
    - Visual indicator (e.g., cloud icon with arrow) on photos awaiting upload
    - Remove indicator after successful upload

**Acceptance Criteria:**

- Photos queue when offline
- Toast notifies user of offline state
- Queued photos upload when back online
- Pending indicator shows on queued items

---

### Testing & Integration

#### Task Group 6: Test Review & Integration

**Dependencies:** Task Groups 1-5

- [x] 6.0 Review tests and verify integration
  - [x] 6.1 Review tests from all task groups
    - Task 1.1: 4 database tests
    - Task 2.1: 5 API tests
    - Task 4.1: 6 UI tests
    - Total: 15 tests written during development
  - [x] 6.2 Analyze critical gaps for THIS feature
    - Check end-to-end flow: capture → upload → display
    - Verify form submission with photos works
    - Check photo deletion flow
  - [x] 6.3 Write up to 5 additional integration tests if needed
    - E2E: Capture photo in SessionForm, submit, verify in SessionDetailView
    - E2E: Delete photo from gallery, verify removed
    - Integration: API upload + storage + signed URL retrieval
  - [x] 6.4 Run all feature-specific tests
    - Run all tests from groups 1, 2, 4, and 6.3
    - Expected total: 15-20 tests
    - Verify all pass

**Acceptance Criteria:**

- All 15-20 feature tests pass
- End-to-end photo flow works
- No more than 5 additional tests added
- Feature complete and verified

---

## Execution Order

Recommended implementation sequence:

1. **Database Layer** (Task Group 1) - Schema foundation
2. **API Layer** (Task Group 2) - Backend endpoints
3. **Types & API Client** (Task Group 3) - Frontend integration
4. **UI Components** (Task Group 4) - User interface
5. **Offline Handling** (Task Group 5) - Resilience
6. **Test Review** (Task Group 6) - Verification

## Notes

- **Reuse existing components**: CameraCapture, MediaLightbox, mediaApi patterns
- **Follow existing patterns**: VoiceNote for data model, voice notes badge for UI
- **No mockups**: Match existing treatment-timeline component styling
- **Offline is MVP-level**: Basic queue, not full sync (that's Week 8)
