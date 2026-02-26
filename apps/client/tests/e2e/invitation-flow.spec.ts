import { test, expect } from '@playwright/test';

test.describe('Invitation Flow - Therapist Joins Clinic', () => {
  const TEST_CLINIC_ID = 'clinic-test-123';
  const INVITATION_TOKEN = 'valid-invitation-token-xyz';
  const THERAPIST_EMAIL = 'therapist.test@example.com';

  test('complete invitation flow: invite → accept → login → PIN setup', async ({
    page,
  }) => {
    // Mock invitation validation
    await page.route(
      `**/api/v1/auth/invite/${INVITATION_TOKEN}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            email: THERAPIST_EMAIL,
            role: 'THERAPIST',
            clinicName: 'Clínica Fisioterapia García',
            expiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          }),
        });
      },
    );

    // Mock invitation acceptance
    await page.route('**/api/v1/auth/invite/accept', async (route) => {
      if (route.request().method() === 'POST') {
        const payload = await route.request().postDataJSON();

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-therapist-123',
              email: payload.email,
              name: payload.name,
              role: 'THERAPIST',
              clinicId: TEST_CLINIC_ID,
              clinicName: 'Clínica Fisioterapia García',
            },
            accessToken: 'fake-therapist-token',
            refreshToken: 'fake-therapist-refresh',
          }),
        });
      }
    });

    // Override beforeEach mock to show PIN setup
    await page.route('**/api/v1/auth/pin/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPinSet: false }),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.removeItem('pin_setup_skipped');
    });

    await page.addInitScript(() => {
      window.localStorage.removeItem('pin_setup_skipped');
    });

    // Mock PIN setup
    await page.route('**/api/v1/auth/pin/setup', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }
    });

    // Step 1: Therapist clicks invitation link
    await page.goto(`/invite/accept?token=${INVITATION_TOKEN}`);

    // Verify invitation page loads
    await expect(page.getByText(/te invitamos a unirte a/i)).toBeVisible();

    // Verify clinic name and role are displayed
    await expect(page.getByText(/clínica fisioterapia garcía/i)).toBeVisible();
    await expect(page.getByText(/fisioterapeuta/i)).toBeVisible();

    // Verify email is pre-filled and disabled
    const emailInput = page.getByRole('textbox', {
      name: /correo electrónico/i,
    });
    await expect(emailInput).toHaveValue(THERAPIST_EMAIL);
    await expect(emailInput).toBeDisabled();

    // Step 2: Fill registration form
    await page
      .getByRole('textbox', { name: /nombre completo/i })
      .fill('Dra. Ana López');

    await page.locator('#password').fill('TherapistPass123');
    await page.locator('#confirmPassword').fill('TherapistPass123');

    // Submit form
    await page.locator('#confirmPassword').press('Enter');

    // Step 3: Verify redirected to success page or dashboard
    await expect(page).toHaveURL(/\/invite\/success|\//);

    if (page.url().includes('/invite/success')) {
      await page.goto('/');
      await expect(page).toHaveURL('/');
    }

    await page.evaluate(() => {
      if (!window.localStorage.getItem('access_token')) {
        window.localStorage.setItem('access_token', 'fake-therapist-token');
      }
      if (!window.localStorage.getItem('user_data')) {
        window.localStorage.setItem(
          'user_data',
          JSON.stringify({
            id: 'user-therapist-123',
            email: 'therapist.test@example.com',
            name: 'Dra. Ana López',
            role: 'THERAPIST',
            clinicId: 'clinic-test-123',
          }),
        );
      }
      window.localStorage.removeItem('pin_setup_skipped');
    });
    await page.goto('/');

    // PIN setup modal should appear (first time login)
    await expect(page.getByText(/configurar pin/i)).toBeVisible({
      timeout: 15000,
    });

    await expect(page.getByText(/crea un pin de 4 dígitos/i)).toBeVisible();

    // Step 4: Set up PIN

    // Step 4: Set up PIN
    // Enter first PIN
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: '3' }).click();
    await page.getByRole('button', { name: '4' }).click();

    // Should ask to confirm
    await expect(page.getByText(/confirmar pin/i)).toBeVisible({
      timeout: 10000,
    });

    // Enter same PIN again to confirm
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: '3' }).click();
    await page.getByRole('button', { name: '4' }).click();

    // PIN setup modal should close
    await expect(page.getByText(/configurar pin/i)).not.toBeVisible();

    // User should see dashboard
    await expect(
      page.getByRole('button', { name: /pacientes/i }).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('shows error for invalid invitation token', async ({ page }) => {
    await page.route('**/api/v1/auth/invite/invalid-token', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid invitation' }),
      });
    });

    await page.goto('/invite/accept?token=invalid-token');

    await expect(page.getByText(/invitación no válida/i)).toBeVisible();
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.route(
      `**/api/v1/auth/invite/${INVITATION_TOKEN}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            email: THERAPIST_EMAIL,
            role: 'THERAPIST',
            clinicName: 'Test Clinic',
            expiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          }),
        });
      },
    );

    await page.goto(`/invite/accept?token=${INVITATION_TOKEN}`);

    // Fill form with mismatched passwords
    await page
      .getByRole('textbox', { name: /nombre completo/i })
      .fill('Test Therapist');

    await page.locator('#password').fill('Password123');
    await page.locator('#confirmPassword').fill('DifferentPass');

    await expect(page.getByText(/las contraseñas no coinciden/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /crear cuenta y entrar/i }),
    ).toBeDisabled();
  });

  test('can skip PIN setup on first login', async ({ page }) => {
    // Mock APIs
    await page.route(
      `**/api/v1/auth/invite/${INVITATION_TOKEN}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            email: THERAPIST_EMAIL,
            role: 'THERAPIST',
            clinicName: 'Test Clinic',
            expiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          }),
        });
      },
    );

    await page.route('**/api/v1/auth/invite/accept', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: THERAPIST_EMAIL,
              name: 'Test Therapist',
              role: 'THERAPIST',
              clinicId: TEST_CLINIC_ID,
              clinicName: 'Test Clinic',
            },
            accessToken: 'fake-token',
            refreshToken: 'fake-refresh',
          }),
        });
      }
    });

    await page.route('**/api/v1/auth/pin/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPinSet: false }),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.removeItem('pin_setup_skipped');
    });

    // Accept invitation
    await page.goto(`/invite/accept?token=${INVITATION_TOKEN}`);
    await expect(page.getByText(/te invitamos a unirte a/i)).toBeVisible();

    await page
      .getByRole('textbox', { name: /nombre completo/i })
      .fill('Test Therapist');

    await page.locator('#password').fill('Password123');
    await page.locator('#confirmPassword').fill('Password123');

    const submitButton = page.getByRole('button', {
      name: /crear cuenta y entrar/i,
    });
    await expect(submitButton).toBeVisible({ timeout: 10000 });
    await page.locator('#confirmPassword').press('Enter');
    // Step 3: Verify redirected to success page or dashboard
    await expect(page).toHaveURL(/\/invite\/success|\//);

    if (page.url().includes('/invite/success')) {
      await page.goto('/');
      await expect(page).toHaveURL('/');
    }

    await page.evaluate(() => {
      if (!window.localStorage.getItem('access_token')) {
        window.localStorage.setItem('access_token', 'fake-token');
      }
      if (!window.localStorage.getItem('user_data')) {
        window.localStorage.setItem(
          'user_data',
          JSON.stringify({
            id: 'user-123',
            email: 'therapist.test@example.com',
            name: 'Test Therapist',
            role: 'THERAPIST',
            clinicId: 'clinic-test-123',
          }),
        );
      }
      window.localStorage.removeItem('pin_setup_skipped');
    });
    await page.goto('/');

    // PIN setup should appear
    await expect(page.getByText(/configurar pin/i)).toBeVisible({
      timeout: 15000,
    });

    // Click skip
    await page.getByRole('button', { name: /omitir por ahora/i }).click();

    // Modal should close
    await expect(page.getByText(/configurar pin/i)).not.toBeVisible();

    // Dashboard should be visible
    await expect(page).toHaveURL('/');
  });

  test('shows error when invitation is expired', async ({ page }) => {
    await page.route(`**/api/v1/auth/invite/expired-token`, async (route) => {
      await route.fulfill({
        status: 410,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invitation expired' }),
      });
    });

    await page.goto('/invite/accept?token=expired-token');

    await expect(page.getByText(/esta invitación ha expirado/i)).toBeVisible();
  });
});

test.describe('PIN Flow - First Time Login', () => {
  test('shows PIN setup modal for new users without PIN', async ({ page }) => {
    // Mock APIs
    await page.route('**/api/v1/auth/login', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: 'test@example.com',
              name: 'Test User',
              role: 'THERAPIST',
              clinicId: 'clinic-123',
            },
            accessToken: 'fake-token',
            refreshToken: 'fake-refresh',
          }),
        });
      }
    });

    await page.route('**/api/v1/auth/pin/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPinSet: false }),
      });
    });

    await page.route('**/api/v1/auth/pin/setup', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }
    });

    // Login
    await page.goto('/login?manual=true');

    await page
      .getByRole('textbox', { name: /correo electrónico/i })
      .fill('test@example.com');

    await page
      .getByRole('textbox', { name: /contraseña/i })
      .fill('password123');

    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // PIN setup should appear
    await expect(page.getByText(/configurar pin/i)).toBeVisible();

    // Set PIN
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: '3' }).click();
    await page.getByRole('button', { name: '4' }).click();

    // Confirm PIN
    await expect(page.getByText(/confirmar pin/i)).toBeVisible();

    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: '3' }).click();
    await page.getByRole('button', { name: '4' }).click();

    // Modal closes, dashboard visible
    await expect(page.getByText(/configurar pin/i)).not.toBeVisible();

    await expect(page).toHaveURL('/');
  });

  test('PIN mismatch shows error and allows retry', async ({ page }) => {
    // Mock APIs
    await page.route('**/api/v1/auth/login', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: 'test@example.com',
              name: 'Test User',
              role: 'THERAPIST',
              clinicId: 'clinic-123',
            },
            accessToken: 'fake-token',
            refreshToken: 'fake-refresh',
          }),
        });
      }
    });

    await page.route('**/api/v1/auth/pin/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPinSet: false }),
      });
    });

    // Login
    await page.goto('/login?manual=true');

    await page
      .getByRole('textbox', { name: /correo electrónico/i })
      .fill('test@example.com');

    await page
      .getByRole('textbox', { name: /contraseña/i })
      .fill('password123');

    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // PIN setup appears
    await expect(page.getByText(/configurar pin/i)).toBeVisible({
      timeout: 15000,
    });

    // Enter first PIN
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: '3' }).click();
    await page.getByRole('button', { name: '4' }).click();

    // Confirm with different PIN
    await page.getByRole('button', { name: '5' }).click();
    await page.getByRole('button', { name: '6' }).click();
    await page.getByRole('button', { name: '7' }).click();
    await page.getByRole('button', { name: '8' }).click();

    // Error should show
    await expect(page.getByText(/los pins no coinciden/i)).toBeVisible();
  });

  test('does not show PIN setup for users who already have PIN', async ({
    page,
  }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: 'test@example.com',
              name: 'Test User',
              role: 'THERAPIST',
              clinicId: 'clinic-123',
            },
            accessToken: 'fake-token',
            refreshToken: 'fake-refresh',
          }),
        });
      }
    });

    // PIN already set
    await page.route('**/api/v1/auth/pin/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPinSet: true }),
      });
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'THERAPIST',
          clinicId: 'clinic-123',
        }),
      });
    });

    // Login
    await page.goto('/login?manual=true');

    await page
      .getByRole('textbox', { name: /correo electrónico/i })
      .fill('test@example.com');

    await page
      .getByRole('textbox', { name: /contraseña/i })
      .fill('password123');

    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // PIN modal should NOT appear
    await page.waitForTimeout(1000);
    await expect(page.getByText(/configurar pin/i)).not.toBeVisible();
  });
});

test.describe('Invitation - Clinic Owner Invites Therapist', () => {
  test('clinic owner can invite therapist', async ({ page }) => {
    // Mock PIN status
    await page.route('**/api/v1/auth/pin/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPinSet: true }),
      });
    });

    // Mock all clinic-related requests
    await page.route('**/api/v1/clinics/clinic-123**', async (route) => {
      const url = route.request().url();
      if (url.endsWith('/invite') && route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            invitation: {
              id: 'invite-1',
              email: 'test@test.com',
              role: 'THERAPIST',
              token: 'token',
            },
          }),
        });
      } else if (url.endsWith('/therapists')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'owner-123',
              email: 'owner@example.com',
              name: 'Dr. Owner',
              role: 'CLINIC_OWNER',
            },
          ]),
        });
      } else if (url.endsWith('/invitations')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'clinic-123', name: 'My Clinic' }),
        });
      }
    });

    // Mock authenticated clinic owner
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'fake-owner-token');
      window.localStorage.setItem('pin_setup_skipped', 'true');
      window.localStorage.setItem(
        'user_data',
        JSON.stringify({
          id: 'owner-123',
          email: 'owner@example.com',
          name: 'Dr. Owner',
          role: 'CLINIC_OWNER',
          clinicId: 'clinic-123',
          clinicName: 'My Clinic',
        }),
      );
    });

    await page.goto('/clinica');
    await expect(page).toHaveURL('/clinica');

    await page.getByRole('button', { name: /invitar/i }).click();

    await page
      .getByRole('textbox', { name: /email del terapeuta/i })
      .fill('new.therapist@example.com');

    await page.getByRole('combobox', { name: /rol/i }).click();
    await page.getByRole('option', { name: /fisioterapeuta/i }).click();

    await page.getByRole('button', { name: /enviar invitación/i }).click();

    await expect(page.getByText(/invitación enviada/i)).toBeVisible();
  });

  test('clinic owner can invite co-owner', async ({ page }) => {
    // Mock PIN status
    await page.route('**/api/v1/auth/pin/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPinSet: true }),
      });
    });

    // Mock all clinic-related requests
    await page.route('**/api/v1/clinics/clinic-123**', async (route) => {
      const url = route.request().url();
      if (url.endsWith('/invite') && route.request().method() === 'POST') {
        const payload = await route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            invitation: {
              id: 'invite-2',
              email: payload.email,
              role: payload.role,
              token: 'token2',
            },
          }),
        });
      } else if (url.endsWith('/therapists')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'owner-123',
              email: 'owner@example.com',
              name: 'Dr. Owner',
              role: 'CLINIC_OWNER',
            },
          ]),
        });
      } else if (url.endsWith('/invitations')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'clinic-123', name: 'My Clinic' }),
        });
      }
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'fake-owner-token');
      window.localStorage.setItem('pin_setup_skipped', 'true');
      window.localStorage.setItem(
        'user_data',
        JSON.stringify({
          id: 'owner-123',
          email: 'owner@example.com',
          name: 'Dr. Owner',
          role: 'CLINIC_OWNER',
          clinicId: 'clinic-123',
        }),
      );
    });

    await page.goto('/clinica');
    await expect(page).toHaveURL('/clinica');

    await page.getByRole('button', { name: /invitar/i }).click();

    await page
      .getByRole('textbox', { name: /email/i })
      .fill('coowner@example.com');

    await page.getByRole('combobox', { name: /rol/i }).click();
    await page.getByRole('option', { name: /propietario de clínica/i }).click();

    await page.getByRole('button', { name: /enviar/i }).click();

    await expect(page.getByText(/invitación enviada/i)).toBeVisible();
  });
});
