import { test, expect } from '@playwright/test';

test('board-size menu switches the game and persists across reloads', async ({ page }) => {
  await page.goto('/');
  // Default board in the top-bar menu.
  await expect(page.getByLabel('Board size')).toContainText('4×4');

  // Switch to the 6×6 board — a fresh game starts with its trait set.
  await page.getByLabel('Board size').click();
  await page.getByRole('option', { name: '6×6 - Sesto' }).click();
  await expect(page.getByLabel('Board size')).toContainText('6×6');
  await expect(page.getByText(/Player 1 — pick/i)).toBeVisible();
  // The win declaration matches the line length (6 → Sesto).
  await expect(page.getByRole('button', { name: /Sesto!/ })).toBeVisible();

  // Persists via localStorage.
  await page.reload();
  await expect(page.getByLabel('Board size')).toContainText('6×6');

  // Cleanup persisted state so other tests aren't affected.
  await page.evaluate(() => localStorage.clear());
});

test('toggling a trait resizes the board to match the trait count', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Open settings/i }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

  // Classic 4×4 defaults: height on, band off.
  const height = page.getByRole('switch', { name: 'Trait Height' });
  const band = page.getByRole('switch', { name: 'Trait Band' });
  const stripes = page.getByRole('switch', { name: 'Trait Stripes' });
  await expect(height).toBeChecked();
  await expect(band).not.toBeChecked();

  // Add band → 5 traits grows the board to 5×5 (Quinto), 32 pieces;
  // stripes becomes unavailable (conflict).
  await band.click();
  await expect(page.getByText(/5×5 board · 5 traits · 32 pieces/)).toBeVisible();
  await expect(page.getByLabel('Board', { exact: true })).toContainText('5×5 - Quinto');
  await expect(stripes).toBeDisabled();

  // Remove height → back down to a 4×4 with the custom set.
  await height.click();
  await expect(page.getByText(/4×4 board · 4 traits · 16 pieces/)).toBeVisible();

  // Reset restores the current board's default traits.
  await page.getByRole('button', { name: 'Reset to default traits' }).click();
  await expect(band).not.toBeChecked();
  await expect(height).toBeChecked();

  await page.evaluate(() => localStorage.clear());
});
