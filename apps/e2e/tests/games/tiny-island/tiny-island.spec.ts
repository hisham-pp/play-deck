import { expect, test } from '@playwright/test';
import { tinyIslandGame } from '@playdeck/game-data/src/content/tiny-island';

test.describe('Tiny Island', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${tinyIslandGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: tinyIslandGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${tinyIslandGame.definition.slug}`);

    // Click "Play vs Bots" button
    await page.getByRole('button', { name: /Play vs Bots/i }).click();

    // Verify we are playing by checking if the button is gone or if some in-game HUD is there
    // Actually, checking the button goes away is reliable.
    const playBtn = page.getByRole('button', { name: /Play vs Bots/i });
    await expect(playBtn).not.toBeVisible();
  });
});
