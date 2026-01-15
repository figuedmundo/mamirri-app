# Implementation Report: Task Group 4 - Global Validation

## Overview

This report documents the implementation of global validation for the Patients CRUD Backend. The goal was to enforce DTO validation rules across all endpoints using NestJS `ValidationPipe`.

## Changes Implemented

### 1. Global Validation Pipe Registration

Modified `apps/server/src/main.ts` to register `ValidationPipe` globally with the following configuration:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip properties not in DTO
    transform: true, // Automatically transform payloads to DTO instances
    forbidNonWhitelisted: true, // Throw error if extra properties are present
  }),
);
```

### 2. Verification Strategy

Created a new E2E test file `apps/server/test/validation.e2e-spec.ts` to verify the validation logic. This test:

1.  Mirrors the `main.ts` configuration (loading env vars, registering global pipes).
2.  Authenticates a test user (Register + Login).
3.  Attempts to create a patient with invalid data (empty name, future DOB).
4.  Asserts that the server returns `400 Bad Request` with specific validation error messages.
5.  Attempts to create a patient with valid data to ensure the pipe doesn't block legitimate requests.

### 3. Bug Fixes Discovered

During verification, a critical bug was discovered in `LocalStrategy` (`apps/server/src/modules/auth/strategies/local.strategy.ts`). The `validate` method was a stub returning an empty object, bypassing actual credential validation.

**Fix:**
Updated `LocalStrategy` to properly call `AuthService.validateUser(email, password)` and throw `UnauthorizedException` if validation fails.

## Verification Results

The `validation.e2e-spec.ts` test suite passes successfully.

**Test Case 1: Invalid Data**

- **Input:** Empty `firstName`, `dob` in 2099.
- **Output:** Status `400`.
- **Response:**
  ```json
  {
    "message": [
      "firstName must be longer than or equal to 2 characters",
      "Date of birth must not be in the future"
    ],
    "error": "Bad Request",
    "statusCode": 400
  }
  ```

**Test Case 2: Valid Data**

- **Input:** Valid patient data.
- **Output:** Status `201 Created`.

## Conclusion

Global validation is now active and enforced. The application is more robust against invalid input, and the authentication flow has been repaired.
