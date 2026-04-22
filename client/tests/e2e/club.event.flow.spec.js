import { test, expect } from '@playwright/test';

async function login(page, username, password, expectedUrlPart) {
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email').fill(username);
  await page.getByPlaceholder('Enter password').fill(password);
  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL(new RegExp(expectedUrlPart));
  await page.waitForLoadState('networkidle');
}

test('Club login success', async ({ page }) => {
  await login(page, 'umesha@gmail.com', '123Umesha', 'club');

  await expect(page).toHaveURL(/club/);
});

test('Fail when title is empty', async ({ page }) => {
  await login(page, 'umesha@gmail.com', '123Umesha', 'club');

  await page.goto('http://localhost:5173/club/clubrequest');
  await page.waitForLoadState('networkidle');

  await page.locator('input[name="location"]').fill('Colombo');
  await page.locator('input[name="date"]').fill('2026-12-31T12:00');

  await page.getByRole('button', { name: /submit|create|request/i }).click();

  await expect(page.locator('body')).toContainText(/required|title/i);
});

test('Invalid title format', async ({ page }) => {
  await login(page, 'umesha@gmail.com', '123Umesha', 'club');

  await page.goto('http://localhost:5173/club/clubrequest');
  await page.waitForLoadState('networkidle');

  await page.locator('input[name="title"]').fill('HI..#');
  await page.locator('textarea[name="description"]').fill('IT event');
  await page.locator('input[name="location"]').fill('Colombo');
  await page.locator('input[name="date"]').fill('2026-12-31T12:00');

  await page.getByRole('button', { name: /submit|create|request/i }).click();

  await expect(page.locator('body')).toContainText(/title|invalid|required/i);
});

test('Reject past date event', async ({ page }) => {
  await login(page, 'umesha@gmail.com', '123Umesha', 'club');

  await page.goto('http://localhost:5173/club/clubrequest');
  await page.waitForLoadState('networkidle');

  await page.locator('input[name="title"]').fill('Test Event');
  await page.locator('textarea[name="description"]').fill('IT event');
  await page.locator('input[name="location"]').fill('Colombo');
  await page.locator('input[name="date"]').fill('2020-01-01T12:00');

  await page.getByRole('button', { name: /submit|create|request/i }).click();

  await expect(page).toHaveURL(/club\/clubrequest/);
  await expect(page.getByRole('heading', { name: /Create New Event/i })).toBeVisible();
});

test('PDF required validation', async ({ page }) => {
  await login(page, 'umesha@gmail.com', '123Umesha', 'club');

  await page.goto('http://localhost:5173/club/clubrequest');
  await page.waitForLoadState('networkidle');

  await page.locator('input[name="title"]').fill('Test Event');
  await page.locator('textarea[name="description"]').fill('IT event');
  await page.locator('input[name="location"]').fill('Colombo');
  await page.locator('input[name="date"]').fill('2026-12-31T12:00');

  await page.getByRole('button', { name: /submit|create|request/i }).click();

  await expect(page.locator('body')).toContainText(/pdf|required/i);
});

test('Description is required', async ({ page }) => {
  await login(page, 'umesha@gmail.com', '123Umesha', 'club');

  await page.goto('http://localhost:5173/club/clubrequest');
  await page.waitForLoadState('networkidle');

  await page.locator('input[name="title"]').fill('Image Test');
  await page.locator('input[name="location"]').fill('Colombo');
  await page.locator('input[name="date"]').fill('2026-12-31T12:00');

  await page.getByRole('button', { name: /submit|create|request/i }).click();

  await expect(page.locator('body')).toContainText(/description|required/i);
});

test('Approve event', async ({ page }) => {
  await login(page, 'superadmin', 'SuperAdmin123', 'superadmin');

  await page.goto('http://localhost:5173/superadmin/pendingevents');
  await page.waitForLoadState('networkidle');

  await page.getByText('View').first().click();
  await page.getByText('Approve').first().click();

  await expect(page.locator('body')).toContainText(/approved/i);
});

test('Reject event with reason', async ({ page }) => {
  await login(page, 'superadmin', 'SuperAdmin123', 'superadmin');

  await page.goto('http://localhost:5173/superadmin/pendingevents');
  await page.waitForLoadState('networkidle');

  await page.getByText('View').first().click();
  await page.getByText('Reject').first().click();

  await page.locator('textarea').fill('Event not suitable for university policy');
  await page.getByText(/submit/i).click();

  await expect(page.locator('body')).toContainText(/rejected/i);
});