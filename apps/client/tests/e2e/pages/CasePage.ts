import { BasePage } from './BasePage';
import { Page, Locator } from '@playwright/test';

export class CasePage extends BasePage {
  readonly newSessionButton: Locator;
  readonly phaseSelect: Locator;
  readonly procedureInput: Locator;
  readonly patientResponseInput: Locator;
  readonly observationsInput: Locator;
  readonly addSessionButton: Locator;

  constructor(page: Page) {
    super(page);
    this.newSessionButton = page.getByRole('button', { name: /Nueva Sesión/i });
    this.phaseSelect = page.getByLabel('Fase', { exact: true });
    this.procedureInput = page.getByPlaceholder('Agregar procedimiento...');
    this.patientResponseInput = page.getByLabel(/Respuesta del Paciente/i);
    this.observationsInput = page.getByLabel(/Observaciones/i);
    this.addSessionButton = page.getByRole('button', {
      name: /Agregar Sesión/i,
    });
  }

  async gotoDetail(patientId: string, caseId: string) {
    await this.goto(`/pacientes/${patientId}/casos/${caseId}`);
  }

  async createSession(data: {
    phase: string;
    procedures: string[];
    response: string;
    observations: string;
  }) {
    await this.newSessionButton.click();
    await this.phaseSelect.selectOption(data.phase);

    for (const proc of data.procedures) {
      await this.procedureInput.fill(proc);
      await this.procedureInput.press('Enter');
    }

    await this.patientResponseInput.fill(data.response);
    await this.observationsInput.fill(data.observations);
    await this.addSessionButton.click();
  }
}
