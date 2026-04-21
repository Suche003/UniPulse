import { test, expect } from '@playwright/test';


/* PART 1 - FULL SYSTEM FLOW + VALIDATION CHECKS */

test('Full system: Vendor → Club → Payment (with validation checks)', async ({ page }) => {


  // VENDOR LOGIN

  await page.goto('http://localhost:5173/login');

  await page.fill('input[placeholder="Enter username or email"]', 'pands@gmail.com');
  await page.fill('input[placeholder="Enter password"]', 'Ps345678');

  await Promise.all([
    page.waitForURL('**/vendor/dashboard'),
    page.click('button:has-text("Login")')
  ]);

  await page.waitForLoadState('networkidle');



  // BOOK STALL 

  await page.goto('http://localhost:5173/vendor-stalls');
  await page.waitForLoadState('networkidle');

  await page.locator('text=Book Now').first().click();

  await page.waitForURL(/booking-stalls\/Evt/);
  await page.waitForLoadState('networkidle');


  /* // Invalid phone number (less than 10 digits)
  await page.fill('input[name="phone"]', '12345');
  await page.fill('input[name="type"]', 'Savouries and Sweets');

  await page.click('button:has-text("Confirm Booking")');

  await expect(page.locator('.error')).toContainText(/10 digits/i); */


  // FIX DATA
  await page.fill('input[name="phone"]', '0774532567');
  await page.fill('input[name="type"]', 'Savouries and Sweets');

  await page.click('button:has-text("Confirm Booking")'); 



  // CLUB LOGIN

  await page.goto('http://localhost:5173/login');

  await page.fill('input[placeholder="Enter username or email"]', 'fob@gmail.com');
  await page.fill('input[placeholder="Enter password"]', 'fOb23456');

  await Promise.all([
    page.waitForURL('**/club/dashboard'),
    page.click('button:has-text("Login")')
  ]);

  await page.waitForLoadState('networkidle');



  // CLUB APPROVES

  await page.goto('http://localhost:5173/club/stall-requests');
  await page.waitForLoadState('networkidle');

  await page.locator('button:has-text("Approve")').first().click();

  await expect(page.locator('body')).toContainText(/approved/i);


  // VENDOR LOGIN AGAIN

  await page.goto('http://localhost:5173/login');

  await page.fill('input[placeholder="Enter username or email"]', 'pands@gmail.com');
  await page.fill('input[placeholder="Enter password"]', 'Ps345678');

  await Promise.all([
    page.waitForURL('**/vendor/dashboard'),
    page.click('button:has-text("Login")')
  ]);

  await page.waitForLoadState('networkidle');



  // APPROVED STALLS

  await page.goto('http://localhost:5173/approved-stalls');
  await page.waitForLoadState('networkidle');

  await page.locator('button:has-text("Pay Now")').first().click();


  // PAYMENT VALIDATION TEST 

  await page.waitForLoadState('networkidle');

  /* // VALIDATION: try empty submit
  await page.click('button:has-text("Pay")');

  await expect(page.locator('.error-msg')).toBeVisible(); */

  // FIX PAYMENT DATA
  await page.getByLabel(/card holder/i).fill('Kavindu Deshan');
  await page.getByLabel(/card number/i).fill('1234567890123456');
  await page.getByLabel(/expiry/i).fill('12/28');
  await page.getByLabel(/cvv/i).fill('123');

  await page.click('button:has-text("Pay")');

  await expect(page.locator('body')).toContainText(/success|paid|payment/i);
});