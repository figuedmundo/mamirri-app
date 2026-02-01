import { test, expect } from '@playwright/test';
import { CasePage } from './pages/CasePage';

test.describe('Recorder Permissions', () => {
  test('should show error toast when microphone permission is denied', async ({
    context,
    page,
  }) => {
    const casePage = new CasePage(page);
    await casePage.mockAuth();

    await context.clearPermissions();

    // Mock getUserMedia to throw Permission Denied
    await page.addInitScript(() => {
      // @ts-ignore
      navigator.mediaDevices.getUserMedia = () =>
        Promise.reject(
          new DOMException('Permission denied', 'NotAllowedError'),
        );
    });

    const patientId = 'p-1';
    const caseId = 'c-1';

    await page.route(`**/api/v1/patients/${patientId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: patientId,
          name: 'Maria Garcia',
          age: 30,
          occupation: 'Tester',
          phone: '123456789',
          isActive: true,
          createdAt: new Date().toISOString(),
          clinicalCases: [
            {
              id: caseId,
              patientId,
              title: 'Test',
              status: 'active',
              startDate: new Date().toISOString(),
              treatmentSessions: [
                {
                  id: 'sess-1',
                  date: new Date().toISOString(),
                  phaseNumber: 1,
                  procedures: [],
                  patientResponse: '',
                  finalPainLevel: 5,
                  observations: [],
                },
              ],
              evaluations: [
                {
                  id: 'eval-1',
                  clinicalCaseId: caseId,
                  date: new Date().toISOString(),
                  type: 'INITIAL',
                  posturogram: {},
                  orthopedicTests: {},
                  avdEvaluation: {
                    barthel: { total: 12 },
                    lawton: { total: 10 },
                  },
                  painScale: {
                    activity: 0,
                    rest: 0,
                    palpation: 0,
                    type: 'acute',
                  },
                  diagnosis: {
                    functionalIndicator: '',
                    clinicalAspect: '',
                    anatomopathology: '',
                    avdConsequences: '',
                  },
                  footprints: [],
                  postureVideos: [],
                },
              ],
              treatmentPlan: {
                id: 'plan-1',
                phases: [
                  {
                    number: 1,
                    name: 'Fase 1',
                    durationWeeks: 4,
                    techniques: [],
                    objectives: '',
                  },
                ],
              },
            },
          ],
        }),
      });
    });

    await page.goto(`/pacientes/${patientId}/casos/${caseId}`);

    await page.getByTestId('nav-evaluation-btn').click();

    await casePage.startVoiceDictation();

    await expect(page.getByText(/Permiso denegado/i)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/acceso al micrófono/i)).toBeVisible({
      timeout: 10000,
    });
  });
});
