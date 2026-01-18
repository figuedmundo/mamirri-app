# Spec Requirements: Media Upload Endpoint

## Initial Description

**Roadmap Task 7.1:** Backend: Media upload endpoint (validation, MinIO)

From Week 7: Media & Dictation - implement backend media upload endpoint with file validation and MinIO storage integration. Support for photos (session photos, posturogram), videos (posture videos), and audio (voice notes).

## Requirements Discussion

### First Round Questions

**Q1:** I assume the existing `StorageService` and `/storage/upload` endpoint already satisfy the "Media upload endpoint with validation and MinIO" requirement. Is the goal here to **enhance** the existing implementation, or do you need a **separate Media API** that wraps StorageService with domain-specific logic (e.g., linking uploads to Patient/Case/Evaluation)?

**Answer:** Create a domain-specific Media API that wraps StorageService. The MediaModule should be a domain layer that validates entity relationships, creates database records automatically, and returns structured responses. This matches the "Zero-Friction" mission.

**Q2:** The current allowed file types are: `image/jpeg, image/png, image/webp, audio/wav, audio/mpeg, audio/mp4`. Should we add **video formats** (mp4, webm, mov) for posture videos, or is video handled separately in Week 21?

**Answer:** Yes, add video formats now with appropriate limits. Week 7 handles capture, Week 21 handles analysis. Add: `video/mp4`, `video/webm`, `video/quicktime`.

**Q3:** Should we implement domain-specific endpoints like `/media/patient/:patientId/photo`, `/media/evaluation/:evaluationId/footprint`, etc., or keep the generic `/storage/upload`?

**Answer:** Yes, implement domain-specific endpoints:

- `POST /media/patients/:patientId/photos`
- `POST /media/evaluations/:evaluationId/footprints`
- `POST /media/evaluations/:evaluationId/posture-videos`
- `POST /media/evaluations/:evaluationId/voice-notes`
- `POST /media/sessions/:sessionId/voice-notes`

**Q4:** For voice notes, should uploads automatically create a structured entry like `{ audioUrl, transcription: null, durationSeconds }`, or will transcription be handled separately?

**Answer:** Create structured entry with null transcription. Upload is synchronous, transcription (Task 7.4 - Whisper) is asynchronous and handled separately.

**Q5:** Should there be file size limits per media type?

**Answer:** Yes, implement tiered limits:

- Photos: 10 MB
- Audio: 25 MB
- Video: 100 MB

**Q6:** Is there anything to exclude or defer?

**Answer:** Exclude:

- Camera capture component (7.2 - Frontend)
- Photo gallery UI (7.3 - Frontend)
- Whisper transcription (7.4 - Separate service)
- Voice recorder UI (7.5 - Frontend)
- Frontend wiring (7.6 - Frontend)
- Dictation testing (7.7 - QA)
- Footprint analysis (Week 19)
- Video analysis (Week 21)

### Existing Code to Reference

**Similar Features Identified:**

- Feature: StorageModule - Path: `apps/server/src/modules/storage/`
  - StorageService with MinIO integration via AWS SDK
  - StorageController with upload/download/delete endpoints
  - File validation patterns (MIME types, magic numbers, size limits)
  - DTOs for file upload

- Feature: MinIO Integration Spec - Path: `agent-os/specs/2026-01-08-minio-integration/`
  - Implementation reports for storage service
  - Testing patterns

- Feature: Prisma Schema - Path: `apps/server/prisma/schema.prisma`
  - Footprint model (url, type, analysis, evaluationId)
  - PostureVideo model (url, type, duration, evaluationId)
  - voiceNotes JSON field on Evaluation and TreatmentSession

- Feature: MediaModule (stub) - Path: `apps/server/src/modules/media/`
  - Empty module to be implemented

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A

## Requirements Summary

### Functional Requirements

**1. Extend StorageService**

- Add video MIME types: `video/mp4`, `video/webm`, `video/quicktime`
- Add magic number validation for video formats
- Implement tiered size limits per media type:
  - Images (jpeg, png, webp): 10 MB
  - Audio (wav, mpeg, mp4): 25 MB
  - Video (mp4, webm, quicktime): 100 MB

**2. Implement MediaModule**

MediaService with domain logic:

- `uploadPatientPhoto(patientId, file)` → Returns photo URL
- `uploadFootprint(evaluationId, file, type)` → Creates Footprint record
- `uploadPostureVideo(evaluationId, file, type, duration)` → Creates PostureVideo record
- `uploadVoiceNote(entityType, entityId, file, durationSeconds)` → Appends to voiceNotes JSON

MediaController with 5 endpoints:

- `POST /api/v1/media/patients/:patientId/photos`
- `POST /api/v1/media/evaluations/:evaluationId/footprints`
- `POST /api/v1/media/evaluations/:evaluationId/posture-videos`
- `POST /api/v1/media/evaluations/:evaluationId/voice-notes`
- `POST /api/v1/media/sessions/:sessionId/voice-notes`

**3. Database Integration**

- Create Footprint records on footprint upload
- Create PostureVideo records on video upload
- Append to voiceNotes JSON array on audio upload
- VoiceNote structure: `{ audioUrl, transcription: null, durationSeconds }`

**4. Authorization**

- All endpoints require JWT authentication
- Verify therapist owns the patient/case/evaluation/session
- Return 403 Forbidden if unauthorized

**5. API Response Structure**

Footprint upload response:

```json
{
  "id": "cuid",
  "url": "presigned-url",
  "type": "initial|final|followup",
  "evaluationId": "cuid",
  "date": "ISO-8601",
  "analysis": null
}
```

PostureVideo upload response:

```json
{
  "id": "cuid",
  "url": "presigned-url",
  "type": "gait|static|dynamic",
  "duration": 120,
  "evaluationId": "cuid",
  "date": "ISO-8601"
}
```

VoiceNote upload response:

```json
{
  "audioUrl": "presigned-url",
  "transcription": null,
  "durationSeconds": 45
}
```

### Reusability Opportunities

- Extend existing `StorageService` rather than creating new storage logic
- Follow patterns from `StorageController` for file handling
- Use existing `JwtAuthGuard` for authentication
- Follow existing DTO validation patterns with class-validator

### Scope Boundaries

**In Scope:**

- Extend StorageService with video types and tiered limits
- Implement MediaModule (service, controller, DTOs)
- Create Footprint records on upload
- Create PostureVideo records on upload
- Append voiceNotes to Evaluation/TreatmentSession
- Authorization checks (therapist owns entity)
- Unit tests for MediaService
- Integration tests for MediaController
- Swagger documentation

**Out of Scope:**

- Frontend camera capture component (Task 7.2)
- Frontend photo gallery (Task 7.3)
- Whisper transcription integration (Task 7.4)
- Frontend voice recorder (Task 7.5)
- Frontend callback wiring (Task 7.6)
- Dictation accuracy testing (Task 7.7)
- Footprint analysis/arch classification (Week 19)
- Video analysis/angle detection (Week 21)
- Patient profile photo (separate feature)

### Technical Considerations

**File Type Configuration:**

```typescript
const ALLOWED_MIMETYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  // Audio
  'audio/wav',
  'audio/mpeg',
  'audio/mp4',
  // Video (NEW)
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const SIZE_LIMITS: Record<string, number> = {
  'image/jpeg': 10 * 1024 * 1024,
  'image/png': 10 * 1024 * 1024,
  'image/webp': 10 * 1024 * 1024,
  'audio/wav': 25 * 1024 * 1024,
  'audio/mpeg': 25 * 1024 * 1024,
  'audio/mp4': 25 * 1024 * 1024,
  'video/mp4': 100 * 1024 * 1024,
  'video/webm': 100 * 1024 * 1024,
  'video/quicktime': 100 * 1024 * 1024,
};

const MAGIC_NUMBERS: Record<string, number[]> = {
  // Existing...
  'video/mp4': [0x00, 0x00, 0x00], // ftyp box
  'video/webm': [0x1a, 0x45, 0xdf, 0xa3], // EBML header
  'video/quicktime': [0x00, 0x00, 0x00], // moov atom
};
```

**Storage Path Convention:**

- Patient photos: `patients/{patientId}/photos/{timestamp}-{uuid}.{ext}`
- Footprints: `evaluations/{evaluationId}/footprints/{timestamp}-{uuid}.{ext}`
- Posture videos: `evaluations/{evaluationId}/videos/{timestamp}-{uuid}.{ext}`
- Voice notes: `voice-notes/{entityType}/{entityId}/{timestamp}-{uuid}.{ext}`

**Dependencies:**

- PrismaService (for database operations)
- StorageService (for MinIO operations)
- Existing guards (JwtAuthGuard)

**Estimated Effort:** 4-6 hours
