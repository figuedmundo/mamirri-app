# Specification: Media Upload Endpoint

## Goal

Implement domain-specific media upload endpoints that wrap the existing StorageService, automatically creating database records (Footprint, PostureVideo) and appending voice notes to evaluations/sessions, with therapist ownership authorization.

## User Stories

- As a therapist, I want to upload footprint images directly to an evaluation so that they are automatically linked and stored without manual association.
- As a therapist, I want to upload voice notes during a session so that they are appended to the session record with a placeholder for future transcription.

## Specific Requirements

**Extend StorageService with Video Support**

- Add MIME types: `video/mp4`, `video/webm`, `video/quicktime`
- Add magic number validation for video formats (EBML header for webm, ftyp box check for mp4/quicktime)
- Implement tiered size limits: images 10MB, audio 25MB, video 100MB
- Refactor `validateFile()` to use `SIZE_LIMITS` map instead of single `MAX_FILE_SIZE` constant

**MediaController Endpoints**

- `POST /api/v1/media/patients/:patientId/photos` - Upload patient photo
- `POST /api/v1/media/evaluations/:evaluationId/footprints` - Upload footprint image, create Footprint record
- `POST /api/v1/media/evaluations/:evaluationId/posture-videos` - Upload video, create PostureVideo record
- `POST /api/v1/media/evaluations/:evaluationId/voice-notes` - Upload audio, append to Evaluation.voiceNotes
- `POST /api/v1/media/sessions/:sessionId/voice-notes` - Upload audio, append to TreatmentSession.voiceNotes

**Footprint Upload Endpoint**

- Accept multipart/form-data with `file` and `type` (initial | final | followup)
- Validate evaluationId exists and therapist owns parent clinical case
- Create Footprint record with url, type, date, analysis: null
- Return created Footprint entity with presigned URL

**PostureVideo Upload Endpoint**

- Accept multipart/form-data with `file`, `type` (gait | static | dynamic), `duration` (seconds)
- Validate evaluationId exists and therapist owns parent clinical case
- Create PostureVideo record with url, type, duration, observations: ""
- Return created PostureVideo entity with presigned URL

**VoiceNote Upload Endpoints**

- Accept multipart/form-data with `file` and `durationSeconds`
- Validate entity exists and therapist owns it
- Append to voiceNotes JSON array: `{ audioUrl, transcription: null, durationSeconds }`
- Return the appended VoiceNote object

**Authorization and Ownership Verification**

- All endpoints require JwtAuthGuard
- Use CurrentTherapist decorator to get therapist ID from JWT
- Verify therapist owns the entity via parent relationship chain (evaluation → clinicalCase → patient → therapistId)
- Return 403 Forbidden with message "Access denied" if ownership check fails
- Return 404 Not Found if entity does not exist

**Storage Path Convention**

- Patient photos: `patients/{patientId}/photos/{timestamp}-{uuid}.{ext}`
- Footprints: `evaluations/{evaluationId}/footprints/{timestamp}-{uuid}.{ext}`
- Posture videos: `evaluations/{evaluationId}/videos/{timestamp}-{uuid}.{ext}`
- Voice notes: `voice-notes/{entityType}/{entityId}/{timestamp}-{uuid}.{ext}`

**DTOs and Validation**

- `UploadFootprintDto`: type (enum: initial, final, followup) - required
- `UploadPostureVideoDto`: type (enum: gait, static, dynamic), duration (number, min: 1) - required
- `UploadVoiceNoteDto`: durationSeconds (number, min: 1) - required
- Use class-validator decorators for validation

**Swagger Documentation**

- Add @ApiTags('media'), @ApiBearerAuth() to controller
- Document all endpoints with @ApiOperation, @ApiResponse, @ApiConsumes('multipart/form-data')
- Use @ApiBody with schema for file + body parameters

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**StorageService (`apps/server/src/modules/storage/storage.service.ts`)**

- Reuse `uploadFile()` method for all media uploads
- Extend `ALLOWED_MIMETYPES` array with video types
- Refactor `MAX_FILE_SIZE` to `SIZE_LIMITS` map for tiered limits
- Reuse `validateMagicNumbers()` pattern for video validation
- Reuse `getFileUrl()` for generating presigned URLs in responses

**PatientsController (`apps/server/src/modules/patients/patients.controller.ts`)**

- Follow same pattern: @UseGuards(JwtAuthGuard), @ApiBearerAuth()
- Reuse CurrentTherapist decorator for getting therapist ID
- Follow same authorization pattern: pass therapistId to service methods

**Prisma Schema (`apps/server/prisma/schema.prisma`)**

- Use existing Footprint model (id, type, date, url, analysis, evaluationId)
- Use existing PostureVideo model (id, type, date, url, duration, observations, evaluationId)
- Use existing voiceNotes Json field on Evaluation and TreatmentSession

**FileInterceptor pattern (`apps/server/src/modules/storage/storage.controller.ts`)**

- Reuse @UseInterceptors(FileInterceptor('file')) pattern
- Reuse @UploadedFile() decorator for accessing file
- Reuse @ApiConsumes('multipart/form-data') and @ApiBody schema pattern

## Out of Scope

- Frontend camera capture component (Task 7.2)
- Frontend photo gallery per session (Task 7.3)
- Whisper transcription integration (Task 7.4)
- Frontend voice recorder button (Task 7.5)
- Frontend callback wiring (Task 7.6)
- Medical dictation accuracy testing (Task 7.7)
- Footprint analysis/arch classification (Week 19)
- Video analysis/angle detection (Week 21)
- Patient profile photo management
- Bulk upload endpoints
