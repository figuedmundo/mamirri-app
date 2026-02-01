import { test } from '@playwright/test';
import { PatientPage } from './pages/PatientPage';

test('create patient flow', async ({ page }) => {
  const patientPage = new PatientPage(page);

  await page.route('**/api/v1/auth/me', async (route) => {
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

  await page.route('**/api/v1/patients', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          firstName: 'Juan',
          lastName: 'Perez',
          phone: '123456789',
          email: 'juan@example.com',
          birthDate: '1980-01-01T00:00:00.000Z',
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
        meta: { total: 0, page: 1, lastPage: 1 },
      }),
    });
  });

  await page.route('**/api/v1/patients/1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        firstName: 'Juan',
        lastName: 'Perez',
        phone: '123456789',
        email: 'juan@example.com',
        birthDate: '1980-01-01T00:00:00.000Z',
        clinicalCases: [],
      }),
    });
  });

  await patientPage.mockAuth();
  await patientPage.gotoList();

  await patientPage.createPatient({
    name: 'Juan Perez',
    age: '45',
    occupation: 'Ingeniero',
    phone: '123456789',
    email: 'juan@example.com',
  });

  await patientPage.waitForToast(/Paciente creado correctamente/i);
});
