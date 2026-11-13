import {
  cooldownIntervalMs,
  describeCooldown,
  getGoogleOAuthConfig,
  getTelegramConfig,
  IMMEDIATE_POLL_MS,
  getPublicUrl,
  getVkOAuthConfig,
  getVkPublisherConfig,
  publicUrl,
} from './env';

describe('public url', () => {
  const saved = { PUBLIC_URL: process.env.PUBLIC_URL, PORT: process.env.PORT };

  afterEach(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('is PUBLIC_URL without a trailing slash', () => {
    process.env.PUBLIC_URL = 'https://tunnel.vault48.org///';

    expect(getPublicUrl()).toBe('https://tunnel.vault48.org');
  });

  it('defaults to this server on localhost', () => {
    delete process.env.PUBLIC_URL;
    process.env.PORT = '4321';

    expect(getPublicUrl()).toBe('http://localhost:4321');
  });

  it('defaults to port 3000 when PORT is unset', () => {
    delete process.env.PUBLIC_URL;
    delete process.env.PORT;

    expect(getPublicUrl()).toBe('http://localhost:3000');
  });

  it.each([
    ['restore/abc', 'https://vault48.org/restore/abc'],
    ['/restore/abc', 'https://vault48.org/restore/abc'],
    ['//restore/abc', 'https://vault48.org/restore/abc'],
    ['', 'https://vault48.org'],
  ])('joins %p with exactly one slash', (path, expected) => {
    process.env.PUBLIC_URL = 'https://vault48.org/';

    expect(publicUrl(path)).toBe(expected);
  });

  it('derives both OAuth callbacks', () => {
    process.env.PUBLIC_URL = 'https://tunnel.vault48.org/';

    expect(getVkOAuthConfig().callbackUrl).toBe(
      'https://tunnel.vault48.org/api/oauth/vkontakte/process/',
    );
    expect(getGoogleOAuthConfig().callbackUrl).toBe(
      'https://tunnel.vault48.org/api/oauth/google/process/',
    );
  });

  it('links VK posts to the public root', () => {
    process.env.PUBLIC_URL = 'https://vault48.org';

    expect(getVkPublisherConfig().urlPrefix).toBe('https://vault48.org');
  });
});

describe('delivery cooldowns', () => {
  const keys = ['TELEGRAM_COOLDOWN_MINS', 'NOTIFICATIONS_VK_COOLDOWN_MINS'];
  const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));

  afterEach(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it.each([
    ['0', 0],
    ['3', 3],
    ['', 5],
    ['-1', 5],
    ['soon', 5],
  ])('reads %p as %p minutes for both services', (raw, expected) => {
    process.env.TELEGRAM_COOLDOWN_MINS = raw;
    process.env.NOTIFICATIONS_VK_COOLDOWN_MINS = raw;

    expect(getTelegramConfig().cooldownMins).toBe(expected);
    expect(getVkPublisherConfig().cooldownMins).toBe(expected);
  });

  it('defaults to 5 minutes when unset', () => {
    delete process.env.TELEGRAM_COOLDOWN_MINS;

    expect(getTelegramConfig().cooldownMins).toBe(5);
  });

  it('runs every cooldown, or every few seconds at 0 instead of busy-looping', () => {
    expect(cooldownIntervalMs(5)).toBe(5 * 60_000);
    expect(cooldownIntervalMs(0)).toBe(IMMEDIATE_POLL_MS);
    expect(IMMEDIATE_POLL_MS).toBeGreaterThanOrEqual(1000);
  });

  it('describes the cooldown for the startup log', () => {
    expect(describeCooldown(5)).toBe('every 5m');
    expect(describeCooldown(0)).toMatch(/^immediately/);
  });
});
