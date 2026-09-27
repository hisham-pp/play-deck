import { expect, test } from '@playwright/test';
import { stickmanNinjaGame } from '@playdeck/game-data/src/content/stickman-ninja';

test.describe('Stickman Ninja', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${stickmanNinjaGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: stickmanNinjaGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${stickmanNinjaGame.definition.slug}`);

    // The game starts automatically. Wait for the Restart button.
    const restartBtn = page.getByRole('button', { name: /Restart/i, exact: true }).first();
    await expect(restartBtn).toBeVisible({ timeout: 10000 });
  });
});
