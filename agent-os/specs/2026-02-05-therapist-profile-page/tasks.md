# Task Breakdown: Therapist Profile Page

## Overview

Total Tasks: 4 Task Groups, 20 Sub-tasks

## Task List

### Database Layer

#### Task Group 1: Schema Extension & Migration

**Dependencies:** None

- [x] 1.0 Complete database layer
  - [x] 1.1 Write 4 focused tests for User profile fields
  - [x] 1.2 Add profile fields to User model in `prisma/schema.prisma`
  - [x] 1.3 Create and run Prisma migration
  - [x] 1.4 Ensure database layer tests pass

**Acceptance Criteria:**

- The 4 tests written in 1.1 pass
- User model includes all 6 new profile fields
- Migration runs without errors
- Prisma client regenerated with updated types

---

### API Layer

#### Task Group 2: Users API Module

**Dependencies:** Task Group 1

- [x] 2.0 Complete API layer
  - [x] 2.1 Write 6 focused tests for Users API endpoints
  - [x] 2.2 Create UsersModule structure
  - [x] 2.3 Create DTOs for user operations
  - [x] 2.4 Implement UsersService methods
  - [x] 2.5 Implement UsersController endpoints
  - [x] 2.6 Implement profile photo endpoints
  - [x] 2.7 Ensure API layer tests pass

**Acceptance Criteria:**

- The 6 tests written in 2.1 pass
- All 5 endpoints functional (GET, PATCH profile, PATCH password, POST photo, DELETE photo)
- Proper JWT authentication on all endpoints
- Password change requires correct current password
- Sensitive fields excluded from responses

---

### Frontend Layer

#### Task Group 3: Profile Page UI

**Dependencies:** Task Group 2

- [x] 3.0 Complete UI components
  - [x] 3.1 Write 5 focused tests for Profile page components
  - [x] 3.2 Create API client for users module
  - [x] 3.3 Extend AuthContext with profile update capability
  - [x] 3.4 Create Perfil.tsx page component
  - [x] 3.5 Implement Información Personal section
  - [x] 3.6 Implement Información Profesional section
  - [x] 3.7 Implement Seguridad section
  - [x] 3.8 Implement Información de la Cuenta section
  - [x] 3.9 Implement form save functionality
  - [x] 3.10 Add navigation link in UserMenu
  - [x] 3.11 Ensure UI component tests pass
    - Run ONLY the 5 tests written in 3.1
    - Verify components render correctly
    - Confirm form submission works

**Acceptance Criteria:**

- The 5 tests written in 3.1 pass
- Profile page renders all 4 sections with proper styling
- Forms validate and submit correctly
- Password change modal works with existing PinSetupModal integration
- Navigation from UserMenu works
- Matches existing app design patterns

---

### Testing

#### Task Group 4: Test Review & Integration Verification

**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and verify integration
  - [x] 4.1 Review tests from Task Groups 1-3
  - [x] 4.2 Analyze test coverage gaps for profile feature
  - [x] 4.3 Write up to 5 additional integration tests if needed
  - [x] 4.4 Run feature-specific tests only
  - [x] 4.5 Manual verification checklist

**Acceptance Criteria:**

- All feature-specific tests pass (15-20 tests total)
- No more than 5 additional tests added
- Manual verification checklist completed successfully
- Profile feature fully functional end-to-end

---

## Execution Order

Recommended implementation sequence:

1. **Database Layer (Task Group 1)** - Schema changes and migration
2. **API Layer (Task Group 2)** - Backend endpoints and business logic
3. **Frontend Layer (Task Group 3)** - UI components and integration
4. **Testing (Task Group 4)** - Final verification and gap analysis

## Notes

- All UI text must be in Spanish
- Follow existing code patterns from referenced files
- No email verification required for MVP
- Profile photo stored in MinIO using existing infrastructure
- Password change requires current password verification
