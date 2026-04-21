export async function loginAsClub(page, email = 'testclub@example.com', password = 'Club@123') {
  await page.goto('/login');
  await page.fill('input[placeholder*="username" i]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Login")');
  // Wait for any dashboard URL (club dashboard may have different path)
  await page.waitForURL(/\/club\/dashboard|\/dashboard/, { timeout: 15000 });
  // Wait for a known element on club dashboard
  await page.waitForSelector('.club-dashboard-page, .dashboard-hero', { timeout: 10000 });
}