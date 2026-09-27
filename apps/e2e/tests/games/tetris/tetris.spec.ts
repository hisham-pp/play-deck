import { expect, test } from '@playwright/test';
import { tetrisGame } from '@playdeck/game-data/src/content/tetris';

test.describe('Tetris', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${tetrisGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: tetrisGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to play a match and interact with the board', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${tetrisGame.definition.slug}`);

    // Click "Start Game"
    await page.getByRole('button', { name: /Start Game/i }).click();

    // The game enters countdown then 'playing' status.
    // Wait for the "Pause (P)" button to be visible, which means the game has started.
    const pauseButton = page.getByRole('button', { name: /Pause \(P\)/i });
    await expect(pauseButton).toBeVisible({ timeout: 10000 });

    // Click pause
    await pauseButton.click();

    // Verify "Resume Game" is visible (meaning the game successfully paused)
    await expect(page.getByRole('button', { name: /Resume Game/i, exact: true })).toBeVisible();
  });
});
