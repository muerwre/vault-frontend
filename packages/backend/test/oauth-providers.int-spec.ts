// Fake provider credentials, set before the config module reads the
// environment. The redirect leg is built entirely locally, so the whole
// authorisation URL — including PKCE — can be checked without contacting VK or
// Google.
process.env.VK_CLIENT_ID = 'vk-spec-client';
process.env.VK_CLIENT_SECRET = 'vk-spec-secret';
process.env.VK_CALLBACK_URL =
  'https://spec.example/api/oauth/vkontakte/process/';
process.env.GOOGLE_CLIENT_ID = 'google-spec-client';
process.env.GOOGLE_CLIENT_SECRET = 'google-spec-secret';
process.env.GOOGLE_CALLBACK_URL =
  'https://spec.example/api/oauth/google/process/';

import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from './helpers/app';

describe('oauth provider handshake (integration)', () => {
  let app: INestApplication;
  let http: () => ReturnType<typeof request>;

  const redirectUrl = async (provider: string): Promise<URL> => {
    const response = await http()
      .get(`/api/oauth/${provider}/redirect/`)
      .expect(302);

    return new URL(response.headers.location);
  };

  beforeAll(async () => {
    app = await createTestApp();
    http = () => request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /oauth/:provider/redirect', () => {
    /** VK ID, not the deprecated `oauth.vk.com` endpoints. */
    it('sends vkontakte to id.vk.com', async () => {
      const url = await redirectUrl('vkontakte');

      expect(url.origin).toBe('https://id.vk.com');
      expect(url.pathname).toBe('/authorize');
      expect(url.searchParams.get('client_id')).toBe('vk-spec-client');
      expect(url.searchParams.get('redirect_uri')).toBe(
        'https://spec.example/api/oauth/vkontakte/process/',
      );
    });

    it('sends google to its authorisation endpoint', async () => {
      const url = await redirectUrl('google');

      expect(url.origin).toBe('https://accounts.google.com');
      expect(url.searchParams.get('client_id')).toBe('google-spec-client');
    });

    /** Both flows must use PKCE with S256 and carry CSRF state. */
    it.each(['vkontakte', 'google'])(
      'uses pkce and state for %s',
      async (provider) => {
        const url = await redirectUrl(provider);

        expect(url.searchParams.get('response_type')).toBe('code');
        expect(url.searchParams.get('code_challenge_method')).toBe('S256');
        expect(url.searchParams.get('code_challenge')).toMatch(/^[\w-]{43}$/);
        expect(url.searchParams.get('state')).toBeTruthy();
      },
    );

    it('asks google for the openid scopes', async () => {
      const url = await redirectUrl('google');

      expect(url.searchParams.get('scope')?.split(' ').sort()).toEqual([
        'email',
        'openid',
        'profile',
      ]);
    });

    /**
     * The code verifier must outlive the redirect, so the handshake sets a
     * session cookie — scoped to the OAuth routes only.
     */
    it('sets a session cookie scoped to the oauth routes', async () => {
      const response = await http()
        .get('/api/oauth/vkontakte/redirect/')
        .expect(302);

      const cookie = String(response.headers['set-cookie']);

      expect(cookie).toContain('Path=/api/oauth');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
    });

    it('gives each attempt its own state and challenge', async () => {
      const [first, second] = await Promise.all([
        redirectUrl('vkontakte'),
        redirectUrl('vkontakte'),
      ]);

      expect(first.searchParams.get('state')).not.toBe(
        second.searchParams.get('state'),
      );
      expect(first.searchParams.get('code_challenge')).not.toBe(
        second.searchParams.get('code_challenge'),
      );
    });

    it('404s an unknown provider', async () => {
      const { body } = await http()
        .get('/api/oauth/myspace/redirect')
        .expect(404);

      expect(body.error).toBe('OAuth_Unknown_Provider');
    });

    /** Telegram is payload-based and has no redirect handshake. */
    it('404s telegram', async () => {
      await http().get('/api/oauth/telegram/redirect').expect(404);
    });

    it('works without the trailing slash too', async () => {
      await http().get('/api/oauth/vkontakte/redirect').expect(302);
    });
  });

  describe('GET /oauth/:provider/process', () => {
    /**
     * Anything other than success renders the popup error page, so the opener
     * is told the attempt failed instead of the popup showing a JSON body.
     */
    it('renders the popup error page when the callback has no code', async () => {
      const response = await http()
        .get('/api/oauth/vkontakte/process/')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/html');
      expect(response.text).toContain('type: "oauth_error"');
      expect(response.text).toContain('window.close()');
    });

    /** A code with no matching session state cannot be trusted. */
    it('renders the popup error page when state cannot be verified', async () => {
      const response = await http()
        .get('/api/oauth/vkontakte/process/?code=whatever&state=forged')
        .expect(200);

      expect(response.text).toContain('type: "oauth_error"');
      expect(response.text).not.toContain('oauth_processed');
    });

    /**
     * This route only ever loads inside the popup, so even an unknown provider
     * is reported through the handshake rather than as a JSON 404 the user
     * would be left staring at.
     */
    it('renders the popup error page for an unknown provider', async () => {
      const response = await http()
        .get('/api/oauth/myspace/process?code=whatever')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/html');
      expect(response.text).toContain('type: "oauth_error"');
    });
  });
});
