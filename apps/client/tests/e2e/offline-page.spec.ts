import { test, expect } from '@playwright/test';

test.describe('Offline Fallback Page', () => {
  test('should render the offline page correctly', async ({ page }) => {
    await page.goto('/offline.html');

    await expect(page).toHaveTitle(/Offline/i);
    await expect(
      page.getByRole('heading', { name: /You are offline/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/check your internet connection/i),
    ).toBeVisible();

    const dashboardLink = page.getByRole('link', { name: /Go to Dashboard/i });
    await expect(dashboardLink).toBeVisible();
  });
});
