# Spec Requirements: Testing Foundation

## Initial Description

**Feature Description:**
Week 4: Testing Foundation

- **4.1 Unit Tests:** Critical backend services
- **4.2 E2E Tests:** Auth flow verification
- **4.3 API Docs:** Swagger setup & refinement
- **4.4 Onboarding:** Developer guide & setup scripts

**Context:**
This is the final week of Phase 0: Foundations & Infrastructure. The goal is to establish a solid testing foundation, API documentation, and developer onboarding before moving to business logic in Phase 1 (MVP).

**Milestone 1:** "I can login and see an empty dashboard" - Tests should verify this works end-to-end.

## Requirements Discussion

### First Round Questions

**Q1:** I assume "Critical backend services" refers to the auth and storage services since those are the core infrastructure completed in Weeks 1-3. Should I also include unit tests for patients and sessions modules, or focus only on auth/storage?
**Answer:** Focus on auth and storage services only. Patients and sessions modules will be implemented in Phase 1, so their tests should come with those features.

**Q2:** For E2E auth flow verification, I'm thinking we should test the complete happy path: register → login → access protected route → logout. Is that correct, or should we also test error scenarios (invalid credentials, expired tokens)?
**Answer:** Test the happy path only (register → login → access protected route → logout). This aligns with test-writing standard: "Test only core user flows" and "Defer edge case testing."

**Q3:** I see Swagger is already configured in main.ts. For "refinement," I assume this means adding detailed API descriptions, request/response examples, and proper @ApiTags to existing controllers. Is that the intent, or are you looking for something else (like adding Bearer authentication to the Swagger UI)?
**Answer:** Add detailed API descriptions, request/response examples, and @ApiTags to existing controllers. Also add Bearer authentication to Swagger UI (using `addBearerAuth()`) so developers can test authenticated endpoints directly from the documentation.

**Q4:** For the developer onboarding guide, I'm assuming it should cover: environment setup, running the app locally, running tests, and making code contributions. Should it also include sections on architecture overview, debugging, or deployment?
**Answer:** Include: environment setup, running the app locally, running tests, and making code contributions. Add a brief architecture overview (linking to existing docs in `.documentation/`), but skip debugging and deployment sections (those can come later when needed).

**Q5:** Regarding testing coverage, I'm assuming we don't need strict coverage thresholds (like "80% coverage") yet, but should document what we're testing. Is that correct, or do you want specific coverage requirements?
**Answer:** No strict thresholds. Just ensure we have tests for happy paths of auth and storage services. Document what's being tested without enforcing percentages.

**Q6:** For E2E tests, should I assume we use Playwright or Cypress (both common for React apps), or do you have a preference based on the tech stack?
**Answer:** Use Jest + Testing Library (already in the project) instead of Playwright/Cypress. Follow the pattern from `auth-integration.test.tsx`.

**Q7:** What should be excluded from this testing foundation? For example, should we skip frontend component testing (since we'll add UI components in Phase 1), or skip testing of the MinIO/PostgreSQL infrastructure (since that's Docker-managed)?
**Answer:** Skip: (1) frontend component testing (UI components coming in Phase 1), (2) infrastructure testing (Docker-managed services), (3) edge case/error testing (unless critical), (4) performance/load testing (deferred to Phase 2 post-validation).

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Auth Service Tests - Path: `apps/server/src/modules/auth/auth.service.spec.ts` - Follow this test structure for storage service tests
- Feature: E2E Auth Integration - Path: `apps/client/src/tests/auth-integration.test.tsx` - Pattern for E2E auth flow verification
- Feature: README Documentation - Path: `README.md` - Follow structure and tone for developer onboarding guide
- Feature: CI/CD Test Workflow - Path: `.github/workflows/test.yml` - Reference for test CI/CD setup
- Feature: Storage Controller - Path: `apps/server/src/modules/storage/storage.controller.ts` - Add Swagger decorators here
- Feature: Auth Controller - Path: `apps/server/src/modules/auth/auth.controller.ts` - Add Swagger decorators here

### Follow-up Questions

None required.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

No visual assets required for this functional/testing work.

## Requirements Summary

### Functional Requirements

**4.1 Unit Tests: Critical Backend Services**

- Write unit tests for `auth.service.ts` covering happy path scenarios
- Write unit tests for `storage.service.ts` covering happy path scenarios
- Test core business logic: register, login, token generation, file upload/download
- Mock external dependencies (database, MinIO)
- Ensure tests are fast (milliseconds) for frequent developer runs

**4.2 E2E Tests: Auth Flow Verification**

- Create E2E test for complete auth happy path: register → login → access protected route → logout
- Use Jest + React Testing Library (following `auth-integration.test.tsx` pattern)
- Test that protected routes return 401 without authentication
- Test that authenticated user can access protected resources
- Verify logout invalidates the token/session

**4.3 API Docs: Swagger Setup & Refinement**

- Add `@ApiTags()` to all controller methods for better organization
- Add detailed API descriptions to all endpoints
- Add request/response examples to Swagger decorators
- Add Bearer authentication to Swagger UI configuration using `addBearerAuth()`
- Ensure Swagger docs are accessible at `/api/docs`
- Document authentication requirements for protected endpoints

**4.4 Onboarding: Developer Guide & Setup Scripts**

- Create comprehensive developer onboarding guide
- Include environment setup instructions (Node.js, pnpm, Docker)
- Include local development commands (dev, build, test, lint)
- Include how to run the application (client at 5173, server at 3000)
- Include testing instructions (unit tests, E2E tests)
- Include contribution guidelines (commit style, PR process)
- Include brief architecture overview linking to `.documentation/`
- Place guide in `.documentation/onboarding/` or root `CONTRIBUTING.md`

### Reusability Opportunities

- Reuse existing test patterns from `auth.service.spec.ts` for storage service tests
- Reuse E2E test patterns from `auth-integration.test.tsx` for new E2E tests
- Follow README structure and tone for onboarding guide
- Reference existing CI/CD workflows for test automation

### Scope Boundaries

**In Scope:**

- Unit tests for `auth.service.ts` (happy path scenarios)
- Unit tests for `storage.service.ts` (happy path scenarios)
- E2E test for complete auth flow (register → login → access → logout)
- Swagger documentation refinement (API tags, descriptions, examples, Bearer auth)
- Developer onboarding guide (setup, running, testing, contributing)
- Brief architecture overview linking to existing documentation

**Out of Scope:**

- Frontend component testing (coming in Phase 1)
- Unit tests for patients/sessions modules (coming with those features)
- Edge case/error testing in tests (deferred unless critical)
- Infrastructure testing (PostgreSQL, MinIO, Redis Docker containers)
- Performance/load testing (deferred to Phase 2 post-validation)
- Debugging guides (deferred)
- Deployment guides (already documented in README)
- Strict code coverage thresholds/percentages

### Technical Considerations

- **Testing Framework:** Jest (already in project for both backend and frontend)
- **E2E Framework:** React Testing Library (existing pattern in `auth-integration.test.tsx`)
- **Mocking:** Use Jest mocks for database (Prisma), MinIO, and external services
- **Swagger:** NestJS Swagger module (`@nestjs/swagger`)
- **Documentation Style:** Follow README.md structure and conversational tone
- **Test Standards:** Follow `agent-os/standards/testing/test-writing.md`:
  - Test core user flows only
  - Defer edge case testing
  - Test behavior, not implementation
  - Clear test names
  - Fast execution
- **Integration Points:** Existing test CI/CD workflow in `.github/workflows/test.yml`
- **Existing Swagger Config:** Already set up in `apps/server/src/main.ts` at `/api/docs`
