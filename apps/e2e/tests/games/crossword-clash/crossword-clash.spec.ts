import { expect, test } from '@playwright/test';
import { crosswordClashGame } from '@playdeck/game-data/src/content/crossword-clash';

test.describe('Crossword Clash', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${crosswordClashGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: crosswordClashGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${crosswordClashGame.definition.slug}`);

    // Click "Start Crossword Clash"
    await page.getByRole('button', { name: /Start Crossword Clash/i }).click();

    // The game enters the play state. Look for 'TIME' or a similar element in the HUD
    const timeText = page.getByText(/TIME/i).first();
    await expect(timeText).toBeVisible({ timeout: 10000 });
  });
});
