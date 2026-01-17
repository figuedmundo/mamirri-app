import { test, expect } from '@playwright/test';
import { CasePage } from './pages/CasePage';

test('record treatment session flow', async ({ page }) => {
  const casePage = new CasePage(page);

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

  const patientId = '1';
  const caseId = 'case-1';

  await page.route(`**/api/v1/patients/${patientId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: patientId,
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan@example.com',
        clinicalCases: [
          {
            id: caseId,
            title: 'Dolor Lumbar',
            status: 'active',
            startDate: new Date().toISOString(),
            treatmentSessions: [],
            evaluations: [],
            treatmentPlan: {
              id: 'plan-1',
              phases: [
                {
                  id: 1,
                  number: 1,
                  name: 'Fase 1',
                  description: 'Inicial',
                  objectives: [],
                },
                {
                  id: 2,
                  number: 2,
                  name: 'Fase 2',
                  description: 'Intermedia',
                  objectives: [],
                },
              ],
            },
          },
        ],
      }),
    });
  });

  await page.route(
    `**/api/v1/patients/cases/${caseId}/sessions`,
    async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'session-1',
          date: new Date().toISOString(),
          phaseNumber: 1,
          finalPainLevel: 5,
          observations: 'Sesión de prueba',
          procedures: [],
        }),
      });
    },
  );

  await casePage.mockAuth();
  await casePage.gotoDetail(patientId, caseId);

  await casePage.createSession({
    phase: '1',
    procedures: ['Masaje'],
    response: 'El paciente reporta mejoría notable.',
    observations: 'Sesión de prueba',
  });

  await casePage.waitForToast(/Sesión creada/i);
});
