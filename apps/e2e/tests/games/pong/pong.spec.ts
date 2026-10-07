import { expect, test } from '@playwright/test';
import { pongGame } from '@playdeck/game-data/src/content/pong';

test.describe('Pong', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${pongGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: pongGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${pongGame.definition.slug}`);

    // Click "START MATCH (SPACE)"
    await page.getByRole('button', { name: /START MATCH \(SPACE\)/i }).click();

    // The game enters the play state. Check for "PAUSE" or similar game controls.
    const pauseButton = page.getByRole('button', { name: /Pause/i });
    await expect(pauseButton).toBeVisible({ timeout: 10000 });
  });
});
