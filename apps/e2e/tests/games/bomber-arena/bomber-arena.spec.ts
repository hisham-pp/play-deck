import { expect, test } from '@playwright/test';
import { bomberArenaGame } from '@playdeck/game-data/src/content/bomber-arena';

test.describe('Bomber Arena', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${bomberArenaGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: bomberArenaGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${bomberArenaGame.definition.slug}`);

    // The game enters the play state automatically. Look for 'BOMBER ARENA'
    const arenaText = page.getByText(/BOMBER ARENA/i).first();
    await expect(arenaText).toBeVisible({ timeout: 10000 });
  });
});
