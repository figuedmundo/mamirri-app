import { BasePage } from './BasePage';
import { Page, Locator } from '@playwright/test';

export class ProfilePage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly clinicInput: Locator;
  readonly licenseInput: Locator;
  readonly specialtyInput: Locator;
  readonly experienceInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByLabel(/Nombre completo/i);
    this.emailInput = page.getByLabel(/Correo electrónico/i);
    this.phoneInput = page.getByLabel(/Teléfono/i);
    this.clinicInput = page.getByLabel(/Nombre de clínica/i);
    this.licenseInput = page.getByLabel(/Número de colegiado/i);
    this.specialtyInput = page.getByLabel(/Especialidad/i);
    this.experienceInput = page.getByLabel(/Años de experiencia/i);
    this.saveButton = page.getByRole('button', { name: /Guardar cambios/i });
  }

  async gotoProfile() {
    await this.goto('/perfil');
  }

  async updateProfile(data: { name?: string; phone?: string }) {
    if (data.name) await this.nameInput.fill(data.name);
    if (data.phone) await this.phoneInput.fill(data.phone);
    await this.saveButton.click();
  }
}
