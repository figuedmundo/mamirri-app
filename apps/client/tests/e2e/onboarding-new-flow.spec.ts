import { test, expect } from '@playwright/test';

test.describe('Clinic-First Onboarding Flow', () => {
  test('complete onboarding creates clinic and admin account', async ({
    page,
  }) => {
    // Mock the check-name API
    await page.route('**/api/v1/onboarding/check-name**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      });
    });

    // Mock the onboarding API
    await page.route('**/api/v1/onboarding/clinic', async (route) => {
      if (route.request().method() === 'POST') {
        const payload = await route.request().postDataJSON();

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: payload.adminEmail,
              name: payload.adminName,
              role: 'CLINIC_OWNER',
              clinicId: 'clinic-123',
              clinicName: payload.clinicName,
              licenseNumber: payload.adminLicenseNumber,
            },
            clinic: {
              id: 'clinic-123',
              name: payload.clinicName,
              email: payload.clinicEmail,
              phone: payload.clinicPhone,
              address: payload.clinicAddress,
              isActive: true,
              createdAt: new Date().toISOString(),
            },
            accessToken: 'fake-access-token',
            refreshToken: 'fake-refresh-token',
          }),
        });
      }
    });

    // Mock pin status
    await page.route('**/api/v1/auth/pin/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPinSet: false }),
      });
    });

    // Step 1: Navigate to login and click create clinic
    await page.goto('/login?manual=true');

    // Verify the login page shows the new button
    await expect(
      page.getByRole('button', { name: /crear nueva clínica/i }),
    ).toBeVisible();

    // Click create clinic
    await page.getByRole('button', { name: /crear nueva clínica/i }).click();

    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding');

    // Verify Step 1 UI
    await expect(
      page.getByRole('heading', { name: /crea tu clínica/i }),
    ).toBeVisible();
    await expect(page.getByText(/paso 1 de 2/i)).toBeVisible();
    await expect(page.getByText(/información de la clínica/i)).toBeVisible();

    // Step 2: Fill clinic information
    await page
      .getByRole('textbox', { name: /nombre de la clínica/i })
      .fill('Clínica Test E2E');

    await page
      .getByRole('textbox', { name: /email de la clínica/i })
      .fill('test@clinicae2e.com');

    await page
      .getByRole('textbox', { name: /teléfono/i })
      .fill('+34 911 222 333');

    await page
      .getByRole('textbox', { name: /dirección/i })
      .fill('Calle E2E 123, Madrid');

    // Wait for name availability check
    await expect(page.getByText(/nombre disponible/i)).toBeVisible();

    // Continue button should be enabled
    const continueButton = page.getByRole('button', { name: /continuar/i });
    await expect(continueButton).toBeEnabled();

    // Go to Step 2
    await continueButton.click();

    // Verify Step 2 UI
    await expect(page.getByText(/paso 2 de 2/i)).toBeVisible();
    await expect(page.getByText(/cuenta de administrador/i)).toBeVisible();
    await expect(
      page.getByText(/creando clínica: clínica test e2e/i),
    ).toBeVisible();

    // Step 3: Fill admin account information
    await page
      .getByRole('textbox', { name: /nombre completo/i })
      .fill('Dr. Test E2E');

    await page
      .getByRole('textbox', { name: /correo electrónico/i })
      .fill('doctor.test@example.com');

    await page
      .getByRole('textbox', { name: /contraseña/i, exact: false })
      .nth(0)
      .fill('SecurePass123');

    await page
      .getByRole('textbox', { name: /confirmar contraseña/i })
      .fill('SecurePass123');

    await page
      .getByRole('textbox', { name: /número de licencia profesional/i })
      .fill('F-E2E-12345');

    // Submit form
    const createButton = page.getByRole('button', { name: /crear clínica/i });
    await expect(createButton).toBeEnabled();
    await createButton.click();

    // Step 4: Verify success page
    await expect(page).toHaveURL('/onboarding/success');
    await expect(
      page.getByRole('heading', { name: /bienvenido a clínica test e2e/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/tu clínica ha sido creada exitosamente/i),
    ).toBeVisible();

    // Verify quick action cards are clickable
    await expect(
      page.getByRole('heading', { name: /crear primer paciente/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /invitar a tu equipo/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /configurar ajustes/i }),
    ).toBeVisible();

    // Verify dashboard button
    await expect(
      page.getByRole('button', { name: /ir al panel de control/i }),
    ).toBeVisible();
  });

  test('shows name unavailable error', async ({ page }) => {
    await page.route('**/api/v1/onboarding/check-name**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: false }),
      });
    });

    await page.goto('/onboarding');

    // Fill clinic name
    await page
      .getByRole('textbox', { name: /nombre de la clínica/i })
      .fill('Existing Clinic');

    // Wait for validation
    await page.waitForTimeout(600);

    // Should show error
    await expect(page.getByText(/ese nombre ya está en uso/i)).toBeVisible();

    // Continue button should be disabled
    await expect(
      page.getByRole('button', { name: /continuar/i }),
    ).toBeDisabled();
  });

  test('validates required fields in step 1', async ({ page }) => {
    await page.goto('/onboarding');

    const continueButton = page.getByRole('button', { name: /continuar/i });

    // Initially disabled
    await expect(continueButton).toBeDisabled();

    // Fill only clinic name
    await page
      .getByRole('textbox', { name: /nombre de la clínica/i })
      .fill('Test Clinic');

    // Still disabled (needs email too)
    await expect(continueButton).toBeDisabled();

    // Add email
    await page
      .getByRole('textbox', { name: /email de la clínica/i })
      .fill('test@example.com');

    // Still disabled (needs name available)
    // Note: In real test, we'd mock the API to return available
  });

  test('validates password match in step 2', async ({ page }) => {
    // Mock APIs
    await page.route('**/api/v1/onboarding/check-name**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      });
    });

    await page.goto('/onboarding');

    // Fill Step 1
    await page
      .getByRole('textbox', { name: /nombre de la clínica/i })
      .fill('Test Clinic');
    await page
      .getByRole('textbox', { name: /email de la clínica/i })
      .fill('test@example.com');

    await page.waitForTimeout(600);
    await page.getByRole('button', { name: /continuar/i }).click();

    // Fill Step 2 with mismatched passwords
    await page
      .getByRole('textbox', { name: /contraseña/i, exact: false })
      .nth(0)
      .fill('Password123');

    await page
      .getByRole('textbox', { name: /confirmar contraseña/i })
      .fill('DifferentPass');

    // Should show error
    await expect(page.getByText(/las contraseñas no coinciden/i)).toBeVisible();
  });

  test('can navigate back from step 2 to step 1', async ({ page }) => {
    await page.route('**/api/v1/onboarding/check-name**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      });
    });

    await page.goto('/onboarding');

    // Fill and proceed to Step 2
    await page
      .getByRole('textbox', { name: /nombre de la clínica/i })
      .fill('Test Clinic');
    await page
      .getByRole('textbox', { name: /email de la clínica/i })
      .fill('test@example.com');

    await page.waitForTimeout(600);
    await page.getByRole('button', { name: /continuar/i }).click();

    // Verify on Step 2
    await expect(page.getByText(/paso 2 de 2/i)).toBeVisible();

    // Click back
    await page.getByRole('button', { name: /atrás/i }).click();

    // Verify back on Step 1
    await expect(page.getByText(/paso 1 de 2/i)).toBeVisible();

    // Verify data persisted
    await expect(
      page.getByRole('textbox', { name: /nombre de la clínica/i }),
    ).toHaveValue('Test Clinic');
  });

  test('success page action cards navigate correctly', async ({ page }) => {
    // Mock APIs for successful creation
    await page.route('**/api/v1/onboarding/check-name**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      });
    });

    await page.route('**/api/v1/onboarding/clinic', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'user-123',
              email: 'test@example.com',
              name: 'Dr. Test',
              role: 'CLINIC_OWNER',
              clinicId: 'clinic-123',
              clinicName: 'Test Clinic',
            },
            clinic: {
              id: 'clinic-123',
              name: 'Test Clinic',
              email: 'clinic@test.com',
              isActive: true,
              createdAt: new Date().toISOString(),
            },
            accessToken: 'fake-token',
            refreshToken: 'fake-refresh-token',
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

    // Complete onboarding
    await page.goto('/onboarding');

    await page
      .getByRole('textbox', { name: /nombre de la clínica/i })
      .fill('Test Clinic');
    await page
      .getByRole('textbox', { name: /email de la clínica/i })
      .fill('clinic@test.com');

    await page.waitForTimeout(600);
    await page.getByRole('button', { name: /continuar/i }).click();

    await page
      .getByRole('textbox', { name: /nombre completo/i })
      .fill('Dr. Test');
    await page
      .getByRole('textbox', { name: /correo electrónico/i })
      .fill('test@example.com');
    await page
      .getByRole('textbox', { name: /contraseña/i, exact: false })
      .nth(0)
      .fill('Password123');
    await page
      .getByRole('textbox', { name: /confirmar contraseña/i })
      .fill('Password123');

    await page.getByRole('button', { name: /crear clínica/i }).click();

    // On success page
    await expect(page).toHaveURL('/onboarding/success');

    // Test "Crear Primer Paciente" card
    await page
      .locator('div.cursor-pointer', { hasText: /crear primer paciente/i })
      .click();
    await expect(page).toHaveURL('/pacientes');

    // Go back to test another card
    await page.goto('/onboarding/success');

    // Test "Invitar a tu Equipo" card
    await page
      .locator('div.cursor-pointer', { hasText: /invitar a tu equipo/i })
      .click();
    await expect(page).toHaveURL('/clinica');
  });

  test('shows therapist guidance on login page', async ({ page }) => {
    await page.goto('/login?manual=true');

    // Verify therapist guidance is shown
    await expect(
      page.getByText(
        /¿eres fisioterapeuta y trabajas en una clínica existente/i,
      ),
    ).toBeVisible();

    await expect(
      page.getByText(/solicita una invitación a tu administrador/i),
    ).toBeVisible();
  });
});
