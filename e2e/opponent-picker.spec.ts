import { test, expect } from '@playwright/test';

test('opponent picker toggles AI mode and persists across reloads', async ({ page, context }) => {
  await page.goto('/');
  // Open settings.
  await page.getByRole('button', { name: /Open settings/i }).click();
  // Switch to AI/Random via the Opponent dropdown.
  await page.getByLabel('Opponent').selectOption('ai-random');
  // Reload — opponent should persist via localStorage.
  await page.reload();
  await page.getByRole('button', { name: /Open settings/i }).click();
  await expect(page.getByLabel('Opponent')).toHaveValue('ai-random');

  // Cleanup persisted state so other tests aren't affected.
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());
});
