# Spec Requirements: Frontend Auth Protected Routes & Context

## Initial Description

Implement frontend authentication features including:

- Protected routes that require authentication
- Authentication context for managing auth state across the application

Source: agent-os/product/roadmap.md - Task 2.3, Week 2: Auth & Storage

## Requirements Discussion

### First Round Questions

**Q1:** I assume we should persist of access token in localStorage so users stay logged in across page refreshes. Is that correct, or would you prefer sessionStorage (clears on browser close) or no persistence at all?

**Answer:** localStorage for token persistence (keeps user logged in across page refreshes)

**Q2:** I'm thinking we should implement automatic token refresh using the refresh token cookie when's access token expires. Should we handle this transparently in an axios interceptor, or would you prefer explicit handling when API calls fail?

**Answer:** Transparent axios interceptor that handles 401 errors automatically

**Q3:** For initial auth check on app load, I'm planning to check localStorage for a stored access token and optionally validate it with the backend. Should we validate token on every app load, or just check if it exists locally for faster startup?

**Answer:** Just check localStorage for fast startup, validate lazily when making API calls

**Q4:** I notice, that current `isLoading` state is only used during logout. Should we add an initial loading state that shows while we're checking authentication status on app startup?

**Answer:** Yes, show loading screen while checking authentication on app load

**Q5:** Should we store both access token and user data in localStorage, or just's access token and fetch user data from the backend when needed?

**Answer:** Store both access token and user data in localStorage to avoid extra API calls and provide better UX

**Q6:** For logout, I'm assuming we should clear stored tokens and refresh token cookie. Is that correct, or are there any other cleanup steps needed?

**Answer:** Clear localStorage tokens and refresh token cookie, redirect to login page

### Existing Code to Reference

Based on user's response about similar features:

**Similar Features Identified:**

- Feature: AuthContext - Path: `apps/client/src/context/AuthContext.tsx`
  - Components to potentially reuse: Existing AuthContext structure with User interface, AuthContextType interface
  - Backend logic to reference: Auth service methods (login, logout) already implemented

- Feature: ProtectedRoute - Path: `apps/client/src/components/auth/ProtectedRoute.tsx`
  - Components to potentially reuse: Existing ProtectedRoute component structure
  - Backend logic to reference: Navigation patterns using react-router-dom's Navigate

- Feature: Login Page - Path: `apps/client/src/pages/Login.tsx`
  - Components to potentially reuse: Login form structure with axios API calls
  - Backend logic to reference: Auth context usage with useAuth hook

- Feature: Backend Auth Service - Path: `apps/server/src/modules/auth/auth.service.ts`
  - Components to potentially reuse: Token generation, user validation, logout functionality
  - Backend logic to reference: JWT token structure, refresh token handling

### Follow-up Questions

No follow-up questions were asked.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

No visual files found.

## Requirements Summary

### Functional Requirements

- **Token Persistence**: Store access token and user data in localStorage for cross-session persistence
- **Automatic Token Refresh**: Implement axios interceptor to transparently handle token refresh when access token expires (401 responses)
- **Initial Auth Check**: On app load, check localStorage for stored token and user data to determine auth state without backend call
- **Loading States**: Show loading indicator while checking authentication status on app startup
- **Protected Routes**: Ensure all application routes require authentication (using existing ProtectedRoute component)
- **Logout Flow**: Clear localStorage tokens and refresh token cookie, redirect to login page
- **Auth Context**: Manage auth state (user, isAuthenticated, isLoading) globally through AuthProvider

### Reusability Opportunities

- **Existing AuthContext**: Enhance current `apps/client/src/context/AuthContext.tsx` with token persistence and initial loading state
- **Existing ProtectedRoute**: Use current `apps/client/src/components/auth/ProtectedRoute.tsx` with improved loading handling
- **Existing Login Flow**: Reference `apps/client/src/pages/Login.tsx` for token storage patterns
- **Backend Auth Service**: Reference `apps/server/src/modules/auth/auth.service.ts` for token refresh flow

### Scope Boundaries

**In Scope:**

- Enhance AuthContext to persist tokens and user data in localStorage
- Implement axios interceptor for automatic token refresh on 401 errors
- Add initial loading state to AuthContext for app startup
- Improve ProtectedRoute to handle loading state properly
- Ensure logout clears all token storage

**Out of Scope:**

- Changes to backend authentication (already implemented)
- New authentication methods (e.g., OAuth, social login)
- Token revocation/blacklisting mechanisms
- Multi-factor authentication
- Session timeout warnings

### Technical Considerations

- **Integration Points**: Must work with existing NestJS JWT authentication (access tokens with refresh tokens in httpOnly cookies)
- **Existing System Constraints**: React 19, React Router v7, Axios for API calls, Shadcn/UI components
- **Technology Preferences**: localStorage for token storage (not sessionStorage), transparent token refresh via interceptor
- **Similar Code Patterns to Follow**: Current AuthContext structure, ProtectedRoute pattern, Login page axios integration

**Backend API Endpoints to Reference:**

- POST `/api/v1/auth/login` - Returns `{ accessToken, refreshToken, user }`
- POST `/api/v1/auth/refresh` - Returns `{ accessToken, refreshToken }`
- POST `/api/v1/auth/logout` - Clears refresh token cookie

**Token Structure:**

- Access Token: JWT passed in Authorization header (`Bearer <token>`)
- Refresh Token: JWT stored in httpOnly cookie named `refresh_token`
- User Data: `{ id, email, name, role }`
