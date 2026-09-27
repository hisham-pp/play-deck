import { expect, test } from '@playwright/test';
import { floorIsLavaGame } from '@playdeck/game-data/src/content/floor-is-lava';

test.describe('Floor Is Lava', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${floorIsLavaGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: floorIsLavaGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${floorIsLavaGame.definition.slug}`);

    // Click "Launch Battle (4 Players)"
    await page.getByRole('button', { name: /Launch Battle/i, exact: true }).click();

    // The game enters the play state. Look for 'Survivors:'
    const survivorsText = page.getByText(/Survivors:/i).first();
    await expect(survivorsText).toBeVisible({ timeout: 10000 });
  });
});
