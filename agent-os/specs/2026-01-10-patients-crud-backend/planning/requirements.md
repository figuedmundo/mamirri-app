# Spec Requirements: Patients CRUD Backend

## Initial Description

Backend: Patients CRUD (routes, validation, Prisma)

## Requirements Discussion

### First Round Questions

**Q1:** I assume all patient endpoints should be protected with JWT authentication, and therapists should only see patients they created (via `therapistId`). Is that correct, or should there be any public read access?
**Answer:** Yes, all endpoints should be protected with `JwtAuthGuard`. Therapists should only see patients they created via `therapistId` filtering.

**Q2:** For patient list endpoint, I'm thinking to include basic search by name (firstName + lastName) with pagination (10 items per page). Should we also support filtering by date range, email, or phone from the start?
**Answer:** Implement basic name search (searching both `firstName` and `lastName` together) with pagination using Prisma's `skip` and `take` parameters (default 20 items per page). No advanced filtering for MVP.

**Q3:** I plan to implement standard CRUD operations: Create, Read (list + single), Update, and Delete. Should we use soft delete (mark as deleted but keep record) or hard delete (completely remove from database)?
**Answer:** Use soft delete by adding a `deletedAt: DateTime?` field to the Patient model. Set this field in delete endpoint and filter out deleted records in queries for audit trail purposes.

**Q4:** For validation, I assume we need basic validation: name fields required, DOB must be a valid date and not in the future, email format validation if provided, phone format validation. Should we also add age validation (e.g., patients must be over 18 or have parent contact info)?
**Answer:** Basic validation required:

- `firstName`, `lastName`: Required strings, 2-50 characters
- `dob`: Required, must be a valid date in the past (not future), reasonable age range (0-130 years)
- `email`: Optional but if provided, must be valid email format
- `phone`: Optional but if provided, must follow international format (E.164)
- No age restrictions - physiotherapists treat all ages from infants to elderly

**Q5:** When returning patient data in list responses, I'm thinking to exclude `therapistId` from the response (since it's internal) and keep sensitive fields like `email` and `phone`. Should we implement a more comprehensive response DTO that excludes certain fields?
**Answer:** Create a `PatientResponseDto` that excludes `therapistId` (internal field) but keeps `email` and `phone` (needed for contact). Use `@ApiProperty()` decorators for Swagger documentation.

**Q6:** For CreatePatientDto, should we require `therapistId` to be provided in the request body, or should we automatically set it based on the authenticated user making the request?
**Answer:** Automatically set `therapistId` from authenticated user (using a custom `@CurrentTherapist()` decorator similar to `@CurrentUser()` in the auth module). Do NOT allow it in the request body (security risk).

**Q7:** I plan to follow the existing auth module pattern: using `class-validator` decorators, DTOs in a `dto/` folder, and Swagger documentation with `@ApiTags` and `@ApiOperation`. Should we also add any custom validators (e.g., unique email validation per therapist)?
**Answer:** Use standard `class-validator` decorators (IsString, IsEmail, IsOptional, IsDateString, etc.). Create a custom `@IsDateStringNotFuture()` validator for DOB. For MVP, skip unique email validator (let Prisma handle it if needed later). Follow the auth module's pattern exactly.

**Q8:** What's out of scope for this task? For example, should patient search be limited to name only, and advanced filtering (multiple criteria, sorting) be deferred to a future iteration?
**Answer:**

- **IN SCOPE:** Basic CRUD operations (Create, Read list+single, Update, Delete), name search, pagination, authentication
- **OUT OF SCOPE:** Advanced filtering (date ranges, email/phone filtering), custom sorting, patient session history, patient statistics, bulk operations

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Auth Module - Path: `apps/server/src/modules/auth/`
  - Components to potentially reuse: DTO patterns with `class-validator`, service structure, controller decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`), error handling with `ConflictException`, `NotFoundException`
- Feature: Prisma Service - Path: `apps/server/src/prisma/prisma.service.ts`
  - Backend logic to reference: Global `PrismaService` for all database operations, type-safe Prisma client usage
- Feature: Global Exception Filter - Path: `apps/server/src/common/filters/all-exceptions.filter.ts`
  - Error handling to reference: Established error response format with `statusCode`, `timestamp`, `path`, `message`, `error`, `details`, `correlationId`

### Follow-up Questions

No follow-up questions were needed.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - This is a backend-only task with no UI components.

## Requirements Summary

### Functional Requirements

- Create new patients with validation (firstName, lastName, dob, optional email/phone)
- List patients with pagination (20 items per page) and name search (searches firstName + lastName)
- Get single patient by ID
- Update patient information
- Delete patient (soft delete by setting `deletedAt` field)
- All endpoints must be protected with `JwtAuthGuard`
- Automatic `therapistId` assignment from authenticated user
- Filter patients to show only those belonging to the authenticated therapist

### Reusability Opportunities

- Follow auth module's DTO pattern: create `dto/` folder with separate files for Create, Update, and Response DTOs
- Use `@ApiTags('patients')`, `@ApiOperation()`, and `@ApiResponse()` decorators for Swagger documentation
- Create custom `@CurrentTherapist()` decorator similar to existing `@CurrentUser()` decorator for extracting therapist from JWT payload
- Inject `PrismaService` in constructor (same pattern as AuthService)
- Use NestJS built-in exceptions (`NotFoundException`, `ConflictException`) for error handling
- Enable global `ValidationPipe` in `main.ts` to make DTO validators functional (currently missing in codebase)

### Scope Boundaries

**In Scope:**

- Backend CRUD operations for Patient model
- Basic validation using `class-validator`
- Name-based search with pagination
- JWT authentication with therapist isolation
- Swagger API documentation
- Soft delete implementation (schema migration + query filters)

**Out of Scope:**

- Advanced filtering (date ranges, email/phone search)
- Custom sorting options
- Patient session history or statistics
- Bulk operations (create multiple patients at once)
- Frontend UI components
- Patient profile image uploads (deferred to media module)
- Unique email validation per therapist

### Technical Considerations

- **Integration Points:**
  - PrismaService: Global provider for database operations
  - JwtAuthGuard: Protects all patient endpoints
  - ValidationPipe: Must be registered globally in `main.ts` (currently missing)
  - SwaggerModule: Already configured at `/api/docs`
- **Existing System Constraints:**
  - Patient model has `therapistId` field but no explicit relation to User model in Prisma schema
  - `deletedAt` field does not exist yet - requires schema migration
  - ValidationPipe not registered globally in `main.ts` - needs to be added
  - Response format established by `AllExceptionsFilter` must be followed
- **Technology Preferences:**
  - Use `class-validator` and `class-transformer` for validation
  - Use `@nestjs/swagger` decorators for API documentation
  - Follow Prisma's generated types for type safety
  - Use CUID strings for all IDs (already defined in schema)
- **Similar Code Patterns to Follow:**
  - AuthService: Controller → Service → Prisma pattern
  - RegisterDto: Validation decorators and field structure
  - AuthController: Swagger documentation and HTTP decorators
  - Global exception filter: Standard error response format
