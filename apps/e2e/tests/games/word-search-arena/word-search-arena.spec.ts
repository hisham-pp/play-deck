import { expect, test } from '@playwright/test';
import { wordSearchArenaGame } from '@playdeck/game-data/src/content/word-search-arena';

test.describe('Word Search Arena', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${wordSearchArenaGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: wordSearchArenaGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${wordSearchArenaGame.definition.slug}`);

    // Click "Start Searching"
    await page.getByRole('button', { name: /Start Searching/i }).click();

    // The game enters the play state. Look for grid or similar playing text
    // The player scoreboard renders PlayerScoreBoard, the WordList renders 'Find them all!'
    const wordsToFindText = page.getByText(/Find them all!/i).first();
    await expect(wordsToFindText).toBeVisible({ timeout: 10000 });
  });
});
