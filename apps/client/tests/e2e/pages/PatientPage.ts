import { BasePage } from './BasePage';
import { Page, Locator } from '@playwright/test';

export class PatientPage extends BasePage {
  readonly newPatientButton: Locator;
  readonly nameInput: Locator;
  readonly ageInput: Locator;
  readonly occupationInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    super(page);
    this.newPatientButton = page.getByRole('button', {
      name: /Nuevo Paciente/i,
    });
    this.nameInput = page.getByLabel(/Nombre/i);
    this.ageInput = page.getByLabel(/Edad/i);
    this.occupationInput = page.getByLabel(/Ocupación/i);
    this.phoneInput = page.getByLabel(/Teléfono/i);
    this.emailInput = page.getByLabel(/Email/i);
    this.createButton = page.getByRole('button', { name: /Crear Paciente/i });
  }

  async gotoList() {
    await this.goto('/pacientes');
  }

  async createPatient(data: {
    name: string;
    age: string;
    occupation: string;
    phone: string;
    email: string;
  }) {
    await this.newPatientButton.click();
    await this.nameInput.fill(data.name);
    await this.ageInput.fill(data.age);
    await this.occupationInput.fill(data.occupation);
    await this.phoneInput.fill(data.phone);
    await this.emailInput.fill(data.email);
    await this.createButton.click();
  }
}
