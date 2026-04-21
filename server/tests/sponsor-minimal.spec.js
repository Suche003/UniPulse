import { test, expect } from '@playwright/test';

test('Sponsor dashboard loads successfully', async ({ page }) => {
  // Go to login page
  await page.goto('/login');
  
  // Fill credentials (use an existing approved sponsor account)
  await page.fill('input[placeholder*="username" i]', 'asd@gmail.com');
  await page.fill('input[type="password"]', 'asd12345A');
  await page.click('button:has-text("Login")');
  
  // Wait for dashboard to load
  await page.waitForURL('/sponsor/dashboard', { timeout: 15000 });
  await page.waitForSelector('.dashboard-hero', { timeout: 10000 });
  
  // Verify welcome message
  await expect(page.locator('.dashboard-hero h1')).toContainText('Welcome back');
  
  // Verify stats cards exist
  await expect(page.locator('.stat-card')).toHaveCount(4);
  
  // Take a screenshot for proof
  await page.screenshot({ path: 'test-results/sponsor-dashboard.png', fullPage: true });
});