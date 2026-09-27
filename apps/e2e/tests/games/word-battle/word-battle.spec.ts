import { expect, test } from '@playwright/test';
import { wordBattleGame } from '@playdeck/game-data/src/content/word-battle';

test.describe('Word Battle', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${wordBattleGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: wordBattleGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${wordBattleGame.definition.slug}`);

    // Click "Start Battle"
    await page.getByRole('button', { name: /Start Battle/i }).click();

    // The game enters the play state. Check for round info or similar elements.
    const roundText = page.getByText(/Round 1 \//i);
    await expect(roundText).toBeVisible({ timeout: 10000 });
  });
});
