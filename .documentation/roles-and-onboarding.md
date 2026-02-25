# MamirriApp - Roles & Onboarding Documentation

**Last Updated:** 2026-02-20  
**Version:** 1.0  
**Status:** Current Implementation

---

## Table of Contents

1. [Role System Overview](#role-system-overview)
2. [Role Definitions](#role-definitions)
3. [Permission Matrix](#permission-matrix)
4. [How Roles Are Created](#how-roles-are-created)
5. [Clinic-First Onboarding Flow](#clinic-first-onboarding-flow)
6. [API Endpoints by Role](#api-endpoints-by-role)
7. [Frontend Routes](#frontend-routes)
8. [Best Practices](#best-practices)

---

## Role System Overview

MamirriApp uses a **3-tier role system** designed for a multi-tenant physiotherapy clinic platform:

```
┌─────────────────────────────────────────────────────────────┐
│                    PLATFORM LEVEL                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ADMIN (System Superuser)                             │  │
│  │  • Can access ALL clinics                             │  │
│  │  • Platform administration                            │  │
│  │  • No clinic assignment needed                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLINIC LEVEL                              │
│  ┌─────────────────────┐    ┌──────────────────────────┐   │
│  │ CLINIC_OWNER        │    │ THERAPIST                │   │
│  │ • Owns the clinic   │    │ • Works at clinic        │   │
│  │ • Full permissions  │    │ • Limited permissions    │   │
│  │ • Can invite users  │    │ • Cannot manage clinic   │   │
│  └─────────────────────┘    └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Role Definitions

### 👑 ADMIN (System Superuser)

**Purpose:** Platform administration and support

**Characteristics:**

- Created via database seed only (no UI registration)
- Not assigned to any specific clinic
- Can bypass all clinic-based access controls
- Has god-mode access to entire platform

**Typical Users:**

- Mamirri platform developers/owners
- Support staff
- System administrators

**Key Abilities:**

```typescript
// From clinic-roles.guard.ts
if (user.role === ROLES.ADMIN) {
  return true; // Bypasses all permission checks
}
```

**Creation Method:**

```bash
# Option 1: Database seed (apps/server/prisma/seed.ts)
{
  email: 'admin@mamirri.com',
  name: 'Platform Administrator',
  password: 'secure-password',
  role: 'ADMIN'
}

# Option 2: Direct SQL
INSERT INTO users (id, email, password_hash, name, role, created_at)
VALUES (
  gen_random_uuid(),
  'admin@mamirri.com',
  '$2b$10$hashedpassword',
  'Admin User',
  'ADMIN',
  NOW()
);
```

---

### 🏥 CLINIC_OWNER (Clinic Administrator)

**Purpose:** Own and manage a physiotherapy clinic

**Characteristics:**

- Created during clinic onboarding flow
- Assigned to exactly ONE clinic
- Has full administrative control over their clinic
- Can invite and manage other users (THERAPISTs and other CLINIC_OWNERs)

**Typical Users:**

- Doctors who own a clinic
- Clinic directors
- Business owners
- Co-owners (multiple CLINIC_OWNERs per clinic allowed)

**Key Abilities:**

- Manage clinic settings (name, address, contact info)
- Invite therapists to join clinic
- Remove users from clinic
- View all clinic data (patients, sessions, etc.)
- Assign roles to clinic members

**Creation Methods:**

1. **New Clinic Onboarding** (Primary):

   ```http
   POST /api/v1/onboarding/clinic
   {
     "clinicName": "Fisioterapia García",
     "clinicEmail": "clinic@example.com",
     "adminName": "Dr. María García",
     "adminEmail": "maria@example.com",
     "adminPassword": "securePass123"
   }
   ```

   Result: User created with `role: CLINIC_OWNER`

2. **Existing User Promoted** (Secondary):
   ```http
   POST /api/v1/clinics/:clinicId/invite
   {
     "email": "newowner@example.com",
     "role": "CLINIC_OWNER"
   }
   ```

---

### 👨‍⚕️ THERAPIST (Clinic Staff)

**Purpose:** Provide physiotherapy services within a clinic

**Characteristics:**

- Created via invitation from CLINIC_OWNER only
- Assigned to exactly ONE clinic
- Limited permissions (cannot manage clinic settings)
- Can create and manage patients and sessions

**Typical Users:**

- Physiotherapists
- Clinic staff
- Associate practitioners
- Contractors

**Key Abilities:**

- Create and manage patients
- Record treatment sessions
- View patient history
- Use AI analysis features
- Access clinic library

**Limitations:**

- Cannot invite other users
- Cannot change clinic settings
- Cannot delete the clinic
- Cannot remove other users

**Creation Method:**

**Invitation Only** (Exclusive):

```http
POST /api/v1/clinics/:clinicId/invite
{
  "email": "therapist@example.com",
  "role": "THERAPIST"  // or "CLINIC_OWNER" for co-owners
}
```

User receives email with invitation link to `/invite/accept?token=xyz`

---

## Permission Matrix

### Feature Access by Role

| Feature                     |  ADMIN   | CLINIC_OWNER | THERAPIST |
| --------------------------- | :------: | :----------: | :-------: |
| **Platform Administration** |          |              |           |
| View all clinics in system  |    ✅    |      ❌      |    ❌     |
| Manage any clinic           |    ✅    |      ❌      |    ❌     |
| View all users              |    ✅    |      ❌      |    ❌     |
| Reset user passwords        |    ✅    |      ❌      |    ❌     |
| **Clinic Management**       |          |              |           |
| Create new clinic           |    ✅    |   ✅ (own)   |    ❌     |
| View clinic details         | ✅ (any) |   ✅ (own)   | ✅ (own)  |
| Update clinic settings      | ✅ (any) |   ✅ (own)   |    ❌     |
| Delete clinic               | ✅ (any) |   ✅ (own)   |    ❌     |
| **User Management**         |          |              |           |
| Invite users to clinic      | ✅ (any) |   ✅ (own)   |    ❌     |
| Remove users from clinic    | ✅ (any) |   ✅ (own)   |    ❌     |
| Change user roles           | ✅ (any) |   ✅ (own)   |    ❌     |
| View clinic members         | ✅ (any) |   ✅ (own)   | ✅ (own)  |
| **Patient Management**      |          |              |           |
| Create patients             | ✅ (any) |   ✅ (own)   | ✅ (own)  |
| View patients               | ✅ (any) |   ✅ (own)   | ✅ (own)  |
| Edit patients               | ✅ (any) |   ✅ (own)   | ✅ (own)  |
| Delete patients             | ✅ (any) |   ✅ (own)   | ✅ (own)  |
| **Session Management**      |          |              |           |
| Create sessions             | ✅ (any) |   ✅ (own)   | ✅ (own)  |
| View sessions               | ✅ (any) |   ✅ (own)   | ✅ (own)  |
| Edit sessions               | ✅ (any) |   ✅ (own)   | ✅ (own)  |
| **AI & Library**            |          |              |           |
| Use AI analysis             | ✅ (any) |   ✅ (own)   | ✅ (own)  |
| Access medical library      | ✅ (any) |   ✅ (own)   | ✅ (own)  |
| **Profile**                 |          |              |           |
| Edit own profile            |    ✅    |      ✅      |    ✅     |
| Change own password         |    ✅    |      ✅      |    ✅     |

---

## How Roles Are Created

### Flowchart: User Creation by Role

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN                                                      │
│  ═══════                                                    │
│  Created via:                                               │
│  • Database seed script                                     │
│  • Direct SQL insertion                                     │
│  • No UI registration available                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CLINIC_OWNER                                               │
│  ═════════════                                              │
│  Method 1: Onboarding (New Clinic)                         │
│  • User clicks "Crear Nueva Clínica" on login page         │
│  • Fills clinic info (Step 1)                               │
│  • Fills admin account (Step 2)                            │
│  • Automatically becomes CLINIC_OWNER of new clinic        │
│                                                             │
│  Method 2: Invitation (Existing User)                      │
│  • CLINIC_OWNER invites via /clinics/:id/invite            │
│  • Sets role to CLINIC_OWNER                               │
│  • User accepts invitation                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  THERAPIST                                                  │
│  ══════════                                                 │
│  Method: Invitation ONLY                                    │
│  • CLINIC_OWNER or ADMIN invites via /clinics/:id/invite   │
│  • Sets role to THERAPIST                                  │
│  • User receives email with invitation token               │
│  • User clicks link to /invite/accept?token=xyz            │
│  • User creates account and joins clinic                   │
│                                                             │
│  Note: THERAPISTs cannot self-register!                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Clinic-First Onboarding Flow

### Overview

The onboarding flow has been redesigned from **user-first** to **clinic-first** to align with industry standards and user mental models.

**Old Flow:** Register user → Create clinic → Become owner  
**New Flow:** Create clinic + Create owner account → Done!

### User Journey

#### Entry Points

**1. From Login Page**

```
Login Page (/login)
│
├─→ [Iniciar Sesión] → Existing user login
│
└─→ [Crear Nueva Clínica] → New clinic owner onboarding
    │
    ├─→ Info box: "¿Eres fisioterapeuta? Solicita invitación..."
    └─→ Hint: "¿Ya tienes clínica? Inicia sesión aquí"
```

**2. Direct Access**

```
/onboarding → Step 1 of onboarding
/register → Redirects to /onboarding
```

### Step-by-Step Flow

#### Step 1: Clinic Information

**URL:** `/onboarding`  
**Title:** "Crea tu Clínica"  
**Subtitle:** "Paso 1 de 2: Información de la Clínica"

**Fields:**
| Field | Required | Validation |
|-------|----------|------------|
| Nombre de la Clínica | ✅ | Min 2 chars, unique (real-time check) |
| Email de la Clínica | ✅ | Valid email format |
| Teléfono | ❌ | Optional, phone format |
| Dirección | ❌ | Optional, free text |

**Features:**

- Real-time clinic name availability check (debounced 500ms)
- Visual feedback: ✓ Name available / ✗ Name taken
- Disabled "Continuar" button until valid
- Helper text for therapists

**API Call:**

```http
GET /api/v1/onboarding/check-name?name={clinicName}
Response: { "available": true/false }
```

#### Step 2: Admin Account

**URL:** `/onboarding` (state update)  
**Title:** "Crea tu Clínica"  
**Subtitle:** "Paso 2 de 2: Cuenta de Administrador"

**Context Banner:**

```
"Creando clínica: {clinicName}"
```

**Fields:**
| Field | Required | Validation |
|-------|----------|------------|
| Nombre Completo | ✅ | Min 1 char |
| Correo Electrónico | ✅ | Valid email, unique |
| Contraseña | ✅ | Min 6 chars |
| Confirmar Contraseña | ✅ | Must match password |
| Número de Licencia Profesional | ❌ | Optional |

**Features:**

- Password confirmation validation
- "Atrás" button to return to Step 1
- "Crear Clínica" button (disabled until valid)

**API Call:**

```http
POST /api/v1/onboarding/clinic
Content-Type: application/json

{
  "clinicName": "Fisioterapia García",
  "clinicEmail": "clinic@example.com",
  "clinicPhone": "+34 912 345 678",
  "clinicAddress": "Calle Mayor 123, Madrid",
  "adminName": "Dr. María García",
  "adminEmail": "maria@example.com",
  "adminPassword": "securePass123",
  "adminLicenseNumber": "F-12345"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "maria@example.com",
    "name": "Dr. María García",
    "role": "CLINIC_OWNER", // ← Automatically set!
    "clinicId": "clinic-uuid",
    "clinicName": "Fisioterapia García"
  },
  "clinic": {
    "id": "clinic-uuid",
    "name": "Fisioterapia García",
    "email": "clinic@example.com",
    "phone": "+34 912 345 678",
    "address": "Calle Mayor 123, Madrid",
    "isActive": true
  },
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh-token"
}
```

#### Success Page

**URL:** `/onboarding/success`  
**Title:** "¡Bienvenido a {clinicName}!"

**Content:**

- Success checkmark icon
- Welcome message
- Confirmation: "Tu clínica ha sido creada exitosamente. Ahora estás conectado como el propietario de la clínica."

**Quick Actions:**

1. **Crear Primer Paciente** - Start adding patients
2. **Invitar a tu Equipo** - Invite therapists
3. **Configurar Ajustes** - Customize clinic profile

**Primary Button:**

- "Ir al Panel de Control →" - Navigate to dashboard

### Flow Diagram

```
┌─────────────────┐
│   /login        │
│                 │
│ [Iniciar        │
│  Sesión]        │
│                 │
│ 🏥 Crear Nueva  │
│    Clínica →    │
│                 │
│ ℹ️ Info:        │
│ Fisioterapeutas │
│ → Invitación    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ /onboarding                 │
│ Paso 1 de 2                 │
│                             │
│ Nombre de la Clínica *      │
│ [Fisioterapia García    ✓]  │
│ Nombre disponible           │
│                             │
│ Email de la Clínica *       │
│ [clinic@example.com       ] │
│                             │
│ Teléfono                    │
│ [+34 912 345 678          ] │
│                             │
│ Dirección                   │
│ [Calle Mayor 123, Madrid  ] │
│                             │
│ [Continuar →]               │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ /onboarding                 │
│ Paso 2 de 2                 │
│                             │
│ Creando clínica:            │
│ Fisioterapia García         │
│                             │
│ Nombre Completo *           │
│ [Dr. María García         ] │
│                             │
│ Correo Electrónico *        │
│ [maria@example.com        ] │
│                             │
│ Contraseña *                │
│ [••••••••••••             ] │
│ Debe tener al menos 6 chars │
│                             │
│ Confirmar Contraseña *      │
│ [••••••••••••             ] │
│                             │
│ Número de Licencia          │
│ [F-12345                  ] │
│                             │
│ [← Atrás] [Crear Clínica →] │
└────────┬────────────────────┘
         │
         │ POST /onboarding/clinic
         │ 201 Created
         ▼
┌─────────────────────────────┐
│ /onboarding/success         │
│                             │
│        ✅                   │
│ ¡Bienvenido a               │
│ Fisioterapia García!        │
│                             │
│ Tu clínica ha sido creada   │
│ exitosamente...             │
│                             │
│ ┌──────┐ ┌──────┐ ┌──────┐ │
│ 👤 Crear  👥 Invitar  ⚙️   │ │
│ Paciente  Equipo      Config│
│ └──────┘ └──────┘ └──────┘ │
│                             │
│ [Ir al Panel de Control →]  │
└─────────────────────────────┘
```

---

## API Endpoints by Role

### Public Endpoints (No Authentication Required)

| Endpoint                        | Method | Description                    |
| ------------------------------- | ------ | ------------------------------ |
| `/api/v1/onboarding/check-name` | GET    | Check clinic name availability |
| `/api/v1/auth/login`            | POST   | User login                     |
| `/api/v1/auth/refresh`          | POST   | Refresh access token           |
| `/api/v1/invite/accept`         | POST   | Accept clinic invitation       |

### ADMIN-Only Endpoints

| Endpoint                    | Method | Description                |
| --------------------------- | ------ | -------------------------- |
| `/api/v1/clinics/admin/all` | GET    | List ALL clinics in system |

### CLINIC_OWNER & ADMIN Endpoints

| Endpoint                                          | Method | Description           |
| ------------------------------------------------- | ------ | --------------------- |
| `/api/v1/clinics`                                 | POST   | Create clinic         |
| `/api/v1/clinics/:clinicId`                       | GET    | Get clinic details    |
| `/api/v1/clinics/:clinicId`                       | PATCH  | Update clinic         |
| `/api/v1/clinics/:clinicId/invite`                | POST   | Invite user to clinic |
| `/api/v1/clinics/:clinicId/therapists`            | GET    | List clinic members   |
| `/api/v1/clinics/:clinicId/therapists/:userId`    | PATCH  | Update member role    |
| `/api/v1/clinics/:clinicId/therapists/:userId`    | DELETE | Remove member         |
| `/api/v1/clinics/:clinicId/migrate-solo-patients` | POST   | Migrate patients      |

### All Authenticated Users (Role-Specific Access)

| Endpoint              | Method | Access Control   |
| --------------------- | ------ | ---------------- |
| `/api/v1/patients`    | \*     | Own clinic only  |
| `/api/v1/sessions`    | \*     | Own clinic only  |
| `/api/v1/ai-analysis` | \*     | Own clinic only  |
| `/api/v1/library`     | \*     | All users        |
| `/api/v1/users/me`    | \*     | Own profile only |

---

## Frontend Routes

### Public Routes

| Route                 | Component                | Description          |
| --------------------- | ------------------------ | -------------------- |
| `/login`              | Login                    | User login page      |
| `/login?manual=true`  | Login                    | Bypass PIN login     |
| `/register`           | Redirect → `/onboarding` | Legacy redirect      |
| `/onboarding`         | Onboarding               | Clinic creation flow |
| `/onboarding/success` | OnboardingSuccess        | Success screen       |
| `/invite/accept`      | InvitationAcceptance     | Accept invitation    |
| `/forgot-password`    | ForgotPassword           | Password reset       |

### Protected Routes (Authentication Required)

| Route            | Component       | Access                  |
| ---------------- | --------------- | ----------------------- |
| `/`              | Dashboard       | All authenticated       |
| `/pacientes`     | Patients        | CLINIC_OWNER, THERAPIST |
| `/pacientes/:id` | PatientDetail   | CLINIC_OWNER, THERAPIST |
| `/analisis`      | Analisis        | CLINIC_OWNER, THERAPIST |
| `/biblioteca`    | Biblioteca      | All authenticated       |
| `/clinica`       | ClinicDashboard | CLINIC_OWNER            |
| `/ajustes`       | Ajustes         | All authenticated       |
| `/perfil`        | Perfil          | All authenticated       |

---

## Best Practices

### For Clinic Owners

1. **Secure Your Account**
   - Use a strong password (min 12 chars)
   - Enable PIN login for quick access
   - Don't share your admin credentials

2. **Managing Your Team**
   - Invite therapists with THERAPIST role
   - Only promote trusted users to CLINIC_OWNER
   - Regularly review clinic members

3. **Clinic Settings**
   - Keep clinic contact info up to date
   - Upload a clinic logo for branding
   - Set business hours in settings

### For Therapists

1. **Getting Started**
   - Wait for invitation from clinic owner
   - Check your email for invitation link
   - Complete profile after joining

2. **Daily Workflow**
   - Use PIN login for quick access
   - Create patients from dashboard
   - Record sessions immediately after treatment

### For Admins

1. **Platform Management**
   - Monitor system health
   - Respond to support requests
   - Review clinic registrations

2. **Security**
   - Keep admin credentials secure
   - Use separate account for development
   - Regularly audit user access

---

## Database Schema

### User Model

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  passwordHash      String
  name              String
  role              String    @default("THERAPIST")  // ADMIN | CLINIC_OWNER | THERAPIST
  clinicId          String?                           // Null for ADMIN
  clinicName        String?                           // Clinic name cache
  licenseNumber     String?                           // Professional license
  pinHash           String?                           // For quick login
  createdAt         DateTime  @default(now())

  // Relations
  clinic            Clinic?   @relation(fields: [clinicId], references: [id])
  patients          Patient[]
  sessions          Session[]
}
```

### Clinic Model

```prisma
model Clinic {
  id            String    @id @default(cuid())
  name          String    @unique
  email         String?
  phone         String?
  address       String?
  logoUrl       String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())

  // Relations
  users         User[]
  patients      Patient[]
  invitations   ClinicInvitation[]
}
```

---

## Troubleshooting

### Common Issues

**Q: I can't access the onboarding page**  
A: Check that you're not already logged in. Log out first.

**Q: "Nombre no disponible" error**  
A: Clinic name is already taken. Try a different name.

**Q: Invitation email not received**  
A: Check spam folder. Contact clinic owner to resend.

**Q: Can't invite users**  
A: Only CLINIC_OWNER can invite. Check your role in profile.

**Q: How do I become an ADMIN?**  
A: ADMINs must be created via database. Contact platform support.

---

## Changelog

### 2026-02-20 - Version 1.0

- Initial documentation
- Documented new clinic-first onboarding flow
- Added role permission matrix
- Created troubleshooting guide

---

## Contact & Support

For questions about roles or onboarding:

- Technical issues: Check troubleshooting section
- Feature requests: Submit via GitHub issues
- Platform support: Contact Mamirri team

---

**End of Documentation**
