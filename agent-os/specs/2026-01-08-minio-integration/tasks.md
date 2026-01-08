# Task Breakdown: MinIO Integration

## Overview

Total Tasks: 16

## Task List

### Infrastructure & Configuration

#### Task Group 1: Storage Configuration

**Dependencies:** None

- [x] 1.0 Complete storage configuration
  - [x] 1.1 Write 2-4 focused tests for storage configuration
    - Test configuration loads correctly from process.env
    - Test default values are applied when env vars are missing
    - Test MinIO endpoint, port, bucket, access key, secret key, SSL settings
    - Skip exhaustive testing of all edge cases
  - [x] 1.2 Install @aws-sdk/client-s3 package
    - Add to apps/server/package.json dependencies
    - Run pnpm install to install package
    - Verify package is installed successfully
  - [x] 1.3 Create storage.config.ts
    - Export default function returning config object
    - Load from process.env: MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_USE_SSL, MINIO_BUCKET
    - Provide defaults: localhost:9000, no SSL, physio-media bucket
    - Follow pattern from: apps/server/src/config/database.config.ts
  - [x] 1.4 Ensure configuration tests pass
    - Run ONLY 2-4 tests written in 1.1
    - Verify config loads with and without environment variables
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 2-4 tests written in 1.1 pass
- @aws-sdk/client-s3 package installed successfully
- Configuration loads correctly from environment variables
- Default values are applied appropriately

### Service Layer

#### Task Group 2: Storage Service Implementation

**Dependencies:** Task Group 1

- [x] 2.0 Complete storage service
  - [x] 2.1 Write 3-6 focused tests for StorageService methods
    - Test uploadFile method with valid file
    - Test getFileUrl method generates presigned URL
    - Test deleteFile method removes file
    - Test fileExists method checks existence
    - Test bucket initialization creates bucket if missing
    - Test error cases: invalid file type, file too large, MinIO connection failure
    - Skip exhaustive testing of all scenarios
  - [x] 2.2 Create StorageService class
    - Implement uploadFile(file, path, metadata) method
    - Implement getFileUrl(path, expiry) method
    - Implement deleteFile(path) method
    - Implement fileExists(path) method
    - Implement onModuleInit lifecycle hook for bucket initialization
    - Constructor inject MinIO client from configuration
    - Follow pattern from: apps/server/src/modules/auth/auth.service.ts
  - [x] 2.3 Implement file validation logic
    - Magic number verification for file types (JPG, PNG, WEBP, WAV, MP3, M4A)
    - Enforce 10MB file size limit
    - Sanitize filenames to prevent directory traversal
    - Use unique filename strategy (timestamp-prefix or UUID)
    - Validate metadata to prevent XSS
    - Throw BadRequestException for validation failures
  - [x] 2.4 Implement bucket initialization
    - Check if physio-media bucket exists
    - Create bucket if it doesn't exist
    - Set bucket policy to public read access for Week 2 MVP
    - Log initialization status and errors
    - Handle MinIO connection errors with InternalServerErrorException
  - [x] 2.5 Implement error handling and logging
    - Throw specific exceptions: BadRequestException, NotFoundException, InternalServerErrorException
    - Log full details in development mode (file name, MinIO response, stack trace)
    - Return generic messages in production mode ("Upload failed", "File not found")
    - Use centralized error handling pattern from auth module
    - Clean up resources in finally blocks
  - [x] 2.6 Ensure service tests pass
    - Run ONLY 3-6 tests written in 2.1
    - Mock MinIO client for unit tests
    - Verify all 4 core methods work correctly
    - Verify error handling for validation and MinIO failures
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 3-6 tests written in 2.1 pass
- All 4 core service methods implemented
- File validation enforces allowlist and size limits
- Bucket initialization works on app startup
- Error handling follows auth module patterns

### API Layer

#### Task Group 3: Storage Controller & Module

**Dependencies:** Task Group 2

- [x] 3.0 Complete API layer
  - [x] 3.1 Write 3-6 focused tests for controller endpoints
    - Test POST /storage/upload endpoint uploads file successfully
    - Test GET /storage/url/:path endpoint generates presigned URL
    - Test DELETE /storage/file/:path endpoint deletes file
    - Test GET /storage/exists/:path endpoint checks existence
    - Test authentication/authorization with JwtAuthGuard
    - Test error cases: invalid file type, file not found, unauthorized
    - Skip exhaustive testing of all edge cases
  - [x] 3.2 Create StorageController
    - @Controller('storage') with RESTful resource naming
    - @Post('upload') endpoint with FileInterceptor for multipart/form-data
    - @Get('url/:path') endpoint for presigned URL generation
    - @Delete('file/:path') endpoint for file deletion
    - @Get('exists/:path') endpoint for existence check
    - Use @UseGuards(JwtAuthGuard) to protect endpoints
    - Follow pattern from: apps/server/src/modules/auth/auth.controller.ts
  - [x] 3.3 Create DTOs for validation
    - UploadFileDto with path and metadata validation
    - Use @IsString(), @IsNotEmpty(), @IsOptional() decorators
    - Validate input early and reject invalid data before processing
    - Provide clear field-specific error messages
    - Follow pattern from: apps/server/src/modules/auth/dto/register.dto.ts
  - [x] 3.4 Create StorageModule
    - @Module decorator with providers: StorageService
    - controllers: StorageController
    - exports: StorageService
    - imports: HttpModule for @nestjs/platform-express
    - Follow pattern from: apps/server/src/modules/auth/auth.module.ts
  - [x] 3.5 Add Swagger/OpenAPI documentation
    - @ApiTags('storage') on controller
    - @ApiOperation() and @ApiResponse() on each endpoint
    - Document request parameters, body, response types
    - Include error response examples (400, 404, 500)
    - Document file upload with FormData content type
    - Document presigned URL expiry parameter with default value
  - [x] 3.6 Ensure controller tests pass
    - Run ONLY 3-6 tests written in 3.1
    - Verify all endpoints return correct HTTP status codes
    - Verify authentication is enforced
    - Verify file upload, URL generation, deletion work correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 3-6 tests written in 3.1 pass
- All 4 API endpoints implemented
- JWT authentication protects all endpoints
- DTOs validate input correctly
- Swagger documentation is complete
- HTTP status codes are appropriate (200, 201, 400, 404, 500)

### Testing & Integration

#### Task Group 4: Test Review & Integration Tests

**Dependencies:** Task Groups 1-3

- [x] 4.0 Complete testing coverage
  - [x] 4.1 Review existing tests from Task Groups 1-3
    - Review 2-4 tests from Task Group 1 (configuration)
    - Review 3-6 tests from Task Group 2 (service)
    - Review 3-6 tests from Task Group 3 (controller)
    - Total existing tests: approximately 8-16 tests
  - [x] 4.2 Create integration tests with local MinIO
    - Test end-to-end file upload flow
    - Test end-to-end file deletion flow
    - Test presigned URL generation and access
    - Test bucket initialization with real MinIO instance
    - Add up to 4 integration tests maximum
    - Focus on critical workflows, not exhaustive coverage
  - [x] 4.3 Run feature-specific tests
    - Run ONLY tests related to storage (tests from 1.1, 2.1, 3.1, and 4.2)
    - Expected total: approximately 12-20 tests maximum
    - Do NOT run entire application test suite
    - Verify all critical workflows pass
  - [x] 4.4 Manual testing verification
    - Start local MinIO instance via Docker
    - Test file upload via Swagger UI or curl
    - Test file deletion via API endpoint
    - Test presigned URL generation and access
    - Verify bucket is created automatically
    - Verify error messages are appropriate

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 12-20 tests total)
- Integration tests pass with local MinIO instance
- Manual testing verifies all critical workflows work
- No more than 4 additional integration tests added
- Testing focused exclusively on storage feature requirements

## Execution Order

Recommended implementation sequence:

1. Infrastructure & Configuration (Task Group 1)
2. Service Layer (Task Group 2)
3. API Layer (Task Group 3)
4. Testing & Integration (Task Group 4)

## Notes

- This is a backend-only feature (no frontend UI, no database schema changes)
- StorageModule will be imported by MediaModule in Week 7
- Private bucket configuration is deferred to Week 7/production
- All tests should follow existing patterns from auth module
- File validation uses magic number verification, not just extensions
- Error handling provides detailed logs in dev mode, generic messages in production
