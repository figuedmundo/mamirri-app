import { BasePage } from './BasePage';
import { Page, Locator } from '@playwright/test';

export class CasePage extends BasePage {
  readonly newSessionButton: Locator;
  readonly phaseSelect: Locator;
  readonly procedureInput: Locator;
  readonly patientResponseInput: Locator;
  readonly observationsInput: Locator;
  readonly addSessionButton: Locator;
  readonly dictateVoiceButton: Locator;
  readonly startRecordingButton: Locator;
  readonly stopRecordingButton: Locator;
  readonly confirmRecordingButton: Locator;
  readonly cancelRecordingButton: Locator;
  readonly restartRecordingButton: Locator;
  readonly floatingGrabarEvolucionButton: Locator;
  readonly transcriptionStatus: Locator;

  constructor(page: Page) {
    super(page);
    this.newSessionButton = page.getByTestId('new-session-btn');
    this.phaseSelect = page.getByTestId('session-phase-select');
    this.procedureInput = page.getByTestId('procedure-input');
    this.patientResponseInput = page.getByTestId('patient-response-input');
    this.observationsInput = page.getByTestId('observations-input');
    this.addSessionButton = page.getByRole('button', {
      name: /Agregar Sesión|Guardar Cambios/i,
    });
    this.dictateVoiceButton = page.getByTestId('start-recording-btn');
    this.startRecordingButton = page.getByTestId('start-recording-btn');
    this.stopRecordingButton = page.getByRole('button', { name: /Detener/i });
    this.confirmRecordingButton = page
      .getByTestId('confirm-recording')
      .or(page.getByRole('button', { name: /Confirmar/i }));
    this.cancelRecordingButton = page.getByTestId('cancel-recording');
    this.restartRecordingButton = page.getByRole('button', {
      name: /Volver a grabar/i,
    });
    this.floatingGrabarEvolucionButton = page.getByTestId(
      'floating-grabar-evolucion-btn',
    );
    this.transcriptionStatus = page.locator(
      'p.whitespace-pre-wrap, p.text-xs.italic',
    );
  }

  async startVoiceDictation() {
    await this.dictateVoiceButton.click();
  }

  async startFloatingVoiceDictation() {
    await this.floatingGrabarEvolucionButton.click();
  }

  async startRecording() {
    await this.startRecordingButton.click();
  }

  async stopRecording() {
    await this.stopRecordingButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.stopRecordingButton.click();
  }

  async confirmRecording() {
    await this.confirmRecordingButton.waitFor({
      state: 'visible',
      timeout: 5000,
    });
    await this.confirmRecordingButton.click();
  }

  async cancelRecording() {
    await this.cancelRecordingButton.waitFor({
      state: 'visible',
      timeout: 5000,
    });
    await this.cancelRecordingButton.click();
  }

  async restartRecording() {
    await this.restartRecordingButton.click();
  }

  async getTranscriptionText() {
    await this.page.waitForTimeout(1000);
    return await this.page
      .locator('p.whitespace-pre-wrap, p.text-slate-700')
      .filter({ hasText: /Paciente presenta mejoría/ })
      .first()
      .innerText();
  }

  async waitForTranscription() {
    await this.page.waitForFunction(
      () => {
        const ps = Array.from(
          document.querySelectorAll('p.whitespace-pre-wrap, p.text-slate-700'),
        );
        return ps.some((p) => {
          const text = p.textContent || '';
          return text.length > 0 && text.includes('Paciente presenta mejoría');
        });
      },
      { timeout: 30000 },
    );
    await this.page.waitForTimeout(500);
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
      .click({ force: true });
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
