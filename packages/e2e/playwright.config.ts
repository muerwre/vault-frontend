import { defineConfig, devices } from '@playwright/test';

const CI = !!process.env.CI;

/**
 * The site's one public address — the backend, which answers `/api` and proxies
 * every page to the frontend, exactly as in production.
 */
const BASE_URL = (process.env.E2E_BASE_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
);

/** Where the frontend's dev server listens, behind the backend. */
const FRONTEND_DEV_PORT = process.env.E2E_FRONTEND_PORT || '3011';

const port = (url: string) => new URL(url).port || '80';

/**
 * In CI, Playwright starts the backend and the frontend itself, both pointed at
 * the throwaway database the workflow prepared, and both told the public
 * address so every link the app builds points back at the backend. Locally the
 * processes are started by hand (`yarn dev`, see README), so nothing is
 * launched here.
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
        url: `${BASE_URL}/api/health`,
        env: {
          PORT: port(BASE_URL),
          PUBLIC_URL: BASE_URL,
          FRONTEND_URL: `http://localhost:${FRONTEND_DEV_PORT}`,
        },
        reuseExistingServer: false,
        timeout: 60_000,
        stdout: 'pipe' as const,
      },
      {
        command: `yarn next dev -p ${FRONTEND_DEV_PORT}`,
        cwd: '../frontend',
        // A static file through the backend: proves the proxy works, and
        // answers before any page compiles.
        url: `${BASE_URL}/favicon.ico`,
        // Server-side fetches go to the backend directly.
        env: { PUBLIC_URL: BASE_URL, BACKEND_URL: BASE_URL },
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
