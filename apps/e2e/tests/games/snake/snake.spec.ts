import { expect, test } from '@playwright/test';

test.describe('Snake Game', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Snake game
    await page.goto('/play/snake');
  });

  test('should load the game, open setup modal, and start a run', async ({ page }) => {
    // Wait for the setup modal to appear
    const startButton = page.getByRole('button', { name: /Enter Arena/i });
    await expect(startButton).toBeVisible();

    // Start the game
    await startButton.click();

    // Check if the pause action is now available in the actions card, which indicates game is playing
    const pauseButton = page.getByRole('button', { name: /Pause/i });
    await expect(pauseButton).toBeVisible();

    // Press space to pause
    await page.keyboard.press('Space');

    // Wait for resume button to appear
    const resumeButton = page.getByRole('button', { name: 'Resume (Space)' });
    await expect(resumeButton).toBeVisible();

    // Verify scoreboard appears (Score should be 0 initially)
    await expect(page.getByText(/Score/i).first()).toBeVisible();
  });
});
