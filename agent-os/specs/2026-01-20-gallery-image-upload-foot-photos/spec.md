# Specification: Gallery Image Upload for Foot Photos

## Goal

Enable physiotherapists to upload existing foot photos from device gallery (in addition to camera capture) with left/right side identification, quality validation, and HIPAA-compliant metadata handling. Address the "data fragmentation" pain point where clinical photos exist in device gallery but can't be imported.

## User Stories

- As a physiotherapist, I want to upload existing foot photos from my device gallery so that I can include photos from previous visits or AirDrops in patient records.
- As a physiotherapist, I want to clearly mark uploaded foot photos as left or right so that the clinical record accurately identifies which foot is documented.

## Specific Requirements

### Gallery Photo Picker Integration

- Use native `<input type="file" accept="image/*">` for mobile web gallery access
- Add "Elegir de Galería" option in bottom sheet alongside existing "Tomar foto" button
- Limit to single photo selection for this phase (multi-select deferred)
- Accept only JPEG, PNG, WebP formats with 10MB size limit
- Disable `capture` attribute to allow native picker with both camera and gallery options

### Preview with Side Selection

- Display selected photo in preview modal after gallery selection
- Show left/right toggle with visual foot icons and Spanish labels "Izquierdo" / "Derecho"
- Default side to "unknown" until user selects
- Display warning: "Esta foto no tiene guía de superposición. Asegúrate de que el pie esté claramente visible"
- Allow user to override side selection with confirmation dialog if mismatched

### Quality Validation

- Run automatic quality checks after photo selection: resolution (≥1200×900), blur detection (Laplacian variance), brightness histogram
- Calculate quality score 0-100 with thresholds: auto-accept (85+), suggest retake (70-84), require explicit (50-69), block (<50)
- Show quality score and breakdown to user in confirmation dialog
- Allow user override with "Usar de todos modos" option for scores 50-84
- Block upload for scores <30 with "Por favor, selecciona otra foto" message

### EXIF Metadata Stripping

- Load selected image to canvas to strip all EXIF metadata before upload
- Remove GPS coordinates, device ID, timestamp, and camera settings
- Compress to max 1920px dimension with 0.92 JPEG quality
- Store clinical metadata separately (source: gallery, quality score, capturedAt) in encrypted database

### Backend Integration

- Use existing `mediaApi.uploadFootprint()` function which already accepts `side` parameter
- Pass evaluationId (from current evaluation context) and selected side to API
- Display upload progress with percentage indicator
- Show success confirmation with thumbnail after upload completes
- Refresh gallery view to display new photo

### MultimediaSection Component

- Create new `MultimediaSection` component in Patient Profile
- Display all patient media: footprints (with side badges), videos, session photos, voice notes
- Add "Agregar foto" button that opens bottom sheet with camera/gallery options
- Integrate new gallery upload flow within this section
- Reuse existing `MediaLightbox` component for photo viewing

### Upload Target Selection

- Default to current/active evaluation with smart detection
- If no active evaluation exists, show evaluation picker modal
- Display evaluation context (type, date, case number) in upload confirmation
- Never auto-create followup entries without explicit user action

## Visual Design

No visual mockups provided. Development should follow the UX flow documented in requirements.md, based on industry research from Mayo Clinic PhotoExam, Stanford True Image, Recognise Foot app, and RxPhoto patterns.

## Existing Code to Leverage

**CameraCapture.tsx (`apps/client/src/components/patients/CameraCapture.tsx`)**

- State machine pattern (idle → requesting → previewing → captured → error) to follow for gallery upload flow
- Overlay system infrastructure that can be adapted for side indicator display
- Permission handling and error messaging patterns

**mediaApi.ts (`apps/client/src/api/media.ts`)**

- `uploadFootprint()` function already accepts `side` parameter and follows correct FormData pattern
- Existing API integration and error handling to reuse

**Footprint Type (`apps/client/src/types/patient.ts`)**

- `Footprint` interface already has `side?: 'left' | 'right' | 'unknown'` field (line 157)
- `PostureView` type supports footprint-left/right variants for UI consistency

**Prisma Schema (`apps/server/prisma/schema.prisma`)**

- Footprint model already includes `side String @default("unknown")` field
- No migration needed; backend already supports side field

**MediaLightbox (`apps/client/src/components/ui/media-lightbox.tsx`)**

- Reuse for viewing uploaded gallery photos in full-screen mode

## Out of Scope

- AI auto-detection of left/right foot from photo content (manual selection only)
- Advanced quality checks for glare, noise, and color accuracy
- Offline upload queue with Background Sync API (defer to Phase 2)
- Multi-photo batch upload from gallery (single photo first)
- Consent dialog flow for photo capture (implicit in treatment consent)
- Before/after comparison view (existing feature, not part of upload)
- Annotation tools for marking foot regions in photos
- Cloud-based image processing (client-side only for this phase)
- Video gallery upload support (follow-up feature)
- Ghosting overlay for gallery photos using previous photo as guide
