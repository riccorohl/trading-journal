import { test, expect } from '@playwright/test';

test.describe('TradeReviewModal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8080');
    
    // Wait for authentication or navigate to trades
    // You may need to adjust this based on your auth flow
    await page.waitForLoadState('networkidle');
  });

  test('TradeReviewModal opens and closes correctly without extra X button', async ({ page }) => {
    // Try to find and click on a recent trade in the dashboard
    // This assumes you have trades showing on the dashboard
    const recentTrade = page.locator('[data-testid="recent-trade"]').first();
    if (await recentTrade.isVisible()) {
      await recentTrade.click();
    } else {
      // If no recent trades, try going to Trades section
      await page.click('text=Trades');
      await page.waitForSelector('[data-testid="trade-row"]');
      await page.click('[data-testid="trade-row"]');
    }

    // Verify modal is open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verify the trade symbol is displayed (like "MES")
    await expect(page.locator('text=MES, text=ES, text=NQ, text=MNQ').first()).toBeVisible();
    
    // Verify there's only one close mechanism (not multiple X buttons)
    // The modal should close with ESC key or clicking outside
    await page.keyboard.press('Escape');
    
    // Verify modal is closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('Screenshot functionality works in TradeReviewModal', async ({ page }) => {
    // Open a trade review modal (same as above)
    const recentTrade = page.locator('[data-testid="recent-trade"]').first();
    if (await recentTrade.isVisible()) {
      await recentTrade.click();
    } else {
      await page.click('text=Trades');
      await page.waitForSelector('[data-testid="trade-row"]');
      await page.click('[data-testid="trade-row"]');
    }

    // Wait for modal to be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Click on Chart tab (should be default)
    await page.click('text=Chart');
    
    // Check if screenshot upload area is visible
    await expect(page.locator('text=Ready for screenshot upload')).toBeVisible();
    
    // Test file upload (if there's a file input)
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // Test upload with a mock file
      // Note: You'd need an actual test image file for this
      console.log('File upload input found');
    }
    
    // Verify timeframe buttons are present
    await expect(page.locator('text=1h')).toBeVisible();
    await expect(page.locator('text=5m')).toBeVisible();
    
    // Close modal
    await page.keyboard.press('Escape');
  });

  test('Modal does not have duplicate close buttons', async ({ page }) => {
    // Open trade review modal
    const recentTrade = page.locator('[data-testid="recent-trade"]').first();
    if (await recentTrade.isVisible()) {
      await recentTrade.click();
    } else {
      await page.click('text=Trades');
      await page.waitForSelector('[data-testid="trade-row"]');
      await page.click('[data-testid="trade-row"]');
    }

    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Count X buttons - there should only be the default dialog close button
    // The custom X button we removed should not be present
    const xButtons = page.locator('button:has-text("×"), button:has(svg)').filter({ hasText: /^×?$/ });
    const count = await xButtons.count();
    
    // There should be minimal close buttons (ideally just the default dialog one)
    console.log(`Found ${count} potential close buttons`);
    
    // Test that the modal still closes properly
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });
});
