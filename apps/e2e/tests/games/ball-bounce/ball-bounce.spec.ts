import { expect, test } from '@playwright/test';
import { ballBounceGame } from '@playdeck/game-data/src/content/ball-bounce';

test.describe('Ball Bounce', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${ballBounceGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: ballBounceGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${ballBounceGame.definition.slug}`);

    // Click "Play"
    await page.getByRole('button', { name: /Play/i, exact: true }).click();

    // The game enters the play state. Look for 'Pause' or 'Score'
    const scoreText = page.getByText('Score', { exact: true }).first();
    await expect(scoreText).toBeVisible({ timeout: 10000 });
  });
});
