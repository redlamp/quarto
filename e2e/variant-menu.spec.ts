import { test, expect } from '@playwright/test';

test('variant menu switches the game and persists across reloads', async ({ page }) => {
  await page.goto('/');
  // Default variant in the top-bar menu.
  await expect(page.getByLabel('Variant')).toContainText('4×4 - Classic');

  // Switch to the 6×6 variant — a fresh game starts on the new board.
  await page.getByLabel('Variant').click();
  await page.getByRole('option', { name: '6×6 - 4 Mixed Traits' }).click();
  await expect(page.getByLabel('Variant')).toContainText('6×6 - 4 Mixed Traits');
  await expect(page.getByText(/Player 1 — pick/i)).toBeVisible();
  // The win declaration matches the line length (6 → Sesto).
  await expect(page.getByRole('button', { name: /Sesto!/ })).toBeVisible();

  // Persists via localStorage.
  await page.reload();
  await expect(page.getByLabel('Variant')).toContainText('6×6 - 4 Mixed Traits');

  // The settings drawer exposes the same picker.
  await page.getByRole('button', { name: /Open settings/i }).click();
  await expect(page.getByLabel('Variant').last()).toContainText('6×6 - 4 Mixed Traits');

  // Cleanup persisted state so other tests aren't affected.
  await page.evaluate(() => localStorage.clear());
});
