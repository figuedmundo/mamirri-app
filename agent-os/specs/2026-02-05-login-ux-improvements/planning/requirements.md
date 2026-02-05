# Spec Requirements: Login UX Improvements

## Initial Description

Make login more fast, the doctor feels enter email is slow, make the create account more visible (Roadmap task 10.1.1)

## Requirements Discussion

### First Round Questions

**Q1:** Email entry speed — I assume the main issue is that the email field doesn't have autofocus, so the user has to tap the field before typing. I'll add `autoFocus` to the email input. Is that correct, or is there another friction point?
**Answer:** User proposed a better solution: PIN-based login since mother is the only user.

**Q2:** "Remember me" functionality — Should we add a checkbox to persist email?
**Answer:** Superseded by PIN solution - no need.

**Q3:** Create account visibility — Which approach: secondary button, tabs, or larger link?
**Answer:** Not specified, but needs to be more visible. Will use a secondary button approach.

**Q4:** Language consistency — Login is Spanish, Register is English. Should Register be Spanish?
**Answer:** Yes, Register page should be translated to Spanish.

**Q5:** Additional quick improvements — Loading states, auto-submit with password manager?
**Answer:** Not explicitly addressed, but PIN auto-submits on 4th digit.

**Q6:** What should NOT be in scope?
**Answer:** Social login, biometric auth are out of scope.

### Follow-up Questions (PIN Feature)

**Q1:** PIN flow — First login with email/password, then set up PIN, subsequent logins show PIN pad with email fallback?
**Answer:** Correct.

**Q2:** PIN length — 4 or 6 digits?
**Answer:** 4 digits.

**Q3:** Device binding — Should PIN only work on specific device?
**Answer:** No device binding - PIN works across devices.

**Q4:** Forgot PIN — Use email/password to login and reset?
**Answer:** Yes.

**Q5:** Security lockout — Lock after X failed attempts?
**Answer:** No need for lockout.

**Q6:** Visual style — Suggested PIN pad design with greeting, large buttons, dot feedback?
**Answer:** Confirmed. Design includes:

- Personalized "Hola, [Name]" greeting at top
- 4 dot indicators showing PIN entry progress
- Large number buttons (~70px) for iPad
- Backspace button left of 0
- Auto-submit when 4th digit entered
- "Usar correo y contraseña" fallback link at bottom

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Login Page - Path: `apps/client/src/pages/Login.tsx`
- Feature: Register Page - Path: `apps/client/src/pages/Register.tsx`
- Feature: Auth Context - Path: `apps/client/src/context/AuthProvider.tsx`
- Feature: Auth Hook - Path: `apps/client/src/hooks/use-auth.ts`
- Components to potentially reuse: Card, Button, Input from shadcn/ui

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

PIN pad design was described textually and confirmed:

- Greeting section with user name
- 4-dot PIN indicator (filled as digits entered)
- 3x4 number grid with large touch targets
- Backspace and empty space flanking 0
- Email/password fallback link

## Requirements Summary

### Functional Requirements

- PIN-based quick login (4 digits, auto-submit)
- PIN setup flow after first email/password login
- PIN stored server-side (not device-bound)
- Email/password fallback from PIN screen
- Forgot PIN → use email/password to reset
- Autofocus on email field (for email login)
- Register page translated to Spanish
- Create Account link made more visible

### Reusability Opportunities

- Existing Card, Button components from shadcn/ui
- Auth context pattern for PIN state management
- Existing login/register page structure

### Scope Boundaries

**In Scope:**

- PIN login feature (frontend + backend)
- PIN setup flow after first login
- PIN pad UI component
- Email autofocus improvement
- Register page Spanish translation
- More visible "Create Account" link/button

**Out of Scope:**

- Social login (Google, Facebook, etc.)
- Biometric authentication (Face ID, Touch ID)
- Device binding for PIN
- Account lockout after failed attempts
- PIN complexity requirements

### Technical Considerations

- Backend needs new endpoints: POST /auth/pin/setup, POST /auth/pin/login
- User model needs PIN hash field
- PIN should be hashed (bcrypt) before storage
- Frontend needs to detect if user has PIN set
- LocalStorage can cache user email for PIN screen display
