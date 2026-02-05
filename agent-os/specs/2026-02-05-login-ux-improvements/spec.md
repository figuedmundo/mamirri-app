# Specification: Login UX Improvements (PIN Login)

## Goal

Enable faster login for the primary user (doctor) via a 4-digit PIN, while improving the visibility of account creation and translating the Register page to Spanish.

## User Stories

- As a therapist, I want to log in with a 4-digit PIN so that I can access the app quickly without typing my email every time.
- As a new user, I want to easily find the registration option so that I can create an account without confusion.
- As a Spanish-speaking user, I want the registration page in Spanish so that I understand all instructions clearly.

## Specific Requirements

**PIN Login Flow**

- After first successful email/password login, prompt user to set up a 4-digit PIN
- Store user's email in localStorage to display on PIN screen (for personalized greeting)
- On subsequent visits, show PIN pad by default if user has PIN set
- Auto-submit when 4th digit is entered (no submit button needed)
- On successful PIN, return same tokens as email/password login

**PIN Pad UI Component**

- Personalized greeting at top: "Hola, [User Name]"
- 4 dot indicators showing PIN entry progress (filled dots as digits entered)
- 3x4 number grid (1-9, then 0 centered at bottom)
- Large touch targets (~70px) optimized for iPad
- Backspace button positioned left of 0
- "Usar correo y contraseña" fallback link at bottom of card

**PIN Setup Flow**

- Show modal/screen after first email/password login success
- Allow user to enter PIN twice for confirmation
- Display error if PINs don't match
- Skip option available (user can set up later from settings)
- Store hashed PIN on backend via POST /auth/pin/setup

**PIN Backend Endpoints**

- POST /auth/pin/setup: Accepts { pin: string }, hashes with bcrypt, stores in User.pinHash
- POST /auth/pin/login: Accepts { email: string, pin: string }, validates, returns tokens
- GET /auth/pin/status: Returns { hasPinSet: boolean } for current user
- Add pinHash field to User model (nullable String)

**Forgot PIN / PIN Reset**

- User clicks "Usar correo y contraseña" to bypass PIN
- After email/password login, offer to reset/change PIN
- No separate "forgot PIN" flow needed (email/password is the fallback)

**Email Login Improvements**

- Add autoFocus to email input field
- Keep existing email/password flow unchanged
- Email login accessible from PIN screen via fallback link

**Register Page Spanish Translation**

- Translate all labels, placeholders, and messages to Spanish
- "Sign Up" → "Crear Cuenta"
- "Name" → "Nombre"
- "Email" → "Correo Electrónico"
- "Password" → "Contraseña"
- "Confirm Password" → "Confirmar Contraseña"
- Error messages in Spanish

**Create Account Visibility**

- Replace text link with secondary outline button
- Position button prominently in CardFooter
- Use "Crear Cuenta" as button text with arrow icon

## Visual Design

No visual mockups provided. PIN pad design specified textually:

**PIN Pad Layout (Confirmed)**

- Centered card similar to existing Login card
- Top section: Greeting "Hola, [Name]" with user identification
- Middle section: 4 dots (○ unfilled, ● filled) showing entry progress
- Main section: 3x4 numeric keypad with large buttons
- Bottom row: [⌫ Backspace] [0] [empty]
- Footer: "Usar correo y contraseña →" link

## Existing Code to Leverage

**apps/client/src/pages/Login.tsx**

- Use as template for PIN login page structure
- Reuse Card, CardHeader, CardContent, CardFooter layout
- Copy error handling pattern with red banner
- Extend to handle PIN vs email/password mode switching

**apps/server/src/modules/auth/auth.service.ts**

- Follow bcrypt hashing pattern from register() for PIN hashing
- Extend login() method pattern for PIN validation
- Use same JWT token generation for PIN login response

**apps/client/src/context/AuthProvider.tsx**

- Extend to track if user has PIN set (from /auth/pin/status)
- Add localStorage for cached user email display on PIN screen
- Use same login() function after successful PIN auth

**apps/client/src/components/ui/button.tsx (shadcn)**

- Use variant="outline" for secondary "Create Account" button
- Use variant="ghost" for PIN keypad number buttons
- Large size prop or custom className for 70px touch targets

**apps/server/prisma/schema.prisma**

- Add pinHash String? field to User model
- Follow existing nullable field pattern (e.g., deletedAt)
- No new relations needed

## Out of Scope

- Social login (Google, Facebook, GitHub OAuth)
- Biometric authentication (Face ID, Touch ID, fingerprint)
- Device binding for PIN (PIN works on any device)
- Account lockout after failed PIN attempts
- PIN complexity requirements (any 4 digits allowed)
- PIN expiration or rotation policies
- Multi-user PIN switching on same device
- Offline PIN validation (requires backend)
- PIN recovery via SMS/email code
- Settings page for PIN management (defer to future)
