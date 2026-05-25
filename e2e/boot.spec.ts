import { test, expect } from '@playwright/test';

test.describe('Quarto boot smoke', () => {
  test('home route renders shell + canvas + initial turn label', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Quarto/);
    // Brand mark in the top bar.
    await expect(page.getByText('Quarto').first()).toBeVisible();
    // Initial turn = player 1 in pick stage.
    await expect(page.getByText(/Player 1 — pick/i)).toBeVisible();
    // 3D canvas mounts.
    await expect(page.locator('canvas')).toBeVisible();
    // Quarto-call button exists and is disabled before any moves.
    const quartoBtn = page.getByRole('button', { name: /Quarto!/ });
    await expect(quartoBtn).toBeVisible();
    await expect(quartoBtn).toBeDisabled();
  });

  test('playground route renders', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.getByRole('heading', { name: 'Playground' })).toBeVisible();
  });
});
