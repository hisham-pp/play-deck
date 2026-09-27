import { expect, test } from '@playwright/test';
import { stickmanParkourGame } from '@playdeck/game-data/src/content/stickman-parkour';

test.describe('Stickman Parkour', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${stickmanParkourGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: stickmanParkourGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${stickmanParkourGame.definition.slug}`);

    // Wait for the START SPEEDRUN button
    await page.getByRole('button', { name: /START SPEEDRUN/i }).click();

    // Look for JUMP / WALL VAULT (SPACE) button to verify playing state
    const jumpBtn = page.getByRole('button', { name: /JUMP \/ WALL VAULT \(SPACE\)/i }).first();
    await expect(jumpBtn).toBeVisible({ timeout: 10000 });
  });
});
