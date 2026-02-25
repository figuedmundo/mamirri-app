# Initialization: Therapist Onboarding

## Source

Roadmap task 9.10 — "Therapist onboarding"

## Raw Idea

Implement the therapist onboarding flow — the counterpart to the clinic-first onboarding (task 9.9). When a CLINIC_OWNER invites a therapist by email, the therapist receives an invitation link, accepts it, creates their account, and joins the clinic. This flow must handle the full lifecycle: invitation email delivery, token-based acceptance page, account creation with clinic assignment, and the therapist's first-run experience inside the app.

## Context

- Task 9.8 implemented multi-tenancy with ADMIN, CLINIC_OWNER, THERAPIST roles
- Task 9.9 implemented clinic-first onboarding (clinic creation + CLINIC_OWNER account)
- The multi-tenancy spec defines invitation workflow: generate tokens, send email, accept invitation
- The clinic-first onboarding spec references `/invite/accept` as a separate, existing flow
- Task 10.1.2 implemented a therapist profile page
