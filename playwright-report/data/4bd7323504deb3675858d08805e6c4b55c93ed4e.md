# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stallFlow.spec.js >> Full system: Vendor → Club → Payment (with validation checks)
- Location: client\tests\stallFlow.spec.js:6:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Confirm Booking")')
    - locator resolved to <button disabled type="submit">Confirm Booking</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    46 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Book Stall" [level=1] [ref=e4]
  - generic [ref=e5]:
    - generic [ref=e6]:
      - text: Event Name
      - textbox "Event Name" [disabled] [ref=e7]: Euphoria
    - generic [ref=e8]:
      - text: Stall Category
      - textbox "Stall Category" [disabled] [ref=e9]: Food
    - generic [ref=e10]:
      - text: Email
      - textbox "Email" [disabled] [ref=e11]: pands@gmail.com
    - generic [ref=e12]:
      - textbox [ref=e13]:
        - /placeholder: " "
        - text: "12345"
      - generic: Phone Number*
      - text: Phone must be exactly 10 digits
    - generic [ref=e14]:
      - textbox [active] [ref=e15]:
        - /placeholder: " "
        - text: Savouries and Sweets
      - generic: Stall Type*
    - button "Confirm Booking" [disabled] [ref=e16]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | 
  4   | /* PART 1 - FULL SYSTEM FLOW + VALIDATION CHECKS */
  5   | 
  6   | test('Full system: Vendor → Club → Payment (with validation checks)', async ({ page }) => {
  7   | 
  8   | 
  9   |   // VENDOR LOGIN
  10  | 
  11  |   await page.goto('http://localhost:5173/login');
  12  | 
  13  |   await page.fill('input[placeholder="Enter username or email"]', 'pands@gmail.com');
  14  |   await page.fill('input[placeholder="Enter password"]', 'Ps345678');
  15  | 
  16  |   await Promise.all([
  17  |     page.waitForURL('**/vendor/dashboard'),
  18  |     page.click('button:has-text("Login")')
  19  |   ]);
  20  | 
  21  |   await page.waitForLoadState('networkidle');
  22  | 
  23  | 
  24  | 
  25  |   // BOOK STALL 
  26  | 
  27  |   await page.goto('http://localhost:5173/vendor-stalls');
  28  |   await page.waitForLoadState('networkidle');
  29  | 
  30  |   await page.locator('text=Book Now').first().click();
  31  | 
  32  |   await page.waitForURL(/booking-stalls\/Evt/);
  33  |   await page.waitForLoadState('networkidle');
  34  | 
  35  | 
  36  |   // Invalid phone number (less than 10 digits)
  37  |   await page.fill('input[name="phone"]', '12345');
  38  |   await page.fill('input[name="type"]', 'Savouries and Sweets');
  39  | 
> 40  |   await page.click('button:has-text("Confirm Booking")');
      |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  41  | 
  42  |   await expect(page.locator('.error')).toContainText(/10 digits/i); 
  43  | 
  44  | 
  45  |   // FIX DATA
  46  |   await page.fill('input[name="phone"]', '0774532567');
  47  |   await page.fill('input[name="type"]', 'Savouries and Sweets');
  48  | 
  49  |   await page.click('button:has-text("Confirm Booking")'); 
  50  | 
  51  | 
  52  | 
  53  |   // CLUB LOGIN
  54  | 
  55  |   await page.goto('http://localhost:5173/login');
  56  | 
  57  |   await page.fill('input[placeholder="Enter username or email"]', 'fob@gmail.com');
  58  |   await page.fill('input[placeholder="Enter password"]', 'fOb23456');
  59  | 
  60  |   await Promise.all([
  61  |     page.waitForURL('**/club/dashboard'),
  62  |     page.click('button:has-text("Login")')
  63  |   ]);
  64  | 
  65  |   await page.waitForLoadState('networkidle');
  66  | 
  67  | 
  68  | 
  69  |   // CLUB APPROVES
  70  | 
  71  |   await page.goto('http://localhost:5173/club/stall-requests');
  72  |   await page.waitForLoadState('networkidle');
  73  | 
  74  |   await page.locator('button:has-text("Approve")').first().click();
  75  | 
  76  |   await expect(page.locator('body')).toContainText(/approved/i);
  77  | 
  78  | 
  79  |   // VENDOR LOGIN AGAIN
  80  | 
  81  |   await page.goto('http://localhost:5173/login');
  82  | 
  83  |   await page.fill('input[placeholder="Enter username or email"]', 'pands@gmail.com');
  84  |   await page.fill('input[placeholder="Enter password"]', 'Ps345678');
  85  | 
  86  |   await Promise.all([
  87  |     page.waitForURL('**/vendor/dashboard'),
  88  |     page.click('button:has-text("Login")')
  89  |   ]);
  90  | 
  91  |   await page.waitForLoadState('networkidle');
  92  | 
  93  | 
  94  | 
  95  |   // APPROVED STALLS
  96  | 
  97  |   await page.goto('http://localhost:5173/approved-stalls');
  98  |   await page.waitForLoadState('networkidle');
  99  | 
  100 |   await page.locator('button:has-text("Pay Now")').first().click();
  101 | 
  102 | 
  103 |   // PAYMENT VALIDATION TEST 
  104 | 
  105 |   await page.waitForLoadState('networkidle');
  106 | 
  107 |   /* // VALIDATION: try empty submit
  108 |   await page.click('button:has-text("Pay")');
  109 | 
  110 |   await expect(page.locator('.error-msg')).toBeVisible(); */
  111 | 
  112 |   // FIX PAYMENT DATA
  113 |   await page.getByLabel(/card holder/i).fill('Kavindu Deshan');
  114 |   await page.getByLabel(/card number/i).fill('1234567890123456');
  115 |   await page.getByLabel(/expiry/i).fill('12/28');
  116 |   await page.getByLabel(/cvv/i).fill('123');
  117 | 
  118 |   await page.click('button:has-text("Pay")');
  119 | 
  120 |   await expect(page.locator('body')).toContainText(/success|paid|payment/i);
  121 | });
```