import { expect, test } from '@playwright/test';
import { stickmanShooterGame } from '@playdeck/game-data/src/content/stickman-shooter';

test.describe('Stickman Shooter', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${stickmanShooterGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: stickmanShooterGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${stickmanShooterGame.definition.slug}`);

    // Wait for the DEPLOY OPERATIVE button
    await page.getByRole('button', { name: /DEPLOY OPERATIVE/i }).click();

    // Look for RELOAD (R) button to verify playing state
    const reloadBtn = page.getByRole('button', { name: /RELOAD \(R\)/i }).first();
    await expect(reloadBtn).toBeVisible({ timeout: 10000 });
  });
});
