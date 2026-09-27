import { expect, test } from '@playwright/test';
import { guessTheLieGame } from '@playdeck/game-data/src/content/guess-the-lie';

test.describe('Guess The Lie', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${guessTheLieGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: guessTheLieGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start an investigation', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${guessTheLieGame.definition.slug}`);

    // Click "Start Investigation"
    await page.getByRole('button', { name: /Start Investigation/i }).click();

    // Check for "Your Assignment" or "Classified Role"
    // Wait for the role briefing stage
    const assignmentText = page.getByText(/Your Assignment|Classified Role/i);
    await expect(assignmentText).toBeVisible({ timeout: 10000 });
  });
});
