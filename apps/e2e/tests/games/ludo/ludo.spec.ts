import { expect, test } from '@playwright/test';
import { ludoGame } from '@playdeck/game-data/src/content/ludo';

test.describe('Ludo', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${ludoGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: ludoGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start an offline match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${ludoGame.definition.slug}`);

    // Click "Play Offline" card
    await page.getByText('Play Offline').click();

    // Click "Fill with Bots"
    await page.getByRole('button', { name: /Fill with Bots/i }).click();

    // Click "Start Game"
    await page.getByRole('button', { name: /Start Game/i }).click();

    // The game enters the play state. Check for "Roll Dice" button.
    const rollButton = page.getByRole('button', { name: /Roll Dice/i });
    await expect(rollButton).toBeVisible({ timeout: 10000 });
  });
});
