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
      name: /Agregar Sesión|Guardar Cambios/i,
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
    await this.fillSessionForm(data);
    await this.addSessionButton.click();
  }

  async editSession(data: { response: string }) {
    await this.page.locator('div.group').first().hover();
    await this.page
      .getByRole('button', { name: 'Editar sesión', exact: true })
      .click();
    await this.patientResponseInput.fill(data.response);
    await this.addSessionButton.click();
  }

  async deleteSession() {
    await this.page.locator('div.group').first().hover();
    await this.page
      .getByRole('button', { name: 'Eliminar sesión', exact: true })
      .click();
    await this.page
      .getByRole('button', { name: 'Eliminar', exact: true })
      .click();
  }

  private async fillSessionForm(data: {
    phase: string;
    procedures: string[];
    response: string;
    observations: string;
  }) {
    await this.phaseSelect.selectOption(data.phase);

    for (const proc of data.procedures) {
      await this.procedureInput.fill(proc);
      await this.procedureInput.press('Enter');
    }

    await this.patientResponseInput.fill(data.response);
    await this.observationsInput.fill(data.observations);
  }
}
