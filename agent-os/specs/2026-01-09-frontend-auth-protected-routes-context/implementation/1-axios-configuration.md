# Implementation Report: Axios Interceptor Setup

## Tasks Completed

- [x] 1.1 Write tests for axios interceptor
- [x] 1.2 Create axios configuration file
- [x] 1.3 Export configured axios instance and update imports
- [x] 1.4 Ensure tests pass

## Implementation Details

### Central Axios Instance

Created `apps/client/src/lib/axios.ts` which exports a configured axios instance `api`.

- **Base URL**: Set to `/api/v1`.
- **Request Interceptor**: Automatically injects `Authorization: Bearer <token>` from `localStorage`.
- **Response Interceptor**:
  - Intercepts 401 Unauthorized errors.
  - Attempts to refresh the token via `/auth/refresh`.
  - Retries the original request with the new token.
  - Redirects to `/login` and clears storage if refresh fails.
  - Includes logic to prevent infinite loops (does not intercept 401s from the refresh endpoint itself).

### Component Updates

Updated the following files to use the new `api` instance:

- `apps/client/src/context/AuthContext.tsx`
- `apps/client/src/pages/Login.tsx`
- `apps/client/src/pages/Register.tsx`

Replaced direct `axios` usage and relative paths (e.g., `/api/v1/auth/login` -> `/auth/login`) to leverage the configured `baseURL`.

### Backward Compatibility

- Modified `AuthContext` to temporarily store the token in `localStorage` during `login()`. This ensures the interceptor can find the token immediately, maintaining functionality until Task Group 2 (Auth Persistence) is fully implemented.

## Testing

- Created `apps/client/src/lib/axios.test.ts`.
- Implemented 5 focused tests verifying:
  1. Token injection.
  2. Pass-through of successful responses.
  3. Token refresh flow on 401.
  4. Logout flow on failed refresh.
  5. Prevention of refresh loops.
- All tests passed.

## Next Steps

Proceed to Task Group 2: Auth Context with Token Persistence.
