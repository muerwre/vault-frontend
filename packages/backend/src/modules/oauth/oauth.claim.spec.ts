import { isOAuthClaim, OAUTH_CLAIM_TYPE, toClaim } from './oauth.claim';

const PROFILE = {
  provider: 'vkontakte' as const,
  id: '12345',
  email: 'someone@example.com',
  name: 'Someone',
  photo: 'https://example.com/a.jpg',
};

describe('oauth claim', () => {
  it('carries the profile and marks its type', () => {
    expect(toClaim(PROFILE)).toEqual({ ...PROFILE, typ: OAUTH_CLAIM_TYPE });
  });

  it('recognises a claim it built', () => {
    expect(isOAuthClaim(toClaim(PROFILE))).toBe(true);
  });

  /** An API token must not be usable as a claim, and vice versa. */
  it('rejects a payload without the claim type', () => {
    expect(isOAuthClaim({ uid: 1, nme: 'someone', rol: 'user' })).toBe(false);
    expect(isOAuthClaim({ ...toClaim(PROFILE), typ: 'something_else' })).toBe(
      false,
    );
  });

  it('rejects a claim with no account id', () => {
    expect(isOAuthClaim({ ...toClaim(PROFILE), id: '' })).toBe(false);
    expect(isOAuthClaim({ ...toClaim(PROFILE), id: undefined })).toBe(false);
  });

  it('rejects non-objects', () => {
    const values: unknown[] = [null, undefined, 'token', 42, []];

    for (const value of values) {
      expect(isOAuthClaim(value)).toBe(false);
    }
  });
});
