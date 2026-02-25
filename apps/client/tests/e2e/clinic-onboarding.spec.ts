import { test, expect } from '@playwright/test';

type NameAvailability = {
  available: boolean;
};

async function mockOnboardingAuth(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('pin_setup_skipped', 'true');
  });

  await page.route('**/api/v1/auth/pin/status', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ hasPinSet: true }),
    });
  });

  await page.addInitScript(() => {
    window.localStorage.setItem('access_token', 'fake-token');
    window.localStorage.setItem(
      'user_data',
      JSON.stringify({
        id: 'u-onboarding-1',
        email: 'doctor@example.com',
        name: 'Doctor Test',
        role: 'THERAPIST',
        clinicId: null,
      }),
    );
  });
}

test.describe('Clinic onboarding wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('pin_setup_skipped', 'true');
    });
  });

  test('blocks step 1 progression until required fields are valid', async ({
    page,
  }) => {
    await mockOnboardingAuth(page);

    await page.route('**/api/v1/clinics/check-name**', async (route) => {
      const body: NameAvailability = { available: true };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });

    await page.goto('/onboarding/clinic');

    const nextButton = page.getByRole('button', { name: /siguiente/i });
    await expect(nextButton).toBeDisabled();

    await page.getByLabel('Nombre de clínica').fill('Mi Clínica');
    await expect(nextButton).toBeDisabled();

    await page.getByLabel('Email de contacto').fill('clinic@example.com');
    await page.waitForTimeout(650);
    await expect(nextButton).toBeEnabled();
  });

  test('shows unavailable-name feedback and keeps next button disabled', async ({
    page,
  }) => {
    await mockOnboardingAuth(page);

    await page.route('**/api/v1/clinics/check-name**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: false }),
      });
    });

    await page.goto('/onboarding/clinic');
    await page.getByLabel('Nombre de clínica').fill('Clinic Taken');
    await page.getByLabel('Email de contacto').fill('clinic@example.com');

    await page.waitForTimeout(650);
    await expect(
      page.getByText('Ese nombre ya está en uso. Prueba uno distinto.'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /siguiente/i })).toBeDisabled();
  });

  test('supports configure-later path and returns to dashboard personal mode', async ({
    page,
  }) => {
    await mockOnboardingAuth(page);
    await page.goto('/onboarding/clinic');

    await page.getByRole('button', { name: 'Configurar más tarde' }).click();

    await expect(page).toHaveURL('/');
    await expect(
      page.getByText('Estás en modo personal. Configura una clínica'),
    ).toBeVisible();
  });

  test('preserves step 2 data when navigating back and forward', async ({
    page,
  }) => {
    await mockOnboardingAuth(page);

    await page.route('**/api/v1/clinics/check-name**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      });
    });

    await page.goto('/onboarding/clinic');
    await page.getByLabel('Nombre de clínica').fill('Mamirri Clinic');
    await page.getByLabel('Email de contacto').fill('clinic@example.com');
    await page.waitForTimeout(650);
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await page.getByLabel('Dirección').fill('Calle Mayor 123, Madrid');
    await page.getByLabel('Horario apertura lunes').fill('08:30');
    await page.getByLabel('Horario cierre lunes').fill('16:30');

    await page.getByRole('button', { name: 'Atrás' }).click();
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.getByLabel('Dirección')).toHaveValue(
      'Calle Mayor 123, Madrid',
    );
    await expect(page.getByLabel('Horario apertura lunes')).toHaveValue(
      '08:30',
    );
    await expect(page.getByLabel('Horario cierre lunes')).toHaveValue('16:30');
  });

  test('handles team invitation add/remove before creating clinic', async ({
    page,
  }) => {
    await mockOnboardingAuth(page);

    await page.route('**/api/v1/clinics/check-name**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      });
    });

    let createPayload: unknown;
    await page.route('**/api/v1/clinics', async (route) => {
      if (route.request().method() === 'POST') {
        createPayload = route.request().postDataJSON();
        await route.fulfill({
          body: JSON.stringify({ clinic: { id: 'clinic-1', name: 'Mamirri Clinic' } }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/onboarding/clinic');
    await page.getByLabel('Nombre de clínica').fill('Mamirri Clinic');
    await page.getByLabel('Email de contacto').fill('clinic@example.com');
    await page.waitForTimeout(650);
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await page.getByLabel('Email del terapeuta').fill('one@clinic.com');
    await page.getByLabel('Rol').selectOption('THERAPIST');
    await page.getByRole('button', { name: '+ Add another' }).click();

    await page.getByLabel('Email del terapeuta').fill('owner@clinic.com');
    await page.getByLabel('Rol').selectOption('CLINIC_OWNER');
    await page.getByRole('button', { name: '+ Add another' }).click();

    await page
      .locator('li', { hasText: 'one@clinic.com' })
      .getByRole('button', { name: 'Quitar' })
      .click();

    await page.getByRole('button', { name: 'Crear clínica' }).click();

    await expect(page).toHaveURL(/\/onboarding\/quick-start/);
    expect(createPayload).toEqual(
      expect.objectContaining({
        initialInvitations: [
          {
            email: 'owner@clinic.com',
            role: 'CLINIC_OWNER',
          },
        ],
      }),
    );
  });

  test('shows explicit error message when clinic creation fails', async ({
    page,
  }) => {
    await mockOnboardingAuth(page);

    await page.route('**/api/v1/clinics/check-name**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      });
    });

    await page.route('**/api/v1/clinics', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Insufficient permissions' }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto('/onboarding/clinic');
    await page.getByLabel('Nombre de clínica').fill('Mamirri Clinic');
    await page.getByLabel('Email de contacto').fill('clinic@example.com');
    await page.waitForTimeout(650);
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await page.getByRole('button', { name: 'Crear clínica' }).click();

    await expect(
      page.getByText('No se pudo crear la clínica. Inténtalo nuevamente.'),
    ).toBeVisible();
    await expect(page).toHaveURL('/onboarding/clinic');
  });

  test('triggers solo-mode migration when solo flag is set', async ({
    page,
  }) => {
    await mockOnboardingAuth(page);

    await page.addInitScript(() => {
      window.localStorage.setItem('clinic_onboarding_solo_mode', 'true');
    });

    await page.route('**/api/v1/clinics/check-name**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: true }),
      });
    });

    let migrationCalled = false;
    await page.route('**/api/v1/clinics', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          body: JSON.stringify({ clinic: { id: 'clinic-2', name: 'Solo Clinic' } }),
        });
        return;
      }
      await route.continue();
    });

    await page.route(
      '**/api/v1/clinics/clinic-2/migrate-solo-patients',
      async (route) => {
        migrationCalled = true;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ clinicId: 'clinic-2', migratedCount: 2 }),
        });
      },
    );

    await page.goto('/onboarding/clinic');
    await page.getByLabel('Nombre de clínica').fill('Solo Clinic');
    await page.getByLabel('Email de contacto').fill('solo@clinic.com');
    await page.waitForTimeout(650);
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await page.getByRole('button', { name: 'Crear clínica' }).click();

    await expect(page).toHaveURL(/\/onboarding\/quick-start/);
    expect(migrationCalled).toBe(true);
  });
});
