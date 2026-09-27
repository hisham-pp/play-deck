import { expect, test } from '@playwright/test';
import { tinyTankArenaGame as tinyTankGame } from '@playdeck/game-data/src/content/tiny-tank-arena';

test.describe('Tiny Tank', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${tinyTankGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: tinyTankGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${tinyTankGame.definition.slug}`);

    // Wait for the Deploy button
    await page.getByRole('button', { name: /Deploy Tiny Tanks & Start Battle/i }).click();

    // Verify the game started by checking if the Deploy button goes away
    const deployBtn = page.getByRole('button', { name: /Deploy Tiny Tanks & Start Battle/i });
    await expect(deployBtn).not.toBeVisible();
  });
});
