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

    // Mock PIN status - no PIN set yet
    await page.route('**/api/v1/auth/pin/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPinSet: false }),
      });
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
    await expect(
      page.getByText(/te invitamos a unirte a/i),
    ).toBeVisible();

    // Verify clinic name and role are displayed
    await expect(page.getByText(/clínica fisioterapia garcía/i)).toBeVisible();
    await expect(page.getByText(/therapist/i)).toBeVisible();

    // Verify email is pre-filled and disabled
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toHaveValue(THERAPIST_EMAIL);
    await expect(emailInput).toBeDisabled();

    // Step 2: Fill registration form
    await page
      .getByRole('textbox', { name: /nombre completo/i })
      .fill('Dra. Ana López');

    await page
      .getByRole('textbox', { name: /contraseña/i, exact: false })
      .nth(0)
      .fill('TherapistPass123');

    await page
      .getByRole('textbox', { name: /confirmar contraseña/i })
      .fill('TherapistPass123');

    // Submit form
    await page.getByRole('button', { name: /crear cuenta y entrar/i }).click();

    // Step 3: Verify redirected to dashboard and PIN setup modal appears
    await expect(page).toHaveURL('/');

    // PIN setup modal should appear (first time login)
    await expect(
      page.getByText(/configurar pin/i),
    ).toBeVisible();

    await expect(page.getByText(/crea un pin de 4 dígitos/i)).toBeVisible();

    // Step 4: Set up PIN
    // Enter first PIN
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: '3' }).click();
    await page.getByRole('button', { name: '4' }).click();

    // Should ask to confirm
    await expect(
      page.getByText(/confirmar pin/i),
    ).toBeVisible();

    // Enter same PIN again to confirm
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: '3' }).click();
    await page.getByRole('button', { name: '4' }).click();

    // PIN setup modal should close
    await expect(
      page.getByText(/configurar pin/i),
    ).not.toBeVisible();

    // User should see dashboard
    await expect(
      page.getByText(/dashboard|pacientes|bienvenido/i),
    ).toBeVisible();
  });

  test('shows error for invalid invitation token', async ({ page }) => {
    await page.route(
      '**/api/v1/auth/invite/invalid-token',
      async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid invitation' }),
        });
      },
    );

    await page.goto('/invite/accept?token=invalid-token');

    await expect(
      page.getByText(/invitación no válida/i),
    ).toBeVisible();
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

    await page
      .getByRole('textbox', { name: /contraseña/i, exact: false })
      .nth(0)
      .fill('Password123');

    await page
      .getByRole('textbox', { name: /confirmar contraseña/i })
      .fill('DifferentPass');

    await page.getByRole('button', { name: /crear cuenta y entrar/i }).click();

    await expect(page.getByText(/las contraseñas no coinciden/i)).toBeVisible();
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

    // Accept invitation
    await page.goto(`/invite/accept?token=${INVITATION_TOKEN}`);

    await page
      .getByRole('textbox', { name: /nombre completo/i })
      .fill('Test Therapist');

    await page
      .getByRole('textbox', { name: /contraseña/i, exact: false })
      .nth(0)
      .fill('Password123');

    await page
      .getByRole('textbox', { name: /confirmar contraseña/i })
      .fill('Password123');

    await page.getByRole('button', { name: /crear cuenta y entrar/i }).click();

    // PIN setup should appear
    await expect(
      page.getByText(/configurar pin/i),
    ).toBeVisible();

    // Click skip
    await page.getByRole('button', { name: /omitir por ahora/i }).click();

    // Modal should close
    await expect(
      page.getByText(/configurar pin/i),
    ).not.toBeVisible();

    // Dashboard should be visible
    await expect(page).toHaveURL('/');
  });

  test('shows error when invitation is expired', async ({ page }) => {
    await page.route(
      `**/api/v1/auth/invite/expired-token`,
      async (route) => {
        await route.fulfill({
          status: 410,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invitation expired' }),
        });
      },
    );

    await page.goto('/invite/accept?token=expired-token');

    await expect(
      page.getByText(/invitación no válida/i),
    ).toBeVisible();
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
    await expect(
      page.getByText(/configurar pin/i),
    ).toBeVisible();

    // Set PIN
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: '3' }).click();
    await page.getByRole('button', { name: '4' }).click();

    // Confirm PIN
    await expect(
      page.getByText(/confirmar pin/i),
    ).toBeVisible();

    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: '3' }).click();
    await page.getByRole('button', { name: '4' }).click();

    // Modal closes, dashboard visible
    await expect(
      page.getByText(/configurar pin/i),
    ).not.toBeVisible();

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
    await expect(
      page.getByText(/configurar pin/i),
    ).toBeVisible();

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

    // Login
    await page.goto('/login?manual=true');

    await page
      .getByRole('textbox', { name: /correo electrónico/i })
      .fill('test@example.com');

    await page
      .getByRole('textbox', { name: /contraseña/i })
      .fill('password123');

    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Should go directly to dashboard without PIN setup
    await expect(page).toHaveURL('/');

    // PIN modal should NOT appear
    await expect(
      page.getByText(/configurar pin/i),
    ).not.toBeVisible();
  });
});

test.describe('Invitation - Clinic Owner Invites Therapist', () => {
  test('clinic owner can invite therapist', async ({ page }) => {
    // Mock authenticated clinic owner
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'fake-owner-token');
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

    // Mock invite API
    let invitePayload: { email: string; role: string } | null = null;
    await page.route('**/api/v1/clinics/clinic-123/invite', async (route) => {
      if (route.request().method() === 'POST') {
        const payload = await route.request().postDataJSON();
        invitePayload = payload;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            invitation: {
              id: 'invite-123',
              email: payload.email,
              role: payload.role,
              token: 'new-invitation-token',
              expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000,
              ).toISOString(),
            },
          }),
        });
      }
    });

    // Mock clinic data
    await page.route(
      '**/api/v1/clinics/clinic-123/therapists',
      async (route) => {
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
      },
    );

    // Navigate to clinic dashboard
    await page.goto('/clinica');

    // Click invite button (assuming there's an invite button)
    await page.getByRole('button', { name: /invitar/i }).click();

    // Fill invitation form
    await page
      .getByRole('textbox', { name: /email del terapeuta/i })
      .fill('new.therapist@example.com');

    await page
      .getByRole('combobox', { name: /rol/i })
      .selectOption('THERAPIST');

    await page.getByRole('button', { name: /enviar invitación/i }).click();

    // Verify invitation was sent
    expect(invitePayload).not.toBeNull();
    expect(invitePayload!.email).toBe('new.therapist@example.com');
    expect(invitePayload!.role).toBe('THERAPIST');

    await expect(
      page.getByText(/invitación enviada exitosamente/i),
    ).toBeVisible();
  });

  test('clinic owner can invite co-owner', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'fake-owner-token');
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

    let invitePayload: { email: string; role: string } | null = null;
    await page.route('**/api/v1/clinics/clinic-123/invite', async (route) => {
      if (route.request().method() === 'POST') {
        const payload = await route.request().postDataJSON();
        invitePayload = payload;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            invitation: {
              id: 'invite-456',
              email: payload.email,
              role: payload.role,
              token: 'coowner-token',
            },
          }),
        });
      }
    });

    await page.route(
      '**/api/v1/clinics/clinic-123/therapists',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      },
    );

    await page.goto('/clinica');
    await page.getByRole('button', { name: /invitar/i }).click();

    await page
      .getByRole('textbox', { name: /email/i })
      .fill('coowner@example.com');

    // Select CLINIC_OWNER role
    await page
      .getByRole('combobox', { name: /rol/i })
      .selectOption('CLINIC_OWNER');

    await page.getByRole('button', { name: /enviar/i }).click();

    expect(invitePayload).toEqual({
      email: 'coowner@example.com',
      role: 'CLINIC_OWNER',
    });
  });
});
