import { expect, test } from '@playwright/test';
import { chessGame } from '@playdeck/game-data/src/content/master-chess';

test.describe('Master Chess', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${chessGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: chessGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${chessGame.definition.slug}`);

    // Click "Start match" on the setup modal
    await page.getByRole('button', { name: /Start match/i }).click();

    // The game enters the play state. Check for an element on the screen.
    // E.g. the "Undo" or "Resign" buttons.
    const resignButton = page.getByRole('button', { name: /Resign/i });
    await expect(resignButton).toBeVisible({ timeout: 10000 });
  });
});
