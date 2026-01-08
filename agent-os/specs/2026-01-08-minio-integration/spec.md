# Specification: MinIO Integration

## Goal

Implement a foundational MinIO storage service that provides secure file upload, retrieval, deletion, and existence checking capabilities for the medical consultation application.

## User Stories

- As a developer, I want a reusable StorageService to handle file operations so that I can integrate storage across multiple modules (Media, Sessions, Patients) without duplicating code
- As a developer, I want proper file validation and error handling so that uploaded files are secure and storage failures are debuggable
- As a developer, I want clear API documentation and test coverage so that the storage functionality can be verified and maintained easily

## Specific Requirements

**Storage Configuration**

- Create `storage.config.ts` following existing config pattern (empty export function, reads from process.env)
- Load MinIO credentials from environment variables: MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_USE_SSL, MINIO_BUCKET
- Use environment variable defaults where appropriate for development (localhost:9000, no SSL, physio-media bucket)
- Configuration should be available as an exported object for use by StorageService

**StorageService Core Methods**

- Implement `uploadFile(file: Express.Multer.File, path: string, metadata?: object)` to upload files to MinIO with metadata
- Implement `getFileUrl(path: string, expiry?: number)` to generate presigned URLs for file downloads with configurable expiry
- Implement `deleteFile(path: string)` to remove files from MinIO storage
- Implement `fileExists(path: string)` to check if a file exists before operations
- All methods should throw specific exception types (NotFoundException, BadRequestException, InternalServerErrorException) following auth module patterns
- Methods should log errors with full details in development mode and generic messages in production

**StorageModule Structure**

- Create `StorageModule` following auth module structure pattern
- Module should provide StorageService as a provider
- Module should export StorageService for use by other modules (Media, Sessions, Patients)
- Module should be globally available or imported where needed
- Follow NestJS module decorator pattern with imports, controllers, providers, exports

**File Upload Validation**

- Validate file types using magic number verification (not just file extensions)
- Allowlist restricted to: Images (JPG, PNG, WEBP) and Audio (WAV, MP3, M4A)
- Enforce 10MB file size limit with clear error messages
- Sanitize filenames to prevent directory traversal (remove `../`, special characters)
- Use unique filename strategy (timestamp-prefix or UUID) to prevent overwrites
- Validate metadata to prevent XSS when files are served

**StorageController Testing Endpoints**

- Create `@Controller('storage')` following RESTful conventions with plural resource naming
- Implement `@Post('upload')` endpoint with FileInterceptor for multipart/form-data handling
- Implement `@Get('url/:path')` endpoint to generate presigned URLs
- Implement `@Delete('file/:path')` endpoint for file deletion
- Implement `@Get('exists/:path')` endpoint to check file existence
- Use @UseGuards(JwtAuthGuard) to protect endpoints from unauthorized access
- Include Swagger/OpenAPI decorators for API documentation
- Return appropriate HTTP status codes (200, 201, 400, 404, 500)

**Bucket Initialization**

- Implement bucket initialization in StorageService using NestJS `onModuleInit` lifecycle hook
- Check if `physio-media` bucket exists on application startup
- Create bucket if it doesn't exist during initialization
- Set bucket policy to public read access for Week 2 MVP (matches existing setup-dev.sh)
- Log initialization status and any errors for debugging

**Error Handling and Logging**

- Throw specific exception types: `BadRequestException` (validation failures), `NotFoundException` (file not found), `InternalServerErrorException` (MinIO failures)
- Log full error details (file name, MinIO response, stack trace) in development mode
- Return generic error messages ("Upload failed", "File not found") in production mode to prevent information leakage
- Use centralized error handling pattern from auth module (no scattered try-catch blocks)
- Clean up resources (file handles, connections) in finally blocks or equivalent

**DTO Validation**

- Create DTOs following auth module patterns with class-validator decorators
- Use @IsString(), @IsNotEmpty(), @IsNumber(), @IsOptional() decorators
- Create `UploadFileDto` with validation for file path and optional metadata
- Validate input early and reject invalid data before processing
- Provide clear, field-specific error messages to help users correct input

**Testing Coverage**

- Create unit tests for all StorageService methods using mocked MinIO client
- Test success cases: upload, get URL, delete, exists
- Test error cases: invalid file type, file too large, file not found, MinIO connection failures
- Create integration tests with local MinIO instance for end-to-end verification
- Follow existing test patterns from auth module (auth.service.spec.ts, auth.controller.spec.ts)
- Test bucket initialization logic

**Swagger/OpenAPI Documentation**

- Decorate controller methods with @ApiTags('storage'), @ApiOperation(), @ApiResponse()
- Document request parameters, body, and response types
- Include error response examples (400, 404, 500)
- Document file upload endpoint with FormData content type
- Document presigned URL expiry parameter with default value
- Provide example request/response payloads for each endpoint

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**Auth Module Structure**

- Follow `apps/server/src/modules/auth/auth.module.ts` pattern for module configuration
- Use @Module decorator with imports, controllers, providers, exports array
- Export service for use by other modules (MediaModule will import StorageModule)
- Use constructor injection for dependencies

**Auth Service Error Handling**

- Follow `apps/server/src/modules/auth/auth.service.ts` pattern for throwing specific exceptions
- Use UnauthorizedException, ConflictException from @nestjs/common
- Implement async methods returning promises
- Constructor inject dependencies (PrismaService pattern for MinIO client)

**Auth Controller Decorators**

- Follow `apps/server/src/modules/auth/auth.controller.ts` decorator pattern
- Use @Controller with resource path, @Post/@Get/@Delete with route paths
- Use @UseGuards for authentication (JwtAuthGuard)
- Use @Res() from express for response handling if needed
- Use @HttpCode(HttpStatus.OK) for non-default status codes

**Auth DTO Validation Pattern**

- Follow `apps/server/src/modules/auth/dto/register.dto.ts` pattern
- Import decorators from class-validator: @IsString, @IsNotEmpty, @MinLength, @IsEmail
- Create DTO classes with typed properties
- Use validation decorators on each property for server-side validation

**Configuration Pattern**

- Follow `apps/server/src/config/database.config.ts` pattern (currently empty export)
- Export default function returning config object
- Read from process.env directly or provide default values
- Configuration will be consumed by StorageService in constructor

## Out of Scope

- Frontend UI components (file picker, dropzone, upload progress)
- Database integration (no Media Prisma model, no patient/session association)
- Image processing operations (compression, resizing, thumbnails, watermarking)
- Video upload support
- Batch operations (multi-file upload/delete in single request)
- Presigned URL uploads (direct browser-to-MinIO, bypassing server)
- Private bucket configuration (Week 2 only - public bucket matching setup-dev.sh)
- List files operation (get all files in bucket or folder)
- Copy/move operations (duplicate or relocate files within storage)
- CDN integration or caching
- Integration with Patient/Session models (Week 7 task)
- File preview or generation (thumbnails, different quality versions)
