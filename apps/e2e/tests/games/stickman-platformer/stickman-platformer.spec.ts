import { expect, test } from '@playwright/test';
import { stickmanPlatformerGame } from '@playdeck/game-data/src/content/stickman-platformer';

test.describe('Stickman Platformer', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${stickmanPlatformerGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: stickmanPlatformerGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${stickmanPlatformerGame.definition.slug}`);

    // The game starts automatically. Wait for the Restart button.
    const restartBtn = page.getByRole('button', { name: /Restart/i, exact: true }).first();
    await expect(restartBtn).toBeVisible({ timeout: 10000 });
  });
});
