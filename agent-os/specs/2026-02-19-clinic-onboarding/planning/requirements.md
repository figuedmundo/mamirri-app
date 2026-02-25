# Spec Requirements: Clinic Onboarding

## Initial Description

Clinic onboarding feature for the Mamirri physiotherapy app. This feature is part of the multi-tenancy capability (Task 9.9) that allows the system to support multiple clinics, where each clinic can have multiple therapists and patients.

Based on field testing feedback (Week 9), this feature addresses the need for:

- Creating and managing clinic entities during user registration
- Associating therapists with clinics
- Associating patients with clinics
- Proper data isolation between clinics
- Post-registration activation flow

This builds upon the multi-tenancy foundation established in task 9.8.

---

## Requirements Discussion

### First Round Questions

**Q1:** I assume the onboarding should happen immediately after a new therapist registers (before they can use the app), rather than having a separate "create clinic" button in settings. Is that correct, or should it be accessible from the clinic dashboard as well?

**Answer:** Immediately after registration is correct. The flow should intercept users before they reach the dashboard. However, clinic creation should ALSO be accessible from the ClinicDashboard for users who skipped initially or want to create additional clinics later.

**Q2:** I'm thinking the clinic creation form should include name, address, phone, and email fields based on the existing Clinic model. Should we also collect business hours, tax ID, or logo upload at this stage, or keep it minimal?

**Answer:** Use progressive profiling approach:

- **Step 1 (Required):** Name, email, phone (30 seconds to complete)
- **Step 2 (Optional):** Address, logo upload, business hours (can skip)
- **Deferred:** Tax ID, advanced branding (available in settings later)

**Q3:** I assume the user who creates the clinic should automatically become the CLINIC_OWNER role. Should they also be able to assign a clinic admin during onboarding, or manage that later from the dashboard?

**Answer:** Auto-assign CLINIC_OWNER. Include optional team invitation in Step 3 of wizard with role selection (Admin/Therapist). Use existing invitation system from ClinicInvitation model.

**Q4:** I'm thinking we should show a brief onboarding welcome/tutorial after clinic creation explaining key features (patients, evaluations, AI analysis). Should this be a single welcome screen or a multi-step guided tour?

**Answer:** Use a **Quick Start screen** (single view) with 3 action cards:

1. Create First Patient
2. Invite Team Member
3. Configure Settings

This is more effective than a guided tour based on SaaS onboarding research. Users can skip and explore organically.

**Q5:** I assume users who receive an invitation to join a clinic should skip the clinic creation flow entirely and go straight to the dashboard. Is that correct?

**Answer:** Correct. Invitation acceptance flow (existing InvitationAcceptance.tsx) bypasses clinic creation entirely. They join the inviting clinic automatically.

**Q6:** Should we allow users to skip clinic creation temporarily and explore the app in a "personal/solo" mode, or require clinic setup before accessing any features?

**Answer:** Allow "solo mode" with:

- Banner notification: "You're in personal mode. Set up a clinic to unlock team features →"
- Limited features: Can create patients, but no multi-user features
- Easy upgrade path: One-click clinic creation from banner

---

### Existing Code to Reference

**Similar Features Identified:**

- **Feature:** Clinic Dashboard - Path: `apps/client/src/pages/ClinicDashboard.tsx`
  - Components to potentially reuse: Card layouts, TherapistList, ClinicSettings form pattern, InviteTherapistDialog
  - Backend logic to reference: clinicsApi service methods

- **Feature:** Invitation Acceptance - Path: `apps/client/src/pages/InvitationAcceptance.tsx`
  - Components to potentially reuse: Form patterns, error handling, Card layout
  - Backend logic to reference: clinicsApi.getInvitation, clinicsApi.acceptInvitation

- **Feature:** Registration Flow - Path: `apps/client/src/pages/Register.tsx`
  - Components to potentially reuse: Form validation patterns, Input components, Button styling
  - Backend logic to reference: Auth flow integration, PinSetupModal pattern

- **Feature:** Patient Form - Path: `apps/client/src/components/patients/PatientForm.tsx`
  - Components to potentially reuse: Multi-step form patterns (if applicable), Validation with Zod
  - Backend logic to reference: Form submission patterns, Error handling

- **Database Schema:** Clinic, ClinicInvitation models
  - Path: `apps/server/prisma/schema.prisma`
  - Fields available: name, address, phone, email, isActive, createdAt, updatedAt
  - Relations: users, patients, invitations

---

### Follow-up Questions

**Follow-up 1:** Should the clinic wizard support logo upload immediately, or is text-only acceptable for MVP?

**Answer:** Include logo upload in Step 2 (optional). Use existing MinIO upload infrastructure. Show preview immediately after selection. This creates emotional investment and professional feel.

**Follow-up 2:** For the "solo mode" users who skip clinic creation, should their data be automatically migrated when they later create a clinic?

**Answer:** Yes, auto-migrate personal patients to the new clinic. Add clinicId to existing records. Show confirmation: "We've moved your X patients to [Clinic Name]".

---

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

Based on research of world-class onboarding patterns (Notion, Stripe, Figma), recommended visual approach:

- **Step Indicator:** Horizontal progress bar with 3 steps (1-2-3 with checkmarks)
- **Card-Based Layout:** White card centered on subtle background (following existing Register.tsx pattern)
- **Illustrations:** Optional - simple iconography per step (building, palette, people)
- **Quick Start Screen:** 3-column card grid with icons (patient, team, settings)
- **Color Coding:** Use existing primary color for active steps, muted gray for inactive

---

## Requirements Summary

### Functional Requirements

#### Core Onboarding Flow

- [ ] Intercept post-registration users who don't have clinicId assigned
- [ ] Present 3-step clinic creation wizard:
  - Step 1: Essentials (name*, email*, phone)
  - Step 2: Branding (address, logo upload, business hours) - skippable
  - Step 3: Team (invite first therapist with role selection) - optional
- [ ] Show progress indicator with step labels
- [ ] Allow navigation between steps (Back/Next)
- [ ] Validate each step before proceeding
- [ ] Display inline validation errors
- [ ] Show loading states during submission
- [ ] Success state with confetti/celebration

#### Solo Mode (Skip Option)

- [ ] "Set up later" button on Step 1
- [ ] Banner notification on dashboard for solo users
- [ ] One-click clinic creation from banner
- [ ] Auto-migrate personal patients when clinic is created

#### Quick Start Screen (Post-Creation)

- [ ] Display 3 action cards:
  1. "Create Your First Patient" → Navigate to patient creation
  2. "Invite Your Team" → Open invitation dialog
  3. "Configure Settings" → Navigate to ClinicDashboard settings
- [ ] Show "Skip for now →" secondary action
- [ ] Display clinic name and logo (if uploaded)

#### Dual Path Logic

- [ ] Check for invitation token on registration
- [ ] If token exists: Route to InvitationAcceptance (existing)
- [ ] If no token: Route to Clinic Onboarding Wizard
- [ ] If user has clinicId: Route to Dashboard directly

#### Form Features

- [ ] Clinic name uniqueness validation (async check)
- [ ] Logo upload with preview (MinIO integration)
- [ ] Business hours with default values (Mon-Fri 9:00-17:00)
- [ ] Email invitation with role selection (Admin/Therapist)
- [ ] Form state persistence (localStorage) to prevent data loss

### Reusability Opportunities

#### UI Components to Reuse

- `Card`, `CardHeader`, `CardContent`, `CardTitle` from `components/ui/card`
- `Button` from `components/ui/button`
- `Input` from `components/ui/input`
- `InviteTherapistDialog` pattern from `components/clinic/`
- `ClinicSettings` form structure from `components/clinic/`
- `TherapistList` display pattern

#### Backend Patterns to Follow

- `clinicsApi` service structure in `apps/client/src/api/clinics.ts`
- `useClinic` hook pattern for clinic state management
- Prisma create/update patterns from existing services
- File upload pattern from media service (for logo)

#### Existing Endpoints to Leverage

- `POST /clinics` - Create clinic
- `PATCH /clinics/:id` - Update clinic details
- `POST /clinics/:id/invite` - Invite therapist
- `GET /clinics/check-name` - Validate name availability (new)

### Scope Boundaries

**In Scope:**

- Clinic creation wizard (3 steps)
- Solo mode with banner notification
- Quick Start activation screen
- Logo upload with preview
- Team invitation in wizard
- Form state persistence
- Auto-migration from solo to clinic mode
- Progressive profiling (collect minimal upfront)
- Mobile-responsive design

**Out of Scope:**

- Tax ID collection (compliance complexity)
- Advanced branding (colors, fonts)
- Custom subdomain setup (future: white-label)
- Guided product tour (prefer Quick Start cards)
- Video onboarding
- Interactive tutorials
- Email verification during onboarding
- Payment/subscription setup (future milestone)
- Multi-location clinics (single address per clinic)
- Import from other EMR systems

**Future Enhancements (Post-MVP):**

- Subdomain reservation (clinicname.mamirri.app)
- Multi-clinic membership (user switches between clinics)
- White-label branding settings
- Advanced team permissions (custom roles)
- Clinic templates (specialty-specific defaults)
- Bulk team import (CSV)

### Technical Considerations

#### Integration Points

- **Auth Context:** Hook into post-registration redirect logic
- **Clinic Context:** Update useClinic hook after creation
- **Router:** Add `/onboarding/clinic` route
- **API:** Extend clinicsApi with check-name endpoint
- **Storage:** Reuse MinIO upload service for logos

#### Existing System Constraints

- Clinic model already has all required fields in Prisma schema
- User.clinicId relation exists but nullable (supports solo mode)
- Invitation system already built (ClinicInvitation model)
- File upload infrastructure exists (MinIO)

#### Technology Preferences

- **Form Management:** React Hook Form + Zod validation (consistent with existing forms)
- **State Management:** React Context for wizard state (lightweight, no Redux needed)
- **Animations:** Framer Motion for step transitions (if not already installed, use CSS)
- **Image Handling:** Existing MinIO service with preview

#### Similar Code Patterns to Follow

- Register.tsx form structure and validation
- ClinicDashboard.tsx card layouts and API calls
- InvitationAcceptance.tsx flow and error handling
- PatientForm.tsx multi-step patterns (if applicable)

#### Database Changes Required

```sql
-- Add logoUrl field to Clinic model (optional)
ALTER TABLE clinics ADD COLUMN logo_url VARCHAR(255);

-- Add subdomain field for future white-label
ALTER TABLE clinics ADD COLUMN subdomain VARCHAR(100) UNIQUE;

-- Index for faster name lookups
CREATE INDEX idx_clinics_name ON clinics(name);
```

#### New API Endpoints Needed

```typescript
// Check clinic name availability
GET /clinics/check-name?name={name}
Response: { available: boolean }

// Upload clinic logo (reuse existing media endpoint)
POST /media/upload

// Create clinic with full data
POST /clinics
Body: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  businessHours?: Json;
  initialInvitations?: Array<{ email: string; role: string }>;
}
```

### Success Metrics

Based on SaaS onboarding best practices:

1. **Wizard Completion Rate:** > 75% (benchmark: Stripe, Notion)
2. **Time to Complete:** < 2 minutes for required steps
3. **Skip Rate:** < 30% (indicates friction if higher)
4. **Time to First Patient:** < 5 minutes from registration
5. **7-Day Retention:** Track if onboarded users return vs solo mode
6. **Invitation Acceptance:** % of invites sent during onboarding that are accepted

---

## Research References

### SaaS Onboarding Best Practices 2026

- Userflow: "What Great Onboarding Flows Have in Common"
- Formbricks: "7 User Onboarding Best Practices for 2026"
- Orbit AI: "Progressive Form Fields: Complete Guide"
- Chameleon: "12 Strategies to optimize SaaS user onboarding"

### Healthcare EMR Patterns

- Athenahealth: "EHR onboarding that starts with your success"
- ABIG Health: "Streamlining Onboarding for Healthcare Providers"
- ReferralMD: "The Future of Patient Onboarding"

### Multi-Tenancy Architecture

- AWS SaaS Lens: "Tenant Onboarding Best Practices"
- Medplum: "Multi-Tenant Access Control for Healthcare"
- Qrvey: "Multi-Tenant Deployment 2026 Guide"

### World-Class Examples Analyzed

- **Notion:** Personalized template selection post-onboarding
- **Stripe:** Role-based onboarding flows, progressive disclosure
- **Figma:** Visual progress indicators, contextual tooltips
- **Slack:** Team invitation during workspace creation

---

_Requirements documented: 2026-02-19_  
_Ready for spec creation_
