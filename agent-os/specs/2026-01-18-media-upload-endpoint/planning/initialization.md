# Spec Initialization

## Raw Idea

**Roadmap Task 7.1:** Backend: Media upload endpoint (validation, MinIO)

From the roadmap (Week 7: Media & Dictation):

- Backend: Media upload endpoint (validation, MinIO)
- Integration with existing StorageService for MinIO
- Support for photos (session photos, posturogram), videos (posture videos), and audio (voice notes)

## Context

### Existing Implementation

The codebase already has:

1. **StorageService** (`apps/server/src/modules/storage/storage.service.ts`):
   - MinIO integration via AWS SDK S3
   - File validation: 10MB limit, MIME types (jpeg, png, webp, wav, mpeg, mp4)
   - Magic number validation for security
   - Upload, download URL (presigned), delete, exists methods
   - Bucket auto-initialization on module init

2. **StorageController** (`apps/server/src/modules/storage/storage.controller.ts`):
   - POST `/storage/upload` - Upload file
   - GET `/storage/url/*path` - Get presigned URL
   - DELETE `/storage/file/*path` - Delete file
   - GET `/storage/exists/*path` - Check if file exists

3. **MediaModule** (stub - empty implementation):
   - `media.service.ts` - Empty
   - `media.controller.ts` - Empty
   - `media.module.ts` - Empty

### Database Models

Prisma schema already has:

- `Footprint` - footprint images with URL
- `PostureVideo` - posture videos with URL
- `Evaluation.voiceNotes` - JSON array of voice notes
- `TreatmentSession.voiceNotes` - JSON array of voice notes

## Gap Analysis

Task 7.1 appears to be **partially complete** based on existing Storage module.
What may be needed:

- Domain-specific media endpoints (photos, videos, audio)
- Integration with Patient/Case/Evaluation context
- Video-specific validation (mp4, webm, mov)
- Additional file types for medical imaging

## Date Created

2026-01-18
