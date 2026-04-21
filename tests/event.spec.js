import { test, expect } from '@playwright/test';
import path from 'path';

const pdfPath = path.resolve(__dirname, 'files/diyana.pdf');
const imgPath = path.resolve(__dirname, 'files/download.jpg');

test('Club login success', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email')
    .fill('umesha@gmail.com');

  await page.getByPlaceholder('Enter password')
    .fill('123Umesha');

  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('**/club/**');

  await expect(page).toHaveURL(/club/);
});

test('Create event successfully', async ({ page }) => {

  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email')
    .fill('umesha@gmail.com');

  await page.getByPlaceholder('Enter password')
    .fill('123Umesha');

  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('**/club/**');

  await page.goto('http://localhost:5173/club/clubrequest');

  await page.locator('input[name="title"]').fill('Tech Talk 2026');
  await page.locator('textarea[name="description"]').fill('IT event');
  await page.locator('input[name="location"]').fill('Colombo');
  await page.locator('input[name="date"]').fill('2026-12-31T12:00');

  await page.setInputFiles('input[name="pdf"]',pdfPath);
  await page.setInputFiles('input[name="image"]', imgPath);

  await page.getByRole('button', { name: /submit|create|request/i }).click();

  await expect(page.locator('text=success')).toBeVisible();
});

test('Fail when title is empty', async ({ page }) => {

  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email')
    .fill('umesha@gmail.com');

  await page.getByPlaceholder('Enter password')
    .fill('123Umesha');

  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('**/club/**'); 

  await page.goto('http://localhost:5173/club/clubrequest');

  await page.locator('input[name="title"]').fill('');
  await page.locator('input[name="location"]').fill('Colombo');
  await page.locator('input[name="date"]').fill('2026-12-31T12:00');

  await page.setInputFiles('input[name="pdf"]', pdfPath);

  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page.locator('text=required')).toBeVisible();
});

test('Invalid title format', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email')
    .fill('umesha@gmail.com');

  await page.getByPlaceholder('Enter password')
    .fill('123Umesha');

  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('**/club/**');

  await page.goto('http://localhost:5173/club/clubrequest');

  await page.locator('input[name="title"]').fill('HI..#');
  await page.locator('textarea[name="description"]').fill('IT event');
  await page.locator('input[name="location"]').fill('Colombo');
  await page.locator('input[name="date"]').fill('2026-12-31T12:00');

  await page.setInputFiles('input[name="pdf"]', pdfPath);

  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page.locator('text=Title')).toBeVisible();
});

test('Reject past date event', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email')
    .fill('umesha@gmail.com');

  await page.getByPlaceholder('Enter password')
    .fill('123Umesha');

  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('**/club/**');

  await page.goto('http://localhost:5173/club/clubrequest');

  await page.locator('input[name="title"]').fill('Test Event');
  await page.locator('textarea[name="description"]').fill('IT event');
  await page.locator('input[name="location"]').fill('Colombo');
  await page.locator('input[name="date"]').fill('2020-01-01T12:00');

  await page.setInputFiles('input[name="pdf"]', pdfPath);

  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page.locator('text=future')).toBeVisible();
});

test('PDF required validation', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email')
    .fill('umesha@gmail.com');

  await page.getByPlaceholder('Enter password')
    .fill('123Umesha');

  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('**/club/**');

  await page.goto('http://localhost:5173/club/clubrequest');

  await page.locator('input[name="title"]').fill('Test Event');
  await page.locator('textarea[name="description"]').fill('IT event');
  await page.locator('input[name="location"]').fill('Colombo');
  await page.locator('input[name="date"]').fill('2026-12-31T12:00');

  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page.locator('text=PDF')).toBeVisible();
});

test('Create paid event', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email')
    .fill('umesha@gmail.com');

  await page.getByPlaceholder('Enter password')
    .fill('123Umesha');

  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('**/club/**');


  await page.goto('http://localhost:5173/club/clubrequest');

  await page.locator('input[name="title"]').fill('Concert');
  await page.locator('textarea[name="description"]').fill('IT event');
  await page.locator('input[name="location"]').fill('Ground');
  await page.locator('input[name="date"]').fill('2026-12-31T12:00');

  await page.check('input[name="ispaid"]');
  await page.locator('input[name="ticketPrice"]').fill('500');

  await page.setInputFiles('input[name="pdf"]', pdfPath);

  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page.locator('text=success')).toBeVisible();
});

test('Image upload test', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email')
    .fill('umesha@gmail.com');

  await page.getByPlaceholder('Enter password')
    .fill('123Umesha');

  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('**/club/**');


  await page.goto('http://localhost:5173/club/clubrequest');

  await page.locator('input[name="title"]').fill('Image Test');
  await page.locator('textarea[name="description"]').fill('IT event');
  await page.locator('input[name="location"]').fill('Colombo');
  await page.locator('input[name="date"]').fill('2026-12-31T12:00');

  await page.setInputFiles('input[name="image"]', pdfPath);
  await page.setInputFiles('input[name="pdf"]', imgPath);

  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page.locator('text=success')).toBeVisible();
});

test('Description is required', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email')
    .fill('umesha@gmail.com');

  await page.getByPlaceholder('Enter password')
    .fill('123Umesha');

  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('**/club/**');


  await page.goto('http://localhost:5173/club/clubrequest');

  await page.locator('input[name="title"]').fill('Image Test');
  await page.locator('input[name="location"]').fill('Colombo');
  await page.locator('input[name="date"]').fill('2026-12-31T12:00');

  await page.setInputFiles('input[name="image"]', pdfPath);
  await page.setInputFiles('input[name="pdf"]', imgPath);

  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page.locator('text=success')).toBeVisible();
});


test('Approve event', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email')
    .fill('superadmin');

  await page.getByPlaceholder('Enter password')
    .fill('SuperAdmin123');

  await page.getByRole('button', { name: /login/i }).click();

  await expect(page).toHaveURL(/superadmin/);

  await page.goto('http://localhost:5173/superadmin/pendingevents');

  await page.click('text=View');
  await page.click('text=Approve');

  await expect(page.locator('text=approved')).toBeVisible();
});

test('Reject event with reason', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email')
    .fill('superadmin');

  await page.getByPlaceholder('Enter password')
    .fill('SuperAdmin123');

  await page.getByRole('button', { name: /login/i }).click();

  await expect(page).toHaveURL(/superadmin/);

  await page.goto('http://localhost:5173/superadmin/pendingevents');

  await page.click('text=View');

  await page.click('text=Reject');

  // 👉 ENTER REASON (IMPORTANT PART)
  await page.fill('textarea', 'Event not suitable for university policy');

  // OR if input has placeholder:
  // await page.getByPlaceholder('Enter reason').fill('Not suitable');

  await page.click('text=submit');

  await expect(page.locator('text=rejected')).toBeVisible();
});

test('Update event successfully', async ({ page }) => {
  // login
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email')
    .fill('umesha@gmail.com');

  await page.getByPlaceholder('Enter password')
    .fill('123Umesha');

  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('**/club/**');

  // go to events list
  await page.goto('http://localhost:5173/club/dashboard');

  // click edit (AUTO GET ID)
  await page.getByRole('button', { name: /Update Event/i }).first().click();

  await page.waitForURL('**/events/update/**');

  // update fields
  await page.locator('input[name="title"]').fill('Updated Event');
  await page.locator('textarea[name="description"]').fill('Updated desc');
  await page.locator('input[name="location"]').fill('Colombo');

  // submit
  await page.getByRole('button', { name: /update/i }).click();

  // success check
  await expect(page.locator('text=success|updated')).toBeVisible();
});