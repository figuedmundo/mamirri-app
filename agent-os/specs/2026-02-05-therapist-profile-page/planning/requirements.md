# Spec Requirements: Therapist Profile Page

## Initial Description

From roadmap task **10.1.2**: "Therapist wants a profile page where they can update personal details"

The therapist (primary user - physiotherapist) needs a dedicated profile page to manage their personal and professional information. This is separate from the Settings page (Ajustes) which handles app configuration like cache, language, and AI preferences.

---

## Requirements Discussion

### First Round Questions

**Q1:** I assume the profile page should be a section within the existing Ajustes (Settings) page, not a completely separate page. Is that correct, or would you prefer a standalone `/perfil` route?

**Answer:** Profile and Settings are different things. We need a **separate Profile page** (`/perfil` route), not within Ajustes.

**Q2:** For personal details, should we add optional fields beyond name and email (phone, clinic name, license number, profile photo)?

**Answer:** Yes, suggest and explain all relevant fields. See recommended fields below.

**Q3:** For password management, do we need change password and PIN management?

**Answer:** Yes (implied by "update personal details" - security is part of personal account management).

**Q4:** For security when changing email, should we require verification?

**Answer:** No email verification required for MVP. Keep it simple - direct update allowed.

**Q5:** Should UI language remain Spanish?

**Answer:** Yes, all Spanish consistent with the rest of the app.

**Q6:** Anything to explicitly exclude?

**Answer:** Not specified. Following MVP scope - core profile fields only.

---

## Recommended Profile Fields

Based on the physiotherapy domain and professional requirements, here are the suggested fields organized by section:

### Section 1: Información Personal (Personal Information)

| Field                  | Type  | Required | Current State    | Rationale                                                 |
| ---------------------- | ----- | -------- | ---------------- | --------------------------------------------------------- |
| **Nombre completo**    | Text  | Yes      | Exists (`name`)  | Display name shown in app header, patient records         |
| **Correo electrónico** | Email | Yes      | Exists (`email`) | Login credential and contact                              |
| **Teléfono**           | Phone | No       | **NEW**          | Contact for patients/emergencies, shown on reports        |
| **Foto de perfil**     | Image | No       | **NEW**          | Professional presence, helps patients recognize therapist |

### Section 2: Información Profesional (Professional Information)

| Field                   | Type        | Required | Current State | Rationale                                                                       |
| ----------------------- | ----------- | -------- | ------------- | ------------------------------------------------------------------------------- |
| **Nombre de clínica**   | Text        | No       | **NEW**       | Appears on patient reports, PDF exports                                         |
| **Número de colegiado** | Text        | No       | **NEW**       | Professional license number - legal requirement in Spain for official documents |
| **Especialidad**        | Text/Select | No       | **NEW**       | e.g., "Fisioterapia Deportiva", "Fisioterapia Neurológica" - adds credibility   |
| **Años de experiencia** | Number      | No       | **NEW**       | Professional context                                                            |

### Section 3: Seguridad (Security)

| Field                    | Type   | Required | Current State  | Rationale                                       |
| ------------------------ | ------ | -------- | -------------- | ----------------------------------------------- |
| **Cambiar contraseña**   | Action | N/A      | **NEW**        | Standard security feature                       |
| **PIN de acceso rápido** | Action | N/A      | Exists (modal) | Already implemented, link to existing PIN setup |

### Section 4: Información de la Cuenta (Account Information) - Read Only

| Field                 | Type | Required  | Current State        | Rationale            |
| --------------------- | ---- | --------- | -------------------- | -------------------- |
| **Fecha de registro** | Date | Read-only | Exists (`createdAt`) | Account transparency |
| **Rol**               | Text | Read-only | Exists (`role`)      | Shows "Terapeuta"    |

---

## Existing Code to Reference

**Similar Features Identified:**

Based on codebase exploration:

- **Form patterns**: `apps/client/src/pages/CreatePatientPage.tsx` - Multi-section form with validation
- **Auth context**: `apps/client/src/context/AuthProvider.tsx` - User state management, will need `updateUser` method
- **PIN modal**: `apps/client/src/components/auth/PinSetupModal.tsx` - Existing security UI
- **Settings page layout**: `apps/client/src/pages/Ajustes.tsx` - Card-based section layout pattern
- **Backend auth module**: `apps/server/src/modules/auth/` - Will need to add profile update endpoints or create Users module

---

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - Will follow existing app design patterns (Shadcn/UI, card-based layouts, Spanish labels).

---

## Requirements Summary

### Functional Requirements

**Core Functionality:**

- View current profile information
- Edit personal details (name, email, phone)
- Edit professional details (clinic, license number, specialty, years of experience)
- Upload/change profile photo
- Change password (requires current password)
- Access PIN management (existing modal)
- View read-only account information (registration date, role)

**User Actions:**

- Navigate to `/perfil` from main navigation or user menu
- Edit fields inline or via edit mode
- Save changes with success/error feedback
- Cancel edits and revert to saved state

**Data Management:**

- Persist all profile fields to User model in database
- Update AuthContext with new user data after save
- Store profile photo in MinIO (existing storage infrastructure)

### Database Schema Changes

New fields to add to `User` model in `prisma/schema.prisma`:

```prisma
model User {
  // Existing fields...
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         String   @default("THERAPIST")
  createdAt    DateTime @default(now())
  pinHash      String?

  // NEW profile fields
  phone           String?   // Teléfono
  profilePhotoUrl String?   // URL to MinIO stored image
  clinicName      String?   // Nombre de clínica
  licenseNumber   String?   // Número de colegiado
  specialty       String?   // Especialidad
  yearsExperience Int?      // Años de experiencia

  // Relations...
}
```

### API Endpoints

**New endpoints needed:**

| Method   | Endpoint             | Description                                 |
| -------- | -------------------- | ------------------------------------------- |
| `GET`    | `/users/me`          | Get current user's full profile             |
| `PATCH`  | `/users/me`          | Update profile fields                       |
| `POST`   | `/users/me/photo`    | Upload profile photo                        |
| `DELETE` | `/users/me/photo`    | Remove profile photo                        |
| `PATCH`  | `/users/me/password` | Change password (requires current password) |

### Reusability Opportunities

- **Form components**: Reuse Input, Button, Card from Shadcn/UI
- **Photo upload**: Reuse existing MinIO upload service from media module
- **Toast notifications**: Reuse existing toast pattern for success/error feedback
- **Auth patterns**: Extend AuthProvider with profile update capability

### Scope Boundaries

**In Scope:**

- Separate `/perfil` route and page component
- All fields listed in sections above
- Profile photo upload
- Password change functionality
- Link to existing PIN management
- Spanish UI labels
- Mobile-responsive design
- Form validation (client + server side)

**Out of Scope (Future/Post-MVP):**

- Email verification on change
- Two-factor authentication
- Multiple clinic locations
- Social login connections
- Account deletion
- Export personal data (GDPR)
- Notification preferences
- AI/voice preferences (stays in Ajustes)

### Technical Considerations

- **Validation**: Email format, phone format (Spanish), password strength
- **Security**: Current password required for password change, JWT auth for all profile endpoints
- **Storage**: Profile photos stored in MinIO with user-specific path
- **Performance**: Lazy load profile photo, debounce form saves if auto-save
- **Offline**: Profile data cached locally for offline viewing (read-only offline)

### UI/UX Considerations

- **Layout**: Card-based sections matching Ajustes page style
- **Navigation**: Add "Perfil" to user dropdown menu (UserMenu component)
- **Feedback**: Loading states, success toasts, inline validation errors
- **Accessibility**: Proper form labels, keyboard navigation, focus management

---

## Implementation Priority

1. **Phase 1 - Core Profile** (Must Have)
   - Database schema migration
   - `GET /users/me` and `PATCH /users/me` endpoints
   - Profile page with personal info section (name, email, phone)
   - Basic form with save functionality

2. **Phase 2 - Professional Info** (Should Have)
   - Professional fields (clinic, license, specialty, experience)
   - Form sections organization

3. **Phase 3 - Photo & Security** (Should Have)
   - Profile photo upload
   - Change password functionality
   - Link to PIN management

4. **Phase 4 - Polish** (Nice to Have)
   - Animations/transitions
   - Optimistic updates
   - Enhanced validation UX
