import { expect, test } from '@playwright/test';
import { auctionPanicGame } from '@playdeck/game-data/src/content/auction-panic';

test.describe('Auction Panic', () => {
  test('should load the overview page', async ({ page }) => {
    await page.goto(`/games/${auctionPanicGame.definition.slug}`);
    await expect(
      page.getByRole('heading', { name: auctionPanicGame.definition.name, exact: true }),
    ).toBeVisible();
  });

  test('should be able to start a match', async ({ page }) => {
    // Navigate to the game page
    await page.goto(`/play/${auctionPanicGame.definition.slug}`);

    // The game automatically adds 3 bots when opened in solo mode.

    // Click "Begin Auction"
    await page.getByRole('button', { name: /Begin Auction/i, exact: true }).click();

    // The game enters the play state. Look for 'Floor Bidders'
    const floorBiddersText = page.getByText(/Floor Bidders/i).first();
    await expect(floorBiddersText).toBeVisible({ timeout: 10000 });
  });
});
