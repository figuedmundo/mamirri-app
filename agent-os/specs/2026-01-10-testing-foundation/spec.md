# Specification: Testing Foundation

## Goal

Establish a solid testing foundation with unit tests for core backend services, E2E tests for authentication flow, comprehensive API documentation, and a developer onboarding guide to prepare for Phase 1 MVP development.

## User Stories

- As a **developer**, I want to run fast unit tests on core services so that I can quickly verify code changes during development
- As a **new developer joining the project**, I want clear documentation on how to set up the environment and run tests so that I can start contributing quickly
- As a **API consumer**, I want interactive API documentation with authentication support so that I can explore and test endpoints directly

## Specific Requirements

**4.1 Unit Tests: Critical Backend Services**

- Write unit tests for `AuthService` covering validateUser, login, register happy path scenarios
- Write unit tests for `StorageService` covering uploadFile, getFileUrl, deleteFile, fileExists happy paths
- Mock all external dependencies: PrismaService, JwtService, bcrypt, S3Client, getSignedUrl
- Follow existing test structure from `auth.service.spec.ts` using NestJS TestingModule
- Use descriptive test names that explain the behavior and expected outcome
- Ensure tests execute in milliseconds for frequent developer runs
- Test behavior (what code does) rather than implementation details (how it works)
- Skip edge case and error testing unless business-critical

**4.2 E2E Tests: Auth Flow Verification**

- Create E2E test following register → login → access protected route → logout happy path
- Use Jest + React Testing Library matching pattern from `auth-integration.test.tsx`
- Mock API calls to `/auth/login`, `/auth/register`, `/auth/logout` endpoints
- Test that protected routes redirect to login without authentication
- Test that authenticated user can access protected resources and sees dashboard
- Test that logout clears localStorage tokens and redirects appropriately
- Use MemoryRouter for navigation testing and vi.mock for axios API calls
- Verify complete auth flow works end-to-end

**4.3 API Documentation: Swagger Refinement**

- Add `@ApiTags('auth')` to AuthController methods and `@ApiTags('storage')` to StorageController
- Add `@ApiOperation()` with descriptions for all controller methods explaining functionality
- Add `@ApiResponse()` decorators with examples for successful and error responses
- Add `addBearerAuth()` to DocumentBuilder in main.ts to enable Bearer token authentication in Swagger UI
- Document all endpoints including request body examples and response schemas
- Ensure protected endpoints show authentication requirement in Swagger UI
- Make API documentation accessible at `/api/docs` with interactive "Try it out" functionality

**4.4 Developer Onboarding Guide**

- Create comprehensive guide at `.documentation/onboarding/developer-setup.md`
- Include prerequisites: Node.js (>=18), pnpm, Docker & Docker Compose
- Include environment setup: `pnpm install`, copying `.env.example`, running `docker compose up -d`
- Include database initialization: `pnpm --filter server exec npx prisma migrate dev`
- Include local development commands: `pnpm dev` (starts client at 5173, server at 3000)
- Include testing commands: `pnpm test` (unit), `pnpm test:e2e`, `pnpm test:cov`
- Include contribution guidelines: commit style, PR process, code review
- Include brief architecture overview linking to existing `.documentation/` files
- Follow README structure and conversational tone for consistency

## Visual Design

No visual assets required for this functional/testing specification.

## Existing Code to Leverage

**`apps/server/src/modules/auth/auth.service.spec.ts` - Auth Service Tests**

- Uses NestJS TestingModule with mocked providers (JwtService, PrismaService, bcrypt)
- Tests validateUser, login, register methods with clear assertions
- Uses jest.mock for external dependencies like bcrypt
- Follows describe/it nesting for logical test organization
- Provides structure pattern to replicate for storage.service.spec.ts

**`apps/client/src/tests/auth-integration.test.tsx` - E2E Auth Test**

- Uses React Testing Library with MemoryRouter for routing tests
- Mocks axios with vi.mock for API call interception
- Tests complete flow: login → context update → localStorage → redirect
- Tests persistence flow with pre-existing tokens
- Tests logout flow clearing storage
- Provides pattern for new E2E auth verification test

**`README.md` - Documentation Structure**

- Uses clear section headers with emoji markers for visual organization
- Includes Table of Contents with links to documentation sections
- Provides code examples in fenced code blocks with shell commands
- Uses conversational tone with clear instructions
- Links to comprehensive documentation in `.documentation/` directory

**`apps/server/src/main.ts` - Swagger Configuration**

- Uses DocumentBuilder and SwaggerModule from @nestjs/swagger
- Sets up API docs at `/api/docs` with app prefix `/api/v1`
- Already has basic title, description, version configured
- Requires adding `addBearerAuth()` for authentication support

**`.github/workflows/test.yml` - CI/CD Test Workflow**

- Existing workflow for running tests on pull requests
- Reference for ensuring new tests integrate with CI/CD pipeline

## Out of Scope

- Frontend component testing (Login, Register, ProtectedRoute components coming in Phase 1)
- Unit tests for patients and sessions services (to be tested when implemented in Phase 1)
- Edge case/error testing in unit and E2E tests (invalid credentials, expired tokens, file size limits)
- Infrastructure testing (PostgreSQL, MinIO, Redis Docker containers)
- Performance/load testing and benchmarking (deferred to Phase 2 post-validation)
- Debugging guides and troubleshooting documentation
- Deployment guides and production setup (already documented in README)
- Strict code coverage thresholds or percentage requirements
- Integration tests spanning multiple modules beyond auth flow
- Visual UI testing or screenshot regression testing
