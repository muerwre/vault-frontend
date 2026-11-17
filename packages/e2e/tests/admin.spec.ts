import { expect, type Page, test } from '@playwright/test';

import { API_URL, authStorageKey, tokenFor } from '../helpers/api';

/**
 * The admin page. Uses the seeded `e2e_admin` and `e2e_reader` accounts; the
 * token is minted directly, as in the other signed-in specs.
 */

const NOT_FOUND = 'Потерян навсегда';

const userId = async (username: string): Promise<number> => {
  const response = await fetch(`${API_URL}/users/${username}`);
  const { user } = (await response.json()) as { user: { id: number } };

  return user.id;
};

/** Stores a login as the app keeps it, before the page loads. */
const signIn = async (
  page: Page,
  token: string,
  user: { username: string; role: string },
) => {
  const value = JSON.stringify({ token, user, isTesterInternal: false });

  await page.addInitScript(
    ([key, stored]) => window.localStorage.setItem(key, stored),
    [authStorageKey(), value],
  );
};

test.describe('admin page', () => {
  test.skip(
    !process.env.E2E_JWT_SECRET,
    'set E2E_JWT_SECRET to the backend’s JWT_SECRET to run these',
  );

  test('is a 404 for guests', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('body')).toContainText(NOT_FOUND);
  });

  test('is a 404 for users', async ({ page }) => {
    const id = await userId('e2e_reader');
    await signIn(page, tokenFor(id, 'e2e_reader'), {
      username: 'e2e_reader',
      role: 'user',
    });

    await page.goto('/admin');

    await expect(page.locator('body')).toContainText(NOT_FOUND);
    await expect(page.locator('body')).not.toContainText('Транскодирование');
  });

  test('is a 404 when the stored login claims admin but the server disagrees', async ({
    page,
  }) => {
    const id = await userId('e2e_reader');
    await signIn(page, tokenFor(id, 'e2e_reader', 'admin'), {
      username: 'e2e_reader',
      role: 'admin',
    });

    await page.goto('/admin');

    await expect(page.locator('body')).toContainText(NOT_FOUND, {
      timeout: 15_000,
    });
    await expect(page.locator('body')).not.toContainText('Загрузчики');
  });

  test.describe('as an admin', () => {
    test.beforeEach(async ({ page }) => {
      const id = await userId('e2e_admin');
      await signIn(page, tokenFor(id, 'e2e_admin', 'admin'), {
        username: 'e2e_admin',
        role: 'admin',
      });
    });

    test('shows the transcoding section by default', async ({ page }) => {
      await page.goto('/admin');

      await expect(
        page.getByRole('heading', { name: 'Транскодирование' }),
      ).toBeVisible({ timeout: 15_000 });
      await expect(page.locator('body')).toContainText('Загрузчики');
      await expect(page.locator('body')).toContainText('Задания');
      await expect(page.locator('body')).toContainText('Настройки');
      await expect(page.locator('body')).not.toContainText('Application error');
    });

    test('explains why nothing is downloaded, naming the variables', async ({
      page,
    }) => {
      // The suite's backend runs without CACHE_EXTERNAL_MEDIA.
      await page.goto('/admin');

      await expect(page.locator('body')).toContainText(
        'CACHE_EXTERNAL_MEDIA=true',
        { timeout: 15_000 },
      );
      for (const name of [
        'MEDIA_FETCHER_KEYS',
        'MEDIA_QUALITY_TIERS',
        'MEDIA_MAX_MB',
        'MEDIA_BACKLOG_BATCH',
        'MEDIA_BACKLOG_CRON',
        'MEDIA_RESCAN_CRON',
        'MEDIA_CLEANUP_CRON',
        'MEDIA_GC_GRACE_DAYS',
        'SCHEDULE_TIMEZONE',
      ]) {
        await expect(page.locator('body')).toContainText(name);
      }
      await expect(page.locator('body')).not.toContainText('Application error');
    });

    test('opens a section by its address', async ({ page }) => {
      await page.goto('/admin/transcoding');

      await expect(
        page.getByRole('heading', { name: 'Транскодирование' }),
      ).toBeVisible({ timeout: 15_000 });
    });

    test('is a 404 for an unknown section', async ({ page }) => {
      await page.goto('/admin/nothing-here');

      await expect(page.locator('body')).toContainText(NOT_FOUND, {
        timeout: 15_000,
      });
    });

    test('switches the job list between statuses', async ({ page }) => {
      await page.goto('/admin');

      await page.getByText('Готово', { exact: true }).click();
      await expect(page.locator('body')).not.toContainText('Application error');
    });
  });
});
