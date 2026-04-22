import { test, expect } from '@playwright/test';

async function login(page, username, password, expectedUrlPart) {
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email').fill(username);
  await page.getByPlaceholder('Enter password').fill(password);

  await Promise.all([
    page.waitForURL(new RegExp(expectedUrlPart)),
    page.getByRole('button', { name: /login/i }).click(),
  ]);

  await page.waitForLoadState('networkidle');
}

test('Sponsor login success', async ({ page }) => {
  await login(page, 'vimal@gmail.com', 'vimal1234A', 'sponsor');

  await expect(page).toHaveURL(/sponsor/i);
});

test('Sponsor dashboard tabs work', async ({ page }) => {
  await login(page, 'vimal@gmail.com', 'vimal1234A', 'sponsor');

  await expect(page.locator('body')).toContainText(/welcome back/i);

  await page.getByRole('button', { name: /payment history/i }).click();
  await expect(page.locator('body')).toContainText(/payment history|no payments recorded yet/i);

  await page.getByRole('button', { name: /company profile/i }).click();
  await expect(page.locator('body')).toContainText(/edit profile|organization name/i);

  await page.getByRole('button', { name: /sponsorship offerings/i }).click();
  await expect(page.locator('body')).toContainText(/offering|package|sponsorship/i);
});

test('Sponsor profile negative phone validation', async ({ page }) => {
  await login(page, 'vimal@gmail.com', 'vimal1234A', 'sponsor');

  await page.getByRole('button', { name: /company profile/i }).click();
  await page.getByRole('button', { name: /edit profile/i }).click();

  await page.getByPlaceholder('0712345678').fill('123');
  await page.getByRole('button', { name: /save changes/i }).click();

  await expect(page.locator('body')).toContainText(/10 digits|must be exactly 10 digits/i);
});

test('Sponsor profile positive update', async ({ page }) => {
  await login(page, 'vimal@gmail.com', 'vimal1234A', 'sponsor');

  await page.getByRole('button', { name: /company profile/i }).click();
  await page.getByRole('button', { name: /edit profile/i }).click();

  await page.getByPlaceholder('e.g., GreenFuture Innovations Ltd').fill('Tech Vision Lanka');
  await page.getByPlaceholder('0712345678').fill('0771234567');
  await page.getByPlaceholder('https://yourcompany.com').fill('https://techvision.lk');

  await page.getByRole('button', { name: /save changes/i }).click();

  await expect(page.locator('body')).toContainText(/successfully|updated|tech vision lanka/i);
});