import { expect, test } from '@playwright/test';
import { spellingBeeGame } from '@playdeck/game-data/src/content/spelling-bee';

test.describe('Spelling Bee', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${spellingBeeGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: spellingBeeGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a solo game', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${spellingBeeGame.definition.slug}`);

    // Click "Start Playing"
    await page.getByRole('button', { name: /Start Playing/i }).click();

    // The game enters the play state. Check for the center hexagon or outer hexagons.
    // In SpellingBeePlayingView, it has a submit button 'Enter' and 'Shuffle' and 'Delete'
    const enterButton = page.getByRole('button', { name: 'Enter', exact: true });
    await expect(enterButton).toBeVisible({ timeout: 10000 });
  });
});
