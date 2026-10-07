import { expect, test } from '@playwright/test';
import { pushYourLuckGame } from '@playdeck/game-data/src/content/push-your-luck';

test.describe('Push Your Luck', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${pushYourLuckGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: pushYourLuckGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${pushYourLuckGame.definition.slug}`);

    // The game enters the play state automatically. Look for 'Pass & play'
    const passPlayText = page.getByText(/Pass & play/i).first();
    await expect(passPlayText).toBeVisible({ timeout: 10000 });
  });
});
