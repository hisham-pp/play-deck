import { expect, test } from '@playwright/test';
import { reverseRacingGame } from '@playdeck/game-data/src/content/reverse-racing';

test.describe('Reverse Racing', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${reverseRacingGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: reverseRacingGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${reverseRacingGame.definition.slug}`);

    // Click "Start Solo Grand Prix"
    await page.getByRole('button', { name: /Start Solo Grand Prix/i, exact: true }).click();

    // The game enters the play state. Look for 'Distance'
    const distanceText = page.getByText('Distance', { exact: true }).first();
    await expect(distanceText).toBeVisible({ timeout: 10000 });
  });
});
