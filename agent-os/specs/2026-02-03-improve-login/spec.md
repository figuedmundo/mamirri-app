# Specification: Improve Login

## Goal

Optimize the login experience for tablet usage (iPad), localize the interface to Spanish, improve error feedback, and fix the short session timeout issue to ensure users stay logged in for 7 days.

## User Stories

- As a Physiotherapist using an iPad, I want a login screen with large, easy-to-tap inputs and buttons so I can log in quickly without precision tapping.
- As a Spanish-speaking user, I want the login interface and error messages to be in Spanish so I can understand them clearly.
- As a busy practitioner, I want to stay logged in for at least a week so I don't have to re-enter my credentials constantly between patient sessions.

## Specific Requirements

**Session Persistence (Bug Fix)**

- Change JWT access token expiration from `15m` to `7d` in `apps/server/src/modules/auth/auth.module.ts`.
- Ensure frontend `AuthProvider` correctly handles the long-lived token.

**Tablet-Optimized UI**

- Redesign `Login.tsx` to use a centered card layout that works well on iPad (Portrait & Landscape).
- Increase `Input` height to minimum `48px` (or `h-12`) for touch accessibility.
- Increase `Button` height to minimum `48px` (or `h-12`) and font size to `text-lg`.
- Increase Label font sizes to `text-base` or `text-lg`.

**Spanish Localization**

- Translate "Sign In" to "Iniciar Sesión".
- Translate "Email" to "Correo Electrónico".
- Translate "Password" to "Contraseña".
- Translate "Don't have an account? Sign up" to "¿No tienes cuenta? Regístrate".
- Translate placeholder texts (e.g., "ejemplo@correo.com").

**Error Handling**

- Replace generic "Invalid credentials" error with specific Spanish messages where possible, or at least a friendly "Correo o contraseña incorrectos".
- Display error messages in a `Alert` or distinct red text box with clear visibility.

## Visual Design

No visual assets provided. Use existing Shadcn/UI style but with larger dimensions for touch targets.

## Existing Code to Leverage

**`apps/client/src/pages/Login.tsx`**

- Existing login logic (state, API call, context update) should be preserved, only UI and text strings need changing.

**`apps/client/src/components/ui/button.tsx`**

- Use `Button` component. Consider adding a `size="lg"` variant if not present, or use `className="h-12 text-lg"`.

**`apps/client/src/components/ui/input.tsx`**

- Use `Input` component. Apply `className="h-12 text-lg"` for larger touch targets.

**`apps/server/src/modules/auth/auth.module.ts`**

- Modify `JwtModule.registerAsync` configuration for expiration time.

## Out of Scope

- "Forgot Password" functionality.
- "Remember Me" checkbox (session is 7 days by default).
- PIN code login.
- Registration page redesign.
- Social login (Google/Apple).
