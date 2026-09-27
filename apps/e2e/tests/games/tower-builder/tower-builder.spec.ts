import { expect, test } from '@playwright/test';
import { towerBuilderGame } from '@playdeck/game-data/src/content/tower-builder';

test.describe('Tower Builder', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${towerBuilderGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: towerBuilderGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${towerBuilderGame.definition.slug}`);

    // Click "Start Construction"
    await page.getByRole('button', { name: /Start Construction/i }).click();

    // The game enters the play state. Look for 'Restart' button at top
    const restartButton = page.getByRole('button', { name: /Restart/i });
    await expect(restartButton).toBeVisible({ timeout: 10000 });
  });
});
