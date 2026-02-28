import { test, expect } from '@playwright/test';
import { CasePage } from '../pages/CasePage';

test.describe('Stage 4: Treatment Plan - Phases and Objectives', () => {
  test('should display 5 treatment phases and allow setting objectives', async ({
    page,
  }) => {
    const casePage = new CasePage(page);
    await casePage.mockAuth();

    const patientId = 'p-plan-1';
    const caseId = 'c-plan-1';

    // Mock Patient with completed diagnosis to unblock Plan
    await page.route(`**/api/v1/patients/${patientId}**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: patientId,
          name: 'Plan Patient',
          clinicalCases: [
            {
              id: caseId,
              patientId,
              title: 'Test Case',
              status: 'active',
              startDate: new Date().toISOString(),
              evaluation: {
                id: 'e1',
                diagnosis: {
                  functionalIndicator: 'Has diagnosis',
                  clinicalAspect: 'Has aspect',
                },
              },
              treatmentPlan: {
                id: 'plan-1',
                phases: [
                  {
                    number: 1,
                    name: 'Phase 1',
                    durationWeeks: 2,
                    techniques: [],
                    objectives: 'Obj 1',
                  },
                  {
                    number: 2,
                    name: 'Phase 2',
                    durationWeeks: 2,
                    techniques: [],
                    objectives: 'Obj 2',
                  },
                  {
                    number: 3,
                    name: 'Phase 3',
                    durationWeeks: 2,
                    techniques: [],
                    objectives: 'Obj 3',
                  },
                  {
                    number: 4,
                    name: 'Phase 4',
                    durationWeeks: 2,
                    techniques: [],
                    objectives: 'Obj 4',
                  },
                  {
                    number: 5,
                    name: 'Phase 5',
                    durationWeeks: 2,
                    techniques: [],
                    objectives: 'Obj 5',
                  },
                ],
                objectives: {
                  therapeutic: 'Feel better',
                  prophylactic: 'Avoid injury',
                  educational: 'Learn exercises',
                },
              },
              treatmentSessions: [],
            },
          ],
        }),
      });
    });

    await page.goto(`/pacientes/${patientId}/casos/${caseId}`);

    // Verify Timeline Tab
    await page.getByTestId('nav-timeline-btn').click();
    await expect(page.getByText('Cronograma de Tratamiento')).toBeVisible();

    // Verify 5 phases in PhaseProgress
    for (let i = 1; i <= 5; i++) {
      await expect(
        page
          .getByText(`Fase ${i}`)
          .or(page.getByText(`Phase ${i}`))
          .first(),
      ).toBeVisible();
    }

    // Verify Objectives Tab
    await page.getByTestId('nav-objectives-btn').click();
    await expect(page.getByText('Objetivos', { exact: true })).toBeVisible();

    await expect(
      page.getByPlaceholder(/Ej: Reducir dolor lumbar/i),
    ).toHaveValue('Feel better');
    await expect(
      page.getByPlaceholder(/Ej: Prevenir recurrencia/i),
    ).toHaveValue('Avoid injury');
    await expect(page.getByPlaceholder(/Ej: Enseñar postura/i)).toHaveValue(
      'Learn exercises',
    );

    // Test updating objectives
    await page
      .getByPlaceholder(/Ej: Reducir dolor lumbar/i)
      .fill('New therapeutic goal');
    await page.waitForTimeout(500); // Debounce
  });
});
