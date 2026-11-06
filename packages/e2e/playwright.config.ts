import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const API_URL = (process.env.E2E_API_URL || 'http://localhost:7777/api').replace(
  /\/$/,
  '',
);

const port = (url: string) => new URL(url).port || '80';

/**
 * In CI, Playwright starts the backend and the frontend itself, both pointed at
 * the throwaway database the workflow prepared. Locally the three processes are
 * started by hand (see README), so nothing is launched here.
 *
 * The frontend runs `next dev` rather than a production build: `next build`
 * calls the api from `getStaticProps`, so a build would need the backend up
 * before Playwright could start it.
 */
const webServer = CI
  ? [
      {
        command: 'node dist/main.js',
        cwd: '../backend',
        url: `${API_URL}/health`,
        env: { PORT: port(API_URL) },
        reuseExistingServer: false,
        timeout: 60_000,
        stdout: 'pipe' as const,
      },
      {
        command: `yarn next dev -p ${port(BASE_URL)}`,
        cwd: '../frontend',
        // A static file: answers before any page compiles, and without the api.
        url: `${BASE_URL}/favicon.ico`,
        env: {
          NEXT_PUBLIC_API_HOST: `${API_URL}/`,
          NEXT_PUBLIC_REMOTE_CURRENT: `${API_URL}/static/`,
          NEXT_PUBLIC_PUBLIC_HOST: `${BASE_URL}/`,
        },
        reuseExistingServer: false,
        timeout: 120_000,
      },
    ]
  : undefined;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  // `never` keeps a red local run from blocking the terminal on a browser tab.
  reporter: [['html', { open: 'never' }], ['list']],
  // The dev server compiles each page on first visit, which can take a while.
  timeout: CI ? 90_000 : 30_000,
  expect: { timeout: CI ? 20_000 : 5_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    navigationTimeout: CI ? 60_000 : 30_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer,
});
