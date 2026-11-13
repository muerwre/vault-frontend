import type { Request } from 'express';

/** Longest provider response body quoted in a log line. */
const MAX_BODY = 300;

/** The session cookie express-session sets for the handshake. */
const SESSION_COOKIE = 'connect.sid';

const truncate = (value: string): string =>
  value.length > MAX_BODY ? `${value.slice(0, MAX_BODY)}…` : value;

/**
 * What passport and the provider said. A failed exchange surfaces only as
 * "Unauthorized"; the reason lives in `info` (state or PKCE verification) or in
 * the error's `oauthError` (the provider's own response to the token or
 * profile request).
 */
const describeReason = (error: unknown, info: unknown): string => {
  const parts: string[] = [];

  if (error instanceof Error) {
    const named = error as Error & {
      code?: string;
      oauthError?: { statusCode?: number; data?: unknown } | Error;
    };
    let text = `${named.name}${named.code ? ` ${named.code}` : ''}: ${named.message}`;
    const upstream = named.oauthError;

    if (upstream instanceof Error) {
      text += ` (caused by ${upstream.message})`;
    } else if (upstream?.statusCode !== undefined) {
      text += ` (provider answered ${upstream.statusCode}: ${truncate(
        String(upstream.data ?? ''),
      )})`;
    }

    parts.push(text);
  } else if (error) {
    parts.push(String(error));
  }

  if (info) {
    const message =
      typeof info === 'object' && info !== null && 'message' in info
        ? String((info as { message: unknown }).message)
        : String(info);
    parts.push(`passport: ${message}`);
  }

  return parts.length > 0 ? parts.join('; ') : 'no reason given';
};

/**
 * The request as the backend saw it. A handshake needs its session cookie to
 * come back on the callback; behind a proxy that only happens when the request
 * is known to be https, so the protocol is half the story. Session keys are
 * listed, never their values.
 */
const describeRequest = (request: Request): string => {
  const cookieSent = (request.headers?.cookie ?? '').includes(
    `${SESSION_COOKIE}=`,
  );
  const session = (request as Request & { session?: Record<string, unknown> })
    .session;
  const keys = session
    ? Object.keys(session).filter((key) => key !== 'cookie')
    : [];

  return [
    `protocol ${request.protocol}`,
    `x-forwarded-proto ${request.headers?.['x-forwarded-proto'] ?? 'absent'}`,
    `session cookie ${cookieSent ? 'sent' : 'missing'}`,
    `session keys [${keys.join(', ')}]`,
  ].join(', ');
};

/** One log line explaining a failed provider callback. */
export const describeOAuthFailure = (
  provider: string,
  error: unknown,
  info: unknown,
  request: Request,
): string =>
  `${provider} callback rejected: ${describeReason(error, info)} | request: ${describeRequest(request)}`;
