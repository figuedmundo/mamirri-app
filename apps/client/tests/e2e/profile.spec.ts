import { test, expect } from '@playwright/test';
import { ProfilePage } from './pages/ProfilePage';

test('therapist profile flow', async ({ page }) => {
  const profilePage = new ProfilePage(page);

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

  await page.addInitScript(
    (data) => {
      window.localStorage.setItem('access_token', 'mock-token');
      window.localStorage.setItem('user_data', JSON.stringify(data));
    },
    {
      id: '1',
      email: 'terapeuta@test.com',
      name: 'Terapeuta de Prueba',
      role: 'THERAPIST',
    },
  );

  await profilePage.gotoProfile();

  await expect(page.getByText(/Información Personal/i)).toBeVisible();
  await expect(profilePage.nameInput).toHaveValue('Terapeuta de Prueba');

  await profilePage.updateProfile({
    name: 'Terapeuta Actualizado',
    phone: '600123456',
  });

  await profilePage.waitForToast(/Perfil actualizado correctamente/i);

  await expect(
    page
      .locator('section')
      .filter({ hasText: /Información de la Cuenta/i })
      .getByText('Terapeuta', { exact: true }),
  ).toBeVisible();
});
