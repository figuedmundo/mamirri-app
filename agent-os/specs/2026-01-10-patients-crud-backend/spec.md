# Specification: Patients CRUD Backend

## Goal

Implement complete backend CRUD operations for Patient model with proper authentication, validation, and Prisma integration following established codebase patterns.

## User Stories

- As a physiotherapist, I want to create patient records so that I can manage my client base
- As a physiotherapist, I want to search and view my patients so that I can quickly find patient information during consultations

## Specific Requirements

**Create Patient Endpoint**

- POST /api/v1/patients with validation for required fields (firstName, lastName, dob) and optional fields (email, phone)
- Automatically assign therapistId from authenticated JWT payload using custom @CurrentTherapist() decorator
- Return 201 status with created patient data excluding therapistId from response
- Validate dob is not in future date and falls within reasonable age range (0-130 years)

**List Patients Endpoint**

- GET /api/v1/patients with query parameters for pagination (page, limit) and search
- Default to 20 items per page with skip/take Prisma pattern
- Support name search parameter that searches both firstName and lastName fields
- Filter results by therapistId from authenticated user to ensure data isolation
- Return paginated response with patient array excluding therapistId

**Get Single Patient Endpoint**

- GET /api/v1/patients/:id with CUID validation
- Verify patient belongs to authenticated therapist (therapistId matches)
- Return 404 if patient not found or therapist mismatch
- Return patient data excluding therapistId from response

**Update Patient Endpoint**

- PATCH /api/v1/patients/:id with partial data support using PartialType DTO
- Verify patient belongs to authenticated therapist before allowing updates
- Validate all provided fields follow same rules as create endpoint
- Return 200 status with updated patient data excluding therapistId

**Delete Patient Endpoint**

- DELETE /api/v1/patients/:id with soft delete pattern
- Verify patient belongs to authenticated therapist before allowing deletion
- Set deletedAt timestamp instead of hard deletion for audit trail
- Return 204 No Content on success

**Schema Migration for Soft Delete**

- Add deletedAt DateTime? field to Patient model via Prisma migration
- Create reversible migration with proper rollback capability
- Follow naming convention: timestamp_add_deletedAt_to_patient

**Custom Validator for Date of Birth**

- Implement @IsDateStringNotFuture() decorator to validate dob is not future date
- Use class-validator pattern with custom constraint implementation
- Provide clear error message for invalid date input

**Response DTOs for Clean API**

- Create PatientResponseDto excluding therapistId internal field
- Use @ApiProperty decorators for Swagger documentation
- Maintain consistent response format across all endpoints

**Global ValidationPipe Configuration**

- Register ValidationPipe in main.ts with whitelist and transform options
- Ensure DTO decorators are enforced across all patient endpoints
- Follow existing filter response format for validation errors

## Visual Design

No visual assets provided - This is a backend-only specification.

## Existing Code to Leverage

**Auth Module (apps/server/src/modules/auth/)**

- Use RegisterDto pattern for class-validator decorators (IsString, IsEmail, IsNotEmpty, MinLength)
- Replicate controller structure with @ApiTags, @ApiOperation, @ApiResponse decorators
- Follow service pattern: inject PrismaService, use NestJS exceptions (NotFoundException, ConflictException)
- Copy @CurrentUser decorator pattern to create @CurrentTherapist() decorator

**Prisma Service (apps/server/src/prisma/prisma.service.ts)**

- Inject PrismaService in PatientsService constructor following same pattern as AuthService
- Use type-safe Prisma client methods (findMany, findUnique, create, update)
- Leverage existing CUID-based ID system for patient identifiers

**Global Exception Filter (apps/server/src/common/filters/all-exceptions.filter.ts)**

- Follow established error response format with statusCode, timestamp, path, message, error, details, correlationId
- Allow existing filter to handle Prisma errors and validation errors

**Patient Model (apps/server/prisma/schema.prisma)**

- Extend existing Patient model with deletedAt field via migration
- Maintain current field structure: id, firstName, lastName, dob, phone, email, therapistId, createdAt
- Preserve existing indexes on firstName+lastName and Session relations

## Out of Scope

- Advanced filtering options (date ranges, email/phone search, custom sorting)
- Bulk patient operations (create multiple patients at once)
- Patient session history or statistics aggregation
- Unique email validation per therapist
- Frontend UI components or client-side code
- Patient profile image uploads (deferred to media module)
- Hard delete implementation (must use soft delete)
- Testing implementation (deferred per test-writing standards)
