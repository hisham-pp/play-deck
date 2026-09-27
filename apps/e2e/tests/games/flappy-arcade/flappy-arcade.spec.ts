import { expect, test } from '@playwright/test';
import { flappyArcadeGame } from '@playdeck/game-data/src/content/flappy-arcade';

test.describe('Flappy Arcade', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${flappyArcadeGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: flappyArcadeGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${flappyArcadeGame.definition.slug}`);

    // Start the game by pressing Space
    await page.keyboard.press('Space');

    // The game enters the play state. Look for 'Score'
    const scoreText = page.getByText('Score', { exact: true }).first();
    await expect(scoreText).toBeVisible({ timeout: 10000 });
  });
});
