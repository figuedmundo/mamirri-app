# Spec Initialization: Clinic-First Onboarding

## Raw Idea

Replace the current user-first registration flow with a clinic-first onboarding flow that follows industry standards.

**Current Problem:**

- Users register as "therapists" first, then create a clinic
- Doctors find this confusing - they think "I'm creating a clinic, not joining a platform"
- Two separate steps with unclear role assignment

**Desired Solution:**
Implement a true clinic-first onboarding flow:

1. "Create Your Clinic" - collect clinic name, email, phone, address
2. "Create Admin Account" - collect owner name, email, password, license number
3. Create clinic and admin user together in a single transaction
4. User starts as CLINIC_OWNER, not THERAPIST

**Industry Standard Pattern:**

- Jane App, SimplePractice, Notion, Slack all use "workspace-first" approach
- Business entity created first, then owner/admin assigned
- Mental model: "Setting up my clinic" not "Joining an app"

**Technical Approach:**

- New unified API endpoint: POST /onboarding/clinic
- Creates Clinic + User (CLINIC_OWNER) in single transaction
- New frontend: 2-step wizard (Clinic Info → Admin Account)
- Redirect old /register to new /onboarding

**Scope:**

- Backend: OnboardingModule with service, controller, DTOs
- Frontend: New OnboardingPage component
- No migration needed (database can be dumped/recreated)
- Keep invitation flow separate and unchanged

**Created:** 2026-02-20
