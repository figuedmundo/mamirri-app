# Task Breakdown: Frontend Auth Protected Routes & Context

## Overview

Total Tasks: 4

## Task List

### Axios Configuration

#### Task Group 1: Axios Interceptor Setup

**Dependencies:** None

- [x] 1.0 Complete axios configuration
  - [x] 1.1 Write 2-4 focused tests for axios interceptor
    - Test 401 response triggers refresh token call
    - Test successful token refresh retries original request
    - Test failed refresh token triggers logout
    - Test refresh endpoint is not intercepted to prevent loops
  - [x] 1.2 Create axios configuration file
    - Base URL: `/api/v1`
    - Request interceptor to inject Bearer token from localStorage
    - Response interceptor to handle 401 errors
    - Refresh token logic with automatic retry
  - [x] 1.3 Export configured axios instance
    - Update existing axios imports to use configured instance
    - Maintain backward compatibility with existing API calls
  - [x] 1.4 Ensure axios interceptor tests pass
    - Run ONLY 2-4 tests written in 1.1
    - Verify token refresh works correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 2-4 tests written in 1.1 pass
- Axios interceptors handle 401 responses correctly
- Token refresh retries failed requests automatically
- Refresh token failure triggers logout

### AuthContext Enhancement

#### Task Group 2: Auth Context with Token Persistence

**Dependencies:** Task Group 1

- [x] 2.0 Complete AuthContext enhancement
  - [x] 2.1 Write 2-6 focused tests for AuthContext
    - Test localStorage stores access token on login
    - Test localStorage stores user data on login
    - Test initial mount loads user from localStorage
    - Test logout clears localStorage
    - Test isLoading state on initial mount
    - Test isAuthenticated reflects user state
  - [x] 2.2 Enhance AuthContext with localStorage persistence
    - Add useEffect to check localStorage on mount
    - Store access token to localStorage in login()
    - Store user data to localStorage in login()
    - Set isLoading to true during initial check, then false
    - Clear localStorage in logout()
    - Maintain existing interface and method signatures
  - [x] 2.3 Integrate axios instance
    - Import configured axios from Task Group 1
    - Remove axios.defaults configuration from context
    - Ensure token is set in localStorage before axios call
  - [x] 2.4 Ensure AuthContext tests pass
    - Run ONLY 2-6 tests written in 2.1
    - Verify localStorage operations work correctly
    - Verify loading state management
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 2-6 tests written in 2.1 pass
- Tokens and user data persist across page refreshes
- Initial loading state shows on app load
- AuthContext maintains existing API

### ProtectedRoute Enhancement

#### Task Group 3: Protected Route Loading State

**Dependencies:** Task Group 2

- [x] 3.0 Complete ProtectedRoute enhancement
  - [x] 3.1 Write 2-4 focused tests for ProtectedRoute
    - Test route shows loading when isLoading is true
    - Test route redirects to login when !isAuthenticated AND !isLoading
    - Test route renders children when authenticated
    - Test route prevents flash of login page during load
  - [x] 3.2 Enhance ProtectedRoute loading handling
    - Improve loading indicator UI with proper styling
    - Ensure redirect condition checks both !isAuthenticated AND !isLoading
    - Maintain existing component structure and props
    - Add accessible loading state following Shadcn/UI patterns
  - [x] 3.3 Ensure ProtectedRoute tests pass
    - Run ONLY 2-4 tests written in 3.1
    - Verify loading state displays correctly
    - Verify redirect logic works as expected
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 2-4 tests written in 3.1 pass
- Loading state shows during initial auth check
- No flash of login page on refresh
- Route protection works correctly

### Login & Register Integration

#### Task Group 4: Auth Forms Token Storage

**Dependencies:** Task Group 2

- [x] 4.0 Complete auth form updates
  - [x] 4.1 Write 2-4 focused tests for Login/Register
    - Test login calls context login() with correct data
    - Test register calls context login() with correct data
    - Test successful auth navigates to dashboard
    - Test failed auth shows error message
  - [x] 4.2 Update Login component
    - Verify context login() is called with user and token
    - Ensure axios call uses configured instance
    - Maintain existing error handling pattern
    - Navigation to dashboard on success
  - [x] 4.3 Update Register component
    - Verify context login() is called with user and token
    - Ensure axios call uses configured instance
    - Maintain existing validation logic
    - Navigation to dashboard on success
  - [x] 4.4 Ensure Login/Register tests pass
    - Run ONLY 2-4 tests written in 4.1
    - Verify token storage works on auth
    - Verify navigation flow is correct
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- The 2-4 tests written in 4.1 pass
- Login stores tokens correctly
- Register stores tokens correctly
- Users are navigated to dashboard on successful auth

### Testing

#### Task Group 5: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-4

- [x] 5.0 Review existing tests and fill critical gaps only
  - [x] 5.1 Review tests from Task Groups 1-4
    - Review 2-4 tests written for axios interceptor (Task 1.1)
    - Review 2-6 tests written for AuthContext (Task 2.1)
    - Review 2-4 tests written for ProtectedRoute (Task 3.1)
    - Review 2-4 tests written for auth forms (Task 4.1)
    - Total existing tests: approximately 8-18 tests
  - [x] 5.2 Analyze test coverage gaps for THIS feature only
    - Identify critical auth workflows that lack test coverage
    - Focus ONLY on gaps related to token persistence and refresh
    - Do NOT assess entire application test coverage
    - Prioritize integration tests over isolated unit tests
  - [x] 5.3 Write up to 8 additional strategic tests maximum
    - Add maximum of 8 new tests to fill identified critical gaps
    - Focus on end-to-end auth workflow (login → refresh → protected route)
    - Test error scenarios (network failure, malformed tokens)
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases unless business-critical
  - [x] 5.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, 4.1, and 5.3)
    - Expected total: approximately 16-26 tests maximum
    - Do NOT run entire application test suite
    - Verify critical auth workflows pass

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 16-26 tests total)
- Critical auth workflows are covered
- No more than 8 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

## Execution Order

Recommended implementation sequence:

1. Axios Configuration (Task Group 1) - Foundation for all API calls
2. AuthContext Enhancement (Task Group 2) - Core auth state management
3. ProtectedRoute Enhancement (Task Group 3) - Route protection with loading
4. Login & Register Integration (Task Group 4) - Form integration with token storage
5. Test Review & Gap Analysis (Task Group 5) - Comprehensive testing
