import { test, expect } from '@playwright/test';

test('opponent picker toggles AI mode and persists across reloads', async ({ page, context }) => {
  await page.goto('/');
  // Open settings.
  await page.getByRole('button', { name: /Open settings/i }).click();
  // Switch to AI/Random.
  await page.getByRole('button', { name: /AI — Random/i }).click();
  // Reload — opponent should persist via localStorage.
  await page.reload();
  await page.getByRole('button', { name: /Open settings/i }).click();
  const aiButton = page.getByRole('button', { name: /AI — Random/i });
  await expect(aiButton).toBeVisible();
  // Default (selected) buttons have the dark background; outline buttons are bordered.
  // We assert the AI button is no longer outline (i.e., it's selected).
  await expect(aiButton).not.toHaveClass(/border-/);

  // Cleanup persisted state so other tests aren't affected.
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());
});
