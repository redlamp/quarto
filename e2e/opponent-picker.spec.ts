import { test, expect } from '@playwright/test';

test('opponent picker toggles AI mode and persists across reloads', async ({ page, context }) => {
  await page.goto('/');
  // Open settings.
  await page.getByRole('button', { name: /Open settings/i }).click();
  // Switch to AI/Random via the Opponent dropdown (shadcn/Radix Select).
  await page.getByLabel('Opponent').click();
  await page.getByRole('option', { name: 'AI — Random' }).click();
  // Reload — opponent should persist via localStorage.
  await page.reload();
  await page.getByRole('button', { name: /Open settings/i }).click();
  await expect(page.getByLabel('Opponent')).toContainText('AI — Random');

  // Cleanup persisted state so other tests aren't affected.
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());
});
