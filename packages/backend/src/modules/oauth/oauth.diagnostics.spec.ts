import type { Request } from 'express';

import { describeOAuthFailure } from './oauth.diagnostics';

const request = (overrides: Record<string, unknown> = {}): Request =>
  ({
    protocol: 'http',
    headers: {},
    ...overrides,
  }) as unknown as Request;

describe('describeOAuthFailure', () => {
  it("quotes passport's reason when there is no error", () => {
    const line = describeOAuthFailure(
      'vkontakte',
      null,
      { message: 'Unable to verify authorization request state.' },
      request(),
    );

    expect(line).toContain(
      'passport: Unable to verify authorization request state.',
    );
  });

  it("includes the provider's status and body from a failed exchange", () => {
    const error = Object.assign(new Error('Failed to obtain access token'), {
      name: 'InternalOAuthError',
      oauthError: { statusCode: 401, data: '{"error":"invalid_client"}' },
    });

    const line = describeOAuthFailure('vkontakte', error, undefined, request());

    expect(line).toContain('InternalOAuthError: Failed to obtain access token');
    expect(line).toContain('provider answered 401: {"error":"invalid_client"}');
  });

  it('truncates a long provider body', () => {
    const error = Object.assign(new Error('x'), {
      oauthError: { statusCode: 500, data: 'a'.repeat(1000) },
    });

    const line = describeOAuthFailure('google', error, undefined, request());

    expect(line).toContain('a'.repeat(300) + '…');
    expect(line).not.toContain('a'.repeat(301));
  });

  it('reports protocol, forwarded proto and whether the session came back', () => {
    const line = describeOAuthFailure(
      'vkontakte',
      null,
      null,
      request({
        protocol: 'https',
        headers: {
          'x-forwarded-proto': 'https',
          cookie: 'a=1; connect.sid=s%3Aabc',
        },
        session: { cookie: {}, 'oauth2:id.vk.com': { state: 'secret' } },
      }),
    );

    expect(line).toContain('protocol https');
    expect(line).toContain('x-forwarded-proto https');
    expect(line).toContain('session cookie sent');
    expect(line).toContain('session keys [oauth2:id.vk.com]');
    expect(line).not.toContain('secret');
  });

  it('notices a missing session cookie and forwarded proto', () => {
    const line = describeOAuthFailure('vkontakte', null, null, request());

    expect(line).toContain('x-forwarded-proto absent');
    expect(line).toContain('session cookie missing');
    expect(line).toContain('no reason given');
  });
});
