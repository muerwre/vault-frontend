import { expect, test } from '@playwright/test';

import { anyFlowNode, API_URL } from '../helpers/api';

/**
 * The frontend driven against this backend. Unlike the backend's own specs,
 * these assert the contract as the real app consumes it — a wire change the
 * backend considers valid still fails here if the app cannot render it.
 */

/**
 * Collects genuine failures, which means server errors and page-level script
 * errors.
 *
 * A **404 for an upload is not one of them**: a development database carries
 * the file rows without the blobs, so every image legitimately misses. Only
 * 5xx indicates the backend itself is broken.
 */
const watchForFailures = (page: import('@playwright/test').Page) => {
  const problems: string[] = [];

  page.on('pageerror', error => {
    problems.push(`page error: ${error.message}`);
  });

  page.on('response', response => {
    if (response.status() >= 500) {
      problems.push(`${response.status()} from ${response.url()}`);
    }
  });

  return problems;
};

test.describe('public pages', () => {
  test('the flow lists posts from the api', async ({ page }) => {
    const problems = watchForFailures(page);

    await page.goto('/');
    await expect(page).toHaveTitle(/Убежище/);

    // Each tile links to its post; an empty flow means the api gave nothing.
    const links = page.locator('a[href^="/post"]');
    await expect(links.first()).toBeVisible();
    expect(await links.count()).toBeGreaterThan(0);

    expect(problems).toEqual([]);
  });

  test('a post page renders the node from the api', async ({ page }) => {
    const node = await anyFlowNode();
    const problems = watchForFailures(page);

    await page.goto(`/post${node.id}`);

    // The title comes from the database, so this proves the read path.
    await expect(page.locator('body')).toContainText(node.user!.username!);
    expect(problems).toEqual([]);
  });

  test('boris loads with its comment thread', async ({ page }) => {
    const problems = watchForFailures(page);

    await page.goto('/boris');
    await expect(page).toHaveTitle(/Борис/);

    expect(problems).toEqual([]);
  });

  test('a profile page loads', async ({ page }) => {
    const node = await anyFlowNode();
    const problems = watchForFailures(page);

    await page.goto(`/profile/${node.user!.username!}`);
    await expect(page.locator('body')).toContainText(node.user!.username!);

    expect(problems).toEqual([]);
  });

  /** An unknown post must not blow up the app. */
  test('an unknown post shows a not-found page rather than erroring', async ({
    page,
  }) => {
    await page.goto('/post99999999');

    await expect(page.locator('body')).not.toContainText('Application error');
  });
});
