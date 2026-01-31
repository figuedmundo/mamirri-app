import { Page, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForToast(message: string | RegExp) {
    await expect(this.page.getByText(message).first()).toBeVisible({
      timeout: 10000,
    });
  }

  async mockAuth() {
    await this.page.route('**/api/v1/auth/me', async (route) => {
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

    await this.page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'fake-token');
      window.localStorage.setItem(
        'user_data',
        JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test User' }),
      );
    });
  }
}
