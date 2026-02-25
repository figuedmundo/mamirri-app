# Onboarding & Invitation Testing Guide

**Last Updated:** 2026-02-20  
**Test Framework:** Vitest (unit) + Playwright (E2E)

---

## 🧪 Test Overview

We have created comprehensive tests for the new clinic-first onboarding flow and invitation system.

### Test Types

1. **Unit Tests (Vitest)** - Fast, isolated component tests
2. **E2E Tests (Playwright)** - Full user journey tests

---

## 📁 Test Files Created

### Unit Tests (Vitest)

#### `apps/client/src/pages/Onboarding.test.tsx`

Tests for the new clinic-first onboarding component:

| Test Suite                     | Coverage                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Step 1: Clinic Information** | Renders form with Spanish UI labels, validates required fields, enables/disables continue button |
| **Step 2: Admin Account**      | Advances to step 2, shows clinic context, renders form fields, back button navigation            |
| **Form Submission**            | Password matching validation                                                                     |
| **Accessibility**              | Required field indicators, heading hierarchy                                                     |

**Key Features Tested:**

- ✅ Spanish UI labels (following ADR 008: English code, Spanish UI)
- ✅ Required field validation
- ✅ Step navigation (continue/back)
- ✅ Password confirmation matching
- ✅ Therapist guidance messages
- ✅ Login link for existing users

---

### E2E Tests (Playwright)

#### `apps/client/tests/e2e/onboarding-new-flow.spec.ts`

Full integration tests for the onboarding flow:

| Test                                                   | Description                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| `complete onboarding creates clinic and admin account` | Full 2-step flow: Login page → Step 1 → Step 2 → Success page |
| `shows name unavailable error`                         | Real-time validation displays error for taken names           |
| `validates required fields in step 1`                  | Button disabled until required fields valid                   |
| `validates password match in step 2`                   | Error shown when passwords don't match                        |
| `can navigate back from step 2 to step 1`              | Back button returns to step 1 with data persisted             |
| `success page action cards navigate correctly`         | Clicking cards navigates to correct routes                    |
| `shows therapist guidance on login page`               | Login page displays guidance for therapists                   |

#### `apps/client/tests/e2e/invitation-flow.spec.ts`

Complete invitation and PIN setup tests:

| Test Suite                    | Tests                                                  |
| ----------------------------- | ------------------------------------------------------ |
| **Invitation Flow**           | Accept invitation → Create account → Login → PIN setup |
| **Invalid Token**             | Shows error for invalid/expired invitations            |
| **Password Match**            | Validates password confirmation                        |
| **Skip PIN**                  | Can skip PIN setup on first login                      |
| **PIN Flow**                  | Set up 4-digit PIN on first login                      |
| **PIN Mismatch**              | Error when PINs don't match                            |
| **No PIN for existing users** | Users with PIN skip setup                              |
| **Owner Invites Therapist**   | Clinic owner invites therapist via UI                  |
| **Owner Invites Co-owner**    | Clinic owner invites another CLINIC_OWNER              |

---

## 🚀 Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm --filter client test

# Run specific test file
pnpm --filter client test Onboarding.test.tsx

# Run in watch mode
pnpm --filter client test --watch

# Run with coverage
pnpm --filter client test --coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
pnpm --filter client test:e2e

# Run specific test file
pnpm --filter client test:e2e onboarding-new-flow.spec.ts

# Run with UI (headed mode)
pnpm --filter client test:e2e:ui

# Run in headed mode (see browser)
pnpm --filter client test:e2e:headed

# Run specific test
pnpm --filter client test:e2e --grep "complete onboarding"
```

---

## 📝 Test Data Examples

### Onboarding Test Data

```typescript
// Clinic Information (Step 1)
const clinicData = {
  clinicName: 'Clínica Test E2E',
  clinicEmail: 'test@clinicaplaywright.com',
  clinicPhone: '+34 911 222 333',
  clinicAddress: 'Calle E2E 123, Madrid',
};

// Admin Account (Step 2)
const adminData = {
  adminName: 'Dr. Test E2E',
  adminEmail: 'test.playwright@example.com',
  adminPassword: 'TestPass123',
  adminLicenseNumber: 'F-99999',
};
```

### Invitation Test Data

```typescript
const invitationData = {
  token: 'valid-invitation-token-xyz',
  email: 'therapist.test@example.com',
  role: 'THERAPIST',
  clinicName: 'Clínica Fisioterapia García',
};

const newTherapist = {
  name: 'Dra. Ana López',
  password: 'TherapistPass123',
  pin: '1234',
};
```

---

## 🎯 Testing Checklist

### Onboarding Flow Tests

- [ ] **Step 1 Validation**
  - [ ] Empty fields disable continue button
  - [ ] Clinic name < 2 chars shows error
  - [ ] Invalid email format shows error
  - [ ] Real-time name availability check
  - [ ] Available name shows checkmark
  - [ ] Taken name shows error

- [ ] **Navigation**
  - [ ] Continue advances to Step 2
  - [ ] Back returns to Step 1
  - [ ] Data persists when going back

- [ ] **Step 2 Validation**
  - [ ] Empty fields disable submit
  - [ ] Password < 6 chars shows error
  - [ ] Password mismatch shows error
  - [ ] All required fields enable submit

- [ ] **Success Page**
  - [ ] Displays clinic name
  - [ ] All action cards clickable
  - [ ] Dashboard button works

### Invitation Flow Tests

- [ ] **Accept Invitation**
  - [ ] Valid token shows invitation details
  - [ ] Email pre-filled and disabled
  - [ ] Form validation works
  - [ ] Submit creates account
  - [ ] Auto-login after acceptance

- [ ] **PIN Setup**
  - [ ] Shows on first login
  - [ ] 4-digit entry
  - [ ] Confirmation required
  - [ ] Mismatch shows error
  - [ ] Skip option available
  - [ ] Success closes modal

- [ ] **Error Cases**
  - [ ] Invalid token shows error
  - [ ] Expired token shows error
  - [ ] Used token shows error
  - [ ] Password mismatch shows error

---

## 🔍 Debugging Tests

### Unit Test Debugging

```bash
# Run with verbose output
pnpm --filter client test --reporter=verbose

# Run single test with debugging
pnpm --filter client test --grep "renders clinic information"
```

### E2E Test Debugging

```bash
# Run in headed mode to see browser
pnpm --filter client test:e2e --headed

# Run with slow motion (see each action)
pnpm --filter client test:e2e --slow-mo 1000

# Open Playwright inspector
PWDEBUG=1 pnpm --filter client test:e2e

# View trace
pnpm --filter client test:e2e --trace on
```

---

## 🌐 Language Strategy (ADR 008)

All tests follow the **English Code, Spanish UI** strategy:

### Code (English)

```typescript
// Test descriptions
it('advances to step 2 when continue is clicked', () => {
  // Test code
});

// Variables
const clinicName = 'Test Clinic';
const adminEmail = 'admin@example.com';
```

### UI Assertions (Spanish)

```typescript
// Match Spanish UI text
expect(screen.getByLabelText(/nombre de la clínica/i)).toBeInTheDocument();
expect(screen.getByRole('button', { name: /continuar/i })).toBeEnabled();
expect(screen.getByText(/crea tu clínica/i)).toBeInTheDocument();
```

---

## 🔄 Test Maintenance

### When to Update Tests

1. **UI Text Changes**
   - Update Spanish text matchers
   - Keep English test descriptions

2. **Flow Changes**
   - Add new steps to E2E tests
   - Update navigation assertions

3. **Validation Changes**
   - Update validation test cases
   - Add new error message checks

4. **New Features**
   - Add new test suites
   - Update existing tests

---

## 📊 Test Coverage Goals

| Component                   | Target Coverage |
| --------------------------- | --------------- |
| Onboarding Component        | 90%+            |
| OnboardingSuccess Component | 80%+            |
| Invitation Flow             | 85%+            |
| PIN Setup                   | 80%+            |
| API Integration             | 100%            |

---

## 🐛 Common Issues

### Issue: Tests fail due to API mocks

**Solution:** Ensure all API calls are mocked

```typescript
await page.route('**/api/v1/onboarding/check-name**', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ available: true }),
  });
});
```

### Issue: Tests timeout

**Solution:** Increase timeout for async operations

```typescript
await waitFor(
  () => {
    expect(element).toBeVisible();
  },
  { timeout: 3000 },
);
```

### Issue: Query client errors

**Solution:** Create isolated query client per test

```typescript
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
```

---

## 📚 Related Documentation

- [Roles & Onboarding](./roles-and-onboarding.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [ADR 008: Language Strategy](../../product/decisions/008-language-strategy-english-code-spanish-ui.md)

---

**Need Help?**

- Check test output for specific error messages
- Review mock data matches API expectations
- Ensure all required fields are filled in tests
- Verify Spanish text matches UI exactly
