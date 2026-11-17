import { Role } from '~/constants/auth';
import { useUser } from '~/hooks/auth/useUser';
import { useAuthStore } from '~/store/auth/useAuthStore';

/** `pending` while it is not yet known, `denied` for anyone but an admin. */
export type AdminGate = 'pending' | 'denied' | 'allowed';

/**
 * Whether an admin-only page may show. Anyone whose stored login is not an
 * admin's is turned away at once. A stored admin is then checked against the
 * server, so a stale or edited login never opens the page on its own.
 * The caller must be an observer.
 */
export const useAdminGate = (): AdminGate => {
  const { isHydrated, isUser, fetched } = useAuthStore();
  // refetches the user; `fetched` turns true once the server has answered
  const { user } = useUser();

  if (!isHydrated) {
    return 'pending';
  }

  if (!isUser || user.role !== Role.Admin) {
    return 'denied';
  }

  return fetched ? 'allowed' : 'pending';
};
