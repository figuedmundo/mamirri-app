# Task Breakdown: Gallery Image Upload for Foot Photos

## Overview

Total Tasks: 18

This feature adds gallery photo upload capability for foot photos with left/right side identification, quality validation, and HIPAA-compliant metadata handling. No database or API changes required—backend already supports the `side` field.

## Task List

### Backend Verification

#### Task Group 1: Backend Side Field Verification

**Dependencies:** None

- [x] 1.0 Verify backend supports side field
  - [x] 1.1 Test uploadFootprint API with side parameter
    - Send POST request with side='left' and verify response includes side
    - Test side='right' and side='unknown' variants
    - Verify no validation errors
  - [x] 1.2 Verify Prisma schema side field exists
    - Confirm `side String @default("unknown")` in Footprint model
    - Confirm no migration needed

**Acceptance Criteria:**

- API accepts side parameter without errors
- Response includes uploaded footprint with correct side value
- No database schema changes required

---

### Frontend Utilities

#### Task Group 2: Image Processing Utilities

**Dependencies:** Task Group 1

- [x] 2.0 Create image processing utilities
  - [x] 2.1 Write tests for image utilities
    - Test file type validation (JPEG, PNG, WebP)
    - Test file size validation (10MB limit)
    - Test canvas-based EXIF stripping
    - Test image compression to 1920px max dimension
  - [x] 2.2 Create stripExifAndCompress utility
    - Load image to canvas (strips all EXIF metadata)
    - Resize to max 1920px dimension maintaining aspect ratio
    - Export as JPEG with 0.92 quality
    - Return Blob for upload
  - [x] 2.3 Create validateImageFile utility
    - Check MIME type against allowed (image/jpeg, image/png, image/webp)
    - Check file size under 10MB
    - Return validation result with error messages

**Acceptance Criteria:**

- All 2.1 tests pass
- EXIF stripping removes GPS, device ID, timestamp
- Compression maintains aspect ratio
- File validation provides clear error messages

#### Task Group 3: Quality Validation Utilities

**Dependencies:** Task Group 2

- [x] 3.0 Create quality validation utilities
  - [x] 3.1 Write tests for quality validation
    - Test resolution check (pass ≥1200×900, fail <800×600)
    - Test blur detection with Laplacian variance
    - Test brightness histogram analysis
    - Test quality score calculation (0-100)
  - [x] 3.2 Create detectBlur utility
    - Implement Laplacian variance algorithm
    - Return blur score and severity (high/medium/low)
  - [x] 3.3 Create analyzeBrightness utility
    - Calculate histogram average brightness
    - Return brightness score and status (good/too-dark/too-bright)
  - [x] 3.4 Create calculateQualityScore utility
    - Combine resolution, blur, brightness scores
    - Apply threshold logic: auto-accept (85+), suggest (70-84), explicit (50-69), block (<50)
    - Return quality result with score, issues, and recommendation

**Acceptance Criteria:**

- All 3.1 tests pass
- Blur detection identifies blurry vs sharp images
- Brightness analysis works for various lighting conditions
- Quality thresholds match spec: 85+ auto-accept, 70-84 suggest, 50-69 explicit, <50 block

---

### Frontend Components

#### Task Group 4: Gallery Upload Components

**Dependencies:** Task Groups 2-3

- [x] 4.0 Create gallery upload flow components
  - [x] 4.1 Write tests for gallery upload components
    - Test file input onChange handler
    - Test preview image display
    - Test side selection toggle
    - Test quality score display
  - [x] 4.2 Create GalleryUploadButton component
    - Hidden file input with accept="image/\*"
    - Button trigger styled to match existing buttons
    - On file select, trigger preview flow
    - Limit to single file selection
  - [x] 4.3 Create PhotoPreviewWithSide component
    - Display selected photo in modal
    - Show left/right toggle with foot icons
    - Spanish labels: "Izquierdo" / "Derecho"
    - Display warning about no overlay guide
    - Emit selected side on confirm
  - [x] 4.4 Create QualityCheckDialog component
    - Display quality score (0-100)
    - Show resolution, blur, brightness status
    - Display recommendation based on thresholds
    - "Elegir otra" and "Confirmar" buttons
    - "Usar de todos modos" for scores 50-84

**Acceptance Criteria:**

- All 4.1 tests pass
- Gallery button opens native file picker
- Preview shows selected photo with side toggle
- Quality dialog shows score and allows confirmation/retake

#### Task Group 5: MultimediaSection Component

**Dependencies:** Task Group 4

- [x] 5.0 Create MultimediaSection component
  - [x] 5.1 Write tests for MultimediaSection
    - Test media type tabs (footprints, videos, photos, audio)
    - Test footprint display with side badges
    - Test "Agregar foto" button click handler
  - [x] 5.2 Create MultimediaSection component
    - Display patient media organized by type
    - Footprints with "Izquierdo" / "Derecho" badges
    - Thumbnails for photos, icons for videos/audio
    - Click to open in MediaLightbox
  - [x] 5.3 Add "Agregar foto" button
    - Opens bottom sheet with "Tomar foto" and "Elegir de Galería"
    - Integrate gallery upload flow from Task Group 4
    - Refresh media list after successful upload

**Acceptance Criteria:**

- All 5.1 tests pass
- MultimediaSection displays all patient media
- Side badges shown on footprints
- Adding photo refreshes the gallery

#### Task Group 6: Upload Flow Integration

**Dependencies:** Task Groups 4-5

- [x] 6.0 Integrate upload flow with existing components
  - [x] 6.1 Add gallery option to existing photo bottom sheet
    - Modify existing CameraCapture trigger to show bottom sheet
    - Add "Elegir de Galería" option alongside "Tomar foto"
    - Route to gallery upload flow when selected
  - [x] 6.2 Create upload progress indicator
    - Show percentage during upload
    - Disable buttons during upload
    - Handle errors with toast notification
  - [x] 6.3 Implement evaluation context detection
    - Get current/active evaluation from context
    - Pass evaluationId to uploadFootprint API
    - Show evaluation info in upload confirmation
  - [x] 6.4 Create EvaluationPicker component (fallback)
    - Show list of patient's evaluations
    - Allow selection when no active evaluation
    - Display evaluation type, date, case number

**Acceptance Criteria:**

- Bottom sheet shows both camera and gallery options
- Upload progress displayed with percentage
- Photos upload to current evaluation by default
- Evaluation picker appears when needed

---

### Testing

#### Task Group 7: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-6

- [x] 7.0 Review tests and fill critical gaps
  - [x] 7.1 Review tests from Task Groups 2-6
    - Review 2.1 tests (image utilities): ~3-5 tests
    - Review 3.1 tests (quality validation): ~4-6 tests
    - Review 4.1 tests (gallery components): ~4-5 tests
    - Review 5.1 tests (MultimediaSection): ~3-4 tests
    - Total existing: ~14-20 tests
  - [x] 7.2 Analyze coverage gaps for critical workflows
    - End-to-end gallery upload flow
    - Side selection confirmation
    - Quality threshold decision making
    - Upload success and refresh
  - [x] 7.3 Write up to 6 additional strategic tests
    - Test complete gallery upload workflow with mocks
    - Test quality threshold boundary conditions (85, 70, 50, 30)
    - Test side override confirmation dialog
    - Test evaluation context fallback behavior
  - [x] 7.4 Run feature-specific tests
    - Run only tests from Tasks 2.1, 3.1, 4.1, 5.1, 7.3
    - Expected total: ~20-26 tests
    - All must pass

**Acceptance Criteria:**

- All feature-specific tests pass (20-26 tests total)
- End-to-end gallery upload workflow covered
- Quality threshold decisions tested
- No more than 6 additional tests added

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1** - Backend Verification (verify no changes needed)
2. **Task Group 2** - Image Processing Utilities (foundation for all frontend work)
3. **Task Group 3** - Quality Validation Utilities (depends on image utilities)
4. **Task Group 4** - Gallery Upload Components (depends on utilities)
5. **Task Group 5** - MultimediaSection Component (depends on gallery components)
6. **Task Group 6** - Upload Flow Integration (depends on all components)
7. **Task Group 7** - Test Review & Gap Analysis (final verification)

## Dependencies Summary

```
Task Group 1 (Backend Verification)
    ↓
Task Group 2 (Image Processing) ← Task Group 1
    ↓
Task Group 3 (Quality Validation) ← Task Group 2
    ↓
Task Group 4 (Gallery Components) ← Task Groups 2-3
    ↓
Task Group 5 (MultimediaSection) ← Task Group 4
    ↓
Task Group 6 (Upload Integration) ← Task Groups 4-5
    ↓
Task Group 7 (Testing) ← Task Groups 1-6
```

## Key Technical Notes

- **No database changes needed** - Prisma schema already has `side` field
- **No API changes needed** - `uploadFootprint()` already accepts side parameter
- **Client-side only** - All image processing (EXIF stripping, compression, quality check) happens in browser
- **React 19 hooks** - Use `useActionState`, `useFormStatus`, `useOptimistic` where appropriate
- **Canvas API** - Use for EXIF stripping and image compression
- **Reuse patterns** - Follow CameraCapture state machine, use existing MediaLightbox
