import {
  getGoogleOAuthConfig,
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
