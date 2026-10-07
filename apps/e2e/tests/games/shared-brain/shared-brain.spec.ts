import { expect, test } from '@playwright/test';
import { sharedBrainGame } from '@playdeck/game-data/src/content/shared-brain';

test.describe('Shared Brain', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${sharedBrainGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: sharedBrainGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${sharedBrainGame.definition.slug}`);

    // Click "Start Course Run"
    await page.getByRole('button', { name: /Start Course Run/i }).click();

    // The game enters the play state. Look for 'READY TO SYNC' or 'Start Run' inside toolbar
    const startRunButton = page.getByRole('button', { name: /Start Run/i });
    await expect(startRunButton).toBeVisible({ timeout: 10000 });
  });
});
