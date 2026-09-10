import type { RequestHandler } from 'express';
import session from 'express-session';

import { getSessionSecret, isDevMode } from '../config/env';

/**
 * Path the session cookie is scoped to. The OAuth handshake is the only thing
 * that needs server-side state; keeping it off every other route means no
 * throwaway session per API call or static asset.
 */
export const SESSION_PATH = '/api/oauth';

/**
 * Session used solely to carry the PKCE code verifier and CSRF state across the
 * redirect to an OAuth provider and back.
 *
 * `sameSite: 'lax'` is required: the provider sends the user back via a
 * top-level GET, and `strict` would withhold the cookie and break the exchange.
 *
 * Uses the default in-memory store, so a restart mid-handshake — or a second
 * replica answering the callback — makes that one login attempt fail. Adopt a
 * shared store before running more than one instance.
 */
export const createSessionMiddleware = (): RequestHandler =>
  session({
    secret: getSessionSecret(),
    // Both explicit: a session is written only once something is put in it.
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: SESSION_PATH,
      httpOnly: true,
      sameSite: 'lax',
      secure: !isDevMode,
      // The handshake completes in seconds; this only bounds an abandoned one.
      maxAge: 10 * 60 * 1000,
    },
  });
