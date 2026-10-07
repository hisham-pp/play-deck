import { expect, test } from '@playwright/test';
import { summitRushGame } from '@playdeck/game-data/src/content/summit-rush';

test.describe('Summit Rush', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${summitRushGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: summitRushGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${summitRushGame.definition.slug}`);

    // Wait for the "Start driving" button
    await page.getByRole('button', { name: /Start driving/i }).click();

    // Verify the game started by checking if the pause button is visible, 
    // or just checking the Start driving button goes away.
    const startBtn = page.getByRole('button', { name: /Start driving/i });
    await expect(startBtn).not.toBeVisible();
  });
});
