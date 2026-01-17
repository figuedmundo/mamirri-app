# E2E Testing Guide

This guide covers End-to-End (E2E) testing practices and implementation details for Mamirri App.

## Overview

E2E tests verify that the application works as expected from a user's perspective by simulating real user interactions through the entire application stack. We use **Playwright** as our E2E testing framework.

## Tech Stack

- **Framework**: Playwright
- **Pattern**: Page Object Model (POM)
- **Browser**: Chromium (primary), with support for WebKit and Firefox

## Architecture

### Project Structure

```
apps/client/tests/
├── e2e/
│   ├── pages/              # Page Objects (POM pattern)
│   │   ├── BasePage.ts    # Common functionality
│   │   ├── PatientPage.ts  # Patient management page
│   │   └── CasePage.ts    # Clinical case page
│   ├── smoke.spec.ts       # Basic smoke tests
│   ├── create-patient.spec.ts
│   └── record-session.spec.ts
└── playwright.config.ts    # Playwright configuration
```

### Page Object Model (POM)

The POM pattern encapsulates page structure and interactions into reusable classes, making tests more maintainable.

#### BasePage

Provides shared functionality across all pages:

```typescript
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForToast(message: string | RegExp) {
    await expect(this.page.getByText(message).first()).toBeVisible();
  }

  async mockAuth() {
    await this.page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@test.com',
          name: 'Test User',
        }),
      });
    });
    await this.page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'fake-token');
      window.localStorage.setItem(
        'user_data',
        JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test User' }),
      );
    });
  }
}
```

#### Page-Specific Objects

Extend BasePage for specific pages:

```typescript
export class PatientPage extends BasePage {
  readonly newPatientButton: Locator;
  readonly nameInput: Locator;

  constructor(page: Page) {
    super(page);
    this.newPatientButton = page.getByRole('button', {
      name: /Nuevo Paciente/i,
    });
    this.nameInput = page.getByLabel(/Nombre/i);
  }

  async gotoList() {
    await this.goto('/pacientes');
  }

  async createPatient(data: { name: string; age: string; occupation: string }) {
    await this.newPatientButton.click();
    await this.nameInput.fill(data.name);
    // ... more interactions
  }
}
```

## Best Practices

### Selector Priority

Always use the most stable selector type (from most to least stable):

1. **getByRole()** - Best for interactive elements

   ```typescript
   page.getByRole('button', { name: 'Submit' });
   ```

2. **getByLabel()** - Best for form controls

   ```typescript
   page.getByLabel('Email address');
   ```

3. **getByText()** - For static content only

   ```typescript
   page.getByText('Welcome back');
   ```

4. **getByTestId()** - Last resort, requires testid attributes
   ```typescript
   page.getByTestId('date-picker');
   ```

❌ **Avoid**: CSS selectors (`page.locator('.btn-primary')`) or ID selectors (`page.locator('#submit')`)

### Test Organization

- **One file per feature**: All tests for a feature go in one spec file
- **Descriptive test names**: Use clear, action-oriented names
- **Test independence**: Each test should be able to run independently

### API Mocking

Isolate tests from backend by mocking API responses:

```typescript
test('create patient flow', async ({ page }) => {
  await page.route('**/api/v1/patients', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, firstName: 'Juan', lastName: 'Perez' }),
      });
    }
  });

  // ... test code
});
```

### Test Data

Use consistent test data for reproducibility:

```typescript
const testPatient = {
  name: 'Juan Perez',
  age: '45',
  occupation: 'Ingeniero',
  phone: '123456789',
  email: 'juan@example.com',
};
```

## Current Test Coverage

### Smoke Tests

**File**: `smoke.spec.ts`

- ✅ Application loads correctly
- ✅ Page title verification

### Critical User Flows

**File**: `create-patient.spec.ts`

- ✅ Navigate to patients list
- ✅ Click "Nuevo Paciente" button
- ✅ Fill patient form with valid data
- ✅ Submit form
- ✅ Verify success toast

**File**: `record-session.spec.ts`

- ✅ Navigate to case detail page
- ✅ Click "Nueva Sesión" button
- ✅ Select phase
- ✅ Add procedures
- ✅ Fill observations and response
- ✅ Submit session
- ✅ Verify success toast

## Running E2E Tests

### Run All Tests

```bash
pnpm test:e2e
```

### Run Tests in UI Mode (Debug)

```bash
pnpm test:e2e:ui
```

### Run Specific Test File

```bash
pnpm --filter client exec playwright test tests/e2e/create-patient.spec.ts
```

### Run with Specific Browser

```bash
pnpm --filter client exec playwright test --project=chromium
pnpm --filter client exec playwright test --project=webkit
```

## Playwright Configuration

Located at `apps/client/playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

## Adding New E2E Tests

When adding new E2E tests:

1. **Check existing page objects**: Reuse existing page objects if available
2. **Create/update page objects**: Add new locators and methods to page classes
3. **Write the test**: Follow existing patterns in `tests/e2e/`
4. **Mock API responses**: Ensure test isolation from backend
5. **Test critical path**: Focus on user-facing functionality

Example: Adding a login test

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('user can login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'test-token',
        user: { id: 1, email: 'test@test.com' },
      }),
    });
  });

  await loginPage.goto();
  await loginPage.login({ email: 'test@test.com', password: 'password123' });
  await expect(page).toHaveURL('/dashboard');
});
```

## Troubleshooting

### Tests Fail on Local but Pass in CI

- Ensure backend is not running (E2E tests mock API)
- Check that `http://localhost:5173` is available
- Try running with `--debug` flag

### Locators Not Found

- Take a snapshot to see actual DOM structure: `await page.screenshot({ path: 'debug.png' })`
- Verify page has fully loaded: `await page.waitForLoadState('networkidle')`
- Use Playwright Inspector: Run with `--debug` flag

### Flaky Tests

- Increase timeout: `test.setTimeout(10000)`
- Add explicit waits: `await page.waitForSelector(...)`
- Check for race conditions in async operations

## CI/CD Integration

E2E tests run automatically in GitHub Actions via `.github/workflows/test-e2e.yml`.

Test results are available in the workflow runs and can be viewed as HTML reports.

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Pattern](https://playwright.dev/docs/pom)
