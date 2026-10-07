import { expect, test } from '@playwright/test';
import { stickmanBasketballGame } from '@playdeck/game-data/src/content/stickman-basketball';

test.describe('Stickman Basketball', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${stickmanBasketballGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: stickmanBasketballGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${stickmanBasketballGame.definition.slug}`);

    // The game starts automatically. Wait for the Mode indicator or Restart button.
    const modeBtn = page.getByRole('button', { name: /Mode: 1P vs AI/i }).first();
    await expect(modeBtn).toBeVisible({ timeout: 10000 });
  });
});
