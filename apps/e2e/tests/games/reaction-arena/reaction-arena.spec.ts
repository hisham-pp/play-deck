import { expect, test } from '@playwright/test';
import { reactionArenaGame } from '@playdeck/game-data/src/content/reaction-arena';

test.describe('Reaction Arena', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${reactionArenaGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: reactionArenaGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${reactionArenaGame.definition.slug}`);

    // Click "Enter the Arena"
    await page.getByRole('button', { name: /Enter the Arena/i, exact: true }).click();

    // The game enters the play state. Look for 'Round 1 of'
    const roundText = page.getByText(/Round 1 of/i).first();
    await expect(roundText).toBeVisible({ timeout: 10000 });
  });
});
