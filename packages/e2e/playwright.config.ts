import { defineConfig } from '@playwright/test';

// Phase 0 skeleton. Real specs + fixtures land alongside the backend rewrite (Phase 7).
// baseURL targets the Next.js dev server; the reverse proxy fronts /api → NestJS in prod.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
