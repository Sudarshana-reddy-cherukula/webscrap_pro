import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/api',
  timeout: 15000,
  retries: 0,
  use: {
    baseURL: process.env.API_URL || 'http://localhost:5000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'api', use: { browserName: 'chromium' } },
  ],
});
