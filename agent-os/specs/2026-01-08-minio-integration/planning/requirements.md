# Spec Requirements: MinIO Integration

## Initial Description

MinIO Integration: Upload/Download service capability. Implement MinIO integration with upload and download functionality for the medical consultation application. This is part of the foundational infrastructure setup for the medical consultation tracking application. (From roadmap task 2.2 in Phase 0, Week 2)

## Requirements Discussion

### First Round Questions

**Q1:** I'm assuming you want direct server-side file upload for MVP (Week 2), with the application receiving the file via multipart/form-data and then uploading to MinIO. Is that correct, or would you prefer implementing presigned URLs for direct browser-to-MinIO uploads (more scalable but requires more frontend complexity)?
**Answer:** Direct server-side upload (multipart/form-data through NestJS). Simpler to implement and test for Week 2 infrastructure. Future: Refactor to presigned URLs if Week 7 reveals performance issues.

**Q2:** For file validation, I'm thinking we should restrict uploads to common medical image formats (JPG, PNG) and audio files (WAV, MP3, M4A for dictation) with size limits around 10MB per file. Should we implement magic number validation to verify file types beyond just checking extensions?
**Answer:** Yes - strict validation with whitelist. Allowed types: Images (JPG, PNG, WEBP) + Audio (WAV, MP3, M4A). Size limit: 10MB per file. Magic number validation required (verify file headers, not just extensions). Medical data integrity is critical.

**Q3:** The infrastructure setup script currently sets the `physio-media` bucket to public access. Should we keep it public for Week 2 MVP, or implement private bucket with presigned URLs for downloads (more secure but adds complexity)?
**Answer:** Keep public for Week 2 MVP to match existing `setup-dev.sh` configuration. Add presigned URL generation as a method (ready for production). Switch to private bucket for production deployment later.

**Q4:** I'm planning to implement basic operations: upload file, get file URL, delete file, and generate presigned download URLs. Are there any other storage operations you need for Week 2 (e.g., list files, check file existence, copy/move)?
**Answer:** Implement these 4 core methods: `uploadFile(file, path, metadata)`, `getFileUrl(path, expiry)`, `deleteFile(path)`, `fileExists(path)`. Skip list files and copy/move operations for Week 2 (not needed yet).

**Q5:** For error handling, should I implement detailed error logging to help debug upload failures during development, or keep error messages generic for security reasons (minimizing information leakage about your infrastructure)?
**Answer:** Detailed logging with safe public messages. Development: Full error details with file names, MinIO responses, stack traces. Production: Generic error messages ("Upload failed"), detailed logs to console/file. Prevents information leakage while enabling debugging.

**Q6:** The existing Media module is a stub. Should I implement the storage service as a standalone provider in the existing `MediaService`, or create a dedicated `StorageService` that can be used by both the Media module and future features?
**Answer:** Create standalone `StorageService`. Create `apps/server/src/modules/storage/storage.service.ts`, `StorageModule` provides the service, and `MediaModule` imports `StorageModule` and uses `StorageService`. Reusable across Media, Sessions, Patients, and future modules.

**Q7:** I assume this Week 2 implementation is foundational infrastructure only (service layer with basic CRUD), without frontend UI components or database schema updates. Should I scope it to backend-only implementation, or should I also create basic API endpoints and controller methods for testing?
**Answer:** Backend-only infrastructure. In scope: `StorageService` with 4 core methods, basic API endpoints for testing (upload, get URL, delete), Swagger documentation, unit tests for core methods. Out of scope: Frontend UI, database schema (Media model), integration with Patient/Session.

**Q8:** What is explicitly out of scope for this Week 2 task? For example: image processing (compression, resizing), video uploads, batch operations, or integration with the Patient/Session models (those appear to be Week 7 tasks)?
**Answer:** Explicitly out of scope: Image processing (compression, resizing, thumbnails), video uploads, batch operations (multi-file upload/delete), database integration (no Media Prisma model yet), integration with Patient/Session models, frontend file picker or dropzone components, CDN integration.

### Existing Code to Reference

Based on codebase exploration and user input, these patterns are available:

**Similar Features Identified:**

- Feature: Auth Module - Path: `apps/server/src/modules/auth/`
  - Components to potentially reuse: Module structure, service patterns, controller patterns, DTO validation pattern, exception filters, service methods
  - Backend logic to reference: Error handling patterns, configuration loading from environment variables

- Feature: Configuration - Path: `apps/server/src/config/`
  - Components to potentially reuse: Configuration pattern for `storage.config.ts`
  - Backend logic to reference: Load from `process.env` and provide as exported config object

- Feature: Database Schema - Path: `prisma/schema.prisma`
  - Components to potentially reuse: Current models (User, Patient, Session)
  - Backend logic to reference: Note that only these 3 models exist; no Media model yet (scheduled for Week 7)

- Feature: Media Module (stub) - Path: `apps/server/src/modules/media/`
  - Components to potentially reuse: Will import and use the new `StorageService`
  - Backend logic to reference: Keep as empty stub for now (Week 7 will implement full media handling)

### Follow-up Questions

None required - all questions answered satisfactorily.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - No visual files found.

## Requirements Summary

### Functional Requirements

- **File Upload:** Upload files (images: JPG, PNG, WEBP; audio: WAV, MP3, M4A) up to 10MB in size to MinIO via multipart/form-data
- **File Retrieval:** Generate presigned URLs for file downloads with configurable expiry time
- **File Deletion:** Delete files from MinIO storage by path/key
- **File Existence Check:** Verify if a file exists in storage before operations
- **Bucket Initialization:** Automatically initialize the `physio-media` bucket on application startup
- **File Validation:** Validate file types via magic numbers (not just extensions) and enforce size limits
- **Error Handling:** Provide detailed logging for debugging, with safe public error messages
- **API Documentation:** Provide Swagger/OpenAPI documentation for all endpoints

### Reusability Opportunities

- **StorageService Pattern:** Reusable across multiple modules (Media, Sessions, Patients, etc.)
- **Configuration Pattern:** Follows existing auth module's environment variable loading
- **Validation Pattern:** Use existing class-validator DTO patterns from auth module
- **Error Handling Pattern:** Leverage existing exception filter patterns from auth module
- **Test Pattern:** Follow existing unit test patterns in auth module

### Scope Boundaries

**In Scope:**

- `@aws-sdk/client-s3` package installation
- `StorageConfig` service with MinIO credentials from `.env`
- `StorageService` with 4 core methods: upload, get URL, delete, exists
- `StorageModule` providing the service
- `StorageController` with basic testing endpoints
- File type validation with magic numbers
- File size validation (10MB limit)
- Bucket initialization on app startup
- Unit tests for core methods
- Swagger documentation
- Detailed error logging with safe public messages
- Filename sanitization (prevent directory traversal)
- Metadata validation to prevent XSS

**Out of Scope:**

- Image processing (compression, resizing, thumbnails)
- Video uploads
- Batch operations (multi-file upload/delete)
- Database integration (no Media Prisma model)
- Integration with Patient/Session models (Week 7 task)
- Frontend UI components (file picker, dropzone)
- CDN integration
- Presigned URL uploads (direct browser-to-MinIO)
- Private bucket configuration (Week 2 only)
- List files operation
- Copy/move operations

### Technical Considerations

- **MinIO Instance:** Local development on `localhost:9000`, `physio_storage` container
- **Bucket Name:** `physio-media` (configured in `.env`)
- **Credentials:** Load from `.env`: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_ENDPOINT`, `MINIO_BUCKET`
- **Access Pattern:** Direct server-side upload (file passes through NestJS backend)
- **File Naming Strategy:** Use timestamp-prefix or UUID for unique filenames
- **Mimetype Enforcement:** Validate via magic numbers, not just file extensions
- **Error Logging:** Development mode provides full details; production mode provides generic messages
- **Security:** Sanitize filenames, validate metadata, prevent XSS in file serving
- **NestJS Patterns:** Follow existing auth module structure (module, service, controller, DTO)
- **Configuration:** Create `storage.config.ts` following existing config pattern
- **Testing:** Mock MinIO client for unit tests; integration tests with local MinIO instance
- **Module Dependencies:** Storage module will be imported by Media module in Week 7
