import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './client/tests',

  reporter: [['html', { open: 'never' }]],

  outputDir: 'test-results',

  use: {
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  }
});