import type { OAuthProvider } from '@vault/common/constants';

/** Marks a token as an OAuth claim so an API token cannot be passed as one. */
export const OAUTH_CLAIM_TYPE = 'oauth_claim';

/**
 * The provider profile, signed into a short-lived token by `/process` and
 * redeemed by `PUT /oauth` (login/register) or `POST /oauth` (attach).
 *
 * It travels through the browser, so it is signed rather than stored — but it
 * carries only what those two endpoints need.
 */
export interface OAuthClaim {
  typ: typeof OAUTH_CLAIM_TYPE;
  provider: OAuthProvider;
  /** Provider-side account id, stored as `social.account_id`. */
  id: string;
  email: string;
  name: string;
  photo: string;
}

export interface ProviderProfile {
  provider: OAuthProvider;
  id: string;
  email: string;
  name: string;
  photo: string;
}

export const toClaim = (profile: ProviderProfile): OAuthClaim => ({
  typ: OAUTH_CLAIM_TYPE,
  provider: profile.provider,
  id: profile.id,
  email: profile.email,
  name: profile.name,
  photo: profile.photo,
});

/** Narrows a decoded token, rejecting anything that is not a claim. */
export const isOAuthClaim = (value: unknown): value is OAuthClaim => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const claim = value as Partial<OAuthClaim>;

  return (
    claim.typ === OAUTH_CLAIM_TYPE &&
    typeof claim.provider === 'string' &&
    typeof claim.id === 'string' &&
    claim.id !== ''
  );
};
