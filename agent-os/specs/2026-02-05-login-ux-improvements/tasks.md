# Task Breakdown: Login UX Improvements (PIN Login)

## Overview

Total Tasks: 24

## Task List

### Database Layer

#### Task Group 1: User Model PIN Field

**Dependencies:** None

- [x] 1.0 Complete database layer for PIN storage
  - [x] 1.1 Write 3 focused tests for PIN field functionality
    - Test User can be created with null pinHash
    - Test User can be updated with pinHash value
    - Test pinHash is not returned in standard user queries (excluded like passwordHash)
  - [x] 1.2 Add pinHash field to User model
    - Field: `pinHash String?` (nullable)
    - Location: `apps/server/prisma/schema.prisma`
    - Follow existing pattern from passwordHash field
  - [x] 1.3 Create and run migration
    - Migration adds nullable pinHash column to users table
    - No data migration needed (all existing users have null)
  - [x] 1.4 Ensure database layer tests pass
    - Run ONLY the 3 tests written in 1.1
    - Verify migration runs successfully

**Acceptance Criteria:**

- pinHash field exists on User model
- Migration runs without errors
- Existing users unaffected (null pinHash)
- Tests pass

---

### API Layer

#### Task Group 2: PIN Authentication Endpoints

**Dependencies:** Task Group 1

- [x] 2.0 Complete PIN authentication API
  - [x] 2.1 Write 6 focused tests for PIN endpoints
    - POST /auth/pin/setup - success with valid 4-digit PIN
    - POST /auth/pin/setup - failure with invalid PIN format
    - POST /auth/pin/login - success with correct PIN
    - POST /auth/pin/login - failure with wrong PIN
    - GET /auth/pin/status - returns true when PIN is set
    - GET /auth/pin/status - returns false when PIN is not set
  - [x] 2.2 Create PIN DTOs
    - `SetupPinDto`: { pin: string } with @Length(4,4) @IsNumberString()
    - `PinLoginDto`: { email: string, pin: string }
    - Location: `apps/server/src/modules/auth/dto/`
  - [x] 2.3 Implement PIN setup endpoint
    - POST /auth/pin/setup (requires JWT auth)
    - Hash PIN with bcrypt (same pattern as password)
    - Store in User.pinHash
    - Return { success: true }
  - [x] 2.4 Implement PIN login endpoint
    - POST /auth/pin/login (public endpoint)
    - Find user by email, compare PIN with bcrypt
    - Return same response as email/password login (tokens + user)
    - Return 401 if email not found or PIN wrong
  - [x] 2.5 Implement PIN status endpoint
    - GET /auth/pin/status (requires JWT auth)
    - Return { hasPinSet: boolean }
    - Check if current user's pinHash is not null
  - [x] 2.6 Add Swagger documentation
    - Document all 3 new endpoints
    - Include request/response examples
  - [x] 2.7 Ensure API layer tests pass
    - Run ONLY the 6 tests written in 2.1
    - Verify all endpoints respond correctly

**Acceptance Criteria:**

- All 3 PIN endpoints functional
- PIN hashed with bcrypt before storage
- PIN login returns same token format as email login
- Proper error responses for invalid PIN
- Swagger docs complete

---

### Frontend Layer

#### Task Group 3: PIN Pad Component

**Dependencies:** None (can be built in parallel with Task Group 2)

- [x] 3.0 Complete PIN Pad UI component
  - [x] 3.1 Write 4 focused tests for PinPad component
    - Renders 0-9 number buttons
    - Clicking numbers updates PIN state
    - Backspace removes last digit
    - Calls onComplete when 4 digits entered
  - [x] 3.2 Create PinPad component
    - Location: `apps/client/src/components/auth/PinPad.tsx`
    - Props: { onComplete: (pin: string) => void, onBackspace: () => void }
    - 3x4 grid layout with large buttons (~70px)
    - Use Button variant="ghost" for number keys
  - [x] 3.3 Create PinDots component
    - Location: `apps/client/src/components/auth/PinDots.tsx`
    - Props: { length: number, filled: number }
    - Display 4 dots (○ unfilled, ● filled)
    - Animate fill on digit entry
  - [x] 3.4 Style for iPad touch targets
    - Minimum 70px button size
    - Adequate spacing between buttons
    - Large, readable numbers
  - [x] 3.5 Ensure PIN Pad tests pass
    - Run ONLY the 4 tests written in 3.1

---

#### Task Group 6: Login Page Quick Improvements

**Dependencies:** None (can be done in parallel)

- [x] 6.0 Complete Login page improvements
  - [x] 6.1 Add autoFocus to email input
    - Location: `apps/client/src/pages/Login.tsx`
    - Add autoFocus prop to email Input component
  - [x] 6.2 Replace "Create Account" text link with button
    - Use Button variant="outline" in CardFooter
    - Text: "Crear Cuenta"
    - Add ArrowRight icon from lucide-react
    - Navigate to /register on click
  - [x] 6.3 Verify changes visually
    - Email field focuses on page load
    - Create Account button is prominent

---

#### Task Group 7: Register Page Spanish Translation

**Dependencies:** None (can be done in parallel)

- [x] 7.0 Complete Register page translation
  - [x] 7.1 Translate all UI text to Spanish
    - Location: `apps/client/src/pages/Register.tsx`
    - CardTitle: "Crear Cuenta"
    - CardDescription: "Crea una cuenta para comenzar."
    - Labels: Nombre, Correo Electrónico, Contraseña, Confirmar Contraseña
    - Placeholders: "Tu nombre", "nombre@ejemplo.com"
    - Button: "Crear Cuenta"
    - Footer link: "¿Ya tienes cuenta? Inicia sesión"
  - [x] 7.2 Translate error messages
    - "Passwords do not match" → "Las contraseñas no coinciden"
    - "Registration failed. Email might be taken." → "Error al registrar. El correo podría estar en uso."
  - [x] 7.3 Match Login page styling
    - Use same Card width (max-w-[400px])
    - Match input heights (h-12 text-lg)
    - Same spacing patterns
  - [x] 7.4 Verify translation completeness
    - All visible text is in Spanish
    - No English text remaining

**Acceptance Criteria:**

- All Register page text in Spanish
- Consistent styling with Login page
- Error messages translated

---

#### Task Group 4: PIN Login Page

**Dependencies:** Task Groups 2, 3

- [x] 4.0 Complete PIN Login page
  - [x] 4.1 Write 4 focused tests for PIN login flow
    - Shows PIN pad when user has PIN set
    - Shows email/password form when no PIN
    - Fallback link switches to email/password mode
    - Successful PIN login redirects to home
  - [x] 4.2 Create PinLogin page component
    - Location: `apps/client/src/pages/PinLogin.tsx`
    - Display greeting "Hola, [Name]" from localStorage
    - Integrate PinPad and PinDots components
    - Call POST /auth/pin/login on 4-digit entry
  - [x] 4.3 Update Login page routing logic
    - Check localStorage for cached user email/name
    - Check if user has PIN set (call /auth/pin/status or cache)
    - Route to PinLogin or Login based on PIN status
  - [x] 4.4 Add fallback link to email login
    - "Usar correo y contraseña →" link in CardFooter
    - Clicking switches to standard Login page
    - Clear any partial PIN entry
  - [x] 4.5 Handle PIN login errors
    - Show error message for wrong PIN
    - Clear PIN dots on error
    - Allow retry
  - [x] 4.6 Ensure PIN Login tests pass
    - Run ONLY the 4 tests written in 4.1

---

#### Task Group 5: PIN Setup Flow

**Dependencies:** Task Group 2

- [x] 5.0 Complete PIN setup flow
  - [x] 5.1 Write 3 focused tests for PIN setup
    - Modal appears after first login
    - PIN confirmation mismatch shows error
    - Successful setup stores PIN and closes modal
  - [x] 5.2 Create PinSetupModal component
    - Location: `apps/client/src/components/auth/PinSetupModal.tsx`
    - Two-step flow: enter PIN, confirm PIN
    - Reuse PinPad and PinDots components
    - "Omitir" (Skip) button available
  - [x] 5.3 Integrate setup prompt after login
    - Trigger after successful email/password login
    - Only show if user doesn't have PIN set
    - Store decision in localStorage to not re-prompt if skipped
  - [x] 5.4 Handle PIN mismatch
    - Compare first and second PIN entry
    - Show error "Los PINs no coinciden"
    - Clear both entries and restart
  - [x] 5.5 Call PIN setup API on confirmation
    - POST /auth/pin/setup with confirmed PIN
    - On success, close modal and continue to app
    - Cache user info for future PIN screen
  - [x] 5.6 Ensure PIN setup tests pass
    - Run ONLY the 3 tests written in 5.1

---

### Integration Testing

#### Task Group 8: Test Review & Integration

**Dependencies:** Task Groups 1-7

- [x] 8.0 Review and fill critical test gaps
  - [x] 8.1 Review tests from Task Groups 1-7
    - Database tests: 3 tests (from 1.1)
    - API tests: 6 tests (from 2.1)
    - PinPad tests: 4 tests (from 3.1)
    - PinLogin tests: 4 tests (from 4.1)
    - PinSetup tests: 3 tests (from 5.1)
    - Total existing: ~20 tests
  - [x] 8.2 Write up to 5 integration tests for critical flows
    - Full flow: Register → First login → PIN setup → PIN login
    - Email fallback from PIN screen works end-to-end
    - PIN reset flow (login with email, set new PIN)
  - [x] 8.3 Run all feature-specific tests
    - Run all tests from Task Groups 1-7 plus integration tests
    - Verify no regressions
    - Expected total: ~25 tests
  - [x] 8.4 Manual smoke test
    - Test on iPad simulator/device
    - Verify touch targets are adequate
    - Check responsive behavior

**Acceptance Criteria:**

- All ~25 tests pass
- End-to-end flows work
- No regressions in existing login/register

---

## Execution Order

Recommended implementation sequence (with parallelization):

```
Phase 1 (Parallel):
├── Task Group 1: Database Layer (pinHash field)
├── Task Group 3: PIN Pad Component (UI only, no API needed)
├── Task Group 6: Login Quick Improvements (autofocus, button)
└── Task Group 7: Register Spanish Translation

Phase 2 (After Group 1):
└── Task Group 2: PIN API Endpoints

Phase 3 (After Groups 2, 3):
├── Task Group 4: PIN Login Page
└── Task Group 5: PIN Setup Flow

Phase 4 (After all):
└── Task Group 8: Integration Testing
```

**Estimated effort:**

- Phase 1: ~2-3 hours (parallel work)
- Phase 2: ~2 hours
- Phase 3: ~3-4 hours
- Phase 4: ~1 hour
- **Total: ~8-10 hours**
