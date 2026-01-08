# Task Breakdown: JWT Authentication

## Overview

Total Tasks: 4 task groups with 24 sub-tasks

## Task List

### Backend Authentication Layer

#### Task Group 1: Auth Module Infrastructure

**Dependencies:** None

- [x] 1.0 Complete Auth Module Infrastructure
  - [x] 1.1 Write 2-8 focused tests for Auth module setup
    - Test AuthModule is correctly configured with required providers
    - Test AuthService can be injected
    - Test AuthController is properly registered
  - [x] 1.2 Install required dependencies
    - Install: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `passport-local`, `bcrypt`, `class-validator`, `class-transformer`
  - [x] 1.3 Configure AuthModule
    - Register JWT module with secret key configuration
    - Register Passport strategies (Local, JWT, RefreshToken)
    - Provide AuthService globally
  - [x] 1.4 Create base decorators
    - Create `@Public()` decorator for marking public routes
    - Create `@CurrentUser()` decorator for accessing logged-in user
  - [x] 1.5 Create base guards
    - Create `JwtAuthGuard` using JWT strategy
    - Create `LocalAuthGuard` using Local strategy
    - Create `RefreshTokenGuard` using RefreshToken strategy
  - [x] 1.6 Ensure Auth module infrastructure tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify all providers are registered correctly
    - Verify decorators and guards work as expected

**Acceptance Criteria:**

- The 2-8 tests written in 1.1 pass
- All required dependencies installed
- AuthModule configured with JWT, Passport, bcrypt
- @Public() and @CurrentUser() decorators functional
- All guards (Jwt, Local, RefreshToken) functional

#### Task Group 2: Authentication Strategies & Services

**Dependencies:** Task Group 1

- [x] 2.0 Complete Authentication Strategies & Services
  - [x] 2.1 Write 2-8 focused tests for auth services
    - Test user registration with password hashing
    - Test user login with valid credentials returns tokens
    - Test user login with invalid credentials throws UnauthorizedException
    - Test refresh token generates new access token
    - Test logout clears refresh token
  - [x] 2.2 Implement LocalStrategy
    - Validate user credentials against database
    - Return user object if credentials valid
    - Handle invalid credentials with UnauthorizedException
  - [x] 2.3 Implement JwtStrategy
    - Validate JWT token from Authorization header
    - Extract user payload (id, email, role)
    - Attach user to request object
  - [x] 2.4 Implement RefreshTokenStrategy
    - Validate refresh token from httpOnly cookie
    - Verify refresh token against database/store
    - Generate new access token
  - [x] 2.5 Implement AuthService methods
    - `register(name, email, password)`: Hash password with bcrypt, create user
    - `login(email, password)`: Validate credentials, generate access/refresh tokens
    - `logout(userId)`: Clear refresh token
    - `refreshTokens(refreshToken)`: Validate refresh token, generate new access token
    - `generateTokens(user)`: Helper to create signed JWTs with role payload
  - [x] 2.6 Add input validation DTOs
    - Create `RegisterDto`: name, email, password, confirmPassword
    - Create `LoginDto`: email, password
    - Use class-validator decorators for validation
    - Validate email format and password strength
  - [x] 2.7 Ensure auth services tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify all auth flows work correctly
    - Verify password hashing with bcrypt
    - Verify token generation and validation

**Acceptance Criteria:**

- The 2-8 tests written in 2.1 pass
- LocalStrategy validates credentials correctly
- JwtStrategy validates tokens and extracts user payload
- RefreshTokenStrategy validates and refreshes tokens
- AuthService methods (register, login, logout, refresh) functional
- DTOs validate input correctly with proper error messages

#### Task Group 3: Auth API Endpoints

**Dependencies:** Task Group 2

- [x] 3.0 Complete Auth API Endpoints
  - [x] 3.1 Write 2-8 focused tests for auth endpoints
    - Test POST /auth/register creates user with hashed password
    - Test POST /auth/login returns access and refresh tokens
    - Test POST /auth/login sets httpOnly refresh token cookie
    - Test POST /auth/refresh returns new access token
    - Test POST /auth/logout clears refresh token cookie
    - Test protected routes return 401 without auth
    - Test @Public() decorator allows unauthenticated access
  - [x] 3.2 Create AuthController endpoints
    - POST /auth/register: Create new user account
    - POST /auth/login: Authenticate and issue tokens
    - POST /auth/refresh: Refresh access token
    - POST /auth/logout: Invalidate refresh token
  - [x] 3.3 Apply guards and decorators
    - Apply @Public() to register and login endpoints
    - Apply @UseGuards(JwtAuthGuard) to protected endpoints
    - Use @CurrentUser() decorator in protected endpoints to access user
  - [x] 3.4 Configure cookie settings
    - Set httpOnly: true for refresh token cookie
    - Set secure: true in production
    - Set sameSite: 'strict' for CSRF protection
  - [x] 3.5 Add error handling
    - Return 400 for validation errors (class-validator)
    - Return 401 for invalid credentials
    - Return 409 for duplicate email
    - Use standard error format from error-handling standards
  - [x] 3.6 Register AuthModule in AppModule
    - Import AuthModule
    - Configure APP_GUARD to use JwtAuthGuard globally
  - [x] 3.7 Ensure auth endpoints tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify all endpoints return correct responses
    - Verify cookie behavior (httpOnly, secure)
    - Verify global guard protects routes correctly

**Acceptance Criteria:**

- The 2-8 tests written in 3.1 pass
- All auth endpoints functional (register, login, refresh, logout)
- JWT tokens issued correctly with role in payload
- Refresh token stored in httpOnly cookie
- Global JwtAuthGuard protects all routes except @Public() ones
- Proper HTTP status codes and error messages
- AuthModule registered in AppModule with global guard

### Frontend Authentication Layer

#### Task Group 4: Frontend Auth UI & State Management

**Dependencies:** Task Group 3

- [x] 4.0 Complete Frontend Auth UI & State Management
  - [x] 4.1 Write 2-8 focused tests for auth components
    - Test LoginForm component renders correctly
    - Test LoginForm submits login request on form submit
    - Test RegisterForm validates password match
    - Test AuthContext provides auth state correctly
    - Test ProtectedRoute redirects to login when unauthenticated
  - [x] 4.2 Create AuthContext/Provider
    - Create AuthContext with: user, isAuthenticated, loading state
    - Implement login(email, password): Store access token in memory/storage
    - Implement logout(): Clear tokens, redirect to login
    - Implement refresh logic: Call /auth/refresh on 401 error
  - [x] 4.3 Create Axios interceptor
    - Attach access token to Authorization header on all requests
    - Handle 401 errors by calling /auth/refresh
    - If refresh fails, redirect to login page
  - [x] 4.4 Create Login Page component
    - Use Shadcn/UI components: Card, Input, Button, Label, Form
    - Form fields: Email, Password
    - Submit to POST /auth/login
    - Handle errors (401, 400) with user-friendly messages
    - Redirect to dashboard on success
  - [x] 4.5 Create Register Page component
    - Use Shadcn/UI components
    - Form fields: Name, Email, Password, Confirm Password
    - Client-side validation (password match, email format)
    - Submit to POST /auth/register
    - Redirect to login page on success
  - [x] 4.6 Create Forgot Password Page component
    - Use Shadcn/UI components
    - Form field: Email
    - UI-only (placeholder backend)
    - Show success message (no actual email sent)
  - [x] 4.7 Create ProtectedRoute component
    - Check AuthContext for authentication
    - Redirect to /login if not authenticated
    - Render children if authenticated
  - [x] 4.8 Create AuthLayout component
    - Centered card layout for auth pages
    - Reuse MainLayout styling where appropriate
    - Responsive design (mobile-friendly)
  - [x] 4.9 Configure routing
    - Add routes: /login, /register, /forgot-password
    - Wrap protected routes with ProtectedRoute
    - Use AuthLayout for auth pages
  - [x] 4.10 Ensure frontend auth tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify auth state management works
    - Verify forms submit correctly
    - Verify protected routes redirect properly

**Acceptance Criteria:**

- The 2-8 tests written in 4.1 pass
- AuthContext manages user state and tokens correctly
- Axios interceptor attaches tokens and handles 401 refresh
- Login/Register/Forgot Password pages render with Shadcn/UI
- Forms validate client-side and submit to correct endpoints
- ProtectedRoute redirects unauthenticated users
- AuthLayout provides centered, responsive design
- Routing configured for all auth pages

## Execution Order

Recommended implementation sequence:

1. Backend Auth Module Infrastructure (Task Group 1)
2. Backend Auth Strategies & Services (Task Group 2)
3. Backend Auth API Endpoints (Task Group 3)
4. Frontend Auth UI & State Management (Task Group 4)

## Notes

- All backend tests use Jest/NestJS testing utilities
- All frontend tests use React Testing Library
- Follow error-handling standards: user-friendly messages, specific exceptions
- Follow validation standards: server-side validation with class-validator, client-side validation for UX
- Follow API standards: RESTful design, consistent naming, appropriate HTTP status codes
- Follow frontend component standards: single responsibility, reusability, clear interfaces
- JWT secret should use environment variables (JWT_SECRET, JWT_REFRESH_SECRET)
- Access token expiry: 15 minutes (recommended)
- Refresh token expiry: 7 days (recommended)
