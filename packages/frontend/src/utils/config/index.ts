const isServer = typeof window === 'undefined';

const trimSlash = (url?: string) => (url || '').replace(/\/+$/, '');

/**
 * The site's public root, resolved at runtime so one build serves any address:
 * in the browser it is the page's own origin, on the Next server it is
 * `PUBLIC_URL` from the container's environment. Never baked into the bundle.
 */
const publicUrl = isServer
  ? trimSlash(process.env.PUBLIC_URL)
  : window.location.origin;

/**
 * Where api requests go. The browser calls its own origin, where the backend
 * answers `/api`; the Next server calls the backend directly at `BACKEND_URL`
 * (an internal address), falling back to the public one.
 */
const apiRoot = isServer
  ? trimSlash(process.env.BACKEND_URL) || publicUrl
  : publicUrl;

export const CONFIG = {
  /** Absolute public root with a trailing slash, for canonical links. */
  publicHost: `${publicUrl}/`,
  /**
   * Api base with a trailing slash. The persisted login is keyed on it, so in
   * the browser it must stay `<origin>/api/` — the same key as before.
   */
  apiHost: `${apiRoot}/api/`,
  /** Uploads base; absolute, because preview crawlers read it from og tags. */
  remoteCurrent: `${publicUrl}/static/`,
  /** Telegram bot for the login widget and contact link; empty hides both. */
  botUsername: process.env.NEXT_PUBLIC_BOT_USERNAME || '',
  /** The app always runs under Next now; kept for the components that ask. */
  isNextEnvironment: true,
};
