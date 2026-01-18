# Task Breakdown: Media Upload Endpoint

## Overview

Total Tasks: 14

This is a **backend-only** feature. No frontend components are included (those are in Tasks 7.2-7.6).

## Task List

### Infrastructure Layer

#### Task Group 1: StorageService Extension

**Dependencies:** None

- [x] 1.0 Complete StorageService extension for video support and tiered limits
  - [x] 1.1 Write 4 focused tests for StorageService changes
    - Test video file upload (mp4) succeeds with valid magic numbers
    - Test video file rejected when exceeding 100MB limit
    - Test audio file accepted up to 25MB but rejected at 26MB
    - Test image file size limit remains at 10MB
  - [x] 1.2 Add video MIME types to ALLOWED_MIMETYPES
    - Add: `video/mp4`, `video/webm`, `video/quicktime`
    - Location: `apps/server/src/modules/storage/storage.service.ts`
  - [x] 1.3 Add video magic number signatures
    - `video/mp4`: Check for ftyp box (bytes 4-7 = 'ftyp')
    - `video/webm`: `[0x1A, 0x45, 0xDF, 0xA3]` (EBML header)
    - `video/quicktime`: Check for ftyp or moov atom
  - [x] 1.4 Refactor file size validation to tiered limits
    - Replace `MAX_FILE_SIZE` constant with `SIZE_LIMITS` map
    - Images: 10MB, Audio: 25MB, Video: 100MB
    - Update `validateFile()` to use per-type limits
  - [x] 1.5 Ensure StorageService tests pass
    - Run only the 4 tests from 1.1
    - Verify existing storage tests still pass

**Acceptance Criteria:**

- Video files (mp4, webm, quicktime) can be uploaded
- Magic number validation works for video formats
- Tiered size limits enforced correctly
- Existing image/audio upload functionality unchanged

---

### API Layer

#### Task Group 2: MediaModule DTOs and Service

**Dependencies:** Task Group 1

- [x] 2.0 Complete MediaService with domain logic
  - [x] 2.1 Write 6 focused tests for MediaService
    - Test uploadFootprint creates Footprint record with correct data
    - Test uploadPostureVideo creates PostureVideo record with correct data
    - Test uploadVoiceNote appends to existing voiceNotes array
    - Test ownership verification throws 403 for unauthorized access
    - Test 404 thrown when evaluation/session not found
    - Test presigned URL included in response
  - [x] 2.2 Create DTOs with validation
    - `UploadFootprintDto`: type (enum: initial, final, followup)
    - `UploadPostureVideoDto`: type (enum: gait, static, dynamic), duration (number, min: 1)
    - `UploadVoiceNoteDto`: durationSeconds (number, min: 1)
    - Location: `apps/server/src/modules/media/dto/`
  - [x] 2.3 Implement MediaService
    - Inject StorageService and PrismaService
    - Implement `uploadPatientPhoto(patientId, file, therapistId)`
    - Implement `uploadFootprint(evaluationId, file, type, therapistId)`
    - Implement `uploadPostureVideo(evaluationId, file, type, duration, therapistId)`
    - Implement `uploadVoiceNote(entityType, entityId, file, durationSeconds, therapistId)`
  - [x] 2.4 Implement ownership verification helper
    - `verifyPatientOwnership(patientId, therapistId)` → throws ForbiddenException
    - `verifyEvaluationOwnership(evaluationId, therapistId)` → throws ForbiddenException
    - `verifySessionOwnership(sessionId, therapistId)` → throws ForbiddenException
    - Follow chain: evaluation → clinicalCase → patient → therapistId
  - [x] 2.5 Ensure MediaService tests pass
    - Run only the 6 tests from 2.1
    - Mock StorageService and PrismaService

**Acceptance Criteria:**

- DTOs validate input correctly
- MediaService creates database records on upload
- Ownership verification works for all entity types
- Presigned URLs generated for responses

---

#### Task Group 3: MediaController Endpoints

**Dependencies:** Task Group 2

- [x] 3.0 Complete MediaController with all 5 endpoints
  - [x] 3.1 Write 5 focused integration tests for MediaController
    - Test POST /media/evaluations/:id/footprints creates Footprint
    - Test POST /media/evaluations/:id/posture-videos creates PostureVideo
    - Test POST /media/sessions/:id/voice-notes appends voiceNote
    - Test unauthorized user receives 403
    - Test non-existent entity returns 404
  - [x] 3.2 Implement MediaController structure
    - Add @ApiTags('media'), @ApiBearerAuth(), @UseGuards(JwtAuthGuard)
    - Import CurrentTherapist decorator from patients module
    - Inject MediaService
  - [x] 3.3 Implement patient photo endpoint
    - `POST /patients/:patientId/photos`
    - Use FileInterceptor('file')
    - Return { url, patientId, createdAt }
  - [x] 3.4 Implement footprint endpoint
    - `POST /evaluations/:evaluationId/footprints`
    - Accept file + UploadFootprintDto
    - Return created Footprint entity with presigned URL
  - [x] 3.5 Implement posture video endpoint
    - `POST /evaluations/:evaluationId/posture-videos`
    - Accept file + UploadPostureVideoDto
    - Return created PostureVideo entity with presigned URL
  - [x] 3.6 Implement voice note endpoints
    - `POST /evaluations/:evaluationId/voice-notes`
    - `POST /sessions/:sessionId/voice-notes`
    - Accept file + UploadVoiceNoteDto
    - Return { audioUrl, transcription: null, durationSeconds }
  - [x] 3.7 Add Swagger documentation
    - @ApiOperation for each endpoint
    - @ApiResponse for 201, 400, 403, 404
    - @ApiConsumes('multipart/form-data')
    - @ApiBody with file + body schema
  - [x] 3.8 Register MediaModule in AppModule
    - Import MediaModule
    - Ensure StorageModule is exported and imported
  - [x] 3.9 Ensure MediaController tests pass
    - Run only the 5 tests from 3.1
    - Use supertest for integration testing

**Acceptance Criteria:**

- All 5 endpoints respond correctly
- File uploads stored in MinIO with correct paths
- Database records created with correct associations
- Swagger docs render correctly at /api/docs
- Authorization enforced on all endpoints

---

### Testing & Verification

#### Task Group 4: Integration Testing & Verification

**Dependencies:** Task Groups 1-3

- [x] 4.0 Verify complete feature and fill critical test gaps
  - [x] 4.1 Review tests from Task Groups 1-3
    - 4 tests from StorageService (Task 1.1)
    - 6 tests from MediaService (Task 2.1)
    - 5 tests from MediaController (Task 3.1)
    - Total existing: 15 tests
  - [x] 4.2 Write up to 5 additional integration tests if needed
    - E2E test: Upload footprint image to real MinIO
    - E2E test: Upload voice note and verify JSON append
    - Test: Multiple voice notes append correctly (array order)
    - Test: Large video file (50MB) uploads successfully
    - Test: Invalid file type rejected with 400
  - [x] 4.3 Run all feature tests
    - Run tests from 1.1, 2.1, 3.1, and 4.2
    - Expected total: ~20 tests
    - Do NOT run entire application test suite
  - [x] 4.4 Manual verification with Swagger
    - Start server: `pnpm --filter server dev`
    - Open Swagger: http://localhost:3000/api/docs
    - Test upload footprint with real image file
    - Verify MinIO console shows uploaded file
    - Verify database has Footprint record

**Acceptance Criteria:**

- All ~20 feature tests pass
- Manual upload via Swagger succeeds
- Files visible in MinIO console
- Database records created correctly
- Presigned URLs in responses are valid and accessible

---

## Execution Order

Recommended implementation sequence:

```
1. StorageService Extension (Task Group 1)
   └── Foundation for all uploads

2. MediaModule DTOs and Service (Task Group 2)
   └── Business logic layer

3. MediaController Endpoints (Task Group 3)
   └── API exposure

4. Integration Testing & Verification (Task Group 4)
   └── End-to-end validation
```

## File Structure

After completion, the following files should exist:

```
apps/server/src/modules/media/
├── media.module.ts          (updated)
├── media.controller.ts      (updated)
├── media.service.ts         (updated)
├── media.service.spec.ts    (new)
├── media.controller.spec.ts (new)
└── dto/
    ├── upload-footprint.dto.ts     (new)
    ├── upload-posture-video.dto.ts (new)
    └── upload-voice-note.dto.ts    (new)

apps/server/src/modules/storage/
└── storage.service.ts       (modified - video types, tiered limits)
```

## Estimated Effort

| Task Group                  | Estimate    |
| --------------------------- | ----------- |
| 1. StorageService Extension | 1 hour      |
| 2. MediaService & DTOs      | 1.5 hours   |
| 3. MediaController          | 1.5 hours   |
| 4. Testing & Verification   | 1 hour      |
| **Total**                   | **5 hours** |
