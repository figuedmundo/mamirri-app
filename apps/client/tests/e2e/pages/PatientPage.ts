import { BasePage } from './BasePage';
import { Page, Locator } from '@playwright/test';

export class PatientPage extends BasePage {
  readonly newPatientButton: Locator;
  readonly nameInput: Locator;
  readonly occupationInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly ecNameInput: Locator;
  readonly ecPhoneInput: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    super(page);
    this.newPatientButton = page
      .getByRole('button', {
        name: /Nuevo Paciente|Agregar Primer Paciente/i,
      })
      .first();
    this.nameInput = page.locator('#name');
    this.occupationInput = page.locator('#occupation');
    this.phoneInput = page.locator('#phone');
    this.emailInput = page.locator('#email');
    this.ecNameInput = page.locator('#ec-name');
    this.ecPhoneInput = page.locator('#ec-phone');
    this.createButton = page.getByRole('button', { name: /Crear Paciente/i });
  }

  async gotoList() {
    await this.goto('/pacientes');
  }

  async createPatient(data: {
    name: string;
    occupation: string;
    phone: string;
    email: string;
    birthDate?: string;
    emergencyContact: {
      name: string;
      phone: string;
    };
  }) {
    await this.newPatientButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.newPatientButton.click();
    try {
      await this.nameInput.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      const fallbackCreateButton = this.page
        .getByRole('button', {
          name: /Nuevo Paciente|Agregar Primer Paciente/i,
        })
        .last();
      await fallbackCreateButton.click({ force: true });
      await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
    }
    await this.nameInput.fill(data.name);
    await this.occupationInput.fill(data.occupation);
    await this.phoneInput.fill(data.phone);
    await this.emailInput.fill(data.email);
    await this.ecNameInput.fill(data.emergencyContact.name);
    await this.ecPhoneInput.fill(data.emergencyContact.phone);
    if (data.birthDate) {
      const [year, month, day] = data.birthDate.split('-');
      const months = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ];
      const monthName = months[parseInt(month) - 1];
      const dayNum = parseInt(day).toString();

      await this.page.getByTestId('day-select').click();
      await this.page
        .getByRole('option', { name: dayNum, exact: true })
        .click();

      await this.page.getByTestId('month-select').click();
      await this.page
        .getByRole('option', { name: monthName, exact: true })
        .click();

      await this.page.getByTestId('year-select').click();
      await this.page.getByRole('option', { name: year, exact: true }).click();
    }
    await this.createButton.click();
  }
}
