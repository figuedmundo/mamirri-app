# Phase 1: Core Clinical System (MVP)

**Duration:** 8 weeks  
**Status:** 🔴 Not Started  
**Goal:** Functional clinical data manager without AI (better than paper)

---

## 1.1 Core Clinical Data

### Entities
- **Patient** - Demographics, history
- **Session** - Date, observations, treatments
- **Observations** - Clinical notes (text/voice)
- **Treatments** - Applied techniques
- **Images** - Foot prints, posture, gait
- **Orthotic Metadata** - Conceptual design notes (not CAD)

### Key Features
- ✅ Complete CRUD operations
- ✅ Immutable history (finalized sessions can't be edited)
- ✅ Offline-first data access

---

## 1.2 Patient Management (Ultra-Simple UX)

### MVP Requirements
**Must Have:**
- Create patient in < 1 minute
- Minimum fields:
  - Full name
  - Age (or birthdate)
  - Chief complaint (why they came)

**Optional Fields:**
- Phone, Email, Occupation, Medical history

### Design Rule
> "If it's not used daily, it's not in the MVP."

### Acceptance Criteria
- [ ] Patient list loads in < 2 seconds
- [ ] Search by name works instantly
- [ ] Creating a patient requires max 3 taps
- [ ] Can create patient with voice only (accessibility)

---

## 1.3 Session Recording

### Automatic Data
- Date/time (auto-captured)
- Session number (auto-incremented)

### Manual Entry
- Free-form observations (text or voice dictation)
- Techniques used (checkboxes):
  - [ ] Massage therapy
  - [ ] Electrotherapy
  - [ ] Therapeutic exercises
  - [ ] Orthotic adjustment
  - [ ] Manual therapy
  - [ ] Other: _______

### Media Attachment
- Attach photos directly
- Auto-associate to current session
- Timestamp each photo

---

## 1.4 Clinical Images

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

### Backup Strategy
- ✅ Automatic daily backups (3:00 AM local time)
- ✅ 30-day retention
- ✅ Encrypted backup files

### Privacy
- ❌ No external synchronization
- ❌ No cloud analytics
- ❌ No third-party services (except storage)

---

## Phase 1 Success Criteria

**The system is ready when:**
1. ✅ Therapist completes 10 real sessions without asking for help
2. ✅ Zero data loss in 1 month of use
3. ✅ Faster than paper workflow (measured: avg 3 min vs 5 min)
4. ✅ Therapist actively chooses digital over paper

---

**Last Updated:** $(date +%Y-%m-%d)
