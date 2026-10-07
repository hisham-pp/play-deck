import { expect, test } from '@playwright/test';
import { trainRushGame } from '@playdeck/game-data/src/content/train-rush';

test.describe('Train Rush', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${trainRushGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: trainRushGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${trainRushGame.definition.slug}`);

    // Click "Start Railway Rush"
    await page.getByRole('button', { name: /Start Railway Rush/i }).click();

    // The game enters the play state. Look for 'Hold Track Piece' or 'Rotate' button
    const rotateButton = page.getByRole('button', { name: /Rotate/i });
    await expect(rotateButton).toBeVisible({ timeout: 10000 });
  });
});
