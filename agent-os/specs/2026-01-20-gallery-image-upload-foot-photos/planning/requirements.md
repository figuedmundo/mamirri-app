# Spec Requirements: Gallery Image Upload for Foot Photos

## Initial Description

Allow uploading pictures from device gallery (not just taking photos with camera) for foot/feet images. This should include left/right foot identification and live in a "Multimedia" section. The goal is to address the "data fragmentation" pain point where critical info lives in the therapist's phone gallery.

**Source:** User request during feature scoping
**Date:** 2026-01-20

## Requirements Discussion

### First Round Questions

**Q1: Workflow Pattern - Camera-first or Gallery-first as default?**

**Recommendation Given:** Camera-first (keep current behavior), with gallery as secondary option. This matches the app's "Zero-Friction Clinical Assistant" purpose where guided overlays only work with live camera. Gallery is for edge cases (AirDrops, previous visit photos).

**User Response:** PROCEED - User confirmed recommendation

**Q2: Side Selection - Before gallery or after pick + preview?**

**Recommendation Given:** Show side selector AFTER picking photo with preview. This provides context (user sees actual photo), reduces mistakes, and follows industry patterns (Mayo Clinic, Stanford True Image).

**User Response:** PROCEED - User confirmed recommendation

**Q3: Location - Where should "Multimedia" live?**

**Recommendation Given:** Create new `MultimediaSection` component in Patient Profile as a central hub for ALL patient media (footprints, videos, session photos, voice notes). Option A (MediaGallery) is too scoped to display only, Option C (Evaluation tab) is too narrow.

**User Response:** PROCEED - User confirmed recommendation

**Q4: Quality Check - Manual confirmation sufficient, or resolution check?**

**Recommendation Given:** Auto + Manual hybrid. Auto-check resolution (≥1200×900), blur (Laplacian variance), brightness. Show quality score to user with "Is this clear?" confirmation. Thresholds: Auto-accept (85+), suggest retake (70-84), block (<50).

**User Response:** PROCEED - User confirmed recommendation

**Q5: EXIF Metadata - Strip for HIPAA compliance?**

**Recommendation Given:** YES - Always strip EXIF metadata (GPS, device ID, timestamp) before upload. Store only clinical metadata (capture time, source, quality score) in encrypted database table, not in image.

**User Response:** PROCEED - User confirmed recommendation

**Q6: Backend Side Field Fix - Include in scope?**

**Recommendation Given:** YES - The `side` parameter exists in frontend `mediaApi.ts` but NOT in Prisma schema. Must fix for feature to work. Requires Prisma migration, service update, and API response update.

**User Response:** PROCEED - User confirmed recommendation

**Q7: Upload Target - Current evaluation, select evaluation, or create followup?**

**Recommendation Given:** Smart default to current evaluation with fallback picker. Auto-link to active/in-progress evaluation; if none exists, show evaluation picker. Never automatically create new followup (requires user intent).

**User Response:** PROCEED - User confirmed recommendation

### Existing Code to Reference

**Similar Features Identified:**

- **Feature:** CameraCapture Component
  - **Path:** `apps/client/src/components/patients/CameraCapture.tsx`
  - **Reference:** State machine pattern (idle → previewing → captured), overlay system, permission handling, metadata collection

- **Feature:** Media API Service
  - **Path:** `apps/client/src/api/media.ts`
  - **Reference:** `uploadFootprint()` function already accepts `side` parameter (line 21), existing upload pattern to follow

- **Feature:** Photo Types
  - **Path:** `apps/client/src/types/patient.ts`
  - **Reference:** `Footprint` interface already has `side?: 'left' | 'right' | 'unknown'` field (line 157), `PostureView` type supports footprint-left/right (line 223)

- **Feature:** Media Gallery Display
  - **Path:** `apps/client/src/components/ui/media-lightbox.tsx`
  - **Reference:** Lightbox component for viewing photos (can reuse for gallery uploads)

### Follow-up Questions

**No follow-up questions needed.** All questions were confirmed with "proceed" response.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

No visual files found in `planning/visuals/` folder. Development should follow the UX flow documented in requirements without visual mockup guidance.

**Design Direction:** Based on research from Mayo Clinic PhotoExam, Stanford True Image, Recognise Foot app, and RxPhoto patterns. Implement bottom sheet for source selection, preview + side toggle flow, and quality score dialog.

## Requirements Summary

### Functional Requirements

**Core Upload Flow:**

- User can tap "Elegir de Galería" from bottom sheet (secondary option to camera)
- Native device photo picker opens for gallery selection
- User selects 1+ photos from device gallery
- Selected photos display in preview with left/right side toggle
- Auto-quality check runs (resolution, blur, brightness)
- User confirms "Is this clear?" with quality score displayed
- EXIF metadata stripped client-side before upload
- Photo uploads to current evaluation (smart default) or selected evaluation
- Success confirmation with thumbnail preview

**Side Identification:**

- Visual toggle with left/right foot icons after photo selection
- Labels in Spanish: "Izquierdo" / "Derecho"
- Warning message: "Esta foto no tiene guía de superposición"
- Allow override with confirmation if user selects mismatched side

**Quality Validation:**

- Resolution check: ≥1200×900 pixels minimum
- Blur detection: Laplacian variance algorithm
- Brightness: Histogram analysis (not too dark/bright)
- Quality score: 0-100 with thresholds
- User override: Always allow "Use anyway" with confirmation

**Privacy & Compliance:**

- Client-side EXIF stripping (GPS, device ID, timestamp)
- Encrypted metadata storage (clinical data only)
- No device storage after upload (auto-delete)
- Consent flow: Implicit (already covered in treatment consent)

### Reusability Opportunities

**Components to Potentially Reuse:**

- `CameraCapture.tsx` - State machine pattern, overlay infrastructure
- `PostureOverlay.tsx` - Footprint overlay visuals (adapt for side indicator)
- `MediaLightbox.tsx` - Photo viewing/display
- `mediaApi.ts` - Upload function pattern
- Shadcn/UI components - Dialog, Button, Toggle, Toast

**Backend Patterns to Reference:**

- MinIO/S3 upload service (from media service)
- Prisma schema patterns for Footprint model
- API endpoint structure from existing media endpoints

### Scope Boundaries

**In Scope:**

- Gallery photo picker integration (mobile web native input)
- Preview + side selection UI flow
- Client-side EXIF stripping and image compression
- Auto-quality validation (resolution, blur, brightness)
- Integration with existing `uploadFootprint()` API
- Backend Prisma schema update to add `side` field
- New `MultimediaSection` component in Patient Profile
- Quality score display and user confirmation dialog

**Out of Scope:**

- AI auto-detection of left/right foot (manual selection only)
- Advanced quality checks (glare, noise, color accuracy)
- Offline upload queue (defer to Phase 2)
- Multi-photo batch upload (single photo first)
- Consent dialog flow (implicit in treatment consent)
- Before/after comparison view (existing feature)
- Annotation tools for photos (future enhancement)
- Cloud-based image processing (client-side only for now)

**Future Enhancements Mentioned:**

- AI-assisted capture guidance (real-time feedback)
- Ghosting overlay for gallery photos (using previous photo as guide)
- Offline queue with Background Sync API
- Multi-photo batch selection
- Advanced image quality (glare, noise detection)
- Video gallery upload (follow-up feature)

### Technical Considerations

**Integration Points:**

- `mediaApi.uploadFootprint()` - Already exists, needs side parameter
- `CameraCapture.tsx` - Reference for state machine and overlays
- Patient Profile - Insert MultimediaSection component
- Evaluation context - Get current evaluation for upload target

**Existing System Constraints:**

- React 19 + Vite + TypeScript
- Tailwind CSS + Shadcn/UI
- NestJS backend with MinIO storage
- PWA-ready (Service Worker available)
- Mobile web browser support

**Technology Preferences Stated:**

- Use native `<input type="file" accept="image/*">` for gallery picker
- Client-side image processing (no external services)
- React 19 hooks: `useActionState`, `useFormStatus`, `useOptimistic`
- Canvas API for EXIF stripping and compression

**Similar Code Patterns to Follow:**

- Camera state machine: `idle → requesting → previewing → captured → error`
- Overlay system: PostureView type with footprint-left/right variants
- Metadata pattern: PhotoMetadata interface with width, height, timestamp
- Upload pattern: FormData with file, type, and side parameters

## Implementation Notes

### Critical Backend Fix Required

The `side` field exists in frontend types and API but is MISSING from Prisma schema:

**Current Error:**

```
media.service.ts:77:9 - Object literal may only specify known properties,
and 'side' does not exist in type 'FootprintCreateInput'
```

**Required Changes:**

1. Add `side String?` field to Prisma `Footprint` model
2. Update `media.service.ts` to accept and use `side` parameter
3. Create Prisma migration
4. Verify API response includes `side` field

### Quality Validation Thresholds

```typescript
const QUALITY_THRESHOLDS = {
  AUTO_ACCEPT: 85, // No dialog, auto-upload
  SUGGEST_RETAKE: 70, // "Quality is okay, retake?"
  REQUIRE_EXPLICIT: 50, // "Quality is low, use anyway?"
  BLOCK: 30, // Auto-retake required
};
```

### Image Processing Pipeline

1. **Input:** File from gallery picker
2. **Validate:** File type (JPEG/PNG/WebP), size (<10MB)
3. **Strip EXIF:** Load to canvas, export without metadata
4. **Compress:** Max 1920px dimension, 0.92 quality
5. **Quality Check:** Resolution, blur, brightness
6. **User Confirm:** Show preview + quality score
7. **Upload:** Send to API with evaluationId and side
8. **Success:** Show confirmation, add to gallery

### UX Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SOURCE SELECTION (Bottom Sheet)                          │
│    [📷 Tomar foto] [🖼️ Elegir de Galería]                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. DEVICE PHOTO PICKER (Native)                             │
│    User selects 1 photo from gallery                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PREVIEW + SIDE SELECTION                                 │
│    ┌─────────┐                                              │
│    │ [FOTO]  │ ¿Izquierdo o Derecho?                        │
│    └─────────┘ [○ Izq.] [● Der.]                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. QUALITY CHECK (Auto)                                     │
│    Resolution: 1920×1080 ✓                                  │
│    Clarity: 92/100 ✓                                        │
│    Score: 92/100                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. USER CONFIRMATION                                        │
│    ⚠️ Nota: Sin guía de superposición                       │
│    [Elegir otra] [Confirmar y subir]                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. UPLOAD + SUCCESS                                         │
│    ⏳ Subiendo... [====    ] 60%                            │
│    ✅ Pie derecho cargado exitosamente                      │
└─────────────────────────────────────────────────────────────┘
```
