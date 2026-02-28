import { test, expect } from '@playwright/test';
import { CasePage } from '../pages/CasePage';
import { PatientPage } from '../pages/PatientPage';

test.describe('Patient Clinical Journey - End to End', () => {
  test('should create a patient and complete a full clinical evaluation flow', async ({
    page,
  }) => {
    test.setTimeout(60000);
    const casePage = new CasePage(page);
    const patientPage = new PatientPage(page);
    await casePage.mockAuth();
    // Mock initial auth check that might happen on navigation
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

    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'fake-token');
      window.localStorage.setItem(
        'user_data',
        JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test User' }),
      );
    });

    const patientId = 'p-journey-1';
    const caseId = 'c-journey-1';
    const evalId = 'e-journey-1';

    await page.route('**/api/v1/patients', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: patientId,
            name: 'John Journey',
            occupation: 'Tester',
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [], meta: { total: 0 } }),
      });
    });

    // 2. Mock Patient Detail for the journey
    let hasDiagnosis = false;
    await page.route(`**/api/v1/patients/${patientId}**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: patientId,
          name: 'John Journey',
          occupation: 'Tester',
          phone: '123456789',
          birthDate: '1990-01-01',
          clinicalCases: [
            {
              id: caseId,
              patientId,
              title: 'Ankle Sprain',
              status: 'active',
              startDate: new Date().toISOString(),
              evaluation: {
                id: evalId,
                clinicalCaseId: caseId,
                date: new Date().toISOString(),
                painScale: {
                  activity: 0,
                  rest: 0,
                  palpation: 0,
                  type: 'acute',
                },
                diagnosis: hasDiagnosis
                  ? { functionalIndicator: 'Filled', clinicalAspect: 'Filled' }
                  : {
                      functionalIndicator: '',
                      clinicalAspect: '',
                      anatomopathology: '',
                      avdConsequences: '',
                    },
              },
              treatmentPlan: hasDiagnosis
                ? {
                    id: 'plan-1',
                    phases: [
                      {
                        number: 1,
                        name: 'Phase 1',
                        durationWeeks: 2,
                        techniques: [],
                        objectives: '',
                      },
                      {
                        number: 2,
                        name: 'Phase 2',
                        durationWeeks: 2,
                        techniques: [],
                        objectives: '',
                      },
                      {
                        number: 3,
                        name: 'Phase 3',
                        durationWeeks: 2,
                        techniques: [],
                        objectives: '',
                      },
                      {
                        number: 4,
                        name: 'Phase 4',
                        durationWeeks: 2,
                        techniques: [],
                        objectives: '',
                      },
                      {
                        number: 5,
                        name: 'Phase 5',
                        durationWeeks: 2,
                        techniques: [],
                        objectives: '',
                      },
                    ],
                    objectives: {
                      therapeutic: '',
                      prophylactic: '',
                      educational: '',
                    },
                  }
                : null,
              treatmentSessions: [],
            },
          ],
        }),
      });
    });

    // 3. Mock Evaluation Patch
    await page.route(
      `**/api/v1/patients/evaluations/${evalId}`,
      async (route) => {
        if (route.request().method() === 'PATCH') {
          hasDiagnosis = true;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ id: evalId }),
          });
        } else {
          await route.continue();
        }
      },
    );

    // --- EXECUTION ---

    // Step 1: Create Patient
    await patientPage.gotoList();
    await patientPage.createPatient({
      name: 'John Journey',
      occupation: 'Tester',
      phone: '123456789',
      email: 'john@example.com',
      birthDate: '1990-01-01',
      emergencyContact: { name: 'Emergency', phone: '987654321' },
    });

    await expect(
      page.locator('[role="dialog"][data-state="open"]'),
    ).toHaveCount(0, { timeout: 15000 });
    await page.goto(`/pacientes/${patientId}/casos/${caseId}`, {
      waitUntil: 'networkidle',
    });
    // Step 2: Verification of unblocking plan
    await expect(
      page.getByText(/Plan de tratamiento pendiente/i),
    ).toBeVisible();

    // Step 3: Fill Evaluation
    await page.getByTestId('nav-evaluation-btn').click();
    await page
      .getByRole('button', { name: /^A - (Analisis|Assessment)$/i })
      .click();
    await page
      .getByPlaceholder('Indicador funcional')
      .fill('Dificultad al caminar');
    await page.getByPlaceholder('Aspecto clínico').fill('Inflamación');

    // Wait for auto-save
    await page.waitForTimeout(1000);

    // Step 4: Verify Plan unblocked
    await page.getByTestId('nav-timeline-btn').click();
    await expect(
      page.getByRole('heading', { name: 'Cronograma de Tratamiento' }),
    ).toBeVisible({ timeout: 10000 });

    // Step 5: Verify 5 Phases
    for (let i = 1; i <= 5; i++) {
      await expect(
        page
          .getByText(`Fase ${i}`)
          .or(page.getByText(`Phase ${i}`))
          .first(),
      ).toBeVisible();
    }

    // Step 6: Verify Metrics
    await expect(page.getByText('Sesiones', { exact: true })).toBeVisible();
    await expect(page.getByText('Dolor Promedio')).toBeVisible();
  });
});
