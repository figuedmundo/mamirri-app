# Frontend Authentication & Context

## Overview

This document details the implementation of persistent frontend authentication, automatic token refresh, and protected routes. This system ensures users remain logged in across page refreshes and handles token expiration transparently using JWTs.

## Key Decisions

### 1. Token Persistence

- **Decision:** Use `localStorage` to store the `access_token` and `user_data`.
- **Reasoning:** `localStorage` persists across browser sessions and tabs, providing a seamless user experience (unlike `sessionStorage`). While `httpOnly` cookies are more secure for access tokens, `localStorage` was chosen for the MVP to simplify client-side access for API calls, with the refresh token securely stored in an `httpOnly` cookie.

### 2. Automatic Token Refresh

- **Decision:** Implement a transparent `axios` response interceptor.
- **Reasoning:** Centralizing 401 handling allows the app to automatically refresh tokens and retry failed requests without user intervention or code duplication across components.

### 3. Loading State Management

- **Decision:** Introduce an explicit `isLoading` state in `AuthContext` and `ProtectedRoute`.
- **Reasoning:** To prevent the "flash of unauthenticated content" or premature redirects to the login page while the app checks `localStorage` during initialization.

## Implementation Details

### Axios Configuration

**File:** `apps/client/src/lib/axios.ts`

- **Central Instance:** A pre-configured `axios` instance (`api`) is exported for use throughout the app.
- **Request Interceptor:** Automatically injects the `Authorization: Bearer <token>` header from `localStorage` into every request.
- **Response Interceptor:**
  - Catches `401 Unauthorized` errors.
  - Calls `/api/v1/auth/refresh` to obtain a new access token.
  - Updates `localStorage` and the default header.
  - Retries the original failed request.
  - **Loop Prevention:** Explicitly ignores 401s from the refresh endpoint itself to prevent infinite retry loops, triggering a logout instead.

### Auth Persistence (AuthContext)

**File:** `apps/client/src/context/AuthContext.tsx`

- **Initialization:** On mount, a `useEffect` reads `access_token` and `user_data` from `localStorage` to restore the user session immediately.
- **State:**
  - `user`: Current user object.
  - `isAuthenticated`: Derived boolean.
  - `isLoading`: `true` during the initial `localStorage` check.
- **Actions:**
  - `login(user, token)`: Saves data to `localStorage` and updates state.
  - `logout()`: Clears `localStorage`, resets state, and calls the backend logout endpoint.

### Protected Routes

**File:** `apps/client/src/components/auth/ProtectedRoute.tsx`

- **Logic:** Wraps protected content. Checks both `isAuthenticated` and `isLoading`.
- **Behavior:**
  - If `isLoading`: Renders a loading spinner.
  - If `!isAuthenticated`: Redirects to `/login`.
  - If `isAuthenticated`: Renders the child components.
- **UX:** Eliminates the flash of login page on refresh.

## Changes Summary

### New Files

- `apps/client/src/lib/axios.ts`: Central axios configuration.
- `apps/client/src/tests/auth-integration.test.tsx`: Integration tests for full auth flows.
- `apps/client/src/lib/axios.test.ts`: Unit tests for interceptors.

### Modified Files

- `apps/client/src/context/AuthContext.tsx`: Added persistence and loading logic.
- `apps/client/src/components/auth/ProtectedRoute.tsx`: Added loading state handling.
- `apps/client/src/pages/Login.tsx`: Updated to use new `api` instance and `login` signature.
- `apps/client/src/pages/Register.tsx`: Updated to use new `api` instance and `login` signature.

## Testing Strategy

The implementation is verified by a mix of unit and integration tests:

1.  **Unit Tests (Vitest):**
    - **Axios:** Verify header injection, refresh flow, and error handling.
    - **AuthContext:** Verify storage operations and state updates.
    - **Components:** Verify rendering logic for `ProtectedRoute`, `Login`, and `Register`.

2.  **Integration Tests:**
    - **Full Flow:** Verifies `Login Form -> API -> Context -> LocalStorage -> Route Access`.
    - **Persistence:** Verifies `LocalStorage -> Auto-Login on Mount`.
    - **Logout:** Verifies `Logout Action -> Cleanup`.

**Test Command:**

```bash
pnpm test
```
