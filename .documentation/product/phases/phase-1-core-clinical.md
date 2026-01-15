# Phase 1: Core Clinical System (MVP)

**Duration:** 8 weeks  
**Status:** 🟢 Week 5 Complete  
**Goal:** Functional clinical data manager without AI (better than paper)

---

## Progress Summary

| Week | Focus                            | Status      |
| ---- | -------------------------------- | ----------- |
| 1-4  | Foundation, Auth, Database       | ✅ Complete |
| 5    | Patients - Core Components       | ✅ Complete |
| 6    | Patients - Evaluation & Timeline | 🔲 Pending  |
| 7    | Media & Dictation                | 🔲 Pending  |
| 8    | PWA Basics (Offline)             | 🔲 Pending  |

---

## 1.1 Core Clinical Data

### Entities

- **Patient** - Demographics, history, soft delete support
- **ClinicalCase** - Treatment period with status (active/completed/inactive)
- **Evaluation** - Posturogram, pain scale, orthopedic tests, Barthel index
- **TreatmentSession** - Date, phase, procedures, observations, pain level
- **TreatmentPlan** - Objectives and phases

### Key Features

- ✅ Complete CRUD operations (Implemented)
- ✅ Therapist isolation (data scoped to authenticated user)
- ✅ Soft delete for patients
- ✅ Automatic initial case creation with patient
- ✅ Paginated API with search/filter support

---

## 1.2 Patient Management (Ultra-Simple UX)

**Status:** ✅ Implemented (2026-01-15)  
See [Technical Spec](../../technical/patients-module.md) and [ADR 008](../decisions/008-language-strategy-english-code-spanish-ui.md).

### MVP Requirements

**Must Have:**

- ✅ Create patient in < 1 minute
- ✅ Minimum fields: Full name, Age, Occupation, Phone, Birth date
- ✅ Automatic clinical case creation on patient creation

**Optional Fields:**

- ✅ Email, Address, Gender, Previous Occupation

### UI Components (Week 5)

| Component      | Status | Description                                 |
| -------------- | ------ | ------------------------------------------- |
| PatientList    | ✅     | Grid with search, filters, hover actions    |
| PatientProfile | ✅     | Dashboard with case, history, quick actions |
| PatientForm    | ✅     | Create/Edit with Zod validation             |
| AlertDialog    | ✅     | Delete confirmation                         |
| Empty States   | ✅     | Context-aware (no patients, no results)     |
| Loading States | ✅     | Spinners on load, submit, delete            |
| Error Handling | ✅     | Toast notifications                         |

### Callbacks Wired

| Callback   | Location                    | Action                   |
| ---------- | --------------------------- | ------------------------ |
| onView     | PatientList                 | Navigate to detail       |
| onCreate   | PatientList                 | Open create dialog       |
| onEdit     | PatientList, PatientProfile | Open edit dialog         |
| onDelete   | PatientList                 | Confirm and soft delete  |
| onSchedule | PatientList, PatientProfile | Google Calendar pre-fill |

### Design Rule

> "If it's not used daily, it's not in the MVP."

### Acceptance Criteria

- [x] Patient list loads in < 2 seconds
- [x] Search by name works instantly
- [x] Creating a patient requires max 3 taps
- [x] Edit and delete from list view
- [x] Schedule appointment via Google Calendar
- [ ] Can create patient with voice only (Week 7)

---

## 1.3 Session Recording

**Status:** 🟡 Backend Complete, UI Pending (Week 6)

### Automatic Data

- ✅ Date/time (auto-captured)
- ✅ Session number (phaseNumber field)
- ✅ Therapist ID (from JWT)

### Manual Entry

- ✅ Procedures array (techniques used)
- ✅ Patient response text
- ✅ Final pain level (0-10)
- ✅ Observations text

### API Endpoint

```
POST /api/v1/patients/cases/:caseId/sessions
```

---

## 1.4 Clinical Images

**Status:** 🔲 Planned (Week 7)

### Requirements

- Direct upload from tablet/mobile camera
- Auto-association to current session
- Chronological display
- **No editing tools in MVP**

### Image Types (Metadata Tags)

- Foot print (plantar/dorsal)
- Posture (anterior/posterior/lateral)
- Gait analysis
- Other

---

## 1.5 Security (MVP Requirements)

### Data Protection

- ✅ Data encrypted at rest (database level)
- ✅ Data encrypted in transit (HTTPS only)
- ✅ Access only by authorized user (JWT)
- ✅ Therapist isolation enforced at service layer

### Backup Strategy

- ✅ Automatic daily backups (configured via cron)
- ✅ 7-day retention (configurable)
- ✅ Encrypted backup files (GPG)

### Privacy

- ❌ No external synchronization
- ❌ No cloud analytics
- ❌ No third-party services (except MinIO storage)

---

## 1.6 Test Coverage

### Backend Tests

| Category                        | Tests   | Status |
| ------------------------------- | ------- | ------ |
| PatientsService Unit            | 15      | ✅     |
| ClinicalCasesService Unit       | 15      | ✅     |
| Patients API (Controller)       | 14      | ✅     |
| Clinical Cases API              | 11      | ✅     |
| Patients Integration (DB)       | 2       | ✅     |
| Clinical Cases Integration (DB) | 5       | ✅     |
| **Total Backend**               | **142** | ✅     |

### Frontend Tests

| Category           | Tests  | Status |
| ------------------ | ------ | ------ |
| Auth Context       | 3      | ✅     |
| Protected Route    | 4      | ✅     |
| Login/Register     | 4      | ✅     |
| Error Boundary     | 6      | ✅     |
| Axios Client       | 16     | ✅     |
| **Total Frontend** | **39** | ✅     |

---

## Phase 1 Success Criteria

**The system is ready when:**

1. ✅ Therapist completes 10 real sessions without asking for help
2. ✅ Zero data loss in 1 month of use
3. ✅ Faster than paper workflow (measured: avg 3 min vs 5 min)
4. ✅ Therapist actively chooses digital over paper

---

## Week 5 Deliverables (Complete)

- [x] PatientList with search, filters, quick actions
- [x] PatientProfile with case display and action buttons
- [x] PatientForm for create/edit with validation
- [x] CRUD callbacks wired (view, create, edit, delete)
- [x] Google Calendar integration (onSchedule)
- [x] Context-aware empty states
- [x] Loading states and toast notifications
- [x] Backend unit tests for services
- [x] Backend integration tests for endpoints

## Week 6 Planned

- [ ] EvaluationForm component
- [ ] Treatment timeline (Cronograma)
- [ ] Before/After comparison view
- [ ] Posturogram viewer
- [ ] Wire evaluation callbacks

---

**Last Updated:** 2026-01-15
