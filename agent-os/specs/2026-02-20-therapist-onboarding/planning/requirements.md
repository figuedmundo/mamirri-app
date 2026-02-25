# Spec Requirements: Therapist Onboarding

## Initial Description

Implement the therapist onboarding flow — the counterpart to the clinic-first onboarding (task 9.9). When a CLINIC_OWNER invites a therapist by email, the therapist receives an invitation link, accepts it, creates their account, and joins the clinic. This flow must handle the full lifecycle: invitation email delivery, token-based acceptance page, account creation with clinic assignment, and the therapist's first-run experience inside the app.

## Requirements Discussion

### First Round Questions

**Q1:** Email delivery — The current backend generates an `inviteUrl` but never actually sends an email. Should we add an email service so invitation emails are sent automatically, or should the clinic owner continue manually copying/sharing the link for now (MVP approach)?
**Answer:** Hybrid approach: Add Resend as email provider (free tier: 100 emails/day) for automatic delivery. Also keep a "Copy link" button in the invite dialog as fallback. Resend chosen over nodemailer/SendGrid for simplicity (single npm package, no SMTP config, 5-line API).

**Q2:** Invitation acceptance page polish — The current `InvitationAcceptance.tsx` is very minimal. Should we bring it up to the same quality level as the clinic-first onboarding?
**Answer:** Yes, match `/onboarding` quality. Same centered card layout, gradient background, shadow-lg, input sizing (h-12 text-lg), loading skeleton while validating token, clinic name prominently displayed, password strength indicator, optional license number field.

**Q3:** Error differentiation — Currently all invitation errors show generic Spanish error text. Should we implement specific error screens for expired, used, and invalid tokens?
**Answer:** Yes, 3 specific error screens:

- Expired: "Esta invitación ha expirado" → CTA: "Solicita una nueva invitación al dueño de la clínica"
- Already used: "Esta invitación ya fue utilizada" → CTA: "Ir a Iniciar Sesión" (link to `/login`)
- Not found / Invalid: "Invitación no válida" → CTA: "Contacta con tu clínica"
  Backend already returns distinct exceptions (`NotFoundException`, `ForbiddenException('Invitation expired')`, `ForbiddenException('Invitation already used')`).

**Q4:** Post-acceptance flow — After accepting, the therapist currently goes straight to `/`. Should we add a welcome screen?
**Answer:** Yes, brief welcome screen with quick actions (not a multi-step wizard):

- "¡Bienvenido a [Clinic Name]! Tu cuenta ha sido creada. Ya formas parte del equipo."
- Quick action cards: "Completar mi perfil", "Ver pacientes", "Ir al panel"
- Therapist wants to start working, not fill more forms.

**Q5:** Profile completion — Should the post-invitation flow prompt the therapist to fill out their profile before reaching the dashboard?
**Answer:** Soft prompt, not required. Show a dismissible banner on the dashboard after first login:

- "📝 Completa tu perfil — Añade tu número de licencia y especialización. [Completar →] [✕]"
- Store a flag on the user to track dismissal (`profileCompleted` or `onboardingDismissed`)
- Do NOT gate access behind mandatory profile completion.

**Q6:** Invitation management for clinic owners — Should this spec include an invitation list/table in the clinic dashboard?
**Answer:** Yes, include basic invitation management. Add an invitation status table to the clinic dashboard showing: email, role, status (Accepted/Pending/Expired), sent date, and a "Reenviar" (Resend) button for expired/pending invitations. The backend already has `ClinicInvitation` records with `usedAt` and `expiresAt`. Needs a new `GET /clinics/:id/invitations` endpoint and frontend table.

**Q7:** Explicit exclusions from this spec?
**Answer:** Out of scope:

- Rich HTML email templates (plain text with clear formatting is fine for MVP)
- Invitation quotas or rate limiting
- Multi-clinic invitations (inviting to multiple clinics at once)
- Social login for invited users
- CAPTCHA or email verification as a blocker
- Custom email sender domain (use Resend default sender)
- Bulk invitation import (CSV)
- Invitation expiry extension (just resend creates new token)
- Tutorial or guided tour after acceptance (welcome screen + profile nudge is enough)

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Clinic-First Onboarding — Path: `apps/client/src/pages/Onboarding.tsx`
  - Reuse: Form layout, styling, step indicator, centered card pattern, gradient background, input sizing
- Feature: Onboarding Success Screen — Path: `apps/client/src/pages/OnboardingSuccess.tsx`
  - Reuse: Welcome screen layout with quick action cards
- Feature: Auth Service (Invitation Logic) — Path: `apps/server/src/modules/auth/auth.service.ts`
  - Reuse: `acceptInvitation()` and `getInvitation()` methods (already implemented)
- Feature: Clinics Service (Invite Creation) — Path: `apps/server/src/modules/clinics/clinics.service.ts`
  - Reuse: `inviteTherapist()` method (already implemented, needs email sending added)
- Feature: Existing Invitation Page — Path: `apps/client/src/pages/InvitationAcceptance.tsx`
  - Reuse: Base structure to upgrade (not rewrite from scratch)
- Feature: Clinic Dashboard — Path: `apps/client/src/pages/ClinicDashboard.tsx`
  - Reuse: Already has invite dialog, extend with invitation status table
- Feature: Accept Invite DTO — Path: `apps/server/src/modules/auth/dto/accept-invite.dto.ts`
  - Reuse: Existing validation (token, email, name, password with min 6 chars)
- Feature: ClinicInvitation Schema — Path: `apps/server/prisma/schema.prisma` (line 90-107)
  - Reuse: Model already exists with token, role, clinicId, expiresAt, usedAt, indexes

### Follow-up Questions

No follow-up questions needed — all answers were comprehensive.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A — use existing onboarding page patterns for design reference.

## Requirements Summary

### Functional Requirements

- **Email Delivery:** Integrate Resend email provider to automatically send invitation emails when clinic owner invites a therapist. Include "Copy link" fallback button in invite dialog.
- **Polished Acceptance Page:** Upgrade `InvitationAcceptance.tsx` to match `/onboarding` visual quality — loading skeleton, clinic branding, password strength indicator, optional license field, responsive design.
- **Error Differentiation:** Three specific error screens (expired, used, invalid) with contextual CTAs instead of generic error messages.
- **Welcome Screen:** Brief post-acceptance success page showing clinic name, confirmation message, and quick action cards (complete profile, view patients, go to dashboard).
- **Profile Nudge:** Dismissible dashboard banner prompting therapist to complete their profile. Tracks dismissal state per user.
- **Invitation Management:** Status table in clinic dashboard showing all invitations (pending/accepted/expired) with resend capability for clinic owners.
- **Resend Invitation:** Backend endpoint and frontend button to create a new invitation token and send a new email for expired/pending invitations.

### Reusability Opportunities

- `Onboarding.tsx` layout and styling patterns (centered card, gradient, input sizing)
- `OnboardingSuccess.tsx` quick action card pattern
- `auth.service.ts` already has full `acceptInvitation()` and `getInvitation()` logic
- `clinics.service.ts` already has `inviteTherapist()` logic (just needs email sending)
- `ClinicInvitation` Prisma model already exists with all required fields
- `AcceptInviteDto` already has server-side validation
- `ClinicDashboard.tsx` already has invite dialog integration point

### Scope Boundaries

**In Scope:**

- Resend email integration (npm package + service module)
- Invitation email sending on `POST /clinics/:clinicId/invite`
- Copy-link fallback in invite dialog
- Upgraded `InvitationAcceptance.tsx` with full polish
- Error-specific screens for expired/used/invalid tokens
- Post-acceptance welcome screen with quick actions
- Dismissible profile completion banner on dashboard
- Invitation management table in clinic dashboard
- `GET /clinics/:id/invitations` endpoint
- Resend invitation endpoint/button
- Unit tests for new email service and endpoints
- Component tests for upgraded invitation acceptance page

**Out of Scope:**

- Rich HTML email templates (plain text for MVP)
- Invitation quotas or rate limiting
- Multi-clinic invitations
- Social login for invited users
- CAPTCHA or email verification as a blocker
- Custom email sender domain
- Bulk invitation import (CSV)
- Invitation expiry extension (resend creates new token)
- Tutorial or guided tour after acceptance
- Email verification before account activation

### Technical Considerations

- **Email Provider:** Resend (free tier: 100 emails/day, single npm package)
- **No SMTP Config:** Resend uses API-based delivery, avoids SMTP issues on home lab
- **Existing Backend:** Core invitation logic already implemented in auth and clinics services
- **Existing Frontend:** Route `/invite/accept` already exists with basic component
- **Database:** `ClinicInvitation` model already exists, no schema changes needed
- **Token Expiry:** 24-hour tokens already implemented
- **Distinct Errors:** Backend already returns typed exceptions, frontend needs to parse them
- **User Flag:** Need a mechanism (DB field or localStorage) to track profile nudge dismissal
- **Resend Integration:** New `EmailModule` / `EmailService` in NestJS with Resend SDK
- **Environment Variable:** `RESEND_API_KEY` needed in `.env`
