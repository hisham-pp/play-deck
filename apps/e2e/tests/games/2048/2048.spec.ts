import { test, expect } from '@playwright/test';

test.describe('2048 Game', () => {
  test('should render the board and respond to keyboard controls', async ({ page }) => {
    await page.goto('/play/2048');

    // Wait for the game grid to render
    const board = page.getByRole('application', { name: /2048 puzzle grid/i });
    await expect(board).toBeVisible();

    // The game starts with exactly 2 tiles
    const tilesLocator = page.locator('.pointer-events-none > div > div.font-display');
    await expect(tilesLocator).toHaveCount(2);

    // Function to get total score or tile values sum to ensure state changes
    const getTilesValues = async () => {
      const texts = await tilesLocator.allInnerTexts();
      return texts.map(Number).sort((a, b) => a - b);
    };

    const initialValues = await getTilesValues();

    // Make some moves
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200); // Wait for animations
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    // After 4 moves, we should have more tiles or different values
    const newValues = await getTilesValues();

    // Total count of tiles should increase (usually 1 tile spawns per move if a move was valid)
    // Or if they merged, the max value might be higher. Either way, the sum of values will be strictly greater.
    const initialSum = initialValues.reduce((a, b) => a + b, 0);
    const newSum = newValues.reduce((a, b) => a + b, 0);

    expect(newSum).toBeGreaterThan(initialSum);
  });
});
