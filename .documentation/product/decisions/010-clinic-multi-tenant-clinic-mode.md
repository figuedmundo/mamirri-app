# ADR-010: Clinic Multi-Tenant (Organization + Membership) Proposal

**Status:** 🟡 Proposed  
**Date:** 2026-02-18  
**Deciders:** PO + Tech Lead

---

## Context

Mamirri currently behaves like a single-therapist product from a data isolation perspective.

Hard evidence in the codebase:

- Patients are tenant-scoped by therapist:
  - `Patient.therapistId` is the primary access boundary.
  - Example query patterns in `apps/server/src/modules/patients/patients.service.ts` filter as `where: { therapistId, deletedAt: null }`.
- Most other access checks inherit therapist isolation by walking the chain:
  - `ClinicalCase -> Patient -> therapistId`.
  - Examples: `apps/server/src/modules/clinical-cases/clinical-cases.service.ts` and `apps/server/src/modules/ai-analysis/services/data-aggregation.service.ts`.

Product direction under discussion:

- The app should support a clinic model where multiple therapists can work in the same clinic.
- A patient should be shareable among therapists within the same clinic (e.g., different procedures, coverage, continuity).

Recent change pressure:

- Protocol CRUD briefly introduced a global `ADMIN` role to gate access to protocol curation UI, but this was rolled back to keep the product single-therapist for now.
- This raises a broader question: do we want global roles at all, or do we want clinic-scoped roles?

---

## Decision

Propose moving from therapist-as-tenant to a clinic-as-tenant model.

### Core model (industry standard)

- Add a first-class tenant entity: `Clinic`.
- Add a membership join model: `ClinicMembership` (user belongs to clinic with a role).
- Tenant-scoped access must be enforced server-side on every request and every data lookup.

Recommended role taxonomy:

- Clinic-scoped roles live in membership (preferred): `CLINIC_OWNER`, `CLINIC_ADMIN`, `THERAPIST`.
- Platform/content permissions (if needed) remain separate and explicitly named (e.g., `CONTENT_ADMIN`).

Patient sharing:

- v1 (simple, likely sufficient for clinics): all therapists in the same clinic can access all patients in that clinic.
- Later (only if needed): introduce per-patient ACL/assignment.

Interim decision (to unblock current workflow):

- Keep a single role (`THERAPIST`) and treat the therapist as the business owner who can perform protocol curation.
- Defer clinic multi-tenancy + clinic-scoped roles until PO alignment.

---

## Consequences

### Positive

- ✅ Enables true clinic workflows: multiple therapists, shared patients, shared clinical history.
- ✅ Role meaning becomes clear (admin of a clinic vs admin of platform content).
- ✅ Aligns with common B2B patterns (Organization/Tenant + Membership).

### Negative

- ⚠️ Large migration: therapistId is currently the isolation boundary across many modules; migrating to clinic scoping requires touching many queries and tests.
- ⚠️ Increased security risk if tenant scoping is missed in any endpoint (classic broken tenant isolation).
- ⚠️ Requires a secure bootstrap story for the first clinic owner/admin (setup).

### Mitigation

- Enforce tenant scoping systematically and deny-by-default.
- Prefer tenant-scoped lookups using composite constraints (tenantId + resourceId) where possible.
- Add tests specifically for cross-tenant isolation ("cannot access other clinic") before scaling.

---

## Alternatives Considered

### Option A: Keep therapist-as-tenant forever (Rejected for clinic roadmap)

- Works for single practitioner.
- Becomes painful for patient sharing (requires ad-hoc share tables, complex rules, and repeated retrofits).

### Option B: Add global `ADMIN` user and keep therapist isolation (Rejected)

- Creates ambiguous permissions (admin of what?).
- Does not solve the clinic patient sharing requirement.

### Option C: First-user-becomes-admin bootstrap (Rejected)

- Commonly unsafe if the app is reachable at first boot (race-to-admin).
- Better handled via controlled bootstrap (CLI/setup) once clinic model is adopted.

---

## References

- OWASP Multi-Tenant Security Cheat Sheet (tenant isolation pitfalls and guidance):
  - https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html
- OWASP Authorization Cheat Sheet (multi-tenancy, RBAC limits, deny-by-default, server-side enforcement):
  - https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- Codebase evidence for current therapist-scoped isolation:
  - `apps/server/src/modules/patients/patients.service.ts`
  - `apps/server/src/modules/clinical-cases/clinical-cases.service.ts`
  - `apps/server/src/modules/ai-analysis/services/data-aggregation.service.ts`
