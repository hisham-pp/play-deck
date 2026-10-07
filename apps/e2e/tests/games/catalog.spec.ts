import { expect, test } from '@playwright/test';
import { GAME_CONTENT } from '@playdeck/game-data/src/content';
import { GAME_DEFINITIONS } from '@playdeck/game-data/src/definitions';

test.describe('Game Catalog Integration Tests', () => {
  // Loop through all defined games dynamically
  for (const game of GAME_DEFINITIONS) {
    if (game.status === 'coming-soon' || game.status === 'maintenance') {
      // Skip testing if it's explicitly not available yet
      continue;
    }

    // Only test games that have actual content modules created for them
    const hasContent = Object.values(GAME_CONTENT).some((c: any) => c.id === game.id);
    if (!hasContent) {
      continue;
    }

    test.describe(`Game: ${game.name} (${game.slug})`, () => {
      test('overview page loads without error and displays title', async ({ page }) => {
        const response = await page.goto(`/games/${game.slug}`);
        expect(response?.status()).toBe(200);

        // Check if the game name is visible on the page (H1)
        await expect(page.getByRole('heading', { name: game.name })).toBeVisible();
      });

      test('play launcher loads without error', async ({ page }) => {
        const response = await page.goto(`/play/${game.slug}`);
        expect(response?.status()).toBe(200);

        // Check that there is a back button to exit
        await expect(page.locator('a[href="/games"]')).toBeVisible();
      });
    });
  }
});
