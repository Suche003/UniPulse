// helpers/setup.js
import { request } from '@playwright/test';

export async function ensurePendingSponsorshipRequest() {
  // මෙම function එක API හරහා pending request එකක් සාදයි (අවශ්‍ය නම්)
  // නැතහොත් club-send-request test එක කලින් run කිරීමට උපදෙස් දෙන්න.
  console.log('Ensure a pending sponsorship request exists (run club-send-request first)');
}

export async function clearNotifications(page) {
  await page.evaluate(() => localStorage.clear());
}