# Clinical Pending Banner Regression (2026-02-28)

Objective: confirm the treatment plan pending banner renders for cases without defined phases and that the entire clinical journey flow remains green after the UI guard change.

## Focused Tests

1. `pnpm --filter client test TreatmentTimeline`
   - Scope: new unit tests for `TreatmentTimeline` pending-banner logic (2 tests)
   - Result: ✅ pass

2. `pnpm --filter client exec playwright test apps/client/tests/e2e/clinical/clinical-happy-path.spec.ts`
   - Scope: clinical happy path E2E to cover the pending banner and treatment plan unlock
   - Result: ✅ pass (proxy warnings expected for AI analysis endpoints without backend)

## Full Suite

- `pnpm --filter client test:e2e`
  - Scope: all Playwright E2E suites (30 tests)
  - Result: ✅ pass (proxy warnings for AI endpoints remain expected; no test failures)

Artifacts recorded locally at 2026-02-28 21:55 CET.

## CI Failure Follow-Up (2026-03-01)

Observed CI failures:

- Missing pending banner assertion in `clinical-happy-path.spec.ts`
- Missing timeline nav button in `stage-04-treatment-plan-phases-objectives.spec.ts`
- Missing floating recorder button in `voice-recorder-resilience.spec.ts`

Stabilization changes:

- Added explicit mock for `GET /api/v1/ai/cases/:id/analyses/latest` in affected specs to avoid proxy-driven timing noise.
- Added deterministic layout readiness checks (`nav-timeline-btn` visibility) before UI interactions.
- Hardened list-route matching in voice resilience test to support query-string list requests while preserving detail route matching.

Verification commands and outcomes:

1. `pnpm --filter client exec playwright test apps/client/tests/e2e/clinical/clinical-happy-path.spec.ts apps/client/tests/e2e/clinical/stage-04-treatment-plan-phases-objectives.spec.ts apps/client/tests/e2e/clinical/voice/voice-recorder-resilience.spec.ts --workers=1`
   - Result: ✅ pass

2. `pnpm --filter client exec playwright test apps/client/tests/e2e/clinical/clinical-happy-path.spec.ts apps/client/tests/e2e/clinical/stage-04-treatment-plan-phases-objectives.spec.ts apps/client/tests/e2e/clinical/voice/voice-recorder-resilience.spec.ts --workers=1 --repeat-each=6`
   - Result: ✅ pass (18/18)

3. `pnpm --filter client test:e2e`
   - Result: ✅ pass (30/30)

4. `pnpm --filter client check-types`
   - Result: ✅ pass

Artifacts recorded locally at 2026-03-01 01:34 CET.
