export const OAUTH_PROVIDERS = {
  VKONTAKTE: 'vkontakte',
  GOOGLE: 'google',
  TELEGRAM: 'telegram',
} as const;

export type OAuthProvider =
  (typeof OAUTH_PROVIDERS)[keyof typeof OAUTH_PROVIDERS];

/**
 * Messages posted to `window.opener` by the OAuth popup. The frontend listens
 * for these exact strings.
 */
export const OAUTH_POPUP_EVENTS = {
  PROCESSED: 'oauth_processed',
  ERROR: 'oauth_error',
} as const;
