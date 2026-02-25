# Specification: Therapist Onboarding

## Goal

Implement the full therapist invitation lifecycle — from a clinic owner sending an email invitation, through the therapist accepting and creating their account, to their first-run experience inside the app — including invitation management for clinic owners.

## User Stories

- As a **CLINIC_OWNER**, I want to invite therapists by email and track invitation status so that I can grow my team and know who has joined.
- As a **THERAPIST** receiving an invitation, I want a polished, branded acceptance page with clear error handling so that I can create my account and start working immediately.
- As a **THERAPIST** joining for the first time, I want a brief welcome and a gentle nudge to complete my profile so that I know I'm set up correctly without being blocked by forms.

## Specific Requirements

**Resend Email Integration**

- Add `resend` npm package to the server app for API-based email delivery (no SMTP config required)
- Create `EmailModule` and `EmailService` in NestJS following existing module patterns (`apps/server/src/modules/email/`)
- `EmailService` exposes a `sendInvitationEmail(to, clinicName, inviteUrl, role)` method
- `RESEND_API_KEY` environment variable required; when absent, log the invite URL to console instead of failing (graceful degradation for local dev)
- Plain text email body with clinic name, role, and invite link — no rich HTML templates
- Call `emailService.sendInvitationEmail()` from `clinicsService.inviteTherapist()` after creating the `ClinicInvitation` record

**Copy-Link Fallback in Invite Dialog**

- After `inviteTherapist()` succeeds, the dialog should display the `inviteUrl` returned by the API
- Add a "Copiar enlace" button that copies the URL to clipboard using `navigator.clipboard.writeText()`
- Show a brief toast/confirmation ("Enlace copiado") on successful copy
- The dialog stays open after invite so the user can copy the link before dismissing

**Polished Invitation Acceptance Page**

- Upgrade `InvitationAcceptance.tsx` to match the visual quality of `Onboarding.tsx`
- Use the same layout: `min-h-screen bg-gradient-to-br from-primary/5 to-background`, centered `Card` with `max-w-[520px]`, `shadow-lg`
- Use `h-12 text-lg` input sizing, `space-y-4` field spacing, `text-sm font-medium` labels
- Show a loading skeleton while `GET /auth/invite/:token` resolves
- Display clinic name prominently in the card header: "Te invitamos a unirte a **[Clinic Name]**"
- Add password strength indicator (reuse pattern from `Onboarding.tsx` — min 6 chars helper text)
- Add optional license number field (`adminLicenseNumber` pattern from onboarding)
- Email field pre-filled and disabled (from invitation data)

**Error-Specific Screens**

- Parse backend error responses to differentiate: expired (`ForbiddenException('Invitation expired')`), already used (`ForbiddenException('Invitation already used')`), and not found (`NotFoundException`)
- Expired: icon + "Esta invitacion ha expirado" + CTA "Solicita una nueva invitacion al dueno de la clinica"
- Already used: icon + "Esta invitacion ya fue utilizada" + CTA button linking to `/login`
- Not found / invalid: icon + "Invitacion no valida" + CTA "Contacta con tu clinica"
- Error screens use the same centered card layout as the acceptance form
- All interactive elements must be keyboard-accessible with visible focus indicators

**Therapist Welcome Screen**

- New page at `/invite/success` following `OnboardingSuccess.tsx` pattern
- Same gradient background, centered card (`max-w-[600px]`), green checkmark icon
- Title: "Bienvenido a [Clinic Name]!" with subtitle "Tu cuenta ha sido creada. Ya formas parte del equipo."
- Three quick action cards in a responsive grid (`grid-cols-1 md:grid-cols-3`): "Completar mi perfil" → `/perfil`, "Ver pacientes" → `/pacientes`, "Ir al panel" → `/`
- Navigate to this page after successful `POST /auth/invite/accept` instead of `/`
- Pass `clinicName` via `useNavigate` state, same pattern as `OnboardingSuccess.tsx`

**Profile Completion Nudge**

- Add a dismissible banner component at the top of the dashboard for first-time therapists
- Banner text: "Completa tu perfil — Anade tu numero de licencia y especializacion" with "Completar" link to `/perfil` and a dismiss "X" button
- Track dismissal using a `profileNudgeDismissed` boolean field on the User model (Prisma migration)
- Show banner only when `profileNudgeDismissed` is `false` and user role is `THERAPIST`
- `PATCH /users/me` endpoint should accept `profileNudgeDismissed: true` to persist dismissal
- Do NOT gate any functionality behind profile completion — purely informational

**Invitation Management Table**

- Add a new `Card` section to `ClinicDashboard.tsx` between the therapist list and clinic settings
- New `GET /clinics/:clinicId/invitations` endpoint returning all invitations for the clinic, sorted by `createdAt` desc
- Table columns: Email, Role (Badge), Status (computed: Accepted/Pending/Expired based on `usedAt` and `expiresAt`), Sent date, Action
- Status badges: green for "Aceptada", yellow for "Pendiente", red for "Expirada"
- "Reenviar" button on pending/expired rows — calls `POST /clinics/:clinicId/invite` with the same email/role to create a new token and send a new email
- Table follows the same pattern as `TherapistList.tsx`: `overflow-x-auto rounded-lg border`, `min-w-full text-sm`, slate-colored header
- Empty state: "No hay invitaciones enviadas"

**Testing**

- Unit tests for `EmailService` (mock Resend SDK, verify `sendInvitationEmail` calls)
- Unit test for `GET /clinics/:clinicId/invitations` endpoint
- Component test for upgraded `InvitationAcceptance.tsx` covering: loading state, success render, error differentiation (expired, used, invalid)
- Focus on core user flows only; defer edge case testing per project test standards

## Visual Design

No visual mockups provided. Use existing `Onboarding.tsx` and `OnboardingSuccess.tsx` as design reference — same gradient background (`bg-gradient-to-br from-primary/5 to-background`), card sizing, input sizing (`h-12 text-lg`), button sizing (`w-full h-12 text-lg`), and spacing patterns (`space-y-4`).

## Existing Code to Leverage

**Onboarding.tsx (apps/client/src/pages/Onboarding.tsx)**

- Reuse: centered card layout (`max-w-[520px]`), gradient background, step indicator dots, input sizing (`h-12 text-lg`), label pattern (`text-sm font-medium` + `text-destructive` asterisk), password confirmation logic, error display (`bg-destructive/10`), name availability check pattern (for copy-link UX feedback)
- Reuse: `useDebounce` hook, `Loader2`/`Check`/`X` icon pattern for inline validation states

**OnboardingSuccess.tsx (apps/client/src/pages/OnboardingSuccess.tsx)**

- Reuse: welcome screen structure — green checkmark in circle, `CardTitle` with clinic name, quick action cards in `grid-cols-1 md:grid-cols-3`, "Ir al Panel" primary button (`w-full h-12 text-lg`), `useLocation` state for passing `clinicName`

**Auth Service (apps/server/src/modules/auth/auth.service.ts)**

- Already has: `acceptInvitation()` with full validation (token lookup, expiry check, used check, email match, user creation, JWT generation), `getInvitation()` returning email/role/clinicName/expiresAt
- Extend: no changes needed to acceptance logic; just need frontend to parse distinct error types

**Clinics Service (apps/server/src/modules/clinics/clinics.service.ts)**

- Already has: `inviteTherapist()` creating `ClinicInvitation` with 24h token, `validateInvitation()`, `markInvitationUsed()`
- Extend: inject `EmailService` and call `sendInvitationEmail()` after creating invitation record

**InviteTherapistDialog (apps/client/src/components/clinic/InviteTherapistDialog.tsx)**

- Already has: Dialog with email input + role selector + submit button
- Extend: after successful submit, show the returned `inviteUrl` with a copy-link button instead of immediately closing

## Out of Scope

- Rich HTML email templates (use plain text for MVP)
- Invitation quotas or rate limiting
- Multi-clinic invitations (inviting to multiple clinics at once)
- Social login for invited users (Google, etc.)
- CAPTCHA or email verification as a blocker
- Custom email sender domain (use Resend default sender)
- Bulk invitation import (CSV)
- Invitation expiry extension (resend creates a new token instead)
- Tutorial or guided tour after acceptance
- Email verification before account activation
