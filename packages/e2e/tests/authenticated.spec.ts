import { expect, test } from '@playwright/test';

import { anyFlowNode, authStorageKey, tokenFor, whoAmI } from '../helpers/api';

/**
 * Signed-in flows. The token is minted directly rather than typed into the
 * login form, so the suite needs no account with a known password — but it does
 * need the backend's signing secret.
 */

test.describe('authenticated pages', () => {
  test.skip(
    !process.env.E2E_JWT_SECRET,
    'set E2E_JWT_SECRET to the backend’s JWT_SECRET to run these',
  );

  let token: string;
  let username: string;

  test.beforeAll(async () => {
    const node = await anyFlowNode();
    username = node.user!.username!;

    // Mint against a real account, then confirm the backend accepts it —
    // otherwise a wrong secret would surface as a confusing page failure.
    const users = await fetch(
      `${process.env.E2E_API_URL ?? 'http://localhost:7777/api'}/users/${username}`,
    );
    const { user } = (await users.json()) as { user: { id: number } };

    token = tokenFor(user.id, username);
    expect(await whoAmI(token)).not.toBeNull();
  });

  test.beforeEach(async ({ page }) => {
    const key = authStorageKey();
    const value = JSON.stringify({ token, user: { username }, isTesterInternal: false });

    await page.addInitScript(
      ([storageKey, storageValue]) => {
        window.localStorage.setItem(storageKey, storageValue);
      },
      [key, value],
    );
  });

  test('the lab is reachable when signed in', async ({ page }) => {
    await page.goto('/lab');

    await expect(page).toHaveTitle(/Лаборатория/);
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  /** Proves the token the app stores is the one the backend accepts. */
  test('the app recognises the session', async ({ page }) => {
    await page.goto('/');

    const authed = page.locator(`text=${username}`).first();
    await expect(authed).toBeVisible({ timeout: 15_000 });
  });
});
