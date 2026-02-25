# Task Breakdown: Therapist Onboarding

## Overview

Total Tasks: 5 major task groups covering database, backend, and frontend

## Task List

### Database Layer

#### Task Group 1: User Model Extension

**Dependencies:** None

- [x] 1.0 Complete database layer for profile nudge tracking
  - [x] 1.1 Add migration for `profileNudgeDismissed` field
    - Add `profileNudgeDismissed` boolean field to `User` model, default `false`
    - Follow pattern from existing User model fields in `apps/server/prisma/schema.prisma`
  - [x] 1.2 Update Prisma schema
    - Field: `profileNudgeDismissed Boolean @default(false)`
    - No indexes needed (read on every dashboard load, small table)
  - [x] 1.3 Generate and apply migration
    - `npx prisma migrate dev --name add_profile_nudge_dismissed`
    - Verify migration runs successfully locally

**Acceptance Criteria:**

- Migration runs successfully without errors
- `profileNudgeDismissed` field exists in User table
- Default value is `false` for existing users

### Backend Layer

#### Task Group 2: Email Service Integration

**Dependencies:** None (can run in parallel with Task Group 1)

- [x] 2.0 Complete email service layer
  - [x] 2.1 Write 2-4 focused tests for EmailService
    - Test: `sendInvitationEmail` calls Resend SDK with correct parameters
    - Test: graceful degradation when `RESEND_API_KEY` is absent (logs to console)
    - Test: error handling when Resend API fails (throws appropriate exception)
  - [x] 2.2 Install `resend` npm package in server app
    - `pnpm add resend` in `apps/server`
    - No additional packages needed (single dependency)
  - [x] 2.3 Create EmailModule and EmailService
    - Path: `apps/server/src/modules/email/`
    - Structure follows existing modules (see `onboarding/` pattern)
    - `EmailService.sendInvitationEmail(to, clinicName, inviteUrl, role): Promise<void>`
    - Use Resend SDK: `new Resend(process.env.RESEND_API_KEY)`
    - Plain text email body: "Has sido invitado a unirte a {clinicName} como {role}. Acepta tu invitacion aqui: {inviteUrl}. Este enlace expira en 24 horas."
  - [x] 2.4 Add `RESEND_API_KEY` to environment
    - Update `.env.example` with placeholder
    - Add to deployment docs if needed
    - Console fallback when absent: `console.log('[Email] Would send invitation:', {to, inviteUrl})`
  - [x] 2.5 Update `inviteTherapist()` to send emails
    - Inject `EmailService` into `ClinicsService`
    - After creating `ClinicInvitation` record, call `emailService.sendInvitationEmail()`
    - Pass: invitation.email, clinic.name, full inviteUrl with domain, invitation.role
    - Wrap in try/catch so email failure doesn't fail the API call (graceful degradation)
  - [x] 2.6 Run EmailService tests
    - Run ONLY the 2-4 tests written in 2.1
    - All tests pass

**Acceptance Criteria:**

- The 2-4 tests written in 2.1 pass
- EmailService can be injected into other services
- When RESEND_API_KEY is present, emails are sent via Resend API
- When RESEND_API_KEY is absent, invite URL is logged to console
- `inviteTherapist()` endpoint calls email service after creating invitation

#### Task Group 3: Invitation Management API

**Dependencies:** Task Group 1 (User model changes if overlapping, but mostly independent)

- [x] 3.0 Complete invitation management endpoints
  - [x] 3.1 Write 2-4 focused tests for invitation endpoints
    - Test: `GET /clinics/:id/invitations` returns invitations sorted by `createdAt` desc
    - Test: endpoint returns correct status badges (Accepted/Pending/Expired) based on `usedAt` and `expiresAt`
    - Test: endpoint is protected by ClinicRolesGuard (only CLINIC_OWNER/ADMIN)
  - [x] 3.2 Create `GET /clinics/:clinicId/invitations` endpoint
    - Path: add to `ClinicsController`
    - Guard: `JwtAuthGuard` + `ClinicRolesGuard` with `@Roles(ROLES.CLINIC_OWNER, ROLES.ADMIN)`
    - Service method: `clinicsService.listInvitations(clinicId)`
    - Returns: array with fields: id, email, role, createdAt, usedAt, expiresAt, status (computed)
    - Sort: `createdAt` descending (newest first)
  - [x] 3.3 Update `PATCH /users/me` endpoint for profile nudge dismissal
    - Extend existing endpoint to accept `profileNudgeDismissed?: boolean` in body
    - Update `UpdateUserDto` with optional boolean field
    - Service method should update user record and return updated user
  - [x] 3.4 Run invitation management tests
    - Run ONLY the 2-4 tests written in 3.1
    - All tests pass

**Acceptance Criteria:**

- The 2-4 tests written in 3.1 pass
- `GET /clinics/:id/invitations` returns invitations with computed status
- `PATCH /users/me` accepts and persists `profileNudgeDismissed`
- Endpoints are properly protected by authentication and role guards

### Frontend Layer

#### Task Group 4: Invitation Dialog & Management

**Dependencies:** Task Group 3 (backend endpoints)

- [x] 4.0 Complete invitation dialog and management UI
  - [x] 4.1 Write 2-4 focused tests for InviteTherapistDialog
    - Test: clicking submit creates invitation and shows inviteUrl
    - Test: "Copiar enlace" button copies URL to clipboard
    - Test: dialog shows success state with copy-link button
  - [x] 4.2 Update `InviteTherapistDialog` with copy-link fallback
    - Add local state: `inviteResult: { inviteUrl: string } | null`
    - After successful submit, store result instead of immediately closing
    - Show inviteUrl in a read-only input field with "Copiar enlace" button
    - Copy button uses `navigator.clipboard.writeText(inviteUrl)`
    - Show toast: "Enlace copiado" using existing toast system (or alert if none exists)
    - Add "Cerrar" button to dismiss dialog after copying
    - Reuse: Dialog, Input, Button from shadcn/ui (already imported)
  - [x] 4.3 Add invitation management table to `ClinicDashboard`
    - Create `InvitationList.tsx` component (follow `TherapistList.tsx` pattern)
    - Add to `clinicsApi`: `listInvitations(clinicId)` method calling `GET /clinics/:id/invitations`
    - Add new Card section in `ClinicDashboard.tsx` between therapist list and settings
    - Table columns: Email, Role (Badge), Estado (Badge: green Aceptada/yellow Pendiente/red Expirada), Enviado (formatted date), Accion
    - "Reenviar" button on Pending/Expired rows — calls `clinicsApi.inviteTherapist()` with same email/role
    - Reload table data after resend
    - Empty state: "No hay invitaciones enviadas"
  - [x] 4.4 Run invitation dialog tests
    - Run ONLY the 2-4 tests written in 4.1
    - All tests pass

**Acceptance Criteria:**

- The 2-4 tests written in 4.1 pass
- InviteTherapistDialog shows inviteUrl with copy button after successful invite
- InvitationList displays all invitations with correct status badges
- "Reenviar" button creates new invitation for expired/pending entries
- Components match existing styling patterns (cards, tables, badges)

#### Task Group 5: Invitation Acceptance & Welcome Flow

**Dependencies:** Task Group 3 (backend endpoints)

- [x] 5.0 Complete invitation acceptance polish and welcome flow
  - [x] 5.1 Write 2-4 focused tests for upgraded InvitationAcceptance
    - Test: loading state shown while fetching invitation
    - Test: error screen shown for expired token
    - Test: error screen shown for used token
    - Test: form submits and navigates to success page on acceptance
  - [x] 5.2 Polish `InvitationAcceptance.tsx`
    - Layout: `min-h-screen bg-gradient-to-br from-primary/5 to-background`, centered Card `max-w-[520px]`
    - Add loading skeleton while `clinicsApi.getInvitation(token)` resolves (use `Loader2` spinner)
    - Header: "Te invitamos a unirte a **{clinicName}** como **{role}**"
    - Form fields follow `Onboarding.tsx` pattern:
      - Name input: `h-12 text-lg`, required
      - Email: pre-filled from invitation, disabled
      - Password: `h-12 text-lg`, min 6 chars helper text
      - Confirm password: validation error if mismatch
      - License number: optional, `h-12 text-lg`
    - Submit button: "Crear cuenta y entrar" with loading state
    - Error states: `bg-destructive/10` alert for API errors
    - Reuse: Card, Input, Button from shadcn/ui; `useAuth` for login after acceptance
  - [x] 5.3 Add error-specific screens in InvitationAcceptance
    - Parse error response: check `error.message` or status code
    - Expired state: `CircleX` icon + "Esta invitacion ha expirado" + "Solicita una nueva invitacion al dueno de la clinica"
    - Used state: `CheckCircle` icon + "Esta invitacion ya fue utilizada" + button linking to `/login`
    - Invalid state: `AlertCircle` icon + "Invitacion no valida" + "Contacta con tu clinica"
    - Use same centered card layout for all error screens
    - All CTAs are keyboard-accessible buttons with visible focus rings
  - [x] 5.4 Create `/invite/success` welcome page
    - New file: `apps/client/src/pages/InvitationSuccess.tsx`
    - Follow `OnboardingSuccess.tsx` pattern exactly:
      - Gradient background, centered Card `max-w-[600px]`
      - Green checkmark in circle icon (`CheckCircle`)
      - Title: "Bienvenido a [Clinic Name]!" (from `useLocation().state.clinicName`)
      - Subtitle: "Tu cuenta ha sido creada. Ya formas parte del equipo."
      - Three quick action cards: Completar mi perfil → `/perfil`, Ver pacientes → `/pacientes`, Ir al panel → `/`
      - "Ir al Panel de Control" primary button
    - Add route in `App.tsx`: `/invite/success` → `InvitationSuccess`
  - [x] 5.5 Update acceptance flow to navigate to success page
    - After successful `clinicsApi.acceptInvitation()`, navigate to `/invite/success`
    - Pass `clinicName` via `navigate('/invite/success', { state: { clinicName } })`
    - Same pattern as `Onboarding.tsx` success navigation
  - [x] 5.6 Add profile nudge banner to dashboard
    - Create `ProfileNudgeBanner.tsx` component
    - Check user: `user.role === 'THERAPIST' && !user.profileNudgeDismissed`
    - Banner style: `bg-primary/10` or similar accent background, dismissible with X button
    - Text: "Completa tu perfil — Anade tu numero de licencia y especializacion"
    - Link: "Completar" navigates to `/perfil`
    - Dismiss calls `PATCH /users/me` with `{ profileNudgeDismissed: true }`
    - Add to dashboard layout (top of main content area, below header)
  - [x] 5.7 Update AuthContext with profileNudgeDismissed
    - Extend `User` type to include `profileNudgeDismissed?: boolean`
    - Update `useAuth` hook to include the field in user state
  - [x] 5.8 Run invitation acceptance tests
    - Run ONLY the 2-4 tests written in 5.1
    - All tests pass

**Acceptance Criteria:**

- The 2-4 tests written in 5.1 pass
- InvitationAcceptance matches Onboarding.tsx visual quality
- Error screens differentiate expired/used/invalid tokens with appropriate CTAs
- Welcome page at `/invite/success` displays with clinic name and quick actions
- Profile nudge banner shows for new therapists and can be dismissed

### Testing

#### Task Group 6: Integration Testing & Gap Analysis

**Dependencies:** Task Groups 1-5

- [x] 6.0 Review and fill critical testing gaps
  - [x] 6.1 Review existing tests from Task Groups 1-5
    - EmailService tests (Task 2.1)
    - Invitation endpoint tests (Task 3.1)
    - Invite dialog tests (Task 4.1)
    - Invitation acceptance tests (Task 5.1)
    - Total existing: approximately 8-16 tests
  - [x] 6.2 Identify integration test gaps
    - Critical gap: End-to-end invitation flow (invite → email sent → accept → welcome)
    - Critical gap: Invitation management (resend expired invitation)
    - Critical gap: Profile nudge dismissal persists across sessions
  - [x] 6.3 Write up to 6 additional strategic integration tests
    - Test: Full invitation flow — clinic owner invites, email is sent (or logged), therapist accepts, welcome screen shown
    - Test: Resend invitation — expired invitation can be resent with new token
    - Test: Profile nudge — dismissed flag persists after page refresh
    - Skip edge cases, performance, and accessibility unless business-critical
  - [x] 6.4 Run all feature-specific tests
    - Run tests from: EmailService, invitation endpoints, invite dialog, invitation acceptance, new integration tests
    - Expected total: approximately 14-22 tests maximum
    - All tests must pass

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 14-22 tests total)
- Critical user workflows for therapist onboarding are covered
- No more than 6 additional tests added
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:

1. **Task Group 1** (Database) — Add `profileNudgeDismissed` field
2. **Task Group 2** (Backend) — Email service and sending
3. **Task Group 3** (Backend) — Invitation management endpoints
4. **Task Group 4** (Frontend) — Invitation dialog and management table
5. **Task Group 5** (Frontend) — Acceptance page polish and welcome flow
6. **Task Group 6** (Testing) — Integration tests and gap analysis

**Notes on Parallel Execution:**

- Task Groups 1 and 2 can run in parallel initially
- Task Group 3 requires Task Group 1 (User model changes)
- Task Groups 4 and 5 require Task Group 3 (backend endpoints)
- Task Group 6 requires all previous groups
