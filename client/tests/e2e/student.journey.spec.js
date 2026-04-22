import { test, expect } from '@playwright/test';

async function loginAsStudent(page) {
  await page.goto('/login');

  await page.getByPlaceholder('Enter username or email').fill('IT20202020');
  await page.getByPlaceholder('Enter password').fill('student');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/.*student\/dashboard/);
  await expect(page.getByRole('heading', { name: /Upcoming Events/i })).toBeVisible();
}

test.describe('Student User Journeys', () => {
  test('student can open free event details and click I Am Going', async ({ page }) => {
    await loginAsStudent(page);

    const freeEventCard = page
      .locator('.student-event-card')
      .filter({ has: page.getByRole('heading', { name: 'Test Free' }) })
      .first();

    await expect(freeEventCard).toBeVisible();

    const viewDetailsLink = freeEventCard.getByRole('link', { name: 'View Details' });
    await expect(viewDetailsLink).toBeVisible();
    await viewDetailsLink.click();

    await expect(page).toHaveURL(/.*student\/events\/.*/);
    await expect(page.getByRole('heading', { name: 'Test Free' })).toBeVisible();

    const alreadyGoingButton = page.getByRole('button', { name: /You're Going/i });
    const goingButton = page.getByRole('button', { name: 'I Am Going' });

    if (await goingButton.count()) {
      await goingButton.click();
    }

    await expect(alreadyGoingButton).toBeVisible();
  });

  test('student can complete paid event purchase flow', async ({ page }) => {
    await loginAsStudent(page);

    const paidEventCard = page
      .locator('.student-event-card')
      .filter({ has: page.getByRole('heading', { name: 'Concert' }) })
      .first();

    await expect(paidEventCard).toBeVisible();

    await paidEventCard.getByRole('link', { name: 'View Details' }).click();

    await expect(page).toHaveURL(/.*student\/events\/.*/);
    await expect(page.getByRole('heading', { name: 'Concert' })).toBeVisible();

    const purchasedButton = page.getByRole('button', { name: /Purchased/i });
    const continuePaymentButton = page.getByRole('button', { name: 'Continue Payment' });
    const purchaseTicketButton = page.getByRole('button', { name: 'Purchase Ticket' });

    if (await purchasedButton.count()) {
      await expect(purchasedButton).toBeVisible();
      return;
    }

    if (await continuePaymentButton.count()) {
      await continuePaymentButton.click();
    } else {
      await expect(purchaseTicketButton).toBeVisible();
      await purchaseTicketButton.click();

      await expect(page.locator('body')).toContainText(/Purchase Event Ticket/i);
      await expect(page.getByRole('button', { name: 'Proceed Payment' })).toBeVisible();
      await page.getByRole('button', { name: 'Proceed Payment' }).click();
    }

    await expect(page.locator('body')).toContainText(/Secure Ticket Payment/i);

await page.getByPlaceholder('1234 5678 9012 3456').fill('4242 4242 4242 4242');
await page.getByPlaceholder('MM/YY').fill('12/30');
await page.getByPlaceholder('123', { exact: true }).fill('123');
await page.getByPlaceholder('student@email.com').fill('student20@gmail.com');

    const payButton = page.getByRole('button', { name: /Pay Rs\./i });
    await expect(payButton).toBeVisible();
    await payButton.click();

    await expect(page).toHaveURL(/.*student\/dashboard/);
    await expect(page.locator('body')).toContainText(/Payment Purchased|Purchased/i);
  });
});