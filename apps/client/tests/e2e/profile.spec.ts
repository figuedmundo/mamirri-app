import { test, expect } from '@playwright/test';

test('therapist profile flow', async ({ page }) => {
  const mockUser = {
    id: '1',
    email: 'terapeuta@test.com',
    name: 'Terapeuta de Prueba',
    role: 'THERAPIST',
    createdAt: new Date().toISOString(),
  };

  await page.route('**/api/v1/users/me', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser),
      });
    } else if (route.request().method() === 'PATCH') {
      const data = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockUser, ...data }),
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

  await page.goto('/');

  await page.evaluate(() => {
    localStorage.setItem('access_token', 'mock-token');
    localStorage.setItem(
      'user_data',
      JSON.stringify({
        id: '1',
        email: 'terapeuta@test.com',
        name: 'Terapeuta de Prueba',
        role: 'THERAPIST',
      }),
    );
  });

  await page.goto('/perfil');

  await expect(page.getByText(/Información Personal/i)).toBeVisible();
  await expect(page.getByLabel(/Nombre completo/i)).toHaveValue(
    'Terapeuta de Prueba',
  );

  await page.getByLabel(/Nombre completo/i).fill('Terapeuta Actualizado');
  await page.getByLabel(/Teléfono/i).fill('600123456');

  await page.getByRole('button', { name: /Guardar cambios/i }).click();

  await expect(
    page.getByText(/Perfil actualizado correctamente/i).first(),
  ).toBeVisible();

  await expect(
    page
      .locator('section')
      .filter({ hasText: /Información de la Cuenta/i })
      .getByText('Terapeuta', { exact: true }),
  ).toBeVisible();
});
