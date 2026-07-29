import { defineConfig, devices } from '@playwright/test'
import process from 'node:process'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Use 2 workers per shard on CI to make use of multiple cores; keep serial locally */
  workers: process.env.CI ? 2 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  /* On CI: blob reports are merged into a single HTML report, github reporter adds inline annotations */
  reporter: process.env.CI ? [['blob'], ['github']] : 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.CI ? 'http://127.0.0.1:4173' : 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: process.env.CI
    ? [
        {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
            permissions: ['clipboard-read', 'clipboard-write'],
          },
        },

        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },

        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
      ]
    : [
        {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
            permissions: ['clipboard-read', 'clipboard-write'],
          },
        },
      ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? 'pnpm run serve' : 'pnpm run start --host',
    url: process.env.CI ? 'http://127.0.0.1:4173' : 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
