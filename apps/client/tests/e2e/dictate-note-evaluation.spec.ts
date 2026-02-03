import { test, expect } from '@playwright/test';
import { CasePage } from './pages/CasePage';

test.describe('Voice Dictation in Evaluation Form', () => {
  test('should record and transcribe a voice note in the evaluation form', async ({
    page,
  }) => {
    const casePage = new CasePage(page);
    await casePage.mockAuth();

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
              title: 'Esguince de Tobillo',
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

    await page.route(
      `**/api/v1/media/evaluations/eval-1/voice-notes`,
      async (route) => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'vn-1',
            audioUrl: '/mock-audio.wav',
            transcription: null,
            transcriptionStatus: 'pending',
            durationSeconds: 5,
          }),
        });
      },
    );

    let pollCount = 0;
    await page.route(
      `**/api/v1/media/evaluations/eval-1/voice-notes/vn-1`,
      async (route) => {
        pollCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'vn-1',
            transcription:
              pollCount > 1
                ? 'Paciente presenta mejoría en la movilidad'
                : null,
            transcriptionStatus: pollCount > 1 ? 'completed' : 'pending',
          }),
        });
      },
    );

    await page.goto(`/pacientes/${patientId}/casos/${caseId}`);

    await page.getByTestId('nav-evaluation-btn').click();

    await expect(casePage.dictateVoiceButton).toBeVisible();
    await casePage.startVoiceDictation();
    await expect(casePage.stopRecordingButton).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    await casePage.stopRecording();
    await expect(casePage.confirmRecordingButton).toBeVisible();

    await casePage.confirmRecording();

    await casePage.waitForTranscription();

    const transcriptionText = await casePage.getTranscriptionText();
    expect(transcriptionText).toContain('Paciente presenta mejoría');
  });
});
