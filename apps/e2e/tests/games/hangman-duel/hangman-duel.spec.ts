import { expect, test } from '@playwright/test';
import { hangmanDuelGame } from '@playdeck/game-data/src/content/hangman-duel';

test.describe('Hangman Duel', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${hangmanDuelGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: hangmanDuelGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${hangmanDuelGame.definition.slug}`);

    // The game enters the play state automatically. Look for 'GUESS THE SECRET PHRASE'
    const guessText = page.getByText(/GUESS THE SECRET PHRASE/i).first();
    await expect(guessText).toBeVisible({ timeout: 10000 });
  });
});
