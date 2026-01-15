# Task Breakdown: Patients CRUD Backend

## Overview

Total Tasks: 11

## Task List

### Database Layer

#### Task Group 1: Schema Migration for Soft Delete

**Dependencies:** None

- [x] 1.0 Complete database layer
  - [x] 1.1 Write 3-5 focused tests for Patient model with soft delete
    - Limit to 3-5 highly focused tests maximum
    - Test critical patient behaviors: create with therapistId, filter by therapistId, soft delete functionality
    - Skip exhaustive coverage of all scenarios and edge cases
  - [x] 1.2 Create Prisma migration to add deletedAt field
    - Add deletedAt DateTime? field to Patient model
    - Follow naming convention: timestamp_add_deletedAt_to_patient
    - Create reversible migration with proper rollback capability
  - [x] 1.3 Run migration and verify
    - Apply migration using Prisma Migrate
    - Verify deletedAt field appears in Patient model
    - Verify existing Patient data remains intact
  - [x] 1.4 Ensure database layer tests pass
    - Run ONLY the 3-5 tests written in 1.1
    - Verify migration runs successfully
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 3-5 tests written in 1.1 pass
- Migration runs successfully and adds deletedAt field
- Existing Patient data remains intact

### Validation Layer

#### Task Group 2: DTOs and Custom Validators

**Dependencies:** Task Group 1

- [x] 2.0 Complete validation layer
  - [x] 2.1 Write 2-3 focused tests for validators and DTOs
    - Limit to 2-3 highly focused tests maximum
    - Test @IsDateStringNotFuture() validator behavior and DTO validation rules
    - Skip exhaustive testing of all validation scenarios
  - [x] 2.2 Create custom @IsDateStringNotFuture() validator
    - Implement class-validator custom constraint pattern
    - Validate dob is not in future date
    - Provide clear error message for invalid date input
  - [x] 2.3 Create CreatePatientDto
    - Fields: firstName (required, 2-50 chars), lastName (required, 2-50 chars), dob (required, not future, age 0-130), email (optional, valid format if provided), phone (optional, E.164 format if provided)
    - Use @IsDateStringNotFuture() on dob field
    - Follow RegisterDto pattern for class-validator decorators
  - [x] 2.4 Create UpdatePatientDto
    - Use PartialType(CreatePatientDto) to make all fields optional
    - Follow NestJS PartialType pattern
  - [x] 2.5 Create PatientResponseDto
    - Exclude therapistId internal field from response
    - Keep email and phone for contact purposes
    - Add @ApiProperty() decorators for Swagger documentation
  - [x] 2.6 Ensure validation layer tests pass
    - Run ONLY the 2-3 tests written in 2.1
    - Verify custom validator and DTO validation works correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 2-3 tests written in 2.1 pass
- Custom validator prevents future dates
- All DTOs follow class-validator patterns from auth module

### API Layer

#### Task Group 3: Controller and Service Implementation

**Dependencies:** Task Groups 1, 2

- [x] 3.0 Complete API layer
  - [x] 3.1 Write 3-5 focused tests for patient endpoints
    - Limit to 3-5 highly focused tests maximum
    - Test only critical controller actions: create patient, list patients with therapist filter, get single patient (therapist ownership), update patient (therapist ownership), delete patient (soft delete + therapist ownership)
    - Skip exhaustive testing of all actions and error scenarios
  - [x] 3.2 Create @CurrentTherapist() decorator
    - Follow @CurrentUser() decorator pattern from auth module
    - Extract therapistId from JWT payload
    - Place in decorators folder under patients module
  - [x] 3.3 Implement PatientsService
    - Inject PrismaService in constructor following AuthService pattern
    - Create method: create(patientData, therapistId) - set therapistId from authenticated user
    - Create method: findAll(therapistId, page, limit, search) - filter by therapistId, implement pagination with skip/take, search firstName+lastName
    - Create method: findOne(id, therapistId) - verify patient belongs to therapist
    - Create method: update(id, therapistId, updateData) - verify ownership before update
    - Create method: remove(id, therapistId) - set deletedAt timestamp, verify ownership
    - Use Prisma generated types for type safety
    - Filter out records with deletedAt set in all queries except delete
  - [x] 3.4 Implement PatientsController
    - Actions: create (POST), findAll (GET with pagination+search), findOne (GET by ID), update (PATCH), remove (DELETE)
    - Use @Controller('patients') decorator
    - Add @ApiTags('patients'), @ApiOperation(), @ApiResponse() decorators following auth module
    - Protect all endpoints with @UseGuards(JwtAuthGuard)
    - Use @CurrentTherapist() decorator to extract therapistId
    - Return appropriate HTTP status codes: 201 (create), 200 (list/show/update), 204 (delete), 404 (not found/ownership mismatch)
  - [x] 3.5 Update PatientsModule to import PrismaModule
    - Register PrismaModule in imports
    - Export PatientsController and PatientsService
  - [x] 3.6 Ensure API layer tests pass
    - Run ONLY the 3-5 tests written in 3.1
    - Verify critical CRUD operations work correctly
    - Verify therapist isolation enforced (therapist can only see/update/delete own patients)
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 3-5 tests written in 3.1 pass
- All CRUD operations work (Create, Read list, Read single, Update, Delete)
- Therapist isolation enforced throughout all operations
- Swagger documentation available at /api/docs

### Global Configuration

#### Task Group 4: Enable Global Validation

**Dependencies:** Task Groups 2, 3

- [x] 4.0 Complete global validation setup
  - [x] 4.1 Register ValidationPipe in main.ts
    - Add ValidationPipe with whitelist: true, transform: true, forbidNonWhitelisted: true options
    - Enable DTO validators to be enforced across all endpoints
    - Place after app.setGlobalPrefix() and before app.listen()
  - [x] 4.2 Verify ValidationPipe works with patient endpoints
    - Test CreatePatientDto validation (required fields, format checks, custom DOB validator)
    - Test UpdatePatientDto validation
    - Verify invalid requests return 400 with proper error format

**Acceptance Criteria:**

- ValidationPipe registered globally in main.ts
- Patient DTOs enforce validation rules automatically
- Validation errors return consistent response format via AllExceptionsFilter

## Execution Order

Recommended implementation sequence:

1. Database Layer (Task Group 1)
2. Validation Layer (Task Group 2)
3. API Layer (Task Group 3)
4. Global Configuration (Task Group 4)
