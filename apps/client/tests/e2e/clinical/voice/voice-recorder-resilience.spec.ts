import { test, expect } from '@playwright/test';
import { CasePage } from '../../pages/CasePage';

test.describe('Voice Recorder Resilience', () => {
  test('should handle start, stop, and cancel without crashing', async ({
    page,
  }) => {
    const casePage = new CasePage(page);
    await casePage.mockAuth();

    await page.addInitScript(() => {
      const fakeStream = {
        getTracks: () => [{ stop: () => {} }],
      };

      class FakeMediaRecorder {
        state = 'inactive';
        ondataavailable: ((event: { data: Blob }) => void) | null = null;
        onstop: (() => void) | null = null;

        start() {
          this.state = 'recording';
        }

        stop() {
          if (this.state === 'inactive') return;
          this.state = 'inactive';
          this.ondataavailable?.({
            data: new Blob(['fake-audio'], { type: 'audio/webm' }),
          });
          this.onstop?.();
        }
      }

      Object.defineProperty(window, 'MediaRecorder', {
        configurable: true,
        writable: true,
        value: FakeMediaRecorder,
      });

      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {
          getUserMedia: async () => fakeStream,
        },
      });
    });

    // Ensure PIN status is also mocked correctly from the start
    await page.route('**/api/v1/auth/pin/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ hasPinSet: true }),
      });
    });

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

    const patientId = 'p-res-1';
    const caseId = 'c-res-1';

    // Mock Patients List
    await page.route('**/api/v1/patients', async (route) => {
      if (
        route.request().method() === 'GET' &&
        route.request().url().endsWith('/patients')
      ) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: patientId,
                name: 'Resilience Patient',
                occupation: 'Tester',
              },
            ],
            meta: { total: 1, page: 1, lastPage: 1 },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock Patient Detail
    await page.route(`**/api/v1/patients/${patientId}**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: patientId,
          name: 'Resilience Patient',
          clinicalCases: [
            {
              id: caseId,
              patientId,
              status: 'active',
              title: 'Test Case',
              evaluation: {
                id: 'eval-1',
                clinicalCaseId: caseId,
                posturogram: {},
                orthopedicTests: {},
                painScale: {
                  activity: 0,
                  rest: 0,
                  palpation: 0,
                  type: 'acute',
                },
                diagnosis: {
                  functionalIndicator: 'Test',
                  clinicalAspect: 'Test',
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
                    objectives: '',
                  },
                ],
                objectives: {
                  therapeutic: '',
                  prophylactic: '',
                  educational: '',
                },
              },
              treatmentSessions: [],
            },
          ],
        }),
      });
    });

    await page.route('**/api/v1/media/**', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'v1' }),
      });
    });

    await page.goto(`/pacientes/${patientId}/casos/${caseId}`);

    // Use header recorder (floating bar)
    await expect(page.getByTestId('floating-grabar-evolucion-btn')).toBeVisible(
      { timeout: 10000 },
    );
    await page.getByTestId('floating-grabar-evolucion-btn').click();
    const floatingStopButton = page.getByTestId('floating-stop-btn');
    const floatingCancelButton = page.getByTestId('floating-cancel-btn');
    if (!(await floatingStopButton.isVisible())) {
      await page.getByTestId('floating-grabar-evolucion-btn').click();
    }
    await expect(floatingStopButton).toBeVisible({ timeout: 10000 });
    await expect(floatingCancelButton).toBeVisible({ timeout: 10000 });

    // 1. Test Cancel
    await floatingCancelButton.click();
    await expect(floatingStopButton).not.toBeVisible();

    // 2. Test Stop
    await page.getByTestId('floating-grabar-evolucion-btn').click();
    await expect(page.getByTestId('floating-stop-btn')).toBeVisible({
      timeout: 10000,
    });
    await floatingStopButton.click();

    await expect(floatingStopButton).not.toBeVisible();
  });
});
