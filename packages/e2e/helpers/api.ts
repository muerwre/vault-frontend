import * as jwt from 'jsonwebtoken';

export const API_URL = (
  process.env.E2E_API_URL ?? 'http://localhost:7777/api'
).replace(/\/$/, '');

/**
 * Fixtures are discovered from the running backend rather than hardcoded, so
 * the suite works against any seeded database.
 */
const get = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`GET ${path} answered ${response.status}`);
  }

  return (await response.json()) as T;
};

interface WireNode {
  id: number;
  title: string;
  user?: { username?: string } | null;
}

/**
 * A node from the flow, along with the username that posted it.
 *
 * The flow answers with several buckets rather than one list; `after` is the
 * page of newest posts.
 */
export const anyFlowNode = async (): Promise<WireNode> => {
  const flow = await get<Record<string, WireNode[]>>('/nodes/?take=20');
  const node = [...(flow.after ?? []), ...(flow.recent ?? [])].find(
    candidate => candidate?.user?.username,
  );

  if (!node) {
    throw new Error('the flow returned no node with an author');
  }

  return node;
};

/**
 * A token in the frozen format: HS256, `{ uid, nme, rol, iat }`, no `exp`.
 * Requires the same secret the backend runs with.
 */
export const tokenFor = (
  uid: number,
  username: string,
  role = 'user',
): string =>
  jwt.sign(
    { uid, nme: username, rol: role, iat: Math.floor(Date.now() / 1000) },
    process.env.E2E_JWT_SECRET ?? '',
    { algorithm: 'HS256' },
  );

/** The id the backend considers authenticated for a token, or null. */
export const whoAmI = async (
  token: string,
): Promise<{ id: number; username: string } | null> => {
  const response = await fetch(`${API_URL}/auth/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return null;
  }

  const { user } = (await response.json()) as {
    user?: { id: number; username: string };
  };

  return user ?? null;
};

/**
 * The key the app persists auth under. Derived from the API host, so it must
 * match exactly what the frontend was configured with.
 */
export const authStorageKey = (): string =>
  `vault48_auth_${process.env.E2E_FRONTEND_API_HOST ?? `${API_URL}/`}`;
