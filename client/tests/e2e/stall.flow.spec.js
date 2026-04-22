import { test, expect } from '@playwright/test';

async function login(page, username, password, expectedUrlPart) {
  await page.goto('http://localhost:5173/login');

  await page.getByPlaceholder('Enter username or email').fill(username);
  await page.getByPlaceholder('Enter password').fill(password);

  await Promise.all([
    page.waitForURL(new RegExp(expectedUrlPart)),
    page.getByRole('button', { name: 'Login' }).click(),
  ]);

  await page.waitForLoadState('networkidle');
}

async function logoutIfVisible(page) {
  const logoutBtn = page.getByRole('button', { name: /logout/i });
  if (await logoutBtn.count()) {
    await logoutBtn.click();
    await page.waitForLoadState('networkidle');
  }
}

test('UniPulse stall payment success flow (mocked success)', async ({ page }) => {
  // Mock only the final payment API
  await page.route('http://localhost:5000/api/stall-payment/pay', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Payment successful',
      }),
    });
  });

  // 1. Club login
  await login(page, 'fob@gmail.com', 'fOb23456', 'club');

  // 2. Add stall
  await page.goto('http://localhost:5173/stalls/Evt060/add');
  await page.waitForLoadState('networkidle');

  await page.getByPlaceholder('Enter Stall ID').fill('E002');
  await page.locator('select').selectOption('Games');
  await page.getByPlaceholder('Enter Price').fill('6000');
  await page.getByPlaceholder('Enter Location').fill('Car Park');
  await page.getByPlaceholder('Enter Available Stalls').fill('4');
  await page.getByPlaceholder('Enter Image URL').fill('https://i.postimg.cc/test.jpg');
  await page.locator('textarea').fill('Test stall');

  await page.getByRole('button', { name: /create/i }).click();
  await page.waitForLoadState('networkidle');

  // 3. Club logout
  await logoutIfVisible(page);

  // 4. Vendor login
  await login(page, 'pands@gmail.com', 'Ps345678', 'vendor');

  // 5. Book stall
  await page.goto('http://localhost:5173/vendor-stalls');
  await page.waitForLoadState('networkidle');

  const bookNowBtn = page.getByRole('button', { name: /book now/i }).first();
  await expect(bookNowBtn).toBeVisible();

  await Promise.all([
    page.waitForURL(/booking-stalls\/Evt/i),
    bookNowBtn.click(),
  ]);

  await page.locator('input[name="phone"]').fill('0774532567');
  await page.locator('input[name="type"]').fill('Savouries and Sweets');

  const confirmBtn = page.getByRole('button', { name: /confirm booking/i });
  await expect(confirmBtn).toBeEnabled();
  await confirmBtn.click();

  await page.waitForLoadState('networkidle');

  // 6. Vendor logout
  await logoutIfVisible(page);

  // 7. Club login again
  await login(page, 'fob@gmail.com', 'fOb23456', 'club');

  // 8. Approve stall request
  await page.goto('http://localhost:5173/club/stall-requests');
  await page.waitForLoadState('networkidle');

  const approveBtn = page.locator('button.approve').first();
  await expect(approveBtn).toBeVisible({ timeout: 15000 });
  await approveBtn.click();

  await expect(page.locator('body')).toContainText(/approved/i);

  // 9. Club logout
  await logoutIfVisible(page);

  // 10. Vendor login again
  await login(page, 'pands@gmail.com', 'Ps345678', 'vendor');

  // 11. Open approved stalls
  await page.goto('http://localhost:5173/approved-stalls');
  await page.waitForLoadState('networkidle');

  const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
  await expect(payNowBtn).toBeVisible();

  await Promise.all([
    page.waitForURL(/stall-payment/i),
    payNowBtn.click(),
  ]);

  // 12. Payment page
  await expect(page.getByText(/stall payment/i)).toBeVisible();

  // Use demo autofill
  await page.getByRole('button', { name: /demo/i }).click();

  await expect(page.getByLabel(/card holder name\*/i)).toHaveValue('Pasindu Maleesha');
  await expect(page.getByLabel(/card number\*/i)).toHaveValue('1234567890123456');
  await expect(page.getByLabel(/expiry date\*/i)).toHaveValue('12/28');
  await expect(page.getByLabel(/cvv\*/i)).toHaveValue('342');

  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.getByRole('button', { name: /^pay$/i }).click();

  await expect(page).toHaveURL(/approved-stalls/i);
});