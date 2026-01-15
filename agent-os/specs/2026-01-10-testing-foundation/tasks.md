# Task Breakdown: Testing Foundation

## Overview

Total Tasks: 4 task groups

## Task List

### Backend Unit Tests

#### Task Group 1: Auth Service Unit Tests

**Dependencies:** None

- [x] 1.0 Complete AuthService unit tests
  - [x] 1.1 Write 2-8 focused tests for AuthService
    - Test validateUser: returns user when password matches, returns null when password doesn't match
    - Test login: returns access and refresh tokens with user data
    - Test register: creates user, hashes password, returns tokens
    - Limit to 5 highly focused tests maximum
    - Mock external dependencies: PrismaService, JwtService, bcrypt
  - [x] 1.2 Create or update `auth.service.spec.ts`
    - Follow existing structure from `apps/server/src/modules/auth/auth.service.spec.ts`
    - Use NestJS TestingModule with mocked providers
    - Use describe/it nesting for logical organization
    - Clear test names that explain behavior and expected outcome
  - [x] 1.3 Ensure AuthService tests pass
    - Run ONLY tests in `auth.service.spec.ts`
    - Verify all 5 tests pass
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- All 5 AuthService tests pass
- Tests cover validateUser, login, register happy paths
- External dependencies properly mocked
- Tests execute in milliseconds

#### Task Group 2: Storage Service Unit Tests

**Dependencies:** Task Group 1

- [x] 2.0 Complete StorageService unit tests
  - [x] 2.1 Write 2-8 focused tests for StorageService
    - Test uploadFile: validates file, generates unique path, uploads to S3
    - Test getFileUrl: returns presigned URL for valid path
    - Test deleteFile: deletes file from S3
    - Test fileExists: returns true if file exists, false otherwise
    - Limit to 5 highly focused tests maximum
    - Mock external dependencies: S3Client, getSignedUrl, storageConfig
  - [x] 2.2 Create `storage.service.spec.ts`
    - Follow pattern from `auth.service.spec.ts`
    - Use NestJS TestingModule with mocked S3Client
    - Mock AWS SDK methods (send, getSignedUrl)
    - Test happy paths only, skip error scenarios
  - [x] 2.3 Ensure StorageService tests pass
    - Run ONLY tests in `storage.service.spec.ts`
    - Verify all 5 tests pass
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- All 5 StorageService tests pass
- Tests cover uploadFile, getFileUrl, deleteFile, fileExists happy paths
- AWS SDK dependencies properly mocked
- Tests execute in milliseconds

### E2E Tests

#### Task Group 3: Auth Flow E2E Tests

**Dependencies:** Task Group 1

- [x] 3.0 Complete auth flow E2E tests
  - [x] 3.1 Write 2-8 focused E2E tests for auth flow
    - Test login flow: user logs in, updates context/storage, redirects to dashboard
    - Test protected route: returns 401 without authentication, allows access with valid token
    - Test logout flow: clears storage, invalidates session
    - Limit to 3 highly focused tests maximum
    - Use React Testing Library with MemoryRouter
  - [x] 3.2 Create or update E2E test file
    - Follow pattern from `apps/client/src/tests/auth-integration.test.tsx`
    - Mock axios API calls for /auth/login, /auth/register, /auth/logout
    - Test localStorage token storage and retrieval
    - Test routing with MemoryRouter
  - [x] 3.3 Ensure E2E auth tests pass
    - Run ONLY auth E2E tests
    - Verify all 3 tests pass
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- All 3 E2E auth tests pass
- Complete auth flow verified: register → login → access → logout
- Protected routes properly enforce authentication
- Token persistence and logout work correctly

### API Documentation

#### Task Group 4: Swagger Documentation Refinement

**Dependencies:** Task Group 1

- [x] 4.0 Complete Swagger API documentation
  - [x] 4.1 Add Swagger decorators to AuthController
    - Add @ApiTags('auth') to controller class
    - Add @ApiOperation() with descriptions for register, login, refresh, logout
    - Add @ApiResponse() decorators for success and error responses
    - Include request body examples for register and login
  - [x] 4.2 Add Swagger decorators to StorageController
    - Add @ApiTags('storage') to controller class
    - Add @ApiOperation() with descriptions for upload, download, delete endpoints
    - Add @ApiResponse() decorators with examples
    - Include request/response examples
  - [x] 4.3 Enable Bearer authentication in Swagger UI
    - Update DocumentBuilder in `apps/server/src/main.ts`
    - Add .addBearerAuth() configuration
    - Ensure protected endpoints show lock icon in Swagger UI
  - [x] 4.4 Verify Swagger documentation
    - Access `/api/docs` in browser
    - Verify all endpoints are documented
    - Test Bearer authentication in Swagger UI
    - Verify "Try it out" functionality works

**Acceptance Criteria:**

- All endpoints have @ApiTags, @ApiOperation, and @ApiResponse decorators
- Request/response examples included
- Bearer authentication enabled in Swagger UI
- Swagger UI accessible at `/api/docs` with interactive testing

### Developer Documentation

#### Task Group 5: Developer Onboarding Guide

**Dependencies:** None

- [x] 5.0 Complete developer onboarding documentation
  - [x] 5.1 Create `.documentation/onboarding/developer-setup.md`
    - Include prerequisites: Node.js (>=18), pnpm, Docker & Docker Compose
    - Include environment setup: pnpm install, .env configuration
    - Include infrastructure setup: docker compose up -d
    - Include database initialization: prisma migrate dev
    - Include local development: pnpm dev (client at 5173, server at 3000)
    - Include testing: pnpm test, pnpm test:e2e, pnpm test:cov
    - Include contribution: commit style, PR process, code review
    - Include architecture overview with links to existing docs
  - [x] 5.2 Follow README structure and tone
    - Use clear section headers
    - Include code examples in fenced blocks
    - Use conversational tone
    - Link to comprehensive documentation
  - [x] 5.3 Verify documentation completeness
    - Check all commands are accurate
    - Verify links to documentation work
    - Ensure guide is comprehensive yet concise

**Acceptance Criteria:**

- Developer guide created at `.documentation/onboarding/developer-setup.md`
- All setup steps documented with accurate commands
- Testing and contribution guidelines included
- Architecture overview links to existing documentation
- Follows README structure and tone

## Execution Order

Recommended implementation sequence:

1. Task Group 1: Auth Service Unit Tests
2. Task Group 2: Storage Service Unit Tests
3. Task Group 3: Auth Flow E2E Tests
4. Task Group 4: Swagger Documentation Refinement
5. Task Group 5: Developer Onboarding Guide

**Note:** Task Groups 1 and 2 (backend tests) can be done in parallel. Task Groups 3, 4, and 5 are independent and can be done in parallel after backend tests.
