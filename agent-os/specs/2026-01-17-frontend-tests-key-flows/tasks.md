# Task Breakdown: Frontend Tests - Key User Flows

## Overview

Total Tasks: 4 Groups, ~16 Sub-tasks

## Task List

### Setup & Infrastructure

#### Task Group 1: Playwright Installation & Configuration

**Dependencies:** None

- [ ] 1.0 Setup Playwright
  - [ ] 1.1 Install Playwright in `apps/client`
    - Run `pnpm create playwright`
    - Configure for TypeScript
    - Set base URL to `http://localhost:5173`
  - [ ] 1.2 Configure `playwright.config.ts`
    - Set up webServer to run `pnpm dev`
    - Configure global mocks (if applicable) or reusable auth state
  - [ ] 1.3 Create verification script
    - Simple smoke test to verify browser launches and loads app
  - [ ] 1.4 Verify Playwright setup
    - Run the smoke test successfully

**Acceptance Criteria:**

- Playwright installed
- Configured to run against local dev server
- Smoke test passes

### End-to-End Tests (E2E)

#### Task Group 2: E2E Flows (Create Patient & Record Session)

**Dependencies:** Task Group 1

- [ ] 2.0 Implement E2E Flows
  - [ ] 2.1 Write E2E Test: Flow 1 (Create Patient)
    - File: `tests/e2e/create-patient.spec.ts`
    - Mock API responses for user login and patient creation
    - Test steps: Login -> Navigate -> Fill Form -> Submit -> Verify Toast/Redirect
  - [ ] 2.2 Refine Flow 1 Implementation (if needed)
    - Add data-testids if accessible queries fail
    - Ensure form validation logic matches test expectations
  - [ ] 2.3 Write E2E Test: Flow 2 (Record Treatment Session)
    - File: `tests/e2e/record-session.spec.ts`
    - Mock API: Get Case, Create Session
    - Test steps: Open Case -> New Session -> Select Phase -> Rate Pain -> Save -> Verify Timeline Update
  - [ ] 2.4 Verify E2E Tests
    - Run `pnpm exec playwright test`
    - Ensure both flows pass consistently

**Acceptance Criteria:**

- `create-patient.spec.ts` passes
- `record-session.spec.ts` passes
- Tests use semantic locators (Role/Text) where possible

### Integration Tests (Vitest)

#### Task Group 3: Integration Flows (Posturogram & Timeline)

**Dependencies:** None (Parallelizable with Group 2)

- [ ] 3.0 Implement Integration Flows
  - [ ] 3.1 Write Integration Test: Flow 3 (Compare Posturogram)
    - File: `apps/client/src/components/analisis/PosturogramViewer.test.tsx` (or similar)
    - Mock `PosturogramViewer` props or API data
    - Test: Render -> Check "Before/After" labels -> Simulate Slider interaction -> Verify Image/Overlay State
  - [ ] 3.2 Refine Posturogram Component (if needed)
    - Ensure accessibility roles for slider/buttons
  - [ ] 3.3 Write Integration Test: Flow 4 (View Patient Timeline)
    - File: `apps/client/src/components/patients/CaseDetailLayout.integration.test.tsx`
    - Mock `useParams`, `useNavigate`, and API hooks (`useClinicalCase`)
    - Test: Render -> Verify Timeline items -> Click Session -> Verify Detail View
  - [ ] 3.4 Verify Integration Tests
    - Run `pnpm test` for these specific files
    - Ensure no regressions in existing tests

**Acceptance Criteria:**

- Integration tests for Posturogram comparison pass
- Integration tests for Patient Timeline navigation pass
- Mocks correctly simulate backend responses

### Final Verification

#### Task Group 4: CI Integration & Documentation

**Dependencies:** Task Groups 2 & 3

- [ ] 4.0 CI/CD & Docs
  - [ ] 4.1 Update `package.json` scripts
    - Add `test:e2e` script
  - [ ] 4.2 Document Testing Strategy
    - Create `TESTING.md` or update `README.md` in `apps/client`
    - Explain how to run E2E vs Integration tests
  - [ ] 4.3 Final Suite Run
    - Run all new E2E tests
    - Run all new Integration tests

**Acceptance Criteria:**

- NPM scripts added
- Documentation clear
- All 4 flows verified passing

## Execution Order

1. Setup Playwright (Group 1)
2. E2E Flows (Group 2)
3. Integration Flows (Group 3) - _Can start after Group 1 is planned_
4. Final Verification (Group 4)
