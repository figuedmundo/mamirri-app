# Spec Requirements: JWT Authentication

## Initial Description

From Roadmap Week 2:

- [ ] **2.1 JWT Authentication:** Register/Login/Logout flows.

## Requirements Discussion

### First Round Questions

**Q1:** I assume we should implement a standard email/password login flow with bcrypt hashing for passwords. Is that correct, or do you need social login (Google/Apple) support immediately?
**Answer:** Standard login confirmed.

**Q2:** I'm thinking of using `passport-jwt` with Access Tokens (short-lived) and Refresh Tokens (long-lived, stored in httpOnly cookie) for security. Should we implement this dual-token strategy, or stick to a simpler single long-lived token for MVP?
**Answer:** Use JWT (Dual token strategy recommended for best practice).

**Q3:** For user registration, I assume we need a basic sign-up endpoint. Should we implement email verification (sending a link/code) now, or can users login immediately after registration for the MVP?
**Answer:** Suggested Default: Skip email verification for MVP. Users login immediately.

**Q4:** I'm thinking of creating a `CurrentUsers` decorator and a global `JwtAuthGuard` that we can apply globally or per-controller. Should we secure all routes by default and use a `@Public()` decorator for public routes, or explicit `@UseGuards()`?
**Answer:** Suggested Default: Secure all routes by default. Use `@Public()` for exceptions.

**Q5:** For the frontend, I assume we need a Login page and a Registration page using Shadcn/UI forms. Should we also implement a "Forgot Password" flow now, or is that out of scope for this week?
**Answer:** The more complete the better. Will include Login, Register, and a UI-only Forgot Password flow (placeholder backend).

**Q6:** I'm thinking of storing the `role` in the JWT payload to handle basic authorization (e.g. only ADMIN can delete users). Is role-based access control (RBAC) required now, or just authentication?
**Answer:** Suggested Default: Include `role` in JWT payload for foundation, but minimal enforcement logic for now.

### Existing Code to Reference

No similar existing features identified for reference.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

- N/A

## Requirements Summary

### Functional Requirements

- **Registration**: Endpoint to create a new user with hashed password.
- **Login**: Endpoint to validate credentials and return Access/Refresh tokens.
- **Logout**: Endpoint to clear cookies/tokens.
- **Refresh Token**: Endpoint to get a new Access Token using a valid Refresh Token.
- **Frontend Pages**:
  - Login Page (Email/Password)
  - Register Page (Name, Email, Password, Confirm Password)
  - Forgot Password Page (UI only)
- **Token Handling**: Frontend logic to store access token (memory/storage) and handle automatic refresh on 401 errors (interceptor).

### Reusability Opportunities

- Use `shadcn/ui` components (Card, Input, Button, Label, Form) for all auth pages.
- Reuse `MainLayout` or create `AuthLayout` (centered card pattern).

### Scope Boundaries

**In Scope:**

- Backend: NestJS Auth Module, Strategies (Local, JWT, Refresh), Guards, Decorators.
- Frontend: Auth Context/Provider, Protected Routes, Login/Register UI.
- Database: Update `User` model if needed (though already exists).

**Out of Scope:**

- Social Login (Google/Apple).
- Email Verification (sending actual emails).
- Password Reset functionality (sending actual reset emails).
- Two-Factor Authentication (2FA).

### Technical Considerations

- **Security**: Passwords must be hashed with `bcrypt`.
- **Cookies**: Refresh tokens should use `httpOnly` cookies to prevent XSS theft.
- **Global Guard**: Apply `JwtAuthGuard` globally in `APP_GUARD` provider.
- **Public Routes**: Login/Register endpoints must be decorated with `@Public()`.
