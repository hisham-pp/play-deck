import { expect, test } from '@playwright/test';
import { stickmanSwordFightGame } from '@playdeck/game-data/src/content/stickman-sword-fight';

test.describe('Stickman Sword Fight', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${stickmanSwordFightGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: stickmanSwordFightGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${stickmanSwordFightGame.definition.slug}`);

    // The game starts automatically. Wait for the Restart Match button.
    const restartBtn = page.getByRole('button', { name: /Restart Match/i }).first();
    await expect(restartBtn).toBeVisible({ timeout: 10000 });
  });
});
