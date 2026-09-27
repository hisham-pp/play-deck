import { expect, test } from '@playwright/test';
import { unstableElevatorGame } from '@playdeck/game-data/src/content/unstable-elevator';

test.describe('Unstable Elevator', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${unstableElevatorGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: unstableElevatorGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    await page.goto(`/play/${unstableElevatorGame.definition.slug}`);

    // Click "Play Offline" card
    await page.getByText('Play Offline').first().click();

    // Click "Start the run" button
    await page.getByRole('button', { name: /Start the run/i }).click();

    // Verify the game started by checking if the "Start the run" button goes away
    const startBtn = page.getByRole('button', { name: /Start the run/i });
    await expect(startBtn).not.toBeVisible();
  });
});
