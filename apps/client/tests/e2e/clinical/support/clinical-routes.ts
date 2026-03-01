import { Page } from '@playwright/test';

export const mockPatientFlow = async (page: Page, overrides = {}) => {
  const patientId = 'p-canonical-1';
  const caseId = 'c-canonical-1';
  const evalId = 'e-canonical-1';

  const defaultData = {
    id: patientId,
    name: 'Canonical Patient',
    occupation: 'Tester',
    phone: '123456789',
    birthDate: '1990-01-01',
    clinicalCases: [
      {
        id: caseId,
        patientId,
        title: 'Canonical Case',
        status: 'active',
        startDate: new Date().toISOString(),
        evaluation: {
          id: evalId,
          clinicalCaseId: caseId,
          date: new Date().toISOString(),
          posturogram: {},
          orthopedicTests: {},
          painScale: { activity: 0, rest: 0, palpation: 0, type: 'acute' },
          diagnosis: {
            functionalIndicator: '',
            clinicalAspect: '',
            anatomopathology: '',
            avdConsequences: '',
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
          objectives: { therapeutic: '', prophylactic: '', educational: '' },
        },
        treatmentSessions: [],
      },
    ],
  };

  const data = { ...defaultData, ...overrides };

  await page.route(`**/api/v1/patients/${patientId}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });

  return { patientId, caseId, evalId };
};

export const mockEvaluationPatch = async (page: Page, evalId: string) => {
  await page.route(
    `**/api/v1/patients/evaluations/${evalId}`,
    async (route) => {
      if (route.request().method() === 'PATCH') {
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
};
