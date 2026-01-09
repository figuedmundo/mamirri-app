# Specification: Frontend Auth Protected Routes & Context

## Goal

Implement persistent authentication with automatic token refresh and protected routes to provide seamless authenticated user experience across page refreshes.

## User Stories

- As a physiotherapist, I want to stay logged in when I refresh the page so I can continue my work without re-entering credentials
- As a user, I want my session to automatically refresh without interruption so I don't experience unexpected logouts
- As a user, I want the app to securely handle my authentication state and protect sensitive routes from unauthorized access

## Specific Requirements

**Token Persistence and Initial Auth Check**

- Store access token and user data in localStorage keys `access_token` and `user_data` on successful login
- On AuthProvider mount, check localStorage for stored token and user data to initialize auth state
- Set initial `isLoading` to true while checking localStorage, then false after check completes
- Store user object containing `{ id, email, name, role }` from backend response
- Maintain current `login()` function signature but add localStorage persistence logic
- Remove token and user data from localStorage on logout

**Automatic Token Refresh via Axios Interceptor**

- Create axios interceptor that catches 401 Unauthorized responses from any API call
- On 401, call `/api/v1/auth/refresh` endpoint to get new access token
- Store new access token in localStorage and update axios defaults Authorization header
- Retry original failed request with new token automatically without user action
- Handle refresh token failure by logging out user and redirecting to login page
- Set up interceptor in central axios configuration file, not in individual components
- Ensure interceptor does not intercept the refresh endpoint itself to prevent infinite loops

**Enhanced AuthContext State Management**

- Keep existing `user`, `isAuthenticated`, `isLoading`, `login`, `logout` state and methods
- Add `isLoading` to true on initial mount during localStorage check, then set to false
- Export `useAuth()` hook as existing pattern for component consumption
- Maintain TypeScript interfaces for User and AuthContextType with full type safety
- Ensure auth state updates trigger re-renders in all consuming components

**Protected Route Enhancement**

- Keep existing ProtectedRoute component structure but ensure it uses `isLoading` state properly
- Show loading indicator when auth context is checking localStorage (initial load)
- Redirect to `/login` only when `!isAuthenticated` AND `!isLoading`
- Avoid flash of login page by respecting loading state before redirecting
- Maintain existing pattern of wrapping protected routes in ProtectedRoute component

**Logout Flow Enhancement**

- Clear `access_token` and `user_data` from localStorage
- Clear refresh token cookie via API call to `/api/v1/auth/logout`
- Reset auth context state to initial values (user: null, isAuthenticated: false)
- Redirect user to `/login` page after logout completes
- Ensure logout works from any route and properly cleans up all auth state

**Login and Register Integration**

- Update Login component to store tokens in `login()` call after successful authentication
- Update Register component to store tokens in `login()` call after successful registration
- Maintain existing axios API call patterns in both components
- Navigate to protected route (Dashboard) after successful login/register
- Display user-friendly error messages on auth failures

**Axios Configuration**

- Create central axios configuration file with base URL and default headers
- Configure Authorization header to include Bearer token from localStorage or context
- Set up request interceptor to inject token into every outgoing API call
- Apply interceptors globally so all axios calls benefit from token refresh
- Ensure interceptors handle errors gracefully without breaking app functionality

**Error Handling**

- Show user-friendly error messages for authentication failures
- Handle network errors during token refresh without infinite retry loops
- Log out user automatically if refresh token is invalid or expired
- Do not expose technical error details or stack traces to users
- Use toast or inline error messages following existing Shadcn/UI patterns

**Security Considerations**

- Never store refresh token in localStorage (already handled via httpOnly cookie)
- Clear all auth state on logout to prevent unauthorized access
- Ensure axios Authorization header is set correctly with `Bearer ${token}` format
- Validate user data structure before storing in localStorage
- Handle malformed or expired tokens gracefully by clearing storage and redirecting

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**AuthContext (`apps/client/src/context/AuthContext.tsx`)**

- Base context structure with Provider and custom hook pattern to extend
- User interface definition with `id`, `email`, `name`, `role` fields to reuse
- AuthContextType interface with state and methods to maintain
- Existing `login()` method signature to enhance with localStorage persistence
- Existing `logout()` method to extend with localStorage cleanup

**ProtectedRoute (`apps/client/src/components/auth/ProtectedRoute.tsx`)**

- React Router integration with Navigate component for redirection
- Auth context consumption pattern using `useAuth()` hook to follow
- Loading state handling approach to maintain and improve
- Route protection logic with authentication check to enhance

**Login Page (`apps/client/src/pages/Login.tsx`)**

- Axios API call pattern for `/api/v1/auth/login` endpoint to reference
- Form submission handling with error state management
- Auth context integration with `login()` call and navigation
- Shadcn/UI Card, Input, Button components usage pattern to follow

**Register Page (`apps/client/src/pages/Register.tsx`)**

- Axios API call pattern for `/api/v1/auth/register` endpoint to reference
- Form validation and error handling approach to follow
- Token storage pattern after successful registration
- Similar component structure to Login for consistency

**Backend Auth Service (`apps/server/src/modules/auth/auth.service.ts`)**

- Token refresh endpoint `/api/v1/auth/refresh` implementation to reference
- Logout endpoint `/api/v1/auth/logout` implementation to call
- JWT token structure and payload format understanding
- Refresh token cookie handling approach on backend

## Out of Scope

- Backend authentication changes or modifications
- OAuth or social login authentication methods
- Multi-factor authentication (MFA) implementation
- Token revocation or blacklisting mechanisms
- Session timeout warnings before logout
- Password reset flow (already exists in ForgotPassword.tsx)
- Remember me functionality with extended tokens
- Account verification or email confirmation flows
- Role-based access control (RBAC) UI
- User profile editing or account management
